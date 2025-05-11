import { ResourceGroupController } from "./../utils/AzureController.js"
import express from "express"

const router = express.Router();

router.get("/list", async (req, res) => {
    const rgCnt = new ResourceGroupController();
    const groups = await rgCnt.list();

    const groupNames = [];

    for (const group of groups) {
        groupNames.push(group.name);
    }

    res.json(groupNames);
})

export default router;