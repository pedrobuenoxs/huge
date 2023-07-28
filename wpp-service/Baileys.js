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

const createSocket = async (state, version) => {
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

const createSession = async ({ sessionId, res }) => {
  const { state, saveCreds } = await useSQLAuthState(sessionId, false);
  // const { state, saveCreds } = await useMultiFileAuthState(
  //   `sessions/${sessionId}`
  // );
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
  const sock = await createSocket(state, version);
  await startSock({ sock, sessionId, res, saveCreds });
};

const startSock = async ({ sock, sessionId, res, saveCreds }) => {
  let sendQr = false;

  const logout = async () => {
    try {
      console.log("logging out");
      await sock.logout();
      await query(`DELETE FROM auth_keys WHERE bot_id = ?`, [sessionId]);
    } catch (error) {
      console.error("error while logging out", error);
    }
  };

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
          createSession({ sessionId, res });
        }
      }

      if (qr && !sendQr) {
        sendQr = true;
        // response(res, 200, true, "QR code generated.", { qr });
      }
    }

    if (credsUpdate) {
      await saveCreds();
    }

    if (messageUpsert && messageUpsert.type === "notify") {
      for (const msg of messageUpsert.messages) {
        if (!msg.key.fromMe) {
          try {
            console.log("replying to", msg.key.remoteJid);
            let message = await sock.readMessages([msg.key]);
            // console.log("message", msg);
            // console.log("message read", message);
            console.log("✖️✖️ message", msg);
            res = await axios.post(
              "https://n8n-production-5333.up.railway.app/webhook/f93b4ca9-9e5b-4605-8890-c0096614f018",
              {
                id: msg.key.id,
                msg: msg.message.conversation,
                from: msg.key.remoteJid,
              }
            );
            console.log("res", res.data);
            console.log("res", res.data.message.content);
            await sock.sendMessage(msg.key.remoteJid, {
              text: res.data.message.content,
            });
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

const init = async () => {
  const sessions = await query(
    `SELECT * FROM auth_keys WHERE key_id = 'creds'`,
    []
  );
  console.log("sessions", sessions);
  for (const session of sessions) {
    try {
      const { state, saveCreds } = await useSQLAuthState(session.bot_id, false);
      const { version } = await fetchLatestBaileysVersion();
      const sock = await createSocket(state, version);
      await startSock({
        sock,
        sessionId: session.bot_id,
        res: null,
        saveCreds,
      });
    } catch (error) {}
  }
};
//
// createSession({ sessionId: "academia2", res: null });

init();

export { startSock, getSession, deleteSession, isSessionExists, createSession };
