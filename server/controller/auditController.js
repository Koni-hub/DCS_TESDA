import AuditLog from '../model/auditModels.js';

export const getAllAuditLogs = async(req,res) => {
    try {
        const logs = await AuditLog.findAll();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const createAuditLog = async (req,res) => {
    const { userName, fullName, action } = req.body;
    try {
        const log = await AuditLog.create({ userName, fullName, action });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}