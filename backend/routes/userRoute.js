import { Router } from "express";
import * as controller from "../controllers/userController.js";
import userValidator from "../middlewares/userValidator.js";
import query from "../database/dbpromise.js";
import bcrypt from "bcrypt";
import moment from "moment";

const router = Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);
router.get("/logout", controller.logout);

router.get("/get-user-by-token", userValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM user WHERE uid = ?`, [
      req.session.user.uid,
    ]);
    let user = {
      uid: data[0].uid,
      email: data[0].email,
      role: data[0].role,
      plan: data[0].plan,
    };
    res.json({ data: user, success: true });
  } catch (err) {
    console.log(err);
    res.json({ err, msg: "server error" });
  }
});

router.post("/update-profile", userValidator, async (req, res) => {
  try {
    if (req.body.newpass) {
      const hash = await bcrypt.hash(req.body.newpass, 10);
      await query(`UPDATE user SET email = ?, password = ? WHERE uid = ?`, [
        req.body.email,
        hash,
        req.session.user.uid,
      ]);
      res.json({ success: true, msg: "Admin was updated refresh the page" });
    } else {
      await query(`UPDATE user SET email = ? WHERE uid = ?`, [
        req.body.email,
        req.session.user.uid,
      ]);
      res.json({ success: true, msg: "Profile was updated refresh the page" });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

router.post("/send-new-ping", userValidator, async (req, res) => {
  try {
    await query(`INSERT INTO ping (uid, user_msg) VALUES (?,?)`, [
      req.session.user.uid,
      req.body.msg,
    ]);
    res.json({ msg: "New message was sent", success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

router.get("/get-my-ping", userValidator, async (req, res) => {
  try {
    const data = await query(`SELECT * FROM ping WHERE uid = ?`, [
      req.session.user.uid,
    ]);
    res.json({ data, success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

router.post("/modify_user", userValidator, async (req, res) => {
  try {
    if (!req.body.password) {
      return res.json({ success: false, msg: "No input provided" });
    }

    if (moment(req.decode.time).diff(moment(new Date()), "hours") > 1) {
      return res.json({ success: false, msg: "Token expired" });
    }

    const hashpassword = await bcrypt.hash(req.body.password, 10);

    const result = await query(`UPDATE user SET password = ? WHERE email = ?`, [
      hashpassword,
      req.decode.old_email,
    ]);

    res.json({ success: true, msg: "User has been updated", data: result });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

router.get("/get_dash", userValidator, async (req, res) => {
  try {
    // get plan name
    const getUser = await query(`SELECT * FROM user WHERE uid = ?`, [
      req.session.user.uid,
    ]);
    const plan = getUser[0].plan ? JSON.parse(getUser[0].plan) : false;

    // getting instances
    const instance = await query(`SELECT * FROM instance WHERE uid = ?`, [
      req.session.user.uid,
    ]);

    // getting bots
    const bots = await query(
      `SELECT * FROM aibot WHERE uid = ? and active = ?`,
      [req.session.user.uid, 1]
    );

    res.json({
      success: true,
      plan,
      instance: instance.length,
      bots: bots.length,
    });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
});

export default router;
