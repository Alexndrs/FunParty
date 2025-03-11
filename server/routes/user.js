require('dotenv').config();
const express = require("express");
const jwt = require('jsonwebtoken');

class UserRouter {

    constructor(userManager) {
        this.userManager = userManager;
        this.router = express.Router();
        this.configureRoutes();
    }

    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.status(401).send('Token required');

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).send('Invalid token');
            req.user = user;
            next();
        });
    }

    authorizeRole = (role) => {
        return (req, res, next) => {
            if (req.user.role !== role) {
                return res.status(403).send('Access Denied');
            }
            next();
        };
    };

    configureRoutes() {
        this.router.get('/', this.authenticateToken, this.authorizeRole("admin"), async (req, res) => {
            try {
                const users = await this.userManager.getUsers();
                res.json(users);
            } catch (err) {
                res.status(500).send("Internal server error");
            }
        });

        this.router.post('/', async (req, res) => {
            const { accessToken, status } = await this.userManager.createUser(req.body.name, req.body.mail, req.body.password);

            if (status.number === 409)
                res.status(409).send(`${status.alreadyExistingField} already exists`); // Mail or name already exists
            else if (status.number === 500)
                res.status(500).send("Internal server error"); // Internal server error
            else
                res.status(201).json({ accessToken });
        });

        this.router.post('/login', async (req, res) => {
            const { accessToken, status } = await this.userManager.loggingUser(req.body.mail, req.body.password);

            if (status.number === 404)
                res.status(404).send("User not found");
            else if (status.number === 403)
                res.status(403).send("Wrong password");
            else if (status.number === 500)
                res.status(500).send("Internal server error");
            else
                res.status(200).json({ accessToken });
        });


        this.router.delete('/', this.authenticateToken, this.authorizeRole("admin"), () => {
            // Clear DB : 
            this.userManager.clearDB();
        })

    }
}

module.exports = { UserRouter };