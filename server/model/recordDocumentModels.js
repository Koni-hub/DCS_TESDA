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
    No: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    source: {
      type: DataTypes.ENUM("Internal", "External"),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
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

(async () => {
  try {
    const tableExists = await database
      .getQueryInterface()
      .showAllTables()
      .then((tables) => tables.includes("recorddocument"));

    if (!tableExists) {
      console.info("Table does not exist. Syncing database...");
      await database.sync();
    } else {
      console.info("Table already exists. Skipping sync.");
    }
  } catch (error) {
    console.error("Error syncing database:", error);
  }
})();

export default RecordDocument;