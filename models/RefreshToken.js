const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("geo_database", "geo-user", "geo-password", {
  host: "localhost",
  dialect: "postgres",
});

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
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
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: "updatedAt", // customize the updatedAt field name
    createdAt: "createdAt", // customize the createdAt field name
  }
);

module.exports = RefreshToken;
