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

  if (!document_id) {
    return res.status(400).json({ error: "Document ID is required." });
  }

  try {
    const logs = await DocAuditLog.findAll({
      where: { document_id },
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: "No logs found for this document." });
    }

    const receiverIds = [...new Set(logs.map(log => log.receiver).flat())];

    if (receiverIds.length === 0) {
      return res.status(200).json(
        logs.map(log => ({
          ...log.toJSON(),
          offices: [],
        }))
      );
    }

    const offices = await Office.findAll({
      where: {
        id: {
          [Op.in]: receiverIds,
        },
      },
      attributes: ["id", "name"],
    });

    const officeMap = Object.fromEntries(offices.map(office => [String(office.id), office.name]));

    const result = logs.map(log => {
      const logReceiverIds = Array.isArray(log.receiver) ? log.receiver : [log.receiver];
      const officeNames = logReceiverIds.map(id => officeMap[String(id)]).filter(Boolean);

      return {
        ...log.toJSON(),
        offices: officeNames,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching document logs:", error);
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  }
};