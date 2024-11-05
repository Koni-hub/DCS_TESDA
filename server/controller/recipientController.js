import database from "../config/dbConfig.js";
import Recipient from "../model/recipientModels.js";
import Document from "../model/recordDocumentModels.js";
import { Op, where } from "sequelize";

export const getAllRecipients = async (req, res) => {
  try {
    const response = await Recipient.findAll();
    return res.json(response);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

export const getIncomingDocs = async (req, res) => {
  const officeId = req.query.officeId;

  try {
    if (!officeId) {
      return res.status(400).json({ msg: "Office ID is required" });
    }

    // Fetch incoming documents with improved error logging
    const incomingDocuments = await Recipient.findAll({
      where: { office_id: officeId, status: "To Receive" },
      include: [
        {
          model: Document,
          as: "document",
          required: true,
          where: { id: { [Op.eq]: database.col("recipients.document_id") } },
        },
      ],
    });

    if (incomingDocuments.length === 0) {
      return res.status(404).json({ msg: "No incoming documents found" });
    }

    return res.json(incomingDocuments);
  } catch (error) {
    console.error("Error retrieving incoming documents:", error.message); // Log the error message
    console.error("Full error object:", error); // Log the full error object for more details
    return res.status(500).json({
      error: "Error retrieving incoming documents",
      details: error.message, // Return the error message in the response
    });
  }
};

export const getRecievedDoc = async (req, res) => {
  const recipientId = req.params.id;

  try {
    await Recipient.update(
      { status: "Pending", receivedAt: new Date() },
      { where: { id: recipientId, status: "To Receive" } }
    );
    await Document.update(
      { status: "Pending" },
      { where: { id: recipientId, status: "To Receive" } }
    );
    res.json({ message: "Document received." });
  } catch (error) {
    res.status(500).json({ error: "Error receiving document" });
  }
};

export const getDeclineDoc = async (req, res) => {
  const recipientId = req.params.id;
  const { reason } = req.body;

  try {
    await Recipient.update(
      { status: "Declined", declined_reason: reason },
      { where: { id: recipientId, status: "To Receive" } }
    );
    res.json({ message: "Document declined." });
  } catch (error) {
    res.status(500).json({ error: "Error declining document" });
  }
};

export const getPendingDoc = async (req, res) => {
  const officeId = req.query.officeId;

  try {
    const pendingDocuments = await Recipient.findAll({
      where: { office_id: officeId, status: "Pending" },
      include: [
        {
          model: Document,
          as: "document",
          required: true,
          where: { id: { [Op.eq]: database.col("recipients.document_id") } },
        },
      ],
    });
    res.json(pendingDocuments);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving pending documents" });
  }
};

export const forwardDoc = async (req, res) => {
  console.log("Log from backend body: ", req.body);
  const recipientDocId = req.params.id;
  const { recipient, action, remarks } = req.body;

  try {
    console.log("Recipient:", recipient);

    // Remove duplicate recipients by creating a Set from the recipient array
    const uniqueRecipients = [
      ...new Set(recipient.map((id) => parseInt(id, 10))),
    ];

    // Forward document to unique recipients
    const recipientEntries = uniqueRecipients.map((recipientId) => ({
      document_id: recipientDocId,
      office_id: recipientId,
      action: action,
      remarks: remarks,
      status: "To Receive",
    }));

    await Recipient.bulkCreate(recipientEntries);
    res.json({ message: "Document forwarded." });
  } catch (error) {
    res.status(500).json({ error: "Error forwarding document", error });
  }
};

export const archiveDoc = async (req, res) => {
  const documentId = req.params.id;

  try {
    await Document.update(
      { status: "Archived" },
      { where: { id: documentId } }
    );
    await Recipient.update(
      { status: "Archived" },
      { where: { document_id: documentId, status: "Pending" } }
    );
    res.json({ message: "Document and request has been archived." });
  } catch (error) {
    res.status(500).json({ error: "Error archiving document", error });
  }
};

export const getAllArchiveDocs = async (req, res) => {
  try {
    const response = await Document.findAll({
      where: {
        status: "Archived",
      },
    });

    if (!response) {
      res
        .status(500)
        .json({ error: "Error finding archive status document", error });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", error });
  }
};
