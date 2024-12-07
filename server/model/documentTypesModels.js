import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const DocumentTypes = database.define(
  "DocumentTypes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
      .then((tables) => tables.includes("DocumentTypes"));

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

export default DocumentTypes;
