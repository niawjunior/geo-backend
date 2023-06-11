const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("geo_database", "geo-user", "geo-password", {
  host: "localhost",
  dialect: "postgres", // or the appropriate database dialect
});

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "users", // optional, define the table name if different from the model name
    timestamps: true, // optional, add timestamps for createdAt and updatedAt
    updatedAt: "updatedAt", // customize the updatedAt field name
    createdAt: "createdAt", // customize the createdAt field name
  }
);

module.exports = User;
