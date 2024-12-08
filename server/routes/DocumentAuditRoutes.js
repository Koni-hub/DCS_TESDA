import {
    createDocAuditLog,
    findDocLogsByID,
    findAllDocLogs
  } from "../controller/documentAuditController.js";
  import express from "express";
  
  const router = express.Router();
  
  router.get("/all/:receiver", findAllDocLogs);
  router.post("/", createDocAuditLog);
  router.get("/:document_id", findDocLogsByID);
  
  export default router;  