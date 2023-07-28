import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const con = mysql.createPool({
  connectionLimit: 1000,
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
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
