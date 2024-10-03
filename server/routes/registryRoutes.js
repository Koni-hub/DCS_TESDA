import express from 'express';
import {
    getAllRegistry,
    getRegistryByID,
    saveRegistry,
    editRegistry,
    deleteRegistry
} from '../controller/registryController.js';
const router = express.Router();

router.get('/', getAllRegistry);
router.get('/:id', getRegistryByID);
router.post('/', saveRegistry);
router.put('/:id', editRegistry);
router.delete('/:id', deleteRegistry);

export default router;
