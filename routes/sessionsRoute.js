import { Router } from "express";
import { body } from "express-validator";
import requestValidator from "./../middlewares/requestValidator.js";
import * as controller from "./../controllers/sessionsController.js";

const router = Router();
router.post(
  "/add",
  body("sessionId").notEmpty(),
  requestValidator,
  controller.add
);

router.post("/send", async (req, res) => await controller.send(req, res));

export default router;
