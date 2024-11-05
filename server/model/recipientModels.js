import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const Recipient = database.define(
  "recipients",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    document_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "recorddocuments",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    office_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(
        "For approval/signature",
        "For comments",
        "For filing/archiving",
        "For appropriate action",
        "For information"
      ),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "Archived",
        "To Receive",
        "Pending",
        "Received",
        "Declined"
      ),
      defaultValue: "To Receive",
    },
    declined_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    forwardedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    receivedAt: {
      type: DataTypes.DATE,
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
      .then((tables) => tables.includes("recipients"));

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

export default Recipient;
