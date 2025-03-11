require('dotenv').config();
const { dbService } = require("./database.service");

/**
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
 */

class AppService {
  constructor() {
    this.dbService = dbService;
  }

  get userCollection() {
    return this.dbService.db.collection(process.env.USER_COLLECTION);
  }

  get roomCollection() {
    return this.dbService.db.collection(process.env.ROOM_COLLECTION);
  }


  // Récupérer tous les users de la base de données
  async getAllUsers() {
    return this.userCollection.find({}).toArray();
  }

  /**
   * Récupérer un user par son identifiant
   * @param {string} userId identifiant de l'item 
   */
  async getUserById(userId) {
    const query = { id: userId };
    return this.userCollection.findOne(query);
  }

  /**
  * Ajouter un user à la base de données
  * @param {Object} user identifiant de l'item 
  */

  async addUser(user) {
    // ajouter un user si il n'existe pas déjà
    if (await this.findUserByMail(user.mail)) {
      throw new Error("User already exists");
    }
    return this.userCollection.insertOne(user);
  }

  async findUserByMail(mail) {
    const query = { mail: mail };
    return this.userCollection.findOne(query);
  }

  async updateUser(user) {
    const query = { id: user.id };
    const update = { $set: user };
    return this.userCollection.updateOne(query, update);
  }

  async getAllRooms() {
    return this.roomCollection.find({}).toArray();
  }

  async getRoomById(roomId) {
    const query = { roomId: roomId };
    return this.roomCollection.findOne(query);
  }

  async addRoom(room) {
    return this.roomCollection.insertOne(room);
  }

  async updateRoom(room) {
    const query = { id: room.id };
    const update = { $set: room };
    return this.roomCollection.updateOne(query, update);
  }


  async resetUserCollection() {
    await this.userCollection.deleteMany({});
  }

  async resetRoomCollection() {
    await this.roomCollection.deleteMany({});
  }

  /**
   * Réinitialiser la base de données en supprimant toutes les collections
   */
  async resetDatabase() {
    await this.userCollection.deleteMany({});
    await this.roomCollection.deleteMany({});
  }
}

const appService = new AppService();
module.exports = { appService };
