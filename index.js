import "dotenv/config.js"
import express from "express"

import { listResourceGroups } from "./utils/AzureController.js";

const app = express()

app.get("/", (req, res) => {
    res.send("Hello, World!");
})

listResourceGroups().then(e => console.log(e));
app.listen(3000);