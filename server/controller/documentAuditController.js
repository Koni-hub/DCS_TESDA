import {Op, Sequelize } from "sequelize";
import DocAuditLog from "../model/documentAuditModels.js";
import Office from "../model/officeModels.js";

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

    const receiverIds = logs[0].receiver;
    
    const offices = await Office.findAll({
      where: {
        id: {
          [Op.in]: receiverIds,
        }
      },
      attributes: ['name', 'id'],
    });

    const result = logs.map(log => {
      const officeNames = offices
        .filter(office => receiverIds.includes(String(office.id)))
        .map(office => office.name);

      return {
        ...log.toJSON(),
        offices: officeNames,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
