const router = require("express").Router();
const { User, Post, Comment, Mood, Llama } = require("../models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const email = require("../nodemailer");
const jwt = require("jsonwebtoken");

// Get all users DEV MODE
router.get("/", async (req, res) => {
    try {
        const allUsers = await User.findAll();
        res.json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting all users!" })
    };
});

//GET current userInfo
router.get("/currentUserInfo", async (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "you must be logged in to get current User Info!" });
    }
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        const results = await User.findByPk(tokenData.id, {
            include: [Llama]
        });

        if (results) {
            return res.json(results);
        } else {
            res.status(404).json({
                message: "No record exists!"
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting data - couldn't find user" });
    }
})

// Check if token is valide
router.get("/isValidToken", (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res
            .status(401).json({ isValid: false, message: "you must be logged in!" });
    }
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            isValid: true,
            user: tokenData,
        });
    } catch (err) {
        res.status(403).json({
            isValid: false,
            message: "invalid token",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const results = await User.findByPk(req.params.id);

        if (results) {
            return res.json(results);
        } else {
            res.status(404).json({
                message: "No record exists!"
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error getting data - couldn't find user" });
    }
})

//POST a new User
router.post("/", async (req, res) => {

    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        })
        const token = jwt.sign(
            {
                username: newUser.username,
                id: newUser.id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            }
        );
        email(req.body.email, req.body.username);
        res.json({
            token,
            user: newUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating new user' })
    }
})

//DELETE a record
router.delete("/", async (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "you must be logged in to delete User!" });
    }
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        const foundUser = await User.findByPk(tokenData.id)

        if (!foundUser) {
            return res.status(404).json({ message: "no such User!" });
        } else {
            const results = await User.destroy({
                where: {
                    id: tokenData.id
                }
            })

            return res.json({ message: "User was deleted!" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting User!" });
    }
})

//UPDATE a record
router.put("/", async (req, res) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "you must be logged in to edit User!" });
    }
    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        const foundUser = await User.findByPk(tokenData.id)

        if (!foundUser) {
            return res.status(404).json({ message: "no such User!" });
        } else {
            const updatedUser = await User.update(req.body, {
                where: {
                    id: tokenData.id
                }
            })

            return res.json({ message: "User was updated!" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating user!" });
    }
})


//POST route for login
router.post("/login", async (req, res) => {
    try {
        const foundUser = await User.findOne({
            where: {
                [Op.or]: [{ username: req.body.login }, [{ email: req.body.login }]]
            }
        })

        if (!foundUser) {
            return res.status(400).json({ message: "Login POST - Incorrect Login" })
        } else if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
            return res.status(400).json({ message: "Login POST - Incorrect Password" })
        } else {
            const token = jwt.sign(
                {
                    username: foundUser.username,
                    id: foundUser.id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            );
            res.json({
                token,
                user: foundUser,
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error - logging in" });
    }
})


module.exports = router;
