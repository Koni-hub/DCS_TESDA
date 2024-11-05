import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const Office = database.define(
  "offices",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      unique: true,
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
      .then((tables) => tables.includes("offices"));

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

export default Office;
