import {
  getAllRecordDocument,
  getRecordDocumentByID,
  addRecordDocument,
  editRecordDocument,
  deleteRecordDocument,
  getAllToReceiveDocs,
  editToRecieveDocs,
} from "../controller/recordDocumentController.js";
import express from "express";

const router = express.Router();

router.get("/", getAllRecordDocument);
router.get("/to-receive-docs", getAllToReceiveDocs);
router.get("/:id", getRecordDocumentByID);
router.post("/", addRecordDocument);
router.patch("/:id", editRecordDocument);
router.patch("/:id/to-receive-docs", editToRecieveDocs);
router.delete("/id:", deleteRecordDocument);

export default router;
