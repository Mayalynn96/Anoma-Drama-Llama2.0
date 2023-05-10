const router = require("express").Router();
const { Users, Mood, Comments, Reaction, Llama } = require("../models");
const jwt = require("jsonwebtoken");

// Get all Llamas DEV MODE
router.get("/", async (req, res) => {
  try {
    const allLlamas = await Llama.findAll();
    res.json(allLlamas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting all Llamas!" })
  };
});

// Get llama by user ID
// router.get("/user/:id", (req, res) => {
//   Users.findByPk(req.params.id, {
//     include: [Llama],
//   })
//     .then((dbPostData) => res.json(dbPostData))
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ msg: "error occured", err });
//     });
// });

router.post("/", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "you must be logged in to add llama!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    const newLlama = await Llama.create({
      name: req.body.name,
      llama_image: req.body.llama_image,
      llama_hat_image: req.body.llama_hat_image,
      happiness: req.body.happiness,
      UserId: tokenData.id,
    })

    return res.json(newLlama)

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating llama!" });
  }
});

router.put("/", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ msg: "you must be logged in to edit llama!" });
  }
  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    const llamaData = Llama.update(req.body,
      { where: { UserId: tokenData.id } }
    )

    if(!llamaData){
      return res.status(404).json({message: "this user has no Llama"})
    }

    return res.json({msg: "Llama was updated!"})

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating llama!" });
  }
});

router.delete("/", (req, res) => {
  
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).json({ msg: "you must be logged in to delete llama!" });
    }
    try {
      const tokenData = jwt.verify(token, process.env.JWT_SECRET);
  
      const llamaData = Llama.destroy({
        where: {
          UserId: tokenData.id,
        }
      })
  
      if(!llamaData){
        return res.status(404).json({message: "this user has no Llama"})
      }
  
      return res.json({msg: "Llama was deleted!"})
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting llama!" });
    }
});

// Get loged in user Llama
// router.get("/current_llama", (req, res) => {
//   Users.findByPk(req.session.userId, {
//     include: [Llama],
//   })
//     .then((dbPostData) => res.json(dbPostData))
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ msg: "error occured", err });
//     });
// });

module.exports = router;
