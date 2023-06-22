const router = require("express").Router();
const { User, Post, Reaction, Mood, Llama } = require("../models");
const jwt = require("jsonwebtoken");

router.post("/:postId", async (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "You must be logged in to react to posts!" });
    }
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);

        const postToReactTo = await Post.findByPk(req.params.postId);

        if(!postToReactTo){
            return res.status(404).json({message: "No post found with this Id"})
        }

        const postReaction = await Reaction.findOne({ where: [{ UserId: tokenData.id, PostId: req.params.postId }] })

        if (postReaction) {
            if (postReaction.reaction === req.body.reaction) {
                return res.json({ message: "reaction has been removed" })
            }
            postReaction.destroy()
        }

        const addReaction = await Reaction.create({
            reaction: req.body.reaction,
            UserId: tokenData.id,
            PostId: req.params.postId
        })

        return res.json({ message: "reaction has been added" })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding reaction!" })
    };
})

module.exports = router;