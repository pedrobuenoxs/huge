import { activeSockets, tempStore } from "../wpp-service/Baileys.js";
import response from "./../response.js";
import query from "../database/dbpromise.js";

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

  if (!sessionId || !jid || !message) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  const baileysSocket = activeSockets[sessionId];

  if (baileysSocket) {
    try {
      let sent = await baileysSocket.sendMessage(jid, { text: message });
      tempStore[sent.key.id] = sent;
      res.json({ status: "success" });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  } else {
    res.status(404).json({ status: "error", message: "Session not found" });
  }
};

export { add, send };
