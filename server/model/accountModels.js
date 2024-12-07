import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const Accounts = database.define(
  "accounts",
  {
    account_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    account_username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    account_firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_pass: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    account_contactNo: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    account_status: {
      type: DataTypes.STRING,
      enum: ["active", "closed"],
      allowNull: false,
      defaultValue: "active",
    },
    isAccountVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    account_role: {
      type: DataTypes.ENUM("Admin", "Employee", "Office"),
      allowNull: false,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

(async () => {
  const tableExists = await database
    .getQueryInterface()
    .showAllTables()
    .then((tables) => tables.includes("accounts"));

  if (!tableExists) {
    console.info("Table does not exist. Syncing database...");
    await database.sync();
  } else {
    console.info("Table already exists. Skipping sync.");
  }
})();

export default Accounts;
