require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const { dbService } = require('./services/database.service');
// const { UserManager } = require("./managers/userManager");
// const { UserRouter } = require("./routes/user");
// const { RoomManager } = require("./managers/roomManager");
// const { RoomRouter } = require("./routes/room");

class Server {
    constructor() {
        // this.userManager = new UserManager();
        // this.userRouter = new UserRouter(this.userManager);
        // this.roomManager = new RoomManager();
        // this.roomRouter = new RoomRouter(this.roomManager);

        this.configureRoutes();
    }

    configureRoutes() {
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json());

        // this.app.use("/room", this.roomRouter.router);
        // this.app.use("/user", this.userRouter.router);

        this.app.use("/test", async () => {
            console.log("test");
        });
    }

    launch() {
        const PORT = 5020;
        this.server = this.app.listen(PORT, () => {

            console.log(`Listening on port ${PORT}`);
            dbService.connectToServer(process.env.DB_URI);
        }
        );
    }
}

const server = new Server();
server.launch()