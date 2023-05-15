const User = require("./User");
const Post = require("./Post");
const Comment = require("./Comment");
const Mood = require("./Mood");
const Llama = require("./Llama");
const Reaction = require("./Reaction");

User.hasMany(Post, {
  onDelete: "CASCADE",
  });
User.hasMany(Comment);
User.hasMany(Mood, {
  onDelete: "CASCADE",
});
Post.hasMany(Mood, {
  onDelete: "CASCADE",
});
// Post.hasMany(Comment);
// User.hasMany(Reaction);
// Comment.hasMany(Reaction);

Post.belongsTo(User, {
  onDelete: "CASCADE",
});

Comment.belongsTo(User, {
  onDelete: "CASCADE",
});

// Comment.belongsTo(Post, {
//   onDelete: "CASCADE",
// });

// Comment.belongsTo(Mood, {
//   onDelete: "CASCADE",
// });

Mood.belongsTo(User, {
  onDelete: "CASCADE",
});

Mood.belongsTo(Post, {
  onDelete: "CASCADE",
});

// Reaction.belongsTo(User, {
//   onDelete: "CASCADE",
// });

// Reaction.belongsTo(Comment, {
//   onDelete: "CASCADE",
// });

Llama.belongsTo(User, {
  onDelete: "CASCADE",
});

User.hasOne(Llama, {
  onDelete: "CASCADE",
});

module.exports = { User, Post, Comment, Mood, Llama, Reaction };
