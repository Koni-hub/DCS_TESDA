import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const AuditLog = database.define("auditlogs", {
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
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
  const tableExists = await database
    .getQueryInterface()
    .showAllTables()
    .then((tables) => tables.includes("auditlogs"));

  if (!tableExists) {
    console.info("Table does not exist. Syncing database...");
    await database.sync();
  } else {
    console.info("Table already exists. Skipping sync.");
  }
})();

export default AuditLog;
