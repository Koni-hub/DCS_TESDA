import {
    getAllDocAuditLogs,
    createDocAuditLog,
    findDocLogsByID
  } from "../controller/documentAuditController.js";
  import express from "express";
  
  const router = express.Router();
  
  router.get("/", getAllDocAuditLogs);
  router.post("/", createDocAuditLog);
  router.get("/:document_id", findDocLogsByID);
  
  export default router;  