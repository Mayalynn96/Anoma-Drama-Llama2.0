const router = require("express").Router();
const { User, Post, Comment, Mood, Llama } = require("../models");
const jwt = require("jsonwebtoken");
const { findAll } = require("../models/User");

// Get All Public Posts with user name and Llama (Anonymous changed to Anoma Llama)
router.get("/", async (req, res) => {
  try {
    const allPublicPosts = await Post.findAll({
      attributes: ["id", "title", "text", "type", "visibility", "createdAt"],
      where: { visibility: "public" },
      include: [
        { model: User, attributes: ["username"], include: [{ model: Llama, attributes: ["llama_image", "llama_hat_image"] }] },
        { model: Mood, attributes: ["mood"]}
      ]
    })
    const allAnonymousPosts = await Post.findAll({
      attributes: ["id", "title", "text", "type", "visibility", "createdAt"],
      where: { visibility: "anonymous" },
      include: [
        { model: User, attributes: ["username"], include: [{ model: Llama, attributes: ["llama_image", "llama_hat_image"] }] },
        { model: Mood, attributes: ["mood"]}
      ]
    })

    allAnonymousPosts.forEach(post => {
      post.User.username = "Anoma Llama"
      post.User.Llama.llama_image = "https://raw.githubusercontent.com/Mayalynn96/Anoma-Drama-Llama2.0/Dev/public/images/pixel-llamas/Anoma-llama.png"
      post.User.Llama.llama_hat_image = "https://raw.githubusercontent.com/Mayalynn96/Anoma-Drama-Llama2.0/Dev/public/images/pixel-llamas/no-hat.png"
    })

    const allPosts = allPublicPosts.concat(allAnonymousPosts)

    res.json(allPosts.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }))
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting all posts!" })
  };
});

// router.get("/:id", (req, res) => {
//   Post.findOne({
//     where: {
//       id: req.params.id,
//     },
//     include: [Users, Comments],
//   })
//     .then((dbPostData) => {
//       if (!dbPostData) {
//         res.status(404).json({ message: "No post found with this id" });
//         return;
//       }
//       res.json(dbPostData);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json(err);
//     });
// });

// Add post
router.post("/", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "You must be logged in to add a post!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    const postData = await Post.create({
      title: req.body.title,
      text: req.body.text,
      type: req.body.type,
      visibility: req.body.visibility,
      UserId: tokenData.id,
    })

    const allMoods = await req.body.moods.forEach((mood) => {
      const newMood = Mood.create({
        mood: mood,
        UserId: tokenData.id,
        PostId: postData.id
      })
    })

    res.status(201).json({ message: "Post added and associated moods have been added!" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding post!" })
  };
});

// Edit post with emotions and visibility
router.put("/:id", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "You must be logged in to modify a post!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const postToEdit = await Post.findByPk(req.params.id)

    if (!postToEdit) {
      return res.status(404).json({ msg: "No post found with this id" });
    }

    if(tokenData.id!=postToEdit.UserId){
      return res.status(403).json({ msg: "You can only modify your own post"})
    }

    const oldMoods = await Mood.findAll({where: {PostId : req.params.id }})

    oldMoods.forEach(mood => {
      if(!req.body.moods.includes(mood.mood)){
        mood.destroy()
      }
    })

    req.body.moods.forEach(async(mood) => {
      const existingMood = await Mood.findOne({where: [
        {mood: mood},
        {PostId: req.params.id}
      ]})
      if(!existingMood){
        const newMood = await Mood.create({
          mood: mood,
          UserId: tokenData.id,
          PostId: req.params.id
        })
      }
    })
    const modifiedPost = await Post.update({
      title: req.body.title,
      text: req.body.text,
      visibility: req.body.visibility
    }, {
      where: {
        id: req.params.id
      }
    })
    
    return res.json({ msg: "Post and moods have been edited."})

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error editing post!" })
  };
});

router.delete("/:id", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "You must be logged in to deleting a post!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const postToDelete = await Post.findByPk(req.params.id)

    if (!postToDelete) {
      return res.status(404).json({ msg: "No post found with this id" });
    }

    if(tokenData.id!=postToDelete.UserId){
      return res.status(403).json({ msg: "You can only delete your own post"})
    } else {
      postToDelete.destroy()
    }

    const deletingMoods = await Mood.destroy({
      where: {
        PostId: req.params.id
      }
    })

    return res.json({ msg: "Post and associated moods have been removed."})

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post!" })
  };
});

module.exports = router;