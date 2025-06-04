import "dotenv/config.js"

import express from "express"
import http from "http"

import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import groupsRouter from "./routes/serverGroups.js";
import serversRouter from "./routes/servers.js";
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", socket => {
    
})

app.use("/groups", groupsRouter);
app.use("/servers", serversRouter);

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
})

server.listen(3000);