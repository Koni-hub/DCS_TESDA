import DocAuditLog from "../model/documentAuditModels.js";

export const getAllDocAuditLogs = async (req, res) => {
  try {
    const logs = await DocAuditLog.findAll();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDocAuditLog = async (req, res) => {
  console.log("Log from backend body (Doc Audit Logs): ", req.body);
  const { document_id, senderName, receiver, action } = req.body;
  try {
    const log = await DocAuditLog.create({ document_id, senderName, receiver, action });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const findAllDocLogs = async (req, res) => {
  try {
    const logs = await DocAuditLog.findAll({
      include: [
        {
          model: RecordDocument,
          as: "document",
        },
      ],
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const findDocLogsByID = async (req, res) => {
  const { document_id } = req.params;

  try {
    const logs = await DocAuditLog.findAll({
      where: { document_id },
    });

    if (logs.length === 0) {
      return res.status(404).json({ error: "No logs found for this document." });
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
