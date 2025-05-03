import dotenv from "dotenv"
import express from "express"

dotenv.config();

const app = express()

app.get("/", (req, res) => {
    res.send("Hello, World!");
})

app.listen(3000);