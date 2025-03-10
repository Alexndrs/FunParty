require('dotenv').config();
const { dbService } = require("./database.service");
const { v4: uuidv4 } = require("uuid");

/**
 * @typedef {Object} User
 * @property {string} username - Nom de l'user.
 * @property {string} userId - Id de l'user.
 * @property {email} userMail - mail de l'user.
 * @property {number} startTime - Début de la réservation en millisecondes.
 * @property {number} endTime - Fin de la réservation en millisecondes.
 *
 * @typedef {Object} Room
 * @property {string} clientName - Nom du client.
 * @property {string} plateauId - Id du plateau réservé.
 * @property {string[]} itemIds - Items à réserver
 * @property {number} startTime - Début de la réservation en millisecondes.
 * @property {number} endTime - Fin de la réservation en millisecondes.
 * 
 * @typedef {Object} Challenge
 * @property {string} clientName - Nom du client.
 * @property {string} plateauId - Id du plateau réservé.
 * @property {string[]} itemIds - Items à réserver
 * @property {number} startTime - Début de la réservation en millisecondes.
 * @property {number} endTime - Fin de la réservation en millisecondes.
 */

class AppService {
  constructor() {
    this.JSON_PATH_ITEMS = path.join(__dirname, "../data/items.json");
    this.JSON_PATH_PLATEAUS = path.join(__dirname, "../data/plateaus.json");
    this.fileSystemManager = new FileSystemManager();
    this.dbService = dbService;
  }

  get reservationsCollection() {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_RESERVATIONS);
  }

  /**
   * TODO : Récupérer la collection des items
   */
  get itemsCollection() {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_ITEMS);
  }

  /**
   * TODO : Récupérer la collection des plateaus
   */
  get plateausCollection() {
    return this.dbService.db.collection(DB_CONSTS.DB_COLLECTION_PLATEAUS);
  }


  /**
   * TODO : Récupérer tous les items de la base de données
   * @returns {Promise<Object[]>} - Tous les items
   */
  async getAllItems() {
    return this.itemsCollection.find({}).toArray();
  }

  /**
   * TODO : Récupérer un item par son identifiant
   * @param {string} itemId identifiant de l'item 
   */
  async getItemById(itemId) {
    const query = { id: itemId };
    return this.itemsCollection.findOne(query);
  }

  /**
   * TODO : Récupérer tous les plateaux de la base de données
   * @returns {Promise<Object[]>} - Tous les plateaux
   */
  async getAllPlateaus() {
    return this.plateausCollection.find({}).toArray();
  }

  /**
   * TODO : Récupérer un plateau par son identifiant
   * @param {string} plateauId identifiant du plateau
   */
  async getPlateauById(plateauId) {
    const query = { id: plateauId };
    return this.plateausCollection.findOne(query);
  }

  /**
   * TODO : Vérifier la disponibilité d'un plateau pour une réservation en comparant les heures de début et de fin 
   * avec les réservations existantes
   * @param {string} plateauId identifiant du plateau
   * @param {number} startTime heure de début de la réservation en millisecondes
   * @param {number} endTime heure de fin de la réservation en millisecondes
   */
  async checkPlateauAvailability(plateauId, startTime, endTime) {
    // TODO : Tenir compte des heures de début et fin des réservations existantes
    const overlappingReservations = await this.reservationsCollection
      .find({
        plateauId,
      })
      .toArray();

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    for (const reservation of overlappingReservations) {

      const reservationStart = new Date(reservation.startTime);
      const reservationEnd = new Date(reservation.endTime);

      const isOverlapping =
        (startDate <= reservationStart && reservationStart < endDate) ||
        (startDate < reservationEnd && reservationEnd <= endDate) ||
        (reservationStart <= startDate && endDate <= reservationEnd);

      if (isOverlapping) {
        return reservation; //Si une reservation overlap on la renvoie
      }
    }
    return null;
  }

  /**
   * Récupérer toutes les réservations de la base de données
   */
  async getAllReservations() {
    return await this.reservationsCollection.find().toArray();
  }

  /**
   * TODO : Récupérer une réservation par son identifiant
   */
  async getReservationById(id) {
    const query = { _id: id };
    return this.reservationsCollection.findOne(query);
  }

  async getReservationsForPlateau(plateauId) {
    return await this.reservationsCollection.find({ plateauId }).toArray();
  }

  /**
   * TODO : Ajouter une nouvelle réservation. 
   * TODO : Gérer le cas de données valides (voir les commentaires ci-dessous)
   * @throws {Error} - Si le plateau n'existe pas
   * @throws {Error} - Si un item n'est pas autorisé pour ce plateau
   * @throws {Error} - Si la plage horaire n'est pas disponible
   * @param {Reservation} reservationData - Les données de la réservation
   */
  async createReservation(reservationData) {
    const {
      plateauId,
      itemIds,
      startTime,
      endTime,
      clientName,
    } = reservationData;

    // TODO : Vérifer la validité du plateau, des items et de la plage horaire

    const plateau = await this.getPlateauById(plateauId);

    if (!plateau) {
      throw new Error("Invalid plateau");
    }

    if (await this.checkPlateauAvailability(plateauId, startTime, endTime)) {
      throw new Error("Requested time slot not available");
    }

    if (itemIds) {
      for (const item of itemIds) {
        if (!plateau.allowedItems.includes(item)) {
          throw new Error("Some items are not allowed for this plateau");
        }
      }
    }

    const reservation = {
      _id: uuidv4(),
      plateauId: plateauId,
      plateauName: plateau.name,
      clientName: clientName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdAt: new Date(),
      itemIds: itemIds,
    };

    // TODO : Insérer la réservation dans la base de données
    await this.reservationsCollection.insertOne(reservation);
    return reservation;
  }

  /**
   * TODO : Supprimer une réservation par son identifiant
   * @param {string} id identifiant de la réservation
   * @returns {Promise<import("mongodb").DeleteResult>} - Résultat de la suppression
   */
  async deleteReservation(id) {
    const result = await this.reservationsCollection.deleteOne({ _id: id });
    return result;
  }
  /**
   * Bonus : Modifier une réservation existante. 
   * @throws {Error} - Si la plage horaire n'est pas disponible
   * @param {string} reservationId - L'id de la réservation
   * @param {Reservation} newReservationData - Les données de la réservation
   */
  async updateReservation(reservationId, newReservationData) {
    const {
      plateauId,
      itemIds,
      startTime,
      endTime,
      clientName,
    } = newReservationData;

    const reservation = await this.getReservationById(reservationId);
    if (!reservation) {
      throw new Error("Reservation not found");
    }

    const overlappingReservations = await this.checkPlateauAvailability(plateauId, startTime, endTime);
    if (overlappingReservations._id !== reservationId) {
      throw new Error("Requested time slot not available");
    }

    const plateau = await this.getPlateauById(plateauId);

    const updatedReservation = {
      plateauId,
      plateauName: plateau.name,
      clientName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      itemIds,
    };

    const result = await this.reservationsCollection.updateOne(
      { _id: reservationId },
      { $set: updatedReservation }
    );

    return result;
  }

  /**
   * Réinitialiser la base de données en supprimant toutes les collections et en les remplissant à nouveau
   * Fonction fournie à des fins de débogage durant le développement
   */
  async resetDatabase() {
    await this.reservationsCollection.deleteMany({});
    await this.itemsCollection.deleteMany({});
    await this.plateausCollection.deleteMany({});
    await this.populateDb();
  }
}

const reservationService = new ReservationService();
module.exports = { reservationService };
