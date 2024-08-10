import { registerAccount, getAllAccounts, loginAccount, getAccountById, updateAccount, findGoogleAccount } from '../controller/accountController.js';
import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for login attempts
const loginAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 7, // Limit each emailOrUsername to 5 requests per windowMs
    message: 'Too many login attempts from this login, please try again later.',
});

router.post('/login', loginAttemptLimiter, loginAccount);
router.post('/register', registerAccount);
router.get('/accounts', getAllAccounts);
router.get('/account/:account_email', getAccountById);
router.put('/account/:account_email', updateAccount);

// FInd Google Email
router.post('/find-account', findGoogleAccount);

export default router;