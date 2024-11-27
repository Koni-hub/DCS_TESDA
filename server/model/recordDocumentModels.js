import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const RecordDocument = database.define(
  "recorddocument",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    source: {
      type: DataTypes.ENUM("Internal", "External"),
      allowNull: true,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rdInstruction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    controlNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    personConcern: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateCreated: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dateReceived: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dateCompleted: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    mode: {
      type: DataTypes.ENUM("Hard copy", "Soft copy"),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("To Receive", "Pending", "Forwarded", "Archived"),
      defaultValue: "To Receive",
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check and sync table
(async () => {
  try {
    const tableExists = await database
      .getQueryInterface()
      .showAllTables()
      .then((tables) => tables.includes("recorddocument"));

    if (!tableExists) {
      console.log("Table does not exist. Syncing database...");
      await database.sync();
    } else {
      console.log("Table already exists. Skipping sync.");
    }
  } catch (error) {
    console.error("Error syncing database:", error);
  }
})();

export default RecordDocument;