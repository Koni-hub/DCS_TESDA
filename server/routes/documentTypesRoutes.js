import {
  getAllDocumentTypes,
  getDocumentTypeByID,
  addDocumentTypes,
  editDocumentTypes,
} from "../controller/documentTypesController.js";
import express from "express";

const router = express.Router();

router.get("/", getAllDocumentTypes);
router.get("/:id", getDocumentTypeByID);
router.post("/", addDocumentTypes);
router.patch("/:id", editDocumentTypes);

export default router;
