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
import { mongoClient } from "./mongoClient.js";
import { useMongoDBAuthState } from "./DbAuthMongo.js";
dotenv.config();
import dotenv from "dotenv";

// MongoDB URI and Database Name
const dbName = process.env.MONGODB_SESSION_ENV;

const msgRetryCounterCache = new NodeCache();
const CONNECTION_LOST = 408;
const RESTART_REQUIRED = 515;
const authModel = mongoClient.db(dbName).collection("auth_wpp");
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

const startEvents = async ({ sock, saveCreds, sessionId }) => {
  sock.ev.process(async (events) => {
    const connectionUpdate = events["connection.update"];
    const credsUpdate = events["creds.update"];
    const messageUpsert = events["messages.upsert"];
    const groupUpdate = events["group.update"];
    const groupUpsert = events["group.upsert"];
    const groupUpdateParticipants = events["group-participants.update"];

    if (connectionUpdate) {
      const { connection, lastDisconnect, qr } = connectionUpdate;

      if (connection === "close") {
        const error = lastDisconnect?.error;
        console.log("error", { error });
        const errorCode = error?.output?.statusCode;
        if (errorCode === 408 || errorCode == 515) {
          try {
            // try to reconnect
            console.log("Reconnecting...");
            const { state, saveCreds } = await useMongoDBAuthState(authModel);
            const sock = await createSocket({ state });
            await startEvents({ sock, saveCreds, sessionId });
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

            const message =
              msg.message?.conversation ||
              msg.message?.imageMessage?.caption ||
              msg.message?.extendedTextMessage?.text;

            console.log(
              `Received message from ${msg.key.remoteJid}: ${message}`
            );
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
  try {
    const { state, saveCreds } = await useMongoDBAuthState(authModel);
    const sock = await createSocket({ state });
    await startEvents({ sock, saveCreds, sessionId: "ta_pago" });
    const { waitForSocketOpen, sendMessages } = sock;
    waitForSocketOpen()
      .then(() => {
        console.log(`Session ta_pago started`);
        activeSockets["ta_pago"] = sock;
      })
      .catch((error) => {
        console.error("Error starting session", error);
      });
  } catch (error) {
    console.error("Error starting session");
  }
};

init();

export { activeSockets };
