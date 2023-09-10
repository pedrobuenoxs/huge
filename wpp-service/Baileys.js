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

const tempStore = {}; // This object will be used to store the bot's sent messages.  (MessageInfo object)

// Below's function is what solves the problem
const getMessage = async (key) => {
  const { id } = key;
  console.log("Resending", id);
  return tempStore[id]?.message;
};

export { tempStore };

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
    getMessage,
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
    const groupUpdate = events["group.update"];
    const groupUpsert = events["group.upsert"];
    const groupUpdateParticipants = events["group-participants.update"];
    console.log("events", events);
    if (groupUpdate) {
      console.log("groupUpdate", groupUpdate);
    }
    if (groupUpsert) {
      console.log("groupUpsert", groupUpsert);
    }
    if (groupUpdateParticipants) {
      const { id, participants, action } = groupUpdateParticipants;
      if (action === "add" && sessionId === "tapago") {
        let message = "\t*LOOK AT HIM!*\n\nSeja bem-vindo(a) ao grupo!";
        message += `\n\nEu sou o *Boris Bilder*, o Bot do grupo 🤖.\n Fui criado para te motivar!`;
        message += `\n\n*Como funciona?*`;
        message += `\nCrie um grupo com seus amigos e me adicione. Eu vou lembrar voces de se manterem focados naquele projeto fitness.`;
        message += `\n\n*COMANDOS*`;
        message += `\n\n*Boris, entrar* - Para se cadastrar no grupo`;
        message += `\n*Boris, comandos* - Para ver os comandos disponíveis`;
        message += `\n\n *Redes Sociais*`;
        message += `\n\nNosso site: https://www.hojetapago.com.br/`;
        message += `\nNosso insta: instagram.com/hoje.tapago`;
        let sent = await sock.sendMessage(id, {
          text: message,
        });
        tempStore[sent.key.id] = sent;
      }
    }
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
            // let baseUrl = "http://localhost:3000/webhook";
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
                let sent = await sock.sendMessage(msg.key.remoteJid, {
                  text: res.data.message,
                });
                tempStore[sent.key.id] = sent;
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
