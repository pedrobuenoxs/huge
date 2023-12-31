import { Router } from "express";
import { body } from "express-validator";
import requestValidator from "./../middlewares/requestValidator.js";
import sessionValidator from "./../middlewares/sessionValidator.js";
import * as controller from "./../controllers/sessionsController.js";

const router = Router();

// router.get("/find/:id", sessionValidator, controller.find);

// router.get("/status/:id", sessionValidator, controller.status);

// router.get("/status-internal/:id", sessionValidator, controller.status);

router.post(
  "/add",
  body("sessionId").notEmpty(),
  requestValidator,
  controller.add
);

// router.delete("/delete/:id", controller.del);

// router.get("/get-users-instances", controller.getUserSessions);

router.post("/send", async (req, res) => await controller.send(req, res));

export default router;
