import express from 'express';
import { getAllRejectedDocuments, rejectDocuments } from '../controller/documentController.js';

const router = express.Router();

router.get('/', getAllRejectedDocuments);
router.post('/:No', rejectDocuments);

export default router;