import {
  registerAccount,
  getAllAccounts,
  loginAccount,
  getAccountById,
  updateAccount,
  editAccount,
  findOfficeAccount,
} from "../controller/accountController.js";
import express from "express";

const router = express.Router();

router.post("/login", loginAccount);
router.post("/register", registerAccount);
router.get("/accounts", getAllAccounts);
router.patch("/account/:account_id", editAccount);
router.get("/account/:account_email", getAccountById);
router.put("/account/:account_email", updateAccount);
router.get("/accounts/offices", findOfficeAccount);

export default router;