const router = require("express").Router();
const { Users, Mood, Comments, Posts } = require("../models");
const jwt = require("jsonwebtoken");

// Get all moods DEV MODE
router.get("/", async (req, res) => {
  try {
    const moodData = await Mood.findAll()
    res.json(moodData)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting all moods!" })
  };
});

// All moods by current user
router.get("/user", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "you must be logged in to see all moods!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const userMoodData = await Mood.findAll({ where: { UserId: tokenData.id } })
    if (!userMoodData) {
      res.status(404).json({ message: "No moods found for current user" });
      return;
    }
    res.json(userMoodData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting all user moods!" })
  };
});

// Post new mood
router.post("/", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "You must be logged in to add mood!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const newMood = await Mood.create({
      mood: req.body.mood,
      UserId: tokenData.id,
      PostId: req.body.postId
    })
    res.json({ msg: "Mood has been added" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding mood!" })
  };
});

// Delete mood
router.delete("/:id", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "You must be logged in to delete mood!" })
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const moodToDelete = await Mood.findByPk(req.params.id)
    if(moodToDelete.UserId!=tokenData.id){
      return res.status(403).json({ msg: "You can only delete your own mood"})
    }
    const deletedMood = await Mood.destroy({
      where: {
        id: req.params.id,
      },
    })
    if (!deletedMood) {
      return res.status(404).json({ message: "No mood found with this id" });
    }
    return res.json({ msg: "Mood has been deleted!"})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting mood!" })
  };
});

module.exports = router;
