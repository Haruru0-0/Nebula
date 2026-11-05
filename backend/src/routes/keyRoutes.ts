import express from "express";
import * as keyController from "../controllers/keyController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticate);

router.get("/", keyController.getKeys);
router.get("/:provider/models", keyController.getModels);
router.put("/:provider", keyController.putKey);
router.delete("/:provider", keyController.deleteKey);

export default router;
