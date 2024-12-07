import DocumentTypes from "../model/documentTypesModels.js";

export const getAllDocumentTypes = async (req, res) => {
  try {
    const response = await DocumentTypes.findAll();
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getDocumentTypeByID = async (req, res) => {
  try {
    const response = await DocumentTypes.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!response) {
      return res.status(404).json("No document types found");
    }
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const addDocumentTypes = async (req, res) => {
  try {
    const { name } = req.body;

    const documentTypes = await DocumentTypes.create({ name });

    return res
      .status(201)
      .json({ message: "Successfully created document types" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const editDocumentTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const documentTypes = await DocumentTypes.findByPk(id);

    if (!documentTypes) {
      return res.status(404).json({ message: "Document Types not found" });
    }

    const updateDocumentTypes = await DocumentTypes.update(
      {
        name,
      },
      {
        where: {
          id,
        },
      }
    );

    return res
      .status(200)
      .json({
        message: "Document Types updated successfully",
        DocumentTypes: updateDocumentTypes,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};