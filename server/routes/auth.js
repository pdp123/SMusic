const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const Joi = require("joi");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        const validatePassword = await bcrypt.compare(req.body.password, user.password);
        if (!validatePassword) {
            return res.status(401).send({ message: "Invalid username or password" });
        }

        const token = user.generateAuthToken();
        return res.status(200).send({ token, username: user.username, message: "Logged in successfully" });
    } catch (error) {
        return res.status(500).send({ message: "Internal server error" });
    }
});

const validate = (data) => {
    const schema = Joi.object({
        username: Joi.string().required().label("Username"),
        password: Joi.string().required().label("Password")
    });
    return schema.validate(data);
};

module.exports = router;
