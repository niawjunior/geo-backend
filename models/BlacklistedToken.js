const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("geo_database", "geo-user", "geo-password", {
  host: "localhost",
  dialect: "postgres",
});

const BlacklistedToken = sequelize.define(
  "BlacklistedToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    tableName: "blacklisted_tokens",
    timestamps: true,
    updatedAt: "updatedAt", // customize the updatedAt field name
    createdAt: "createdAt", // customize the createdAt field name
  }
);

module.exports = BlacklistedToken;
