const { v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { appService } = require('../services/app.service');

/**
 * 
 * Méthadonnées d'un user
 * @typedef {Object} User
 * @property {string} id 
 * @property {string} name
 * @property {string} mail
 * @property {string} password (hashed)
 * @property {string} role (admin or user)
 * @property {string[]} friendList - (list of user id)
 * 
 */

class UserManager {
    constructor() {
        this.userCollection = appService.userCollection;
    }

    async getUsers() {
        return appService.getAllUsers();
    }

    async createAdmin() {
        try {
            const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            let role = "admin";
            const id = uuidv4();
            const newAdmin = { id, name: "admin", mail: process.env.ADMIN_MAIL, password: hashedAdminPassword, role, friendList: [] };
            await appService.addUser(newAdmin);
        } catch (err) {

        }
    }

    async createUser(name, mail, password) {
        // Vérifier si l'utilisateur existe déjà
        const user = await appService.findUserByMail(mail);
        if (user) {
            return { accessToken: undefined, status: { number: 409, alreadyExistingField: user.name === name ? "name" : "mail" } };
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            let role = "user"; // rôle par défaut
            const id = uuidv4();
            const newUser = { id, name, mail, password: hashedPassword, role, friendList: [] };
            await appService.addUser(newUser); // Ajout à la db

            const accessToken = jwt.sign(
                { id: newUser.id, name: newUser.name, role: newUser.role },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '3h' }
            );

            return { accessToken, status: { number: 201 } };
        } catch (err) {
            return { accessToken: undefined, status: { number: 500 } };
        }
    }

    async addFriend(userId1, userId2) {
        try {

            console.log(userId1)
            console.log(userId2)

            const user1 = await appService.getUserById(userId1);
            const user2 = await appService.getUserById(userId2);
            if (!user1 || !user2) {
                return { status: { number: 404 } };
            }
            if (user1.friendList.includes(userId2) || user2.friendList.includes(userId1)) {
                return { status: { number: 409 } };
            }
            user1.friendList.push(userId2);
            user2.friendList.push(userId1);
            await appService.updateUser(user1);
            await appService.updateUser(user2);
            return { status: { number: 200 } };
        } catch (err) {
            return { status: { number: 500 } };
        }
    }

    async loggingUser(mail, password) {
        // Vérifier si l'utilisateur existe déjà
        const user = await appService.findUserByMail(mail);
        if (!user) {
            return { accessToken: undefined, status: { number: 404 } };
        }
        // Vérifier le mot de passe
        try {
            if (await bcrypt.compare(password, user.password)) {
                const accessToken = jwt.sign(
                    { id: user.id, name: user.name, role: user.role },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '3h' }
                );
                return { accessToken, status: { number: 200 } };
            } else {
                return { accessToken: undefined, status: { number: 403 } };
            }
        } catch (err) {
            return { accessToken: undefined, status: { number: 500 } };
        }
    }


    async clearDB() {
        try {
            await appService.resetDatabase();
            await this.createAdmin();
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = { UserManager };