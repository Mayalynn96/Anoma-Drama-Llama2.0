const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
const Llama = require("./Llama");

class Post extends Model {}

Post.init(
  {
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["journal", "mood-entry"]],
      },
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["private", "anonymous", "public"]],
      },
    },
  },
  {
    sequelize
  }
);

module.exports = Post;
