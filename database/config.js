import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const con = mysql.createPool({
  connectionLimit: 1000,
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: "utf8mb4",
});

con.getConnection((err) => {
  if (err) {
    console.log({
      err,
      msg: "Database connected error",
    });
  } else {
    console.log("Database has been connected");
  }
});

export default con;
