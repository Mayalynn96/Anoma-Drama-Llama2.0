const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Reaction extends Model {}

Reaction.init(
  {
    reaction: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },

  {
    sequelize
  }
);

module.exports = Reaction;
