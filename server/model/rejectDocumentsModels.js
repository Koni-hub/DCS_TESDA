import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const Document = database.define("rejectdocuments", {
  No: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  dateReceived: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  documentType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  documentOrigin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  controlNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  documentTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateCreated: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dateDeadline: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rdInstruction: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  personConcern: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  actionTaken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateCompleted: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

(async () => {
  // Check if the table exists
  const tableExists = await database
    .getQueryInterface()
    .showAllTables()
    .then((tables) => tables.includes("rejectdocuments"));

  if (!tableExists) {
    console.log("Table does not exist. Syncing database...");
    await database.sync();
  } else {
    console.log("Table already exists. Skipping sync.");
  }
})();

export default Document;
