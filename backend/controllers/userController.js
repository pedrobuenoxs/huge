import query from "../database/dbpromise.js";
import bcrypt from "bcrypt";
import randomstring from "randomstring";

const login = async (req, res) => {
  try {
    const { body } = req;
    const { email } = body;
    const pass = body.password;

    if (!email || !pass) {
      return res.json({ msg: "please send required fields" });
    }

    const userFind = await query(`SELECT * FROM user WHERE email = ?`, [email]);
    if (userFind.length < 1) {
      return res.json({ msg: "Invalid credentials" });
    }

    const compare = await bcrypt.compare(pass, userFind[0].password);
    if (!compare) {
      return res.json({ msg: "Invalid credentials" });
    }

    req.session.user = {
      uid: userFind[0].uid,
      role: "user",
      password: userFind[0].password,
      email: userFind[0].email,
    };

    res.json({ msg: "Login success", success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
};

const signup = async (req, res) => {
  try {
    const { body } = req;
    const { name } = body;
    const { email } = body;
    const pass = body.password;

    if (!name || !email || !pass) {
      return res.json({ msg: "Please send all required fields" });
    }

    const findEx = await query(`SELECT * FROM user WHERE email = ?`, email);
    if (findEx.length > 0) {
      return res.json({ msg: "A user already exist with this email" });
    }

    const haspass = await bcrypt.hash(pass, 10);
    const uid = randomstring.generate();

    await query(
      `INSERT INTO user (uid, name, email, password) VALUES (?,?,?,?)`,
      [uid, name, email, haspass]
    );

    res.json({ msg: "Signup Success", success: true });
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.json({ msg: "Unable to logout", success: false });
    }

    res.json({ msg: "Logout successful", success: true });
  });
};

export { login, signup, logout };
