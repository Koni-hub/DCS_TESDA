import Office from "../model/officeModels.js";

// Get all offices
export const getAllOffice = async (req, res) => {
  try {
    const response = await Office.findAll();
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get office by ID
export const getOfficeByID = async (req, res) => {
  try {
    const findOffice = await Office.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!findOffice) {
      return res.status(404).json({ msg: "Office not found" });
    }

    return res.json(findOffice);
  } catch (error) {
    return res.status(500).json("Internal Server Error", error);
  }
};

// Add a new office
export const addOffice = async (req, res) => {
  try {
    const { name, email, address, phone, status } = req.body;

    const office = await Office.create({
      name,
      email,
      address,
      phone,
      status,
    });

    return res
      .status(201)
      .json({ message: "Successfully created office", office });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

// Edit an existing office
export const editOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, phone, status } = req.body;

    const office = await Office.findByPk(id);

    if (!office) {
      return res.status(404).json({ message: "Office not found" });
    }

    await office.update({
      name,
      email,
      address,
      phone,
      status,
    });

    return res
      .status(200)
      .json({ message: "Office updated successfully", office });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
