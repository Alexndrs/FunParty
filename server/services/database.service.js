const { MongoClient, ServerApiVersion } = require('mongodb');

class DatabaseService {
    /**
     * Établir la connection avec la base de données MongoDB
     * @param {string} uri URI de la base de données MongoDB 
     */
    async connectToServer(uri) {
        try {
            this.client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            });

            await this.client.connect();
            this.db = this.client.db();
            console.log('Successfully connected to MongoDB.');
        } catch (err) {
            console.error(err);
        }
    }
}

const dbService = new DatabaseService();

module.exports = { dbService };