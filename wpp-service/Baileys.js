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
import response from "../response.js";
import query from "../database/dbpromise.js";

const msgRetryCounterCache = new NodeCache();
const CONNECTION_LOST = 408;
const RESTART_REQUIRED = 515;

const createSocket = async ({ state, version }) => {
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

const startEventsAndSendQrCode = async ({
  sock,
  res,
  saveCreds,
  sessionId,
  sendQrCode = true,
}) => {
  sock.ev.process(async (events) => {
    const connectionUpdate = events["connection.update"];
    const credsUpdate = events["creds.update"];
    const messageUpsert = events["messages.upsert"];

    if (connectionUpdate) {
      const { connection, lastDisconnect, qr } = connectionUpdate;

      if (connection === "close") {
        const errorCode = lastDisconnect?.error?.output?.statusCode;
        console.log("errorCode", errorCode);
        if (errorCode === CONNECTION_LOST || errorCode !== RESTART_REQUIRED) {
          console.log("Connection closed. You are logged out.");
          await logout();
        } else {
          console.log("Restart required.");
          createSession({
            sessionId: sessionId,
            res: null,
            sendQrCode: false,
          });
        }
      }

      if (qr && sendQrCode) {
        sendQrCode = false;
        response(res, 200, true, "QR code generated.", { qr });
      }
    }

    if (credsUpdate) {
      await saveCreds();
    }
  });
};

const startEvents = async ({ sock, saveCreds, sessionId }) => {
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
          console.log("Connection closed. You are logged out.");
        } else {
          console.log("Restart required.");
          createSession({
            sessionId: sessionId,
            res: null,
          });
        }
      }
    }

    if (credsUpdate) {
      await saveCreds();
    }

    if (messageUpsert && messageUpsert.type === "notify") {
      for (const msg of messageUpsert.messages) {
        console.log("msg", msg);
        if (!msg.key.fromMe) {
          try {
            console.log("replying to", msg.key.remoteJid);
            let group = await sock.groupMetadata(msg.key.remoteJid);
            console.log("group", group);
            let groupName = group.subject;
            console.log("✖️✖️ message", msg);
            let msgTimeStamps = msg.messageTimestamp;
            let date = new Date(msgTimeStamps * 1000);
            let dateStr = date.toLocaleDateString("pt-br");
            let hour = date.toLocaleTimeString("pt-br");
            let webhook = await query(
              `SELECT url FROM webhooks WHERE bot_id = ?`,
              [sessionId]
            );
            let webhookUrl = webhook[0].url;
            if (webhookUrl) {
              let res = await axios.post(webhookUrl, {
                msg: msg.message.conversation,
                from: msg.key.remoteJid,
                name: msg.pushName,
                day: dateStr,
                hour: hour,
                group: groupName,
              });
              if (res.data[0].status == "success") {
                await sock.sendMessage(msg.key.remoteJid, {
                  text: res.data[0].message,
                });
              }
            }
          } catch (error) {
            console.error("error", error);
          }
        }
      }
    }
    // http://localhost:5678/webhook-test/f93b4ca9-9e5b-4605-8890-c0096614f018
    //http://localhost:5678/webhook/f93b4ca9-9e5b-4605-8890-c0096614f018
  });
};

const createSession = async ({ sessionId, res, sendQrCode }) => {
  try {
    const { state, saveCreds } = await useSQLAuthState(sessionId);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
    const sock = await createSocket({ state, version });
    await startEventsAndSendQrCode({
      sock,
      saveCreds,
      res,
      sessionId,
      sendQrCode,
    });
    return {
      status: true,
      message: "Session created",
      sock,
    };
  } catch (error) {
    console.error("Error creating session", error);
    return {
      status: false,
      message: "Error creating session",
      error,
    };
  }
};

const getSession = async (sessionId) => {
  const { state } = await useSQLAuthState(sessionId, false);
  const { version } = await fetchLatestBaileysVersion();
  return createSocket(state, version);
};

const isSessionExists = async (sessionId) => {
  const sessionQuery = await query(`SELECT * FROM auth_keys WHERE bot_id = ?`, [
    sessionId,
  ]);
  return sessionQuery.length > 0;
};

const deleteSession = async (sessionId, logout = true) => {
  if (logout) {
    try {
      const session = await getSession(sessionId);
      console.log("logging out");
      await session.logout();
    } catch (error) {
      console.error("Error logging out", error);
    }
  }

  try {
    await query(`DELETE FROM auth_keys WHERE bot_id = ?`, [sessionId]);
  } catch (error) {
    console.error("Error deleting", error);
  }
};

const initSocketAndSendMessage = async ({ sessionId, jid, message }) => {
  try {
    const { state, saveCreds } = await useSQLAuthState(sessionId);
    const { version } = await fetchLatestBaileysVersion();
    const sock = await createSocket({ state, version });
    await startEvents({ sock, saveCreds, sessionId });
    const { waitForSocketOpen, sendMessage } = sock;

    await waitForSocketOpen();
    setTimeout(async () => {
      await sendMessage(jid, message);
      console.log("Message sent");
    }, 5000);
    console.log("Message sent");
  } catch (error) {
    console.error("Error sending message", error);
  }
};

const init = async () => {
  const sessions = await query(
    `SELECT * FROM auth_keys WHERE key_id = 'creds' AND bot_id = 'car'`,
    []
  );

  for (const session of sessions) {
    try {
      const { state, saveCreds } = await useSQLAuthState(session.bot_id);
      const { version } = await fetchLatestBaileysVersion();
      const sock = await createSocket({ state, version });
      await startEvents({ sock, saveCreds, sessionId: session.bot_id });
      const { waitForSocketOpen, sendMessages } = sock;
      await waitForSocketOpen();
      console.log(`Session ${session.bot_id} started`);
    } catch (error) {
      console.error("Error starting session", error);
    }
  }
};

const buttonMessage = {
  text: "Hi it's button message",
  footer: "Hello World",
  buttons: [
    { buttonId: "id1", buttonText: { displayText: "Button 1" }, type: 1 },
    { buttonId: "id2", buttonText: { displayText: "Button 2" }, type: 1 },
    { buttonId: "id3", buttonText: { displayText: "Button 3" }, type: 1 },
  ],
  headerType: 1,
};

init();

export {
  getSession,
  deleteSession,
  isSessionExists,
  createSession,
  initSocketAndSendMessage,
};
