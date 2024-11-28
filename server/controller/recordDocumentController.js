import RecordDocument from "../model/recordDocumentModels.js";
import Recipient from "../model/recipientModels.js";
import path from "path";
import fs from "fs";
import "dotenv/config";

// Get all record documents
export const getAllRecordDocument = async (req, res) => {
  try {
    const response = await RecordDocument.findAll();
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Get a record document by ID
export const getRecordDocumentByID = async (req, res) => {
  try {
    const response = await RecordDocument.findOne({
      where: { id: req.params.id },
    });

    if (!response) {
      return res.status(404).json({ msg: "No record document found" });
    }

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

// Add a new record document
export const addRecordDocument = async (req, res) => {
  console.log("Log from backend body: ", req.body);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: "No File Uploaded" });
  }

  const { title, source, origin, type, rdInstruction, controlNo, personConcern, dateCreated, dateReceived, dateCompleted, description, mode, recipient, action, remarks, userName, senderEmail } =
    req.body;

    console.log('Sender Name: ', userName);
    console.log('Sender Email: ', senderEmail);

  console.log("Recipient:", recipient);

  const file = req.files.file;

  // File details
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const allowedTypes = [".png", ".jpg", ".jpeg"];

  if (!allowedTypes.includes(ext.toLowerCase())) {
    return res.status(422).json({ msg: "Invalid Image Extension" });
  }

  if (fileSize > 5000000) {
    return res.status(422).json({ msg: "Image must be less than 5MB" });
  }

  // Absolute path to save images
  const uploadDir = path.join(process.cwd(), "public/recordDocuments/");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const url = `${process.env.ORIGIN}recordDocuments/${fileName}`;

  // Move the file to the designated directory
  file.mv(path.join(uploadDir, fileName), async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "File Upload Error" });
    }

    try {
      // Create the record document first
      const recordDocument = await RecordDocument.create({
        title,
        source,
        origin,
        type,
        rdInstruction,
        controlNo,
        personConcern,
        dateCreated,
        dateReceived,
        dateCompleted,
        description,
        mode,
        image: fileName,
        url,
        status: "To Receive", // Set initial status
      });

      // Remove duplicate recipients by creating a Set from the recipient array
      const uniqueRecipients = [
        ...new Set(recipient.map((id) => parseInt(id, 10))),
      ];

      // Forward document to unique recipients
      const recipientEntries = uniqueRecipients.map((recipientId) => ({
        document_id: recordDocument.id,
        office_id: recipientId,
        action: action,
        remarks: remarks,
        status: "To Receive",
        senderName: userName,
        senderEmail: senderEmail
      }));

      await Recipient.bulkCreate(recipientEntries);

      return res
        .status(201)
        .json({
          msg: "Record Document Created Successfully and forwarded to recipients",
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal server error", error });
    }
  });
};

// Edit a record document (to forward to another office)
export const editRecordDocument = async (req, res) => {
  try {
    const recordDocument = await RecordDocument.findOne({
      where: { id: req.params.id },
    });

    if (!recordDocument) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    const {
      source,
      type,
      title,
      description,
      mode,
      action,
      remarks,
      recipient,
    } = req.body;

    // Check if the required fields are provided
    if (
      !source ||
      !type ||
      !title ||
      !description ||
      !mode ||
      !action ||
      !remarks ||
      !recipient
    ) {
      return res.status(400).json({ msg: "All fields are required." });
    }

    // If a new file is provided, handle file upload
    let fileName = recordDocument.image; // Keep existing image by default

    if (req.files && req.files.file) {
      const file = req.files.file;

      // File details
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const newFileName = file.md5 + ext;
      const allowedTypes = [".png", ".jpg", ".jpeg"];

      if (!allowedTypes.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid Image Extension" });
      }

      if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5MB" });
      }

      const uploadDir = path.join(process.cwd(), "public/recordDocuments/");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await file.mv(path.join(uploadDir, newFileName));
      fileName = newFileName; // Update to the new file name
    }

    // Update record document with new values
    await RecordDocument.update(
      {
        source,
        type,
        title,
        description,
        mode,
        recipient,
        action,
        remarks,
        image: fileName,
        url: fileName
          ? `${process.env.ORIGIN}recordDocuments/${fileName}`
          : undefined,
      },
      {
        where: { id: req.params.id },
      }
    );

    return res
      .status(200)
      .json({ msg: "Record Document Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Delete a record document
export const deleteRecordDocument = async (req, res) => {
  const recordDocument = await RecordDocument.findOne({
    where: { id: req.params.id },
  });

  if (!recordDocument) return res.status(404).json({ msg: "No Data Found" });

  try {
    const filepath = `./public/recordDocuments/${recordDocument.image}`;
    fs.unlinkSync(filepath);
    await RecordDocument.destroy({
      where: { id: req.params.id },
    });
    res.status(200).json({ msg: "Record Document deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error: " + error });
  }
};

// Record fetch data by it's status = "To Receive"
export const getAllToReceiveDocs = async (req, res) => {
  try {
    const findToReceiveDocs = await RecordDocument.findAll({
      where: { status: "To Receive" },
    });

    if (!findToReceiveDocs) {
      return res
        .status(404)
        .json({ msg: "No documents has to receive status" });
    }

    return res.json(findToReceiveDocs);
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Edit Record Document if status is only "To Receive"
export const editToRecieveDocs = async (req, res) => {
  try {
    const recordDocument = await RecordDocument.findOne({
      where: { id: req.params.id },
    });

    const isToReceive = await RecordDocument.findOne({
      where: { status: "To Receive" },
    });

    if (!isToReceive) {
      return res.json({ msg: "Document no longer be edited" });
    }

    if (!recordDocument) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    const { source, type, title, description, mode } = req.body;

    // Check if the required fields are provided
    if (!source || !type || !title || !description || !mode) {
      return res.status(400).json({ msg: "All fields are required. (t)" });
    }

    // If a new file is provided, handle file upload
    let fileName = recordDocument.image; // Keep existing image by default

    if (req.files && req.files.file) {
      const file = req.files.file;

      // File details
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const newFileName = file.md5 + ext;
      const allowedTypes = [".png", ".jpg", ".jpeg"];

      if (!allowedTypes.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid Image Extension" });
      }

      if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Image must be less than 5MB" });
      }

      const uploadDir = path.join(process.cwd(), "public/recordDocuments/");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await file.mv(path.join(uploadDir, newFileName));
      fileName = newFileName; // Update to the new file name
    }

    // Update record document with new values
    await RecordDocument.update(
      {
        source,
        type,
        title,
        description,
        mode,
        image: fileName,
        url: fileName
          ? `${process.env.ORIGIN}recordDocuments/${fileName}`
          : undefined,
      },
      {
        where: { id: req.params.id },
      }
    );

    return res
      .status(200)
      .json({ msg: "Record Document Updated Successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};
