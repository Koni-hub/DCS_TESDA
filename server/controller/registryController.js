import Registry from "../model/registryModels.js";

export const getAllRegistry = async (req, res) => {
  try {
    const response = await Registry.findAll();
    res.json(response);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error", err });
  }
};

export const getRegistryByID = async (req, res) => {
  try {
    const response = await Registry.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!response) {
      return res.status(404).json({ msg: "No Registry found" });
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const saveRegistry = async (req, res) => {
  try {
    const {
      region,
      province,
      name,
      address,
      sex,
      date_of_birth,
      educational_attainment,
      present_designation,
      company_name,
      sector,
      qualification_title,
      accreditation_number,
      date_accreditation,
      valid_until,
    } = req.body;

    const createRegirsty = Registry.create({
      region,
      province,
      name,
      address,
      sex,
      date_of_birth,
      educational_attainment,
      present_designation,
      company_name,
      sector,
      qualification_title,
      accreditation_number,
      date_accreditation,
      valid_until,
    });
    res
      .status(201)
      .json({
        msg: "Registry created successfully",
        RegistryData: createRegirsty,
      });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const editRegistry = async (req, res) => {
  try {
    const registry = await Registry.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!registry) {
      res.status(404).json({ msg: "Registry not found" });
    }

    const {
      region,
      province,
      name,
      address,
      sex,
      date_of_birth,
      educational_attainment,
      present_designation,
      company_name,
      sector,
      qualification_title,
      accreditation_number,
      date_accreditation,
      valid_until,
    } = req.body;

    const createRegirsty = Registry.update(
      {
        region,
        province,
        name,
        address,
        sex,
        date_of_birth,
        educational_attainment,
        present_designation,
        company_name,
        sector,
        qualification_title,
        accreditation_number,
        date_accreditation,
        valid_until,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res
      .status(201)
      .json({
        msg: "Registry updated successfully",
        RegistryData: createRegirsty,
      });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const deleteRegistry = async (req, res) => {
  try {
    const response = await Registry.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!response) {
      res.status(404).json({ msg: "Registry not found" });
    }

    await Registry.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ msg: "Registry deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
