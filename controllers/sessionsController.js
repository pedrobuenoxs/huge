import { set } from "mongoose";
import { activeSockets, tempStore } from "../wpp-service/Baileys.js";
import response from "./../response.js";

const add = async (req, res) => {
  try {
    const { clientId, sessionId } = req.body;

    // Checking user
    console.log(`Creating session: ${sessionId}`);
  } catch (error) {
    console.log(error);
    response(res, 500, false, "Server error.");
  }
};

const send = async (req, res) => {
  const { sessionId, jid, message } = req.body;
  console.log({ sessionId, jid, message });
  if (!sessionId || !jid || !message) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  const baileysSocket = activeSockets[sessionId];

  if (baileysSocket) {
    try {
      let sent = await baileysSocket.sendMessage(jid, { text: message.text });
      tempStore[sent.key.id] = sent;
      res.json({ status: "success" });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  } else {
    res.status(404).json({ status: "error", message: "Session not found" });
  }
};

const sendByJids = async (req, res) => {
  const { sessionId, groupJids, message } = req.body;

  if (!sessionId || !groupJids || !message) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }
  console.log({ activeSockets });
  const baileysSocket = activeSockets[sessionId];
  console.log({ baileysSocket });

  if (baileysSocket) {
    for (let i = 0; i < groupJids.length; i++) {
      try {
        let sent = await baileysSocket.sendMessage(groupJids[i], {
          text: `${message.text}`,
        });
        tempStore[sent.key.id] = sent;
        setTimeout(() => {
          console.log(`✅✅✅✅  Message sent to ${groupJids[i]}`);
        }, 3000);
      } catch (err) {
        console.error(err);
      }
    }
    return res.json({ status: "success" });
  } else {
    res.status(404).json({ status: "error", message: "Session not found" });
  }
};

export { add, send, sendByJids };
