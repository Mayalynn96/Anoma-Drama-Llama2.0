const router = require("express").Router();
const { User, Post, Comment, Mood, Llama } = require("../models");
const jwt = require("jsonwebtoken");

// Get All Public Posts with user name and Llama and Anonymous changed to Anoma Llama
router.get("/", async (req, res) => {
  try {
    const allPublicPosts = await Post.findAll({
      where: { visibility: "public" },
      include: [
        { model: User, attributes: ["username"], include: [{ model: Llama, attributes: ["llama_image", "llama_hat_image"] }] }
      ]
    })
    const allAnonymousPosts = await Post.findAll({
      where: { visibility: "anonymous" },
      include: [
        { model: User, attributes: ["username"], include: [{ model: Llama, attributes: ["llama_image", "llama_hat_image"] }] }
      ]
    })

    allAnonymousPosts.forEach(post => {
      post.User.username = "Anoma Llama"
      post.User.Llama.llama_image = "https://raw.githubusercontent.com/Mayalynn96/Anoma-Drama-Llama2.0/Dev/public/images/pixel-llamas/Anoma-llama.png"
      post.User.Llama.llama_hat_image = "https://raw.githubusercontent.com/Mayalynn96/Anoma-Drama-Llama2.0/Dev/public/images/pixel-llamas/no-hat.png"
    })

    const allPosts = allPublicPosts.concat(allAnonymousPosts)

    res.json(allPosts.sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
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
    return res.status(401).json({ msg: "You must be logged in to add mood!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const allMoodsData = [...req.body.moods]
    let moodText = " "
    
    if (req.body.moods.length < 1) {
      moodText = req.body.moods[0]
    } if (req.body.moods.length > 1) {
      const lastWord = allMoodsData.pop()
      const allOtherWords = allMoodsData.join(", ")
      const allWords = [allOtherWords, lastWord]
      moodText = allWords.join(" and ")
    }
    const postData = await Post.create({
      moodText: moodText,
      title: req.body.title,
      text: req.body.text,
      type: req.body.type,
      visibility: req.body.visibility,
      UserId: tokenData.id,
    })
    
    const allMoods =  await req.body.moods.forEach( (mood) => {
      const newMood = Mood.create({
        mood: mood,
        UserId: tokenData.id,
        PostId: postData.id
      })
    })

    res.status(201).json({ message: "Post added!" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding post!" })
  };
});

router.put("/:id", (req, res) => {
  Post.update({
    title: req.body.title,
    text: req.body.text
  }, {
    where: {
      id: req.params.id
    }
  }).then((dbPostData) => { res.json(dbPostData) })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    })
});

router.delete("/:id", (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;