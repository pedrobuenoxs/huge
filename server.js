import "dotenv/config";
import express from "express";
import nodeCleanup from "node-cleanup";
import fileUpload from "express-fileupload";
import routes from "./routes.js";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 1000,
      sameSite: true,
    },
  })
);
app.use("/api", routes);

// Linking client
import path from "path";

const currentDir = process.cwd();

const PROD_BUILD = path.resolve(currentDir, "./client/build");
const DEV_BUILD = path.resolve(currentDir, "./client/public");

app.use(express.static(path.resolve(currentDir, PROD_BUILD)));

app.get("*", (request, response) => {
  response.sendFile(path.resolve(currentDir, PROD_BUILD, "index.html"));
});

app.listen(process.env.PORT || 8000, () => {
  // init();
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

export default app;
