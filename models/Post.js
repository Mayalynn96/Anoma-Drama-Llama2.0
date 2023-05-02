const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
const Llama = require("./Llama");

class Post extends Model {
  static async afterCreate(post, options) {
    const llama = await Llama.findOne({ where: { userId: post.userId } });
    if (llama) {
      llama.happiness += post.type === "mood-entry" ? 1 : 2;
      llama.happiness = Math.min(llama.happiness, 10);
      await llama.save();
    }
  }
}

Post.init(
  {
    moodText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
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
    sequelize,
    hooks: {
      afterCreate: Post.afterCreate,
    },
  }
);

module.exports = Post;
