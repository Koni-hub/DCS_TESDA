import {getAllDocuments, getDocumentByID, createDocument, editDocument} from '../controller/documentController.js';
import express from 'express';

const router = express.Router();

router.get('/', getAllDocuments);
router.get('/:No', getDocumentByID);
router.post('/', createDocument);
router.patch('/:No', editDocument);

export default router;