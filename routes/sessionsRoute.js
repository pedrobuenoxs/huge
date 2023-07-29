import { Router } from "express";
import { body } from "express-validator";
import requestValidator from "./../middlewares/requestValidator.js";
import sessionValidator from "./../middlewares/sessionValidator.js";
import userValidator from "./../middlewares/userValidator.js";
import * as controller from "./../controllers/sessionsController.js";

const router = Router();

router.get("/find/:id", sessionValidator, userValidator, controller.find);

router.get("/status/:id", userValidator, sessionValidator, controller.status);

router.get("/status-internal/:id", sessionValidator, controller.status);

router.post(
  "/add",
  body("id").notEmpty(),
  body("isLegacy").notEmpty(),
  requestValidator,
  userValidator,
  controller.add
);

router.delete("/delete/:id", userValidator, controller.del);

router.get("/get-users-instances", userValidator, controller.getUserSessions);

router.post(
  "/send",
  userValidator,
  async (req, res) => await controller.send(req, res)
);

export default router;
