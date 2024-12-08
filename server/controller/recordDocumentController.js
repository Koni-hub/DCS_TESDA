import RecordDocument from "../model/recordDocumentModels.js";
import Recipient from "../model/recipientModels.js";
import path from "path";
import fs from "fs";
import "dotenv/config";

export const getAllRecordDocument = async (req, res) => {
  try {
    const response = await RecordDocument.findAll();
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error", error });
  }
};

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

const generateUniqueNo = async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const lastDocument = await RecordDocument.findOne({
    order: [["No", "DESC"]],
  });

  let newAI;

  if (lastDocument) {
    const lastNoParts = lastDocument.No.split("-");
    const lastAI = parseInt(lastNoParts[2], 10);
    newAI = (lastAI + 1).toString().padStart(4, "0");
  } else {
    newAI = "0001";
  }

  const uniqueNo = `${currentYear}-${currentMonth}-${newAI}`;

  const existingDocument = await RecordDocument.findOne({
    where: { No: uniqueNo },
  });
  if (existingDocument) {
    return generateUniqueNo();
  }

  return uniqueNo;
};

export const addRecordDocument = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ msg: "No File Uploaded" });
  }

  const { title, source, type, description, mode, recipient, action, remarks, userName, senderEmail } =
    req.body;

  const file = req.files.file;

  const uniqueNo = await generateUniqueNo();

  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
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

  const url = `${process.env.ORIGIN}recordDocuments/${fileName}`;

  file.mv(path.join(uploadDir, fileName), async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ msg: "File Upload Error" });
    }

    try {
      const recordDocument = await RecordDocument.create({
        No: uniqueNo,
        title,
        source,
        type,
        description,
        mode,
        image: fileName,
        url,
        status: "To Receive",
      });

      const uniqueRecipients = [
        ...new Set(recipient.map((id) => parseInt(id, 10))),
      ];

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
          recordDocument: recordDocument
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal server error", error });
    }
  });
};

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

    let fileName = recordDocument.image;

    if (req.files && req.files.file) {
      const file = req.files.file;

      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const newFileName = file.md5 + ext;
      const allowedTypes = [".pdf"];

      if (!allowedTypes.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid Image Extension" });
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
    res.status(500).json({ error: "Internal Server Error: " + error });
  }
};

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

export const editToReceiveDocs = async (req, res) => {
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

    if (!source || !type || !title || !description || !mode) {
      return res.status(400).json({ msg: "All fields are required. (t)" });
    }

    let fileName = recordDocument.image;

    if (req.files && req.files.file) {
      const file = req.files.file;

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
      fileName = newFileName;
    }

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