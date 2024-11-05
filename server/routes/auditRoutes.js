import {
  getAllAuditLogs,
  createAuditLog,
} from "../controller/auditController.js";
import express from "express";

const router = express.Router();

router.get("/", getAllAuditLogs);
router.post("/", createAuditLog);

export default router;
