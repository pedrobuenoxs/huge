import NodeCache from "node-cache";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import axios from "axios";
import logger from "./logs.js";
import useSQLAuthState from "./DbAuth.js";
import query from "../database/dbpromise.js";

const msgRetryCounterCache = new NodeCache();
const CONNECTION_LOST = 408;
const RESTART_REQUIRED = 515;

const createSocket = async ({ state }) => {
  const { version } = await fetchLatestBaileysVersion();
  return makeWASocket.default({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
  });
};

const startEvents = async ({
  sock,
  saveCreds,
  sessionId,
  numReconnect = 3,
}) => {
  sock.ev.process(async (events) => {
    const connectionUpdate = events["connection.update"];
    const credsUpdate = events["creds.update"];
    const messageUpsert = events["messages.upsert"];
    let sendQrCode = true;

    if (connectionUpdate) {
      const { connection, lastDisconnect, qr } = connectionUpdate;

      if (connection === "close") {
        const errorCode = lastDisconnect?.error?.output?.statusCode;
        console.log("errorCode", errorCode);
        if (errorCode === CONNECTION_LOST || errorCode !== RESTART_REQUIRED) {
          try {
            // try to reconnect
            if (numReconnect > 0) {
              console.log("Reconnecting...");
              numReconnect--;
              const { state, saveCreds } = await useSQLAuthState(sessionId);
              const sock = await createSocket({ state });
              await startEvents({ sock, saveCreds, sessionId, numReconnect });
            }
          } catch (error) {
            console.error("Error reconnecting", error);
          }
        }
      }
    }

    if (credsUpdate) {
      await saveCreds();
    }

    if (messageUpsert && messageUpsert.type === "notify") {
      for (const msg of messageUpsert.messages) {
        if (!msg.key.fromMe) {
          try {
            let isGroup = msg.key.remoteJid.endsWith("@g.us");
            let group = isGroup
              ? await sock.groupMetadata(msg.key.remoteJid)
              : {};
            let queryRes = await query(
              `SELECT base_url FROM webhook_url WHERE session_id = ?`,
              [sessionId]
            );
            let baseUrl = queryRes[0]?.base_url;

            const message =
              msg.message?.conversation ||
              msg.message?.imageMessage?.caption ||
              msg.message?.extendedTextMessage?.text;

            const postUrl = `${baseUrl}/${sessionId}`;

            console.log(`Message received: ${message}`);

            const prefixes = ["Boris,", "/"];

            if (
              baseUrl &&
              prefixes.some((prefix) =>
                message.toLowerCase().startsWith(prefix.toLowerCase())
              )
            ) {
              console.log("Sending message to webhook");
              let res = await axios.post(postUrl, {
                message: {
                  key: msg.key,
                  wppName: msg.pushName,
                  timestamp: msg.messageTimestamp,
                  text: message,
                },
                group: group,
              });
              console.log("Status", JSON.stringify(res.data, null, 4));
              if (res.data.status == "success") {
                await sock.sendMessage(msg.key.remoteJid, {
                  text: res.data.message,
                });
              }
            }
          } catch (error) {
            console.error("error", error);
          }
        }
      }
    }
  });
};

const activeSockets = {};

const init = async () => {
  const sessions = await query(
    `SELECT * FROM auth_keys WHERE key_id = 'creds' and bot_id = ?`,
    ["tapago"]
  );

  for (const session of sessions) {
    try {
      const { state, saveCreds } = await useSQLAuthState(session.bot_id);
      const sock = await createSocket({ state });
      await startEvents({ sock, saveCreds, sessionId: session.bot_id });
      const { waitForSocketOpen, sendMessages } = sock;
      await waitForSocketOpen();
      activeSockets[session.bot_id] = sock;
      console.log(`Session ${session.bot_id} started`);
    } catch (error) {
      console.error("Error starting session", error);
    }
  }
};

init();

export { activeSockets };
