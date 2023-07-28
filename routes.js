import { Router } from "express";
import sessionsRoute from "./routes/sessionsRoute.js";
import userRoute from "./routes/userRoute.js";
// import adminRoute from "./routes/adminRoute.js";
// import aiBotRoute from "./routes/aiBotRoute.js";
import response from "./response.js";

const router = Router();

router.use("/sessions", sessionsRoute);
// router.use("/bot", aiBotRoute);
router.use("/user", userRoute);
// router.use("/admin", adminRoute);

// router.use("/plan", planRoute);
router.get("/list", async (req, res) => {
  res.json({ message: "Alive, here we go" });
});

router.all("*", (req, res) => {
  response(res, 404, false, "The requested url cannot be found.");
});

export default router;
