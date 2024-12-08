import database from "../config/dbConfig.js";
import Recipient from "../model/recipientModels.js";
import Document from "../model/recordDocumentModels.js";
import { Op, where } from "sequelize";
import path from "path";
import fs from "fs";

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
    console.error("Error retrieving incoming documents:", error.message);
    console.error("Full error object:", error);
    return res.status(500).json({
      error: "Error retrieving incoming documents",
      details: error.message,
    });
  }
};

export const getReceivedDoc = async (req, res) => {
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
  const { reason_doc } = req.body;

  console.info('Reasoning: ', reason_doc);

  try {
    await Recipient.update(
      { status: "Declined", declined_reason: reason_doc },
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
  const documentId = req.params.id;
  const { recipient, action, remarks, userName, senderEmail, recipientDocId } = req.body;
  
  try {
    const existingRecipient = await Recipient.findByPk(recipientDocId);

    if (!existingRecipient) {
      console.error('Recipient not found:', recipientDocId);
      return res.status(404).json({ msg: "Recipient not found" });
    }

    const existingDocument = await Document.findByPk(documentId);

    if (!existingDocument) {
      console.error('Document not found:', documentId);
      return res.status(404).json({ msg: "Document not found" });
    }

    if (!recipient) {
      console.error('No recipient provided');
      return res.status(400).json({ msg: "Recipient is required" });
    }
    if (!action) {
      console.error('No action provided');
      return res.status(400).json({ msg: "Action is required" });
    }
    if (!remarks) {
      console.error('No remarks provided');
      return res.status(400).json({ msg: "Remarks are required" });
    }

    let fileName = existingDocument.image;

    if (req.files && req.files.file) {
      const file = req.files.file;

      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const newFileName = file.md5 + ext;
      const allowedTypes = [".pdf"];

      if (!allowedTypes.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid PDF Extension" });
      }

      if (fileSize > 5000000) {
        return res.status(422).json({ msg: "PDF must be less than 5MB" });
      }

      const uploadDir = path.join(process.cwd(), "public/recordDocuments/");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await file.mv(path.join(uploadDir, newFileName));
      fileName = newFileName;
    }

    const recipients = Array.isArray(recipient) 
      ? recipient 
      : [recipient];

    const uniqueRecipients = [
      ...new Set(recipients.map((id) => parseInt(id, 10))),
    ];

    await existingDocument.update({
      image: fileName,
      url: fileName
        ? `${process.env.ORIGIN}recordDocuments/${fileName}`
        : existingDocument.url,
      status: 'Forwarded'
    });

    const recipientEntries = uniqueRecipients.map((recipientId) => ({
      document_id: documentId,
      office_id: recipientId,
      action: action,
      remarks: remarks,
      status: "To Receive",
      senderName: userName,
      senderEmail: senderEmail
    }));

    await Recipient.bulkCreate(recipientEntries);
    
    res.json({ 
      message: "Document forwarded successfully.",
      documentId: documentId,
      recipients: uniqueRecipients
    });
  } catch (error) {
    console.error("Error forwarding document:", error);
    res.status(500).json({ 
      error: "Error forwarding document", 
      details: error.message 
    });
  }
};

export const archiveDoc = async (req, res) => {
  const documentId = req.params.id;

  try {
    const documentUpdate = await Document.update(
      { status: "Archived" },
      { where: { id: documentId } }
    );

    const recipientUpdate = await Recipient.update(
      { status: "Archived" },
      { where: { document_id: documentId, status: "Pending" } }
    );

    if (documentUpdate[0] === 0 && recipientUpdate[0] === 0) {
      return res.status(404).json({ error: "Document or recipient not found or already archived." });
    }

    res.json({ message: "Document and request have been archived." });
  } catch (error) {
    console.error("Error archiving document:", error);
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