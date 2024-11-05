import Document from "../model/documentModels.js";
import RejectDocuments from "../model/rejectDocumentsModels.js";

export const getAllDocuments = async (req, res) => {
  try {
    const response = await Document.findAll();
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDocumentByID = async (req, res) => {
  try {
    const response = await Document.findOne({
      where: {
        No: req.params.No,
      },
    });

    if (!response) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const generateUniqueNo = async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0"); // Months are zero-based in JavaScript

  // Find the last document in the table based on the No field
  const lastDocument = await Document.findOne({
    order: [["No", "DESC"]],
  });

  let newAI;

  if (lastDocument) {
    // Extract the AI part and increment it
    const lastNoParts = lastDocument.No.split("-");
    const lastAI = parseInt(lastNoParts[2], 10);
    newAI = (lastAI + 1).toString().padStart(4, "0"); // Increment and pad with leading zeros
  } else {
    newAI = "001"; // Start with 0001 if the table is empty
  }

  const uniqueNo = `${currentYear}-${currentMonth}-${newAI}`;

  // Check if No already exists to avoid duplicates
  const existingDocument = await Document.findOne({
    where: { No: uniqueNo },
  });
  if (existingDocument) {
    return generateUniqueNo(); // Recursively generate a new number if collision occurs
  }

  return uniqueNo;
};

export const createDocument = async (req, res) => {
  // Generate unique No
  const uniqueNo = await generateUniqueNo();

  try {
    const {
      dateReceived,
      documentOrigin,
      documentType,
      controlNo,
      documentTitle,
      dateCreated,
      dateDeadline,
      rdInstruction,
      personConcern,
      actionTaken,
      dateCompleted,
    } = req.body;

    const docs = Document.create({
      No: uniqueNo,
      dateReceived: dateReceived,
      documentType: documentType,
      documentOrigin: documentOrigin,
      controlNo: controlNo,
      documentTitle: documentTitle,
      dateCreated: dateCreated,
      dateDeadline: dateDeadline,
      rdInstruction: rdInstruction,
      personConcern: personConcern,
      actionTaken: actionTaken,
      dateCompleted: dateCompleted,
      status: "",
    });
    res.status(201).json({ message: "Document created Successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const editDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        No: req.params.No,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "No Document Found" });
    }

    const {
      No,
      dateReceived,
      documentOrigin,
      documentType,
      controlNo,
      documentTitle,
      dateCreated,
      dateDeadline,
      rdInstruction,
      personConcern,
      actionTaken,
      dateCompleted,
      status,
    } = req.body;

    const updated = await Document.update(
      {
        No,
        dateReceived,
        documentType,
        documentOrigin,
        controlNo,
        documentTitle,
        dateCreated,
        dateDeadline,
        rdInstruction,
        personConcern,
        actionTaken,
        dateCompleted,
        status,
      },
      {
        where: {
          No: req.params.No,
        },
      }
    );

    if (updated) {
      return res.status(200).json({ message: "Document updated Successfully" });
    } else {
      return res.status(404).json({ message: "No Document Found" });
    }
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        No: req.params.No,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "No Document Found" });
    }

    await Document.destroy({
      where: {
        No: req.params.No,
      },
    });

    return res.status(200).json({ message: "Document deleted Successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const rejectDocuments = async (req, res) => {
  try {
    // Find the original document using the No parameter
    const document = await Document.findOne({
      where: {
        No: req.params.No,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "No Document Found" });
    }

    // Destructure required fields from the document
    const {
      No,
      dateReceived,
      documentOrigin,
      documentType,
      controlNo,
      documentTitle,
      dateCreated,
      dateDeadline,
      rdInstruction,
      personConcern,
      actionTaken,
      dateCompleted,
      status,
    } = document; // Use the found document's data

    // Create a new rejected document entry
    await RejectDocuments.create({
      No,
      dateReceived,
      documentType,
      documentOrigin,
      controlNo,
      documentTitle,
      dateCreated,
      dateDeadline,
      rdInstruction,
      personConcern,
      actionTaken,
      dateCompleted,
      status: "Archive", // Set status to 'Rejected'
    });

    // Update the original document status to 'Rejected'
    await Document.update(
      { status: "Archive" },
      {
        where: {
          No: req.params.No,
        },
      }
    );

    return res
      .status(200)
      .json({ message: "Document successfully rejected and backed up" });
  } catch (error) {
    console.error("Error rejecting document:", error);
    res.status(500).json({ message: "Failed to reject the document" });
  }
};

export const getAllRejectedDocuments = async (req, res) => {
  try {
    const rejectedRes = await RejectDocuments.findAll();
    res.json(rejectedRes);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
