const User = require("./User");
const Post = require("./Post");
const Mood = require("./Mood");
const Llama = require("./Llama");
const Reaction = require("./Reaction");

User.hasMany(Post, {
  onDelete: "CASCADE",
  });

User.hasMany(Mood, {
  onDelete: "CASCADE",
});

Post.hasMany(Mood, {
  onDelete: "CASCADE",
});

Post.belongsTo(User, {
  onDelete: "CASCADE",
});

Mood.belongsTo(User, {
  onDelete: "CASCADE",
});

Mood.belongsTo(Post, {
  onDelete: "CASCADE",
});

Reaction.belongsTo(User, {
  onDelete: "CASCADE",
});

User.hasMany(Reaction)

Reaction.belongsTo(Post, {
  onDelete: "CASCADE",
})

Post.hasMany(Reaction)


Llama.belongsTo(User, {
  onDelete: "CASCADE",
});

User.hasOne(Llama, {
  onDelete: "CASCADE",
});

module.exports = { User, Post, Mood, Llama, Reaction };
