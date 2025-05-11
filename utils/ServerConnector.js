import { Client } from "ssh2"

export default class ServerConnector {
    constructor() {
        this.conn = new Client();
        this.isConnected = false;

        this.conn.connect({
            host: "20.185.150.136",
            port: 22,
            username: "dzielska",
            password: "FortnitE123.!"
        });

        this.conn.on("ready", () => this.isConnected = true);
    }
}