require('dotenv').config();
const { dbService } = require("./database.service");
const { v4: uuidv4 } = require("uuid");

/**
 * @typedef {Object} User
 * @property {string} username - Nom de l'user.
 * @property {string} userId - Id de l'user.
 * @property {string} userMail - mail de l'user.
 * @property {string} password -
 * @property {string[]} friendList - 

 * @typedef {Object} Room
 * @property {string} roomName
 * @property {string} roomId.
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


  /**
   * Récupérer tous les user de la base de données
   * @returns {Promise<Object[]>} - Tous les user
   */
  async getAllUsers() {
    return this.userCollection.find({}).toArray();
  }

  /**
   * Récupérer un user par son identifiant
   * @param {string} userId identifiant de l'item 
   */
  async getUserById(userId) {
    const query = { userId: userId };
    return this.userCollection.findOne(query);
  }

  /**
   * Réinitialiser la base de données en supprimant toutes les collections et en les remplissant à nouveau
   */
  async resetDatabase() {
    await this.userCollection.deleteMany({});
    await this.roomCollection.deleteMany({});
  }
}

const appService = new AppService();
module.exports = { appService };
