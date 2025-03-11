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


  // Récupérer tous les users de la base de données
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
