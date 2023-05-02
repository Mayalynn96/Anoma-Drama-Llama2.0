const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
router.use("/users", userRoutes);

const postsRoutes = require("./postsRoutes");
router.use("/posts", postsRoutes);

const commentsRoutes = require("./commentsRoutes");
router.use("/comments", commentsRoutes);

const MoodRoutes = require("./moodRoutes");
router.use("/moods", MoodRoutes);

// const frontEndRoutes = require("./frontEndRoutes");
// router.use("/", frontEndRoutes);

const llamaRoutes = require("./llamaRoutes");
router.use("/llamas", llamaRoutes);

module.exports = router;
