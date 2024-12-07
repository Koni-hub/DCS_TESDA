import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const Office = database.define(
  "office",
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
      .then((tables) => tables.includes("office"));

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

export default Office;
