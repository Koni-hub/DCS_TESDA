import {
  getAllOffice,
  getOfficeByID,
  addOffice,
  editOffice,
} from "../controller/officeController.js";
import express from "express";

const router = express.Router();

router.get("/", getAllOffice);
router.get("/:id", getOfficeByID);
router.post("/", addOffice);
router.patch("/:id", editOffice);

export default router;
