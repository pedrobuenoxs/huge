import query from "../database/dbpromise.js";

const validateUser = async (req, res, next) => {
  try {
    const token = req.session.user;
    if (!token) {
      return res.json({ msg: "No token found", logout: true });
    }

    const getUser = await query(
      `SELECT * FROM user WHERE email = ? and password = ? `,
      [token.email, token.password]
    );
    if (getUser.length < 1) {
      return res.json({
        success: false,
        msg: "Invalid token found",
        logout: true,
      });
    }

    if (getUser[0].role === "user") {
      next();
    } else {
      return res.json({
        success: 0,
        msg: "Unauthorized token",
        logout: true,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({ msg: "server error", err });
  }
};

export default validateUser;
