import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const DocumentAuditLogs = database.define("documentAudits", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }, 
  document_id: {
    type: DataTypes.INTEGER,
      references: {
        model: "recorddocuments",
        key: "id",
      },
      onDelete: "CASCADE",
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiver: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

(async () => {
  // Check if the table exists
  const tableExists = await database
    .getQueryInterface()
    .showAllTables()
    .then((tables) => tables.includes("documentAudits"));

  if (!tableExists) {
    console.log("Table does not exist. Syncing database...");
    await database.sync();
  } else {
    console.log("Table already exists. Skipping sync.");
  }
})();

export default DocumentAuditLogs;