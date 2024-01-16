import "dotenv/config";
import express from "express";
import routes from "./routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use("/", (req, res) => {
  res.send("Hello");
});

app.listen(process.env.PORT || 5002, () => {
  console.log(`Server is running on port ${process.env.PORT || 5002}`);
});

export default app;
