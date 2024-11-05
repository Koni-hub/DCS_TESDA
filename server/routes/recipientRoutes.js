import {
  getAllRecipients,
  getIncomingDocs,
  getRecievedDoc,
  getDeclineDoc,
  getPendingDoc,
  forwardDoc,
  archiveDoc,
  getAllArchiveDocs,
} from "../controller/recipientController.js";
import express from "express";

const router = express.Router();

router.get("/", getAllRecipients);
router.get("/incoming", getIncomingDocs);
router.put("/:id/receive", getRecievedDoc);
router.put("/:id/decline", getDeclineDoc);
router.get("/pending", getPendingDoc);
router.post("/:id/forward", forwardDoc);
router.put("/:id/archive", archiveDoc);
router.get("/archive-docs", getAllArchiveDocs);

export default router;
