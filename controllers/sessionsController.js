import {
  getSession,
  isSessionExists,
  createSession,
  deleteSession,
  initSocketAndSendMessage,
} from "../wpp-service/Baileys.js";
import response from "./../response.js";
import query from "../database/dbpromise.js";

const find = (req, res) => {
  response(res, 200, true, "Session found.");
};

const status = async (req, res) => {
  try {
    let exist = await isSessionExists(req.body.id);
    if (!exist) {
      return response(res, 404, false, "Session not found.");
    }
    const states = ["connecting", "connected", "disconnecting", "disconnected"];
    let sessionId = req.params.id;
    const session = await getSession(sessionId);
    let state = states[session.ws.readyState];
    state =
      state === "connected" &&
      typeof (session.isLegacy ? session.state.legacy.user : session.user) !==
        "undefined"
        ? "authenticated"
        : state;

    const status = Boolean(session.user);

    response(res, 200, status, "", {
      status: state,
      loginStatus: session.user,
    });
  } catch (error) {
    console.log(error);
    response(res, 500, false, "Server error.");
  }
};

const add = async (req, res) => {
  try {
    const { clientId, sessionId } = req.body;

    // Checking user
    console.log(`Creating session: ${sessionId}`);
    let session = await isSessionExists(sessionId);
    if (session) {
      return response(
        res,
        409,
        false,
        "Session already exists, please use another id."
      );
    }

    // Adding new client in database for this user
    await query(`INSERT INTO instance (bot_id, client_id) VALUES (?,?)`, [
      sessionId,
      clientId,
    ]);

    await createSession({ sessionId, res });
  } catch (error) {
    console.log(error);
    response(res, 500, false, "Server error.");
  }
};

const del = async (req, res) => {
  const { id } = req.body;

  // Checking user
  console.log(`Deleting session: ${id}`);
  let session = await isSessionExists(id);
  if (!session) {
    return response(res, 404, false, "Session not found.");
  }

  try {
    await deleteSession(id);
    await query(`DELETE FROM instance WHERE client_id = ?`, [id]);
    console.log(`Session ${id} deleted.`);
  } catch (error) {
    console.log(error);
  }

  response(res, 200, true, "The session has been successfully deleted.", {
    msg: "The session was deleted",
  });
};

// Get all users sessions
const getUserSessions = async (req, res) => {
  try {
    const data = await query(`SELECT * FROM instance WHERE uid = ?`, [
      req.session.user.uid,
    ]);
    res.json({ success: true, data });
  } catch (err) {
    console.log(err);
    res.json({ err, msg: "server error" });
  }
};

const send = async (req, res) => {
  const { sessionId, jid, message } = req.body;
  try {
    await initSocketAndSendMessage({ sessionId, jid, message });
    console.log("Sending message");
    res.json({ success: true, msg: "Message sent" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, msg: "Error sending message" });
  }
};

export { find, status, add, del, getUserSessions, send };
