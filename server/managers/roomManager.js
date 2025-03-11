const { v4: uuidv4 } = require('uuid');
const { appService } = require('../services/app.service');
import { generateChallenge } from '../AI/challengeGenerator';
/**
 * 
 * @typedef {Object} User
 * @property {string} id 
 * @property {string} name
 * @property {string} mail
 * @property {string} password (hashed)
 * @property {string} role (admin or user)
 * @property {string[]} friendList - 
 * @property {string[]} roomList - 

 * @typedef {Object} Room
 * @property {string} name
 * @property {string} id.
 * @property {string[]} usersId - Id des users dans la room.
 * @property {Challenge[]} challenges - Liste des challenges de la room.
 * 
 * @typedef {Object} Challenge
 * @property {string} challengeId
 * @property {string} challengeTitle
 * @property {string} challengeDescription
 * @property {string} challengeTime - heure de création du challenge
 * @property {string} challengePoints - points attribués au challenge
 * @property {string[]} winnerIds - Id des gagnants du challenge.
 * 
 */

class RoomManager {
    constructor() {
        this.roomCollection = appService.roomCollection;
    }

    async getRooms() {
        return appService.getAllRooms();
    }

    async createRoom(name, usersId) {
        // Filtrer les users qui n'existent pas

        const users = await Promise.all(usersId.map(async userId => {
            const user = await appService.getUserById(userId);
            return user ? userId : null;
        }));

        const validUsersId = users.filter(userId => userId !== null);

        if (validUsersId.length === 0) {
            return { status: { number: 400, message: "No valid users found" } };
        }

        const roomId = uuidv4();
        const newRoom = { id: roomId, name, usersId: validUsersId, challenges: [] };

        try {
            await appService.addRoom(newRoom);
            return { status: { number: 201, message: "Room created successfully" } };
        } catch (err) {
            return { status: { number: 500, message: "Internal server error" } };
        }
    }

    async addUsersToRoom(roomId, usersId) {
        const room = await appService.getRoomById(roomId);

        if (!room) {
            return { status: { number: 404, message: "Room not found" } };
        }

        // Filtrer les users qui n'existent pas ou qui sont déjà dans la room
        const users = await Promise.all(usersId.map(async userId => {
            const user = await appService.getUserById(userId);
            return user && !room.usersId.includes(userId) ? userId : null;
        }));

        const validUsersId = users.filter(userId => userId !== null);

        if (validUsersId.length === 0) {
            return { status: { number: 400, message: "No valid users found" } };
        }

        room.usersId.push(...validUsersId);

        try {
            await appService.updateRoom(room);
            return { status: { number: 200, message: "Users added successfully" } };
        } catch (err) {
            return { status: { number: 500, message: "Internal server error" } };
        }
    }

    async addChallengeToRoom(roomId, challenge) {

        const room = await appService.getRoomById(roomId);

        if (!room) {
            return { status: { number: 404, message: "Room not found" } };
        }

        const challengeId = uuidv4();
        const newChallenge = { challengeId, ...challenge, winnerIds: [] };

        room.challenges.push(newChallenge);

        try {
            await appService.updateRoom(room);
            return { status: { number: 200, message: "Challenge added successfully" } };
        } catch (err) {
            return { status: { number: 500, message: "Internal server error" } };
        }

    }




    async clearDB() {
        try {
            await appService.resetRoomCollection();
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = { RoomManager };