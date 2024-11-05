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
    source: {
      type: DataTypes.ENUM("Internal", "External"),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mode: {
      type: DataTypes.ENUM("Hard copy", "Soft copy"),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("To Receive", "Pending", "Forwarded", "Archived"),
      defaultValue: "To Receive",
      allowNull: false,
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
