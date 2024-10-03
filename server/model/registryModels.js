import { DataTypes } from "sequelize";
import database from "../config/dbConfig.js";

const Registry = database.define('registyaccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    province: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sex: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    educational_attainment: {
        type: DataTypes.STRING,
        allowNull: false
    },
    present_designation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sector: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qualification_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accreditation_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date_accreditation: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    valid_until: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }

}, {
    timestamps: true
});

(async () => {
    const tableExists = await database.getQueryInterface().showAllTables()
        .then(tables => tables.includes('registyaccount'));

    if (!tableExists) {
        console.log('Table does not exist. Syncing database...');
        await database.sync();
    } else {
        console.log('Table already exists. Skipping sync.');
    }
})();

export default Registry;