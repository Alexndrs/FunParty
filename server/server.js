require('dotenv').config();
const express = require("express");
const cors = require("cors");

const { dbService } = require('./services/database.service');

const { UserManager } = require("./managers/userManager");
const { UserRouter } = require("./routes/user");

// const { RoomManager } = require("./managers/roomManager");
// const { RoomRouter } = require("./routes/room");

class Server {
    constructor() {
        this.app = express();
    }

    configureRoutes() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use("/user", this.userRouter.router);
        // this.app.use("/room", this.roomRouter.router);

        this.app.use("/test", async () => {
            console.log("test");
        });
    }

    async launch() {
        const PORT = 5020;



        this.server = this.app.listen(PORT, async () => {

            await dbService.connectToServer(process.env.DB_URI)
            console.log(`Listening on port ${PORT}.`);

            this.userManager = new UserManager();
            this.userRouter = new UserRouter(this.userManager);

            this.configureRoutes();
            await this.userManager.createAdmin();
        });
    }
}

const server = new Server();
server.launch()