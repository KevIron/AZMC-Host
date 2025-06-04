import express from "express"

import { VirtualMachineController } from "./../utils/AzureController.js"

const router = express.Router();

router.post("/stop/:group/:id", async (req, res) => {
    const { group, id } = req.params;
    const cnt = new VirtualMachineController(group);

    cnt.dealocate(id);
});

router.post("/start/:group/:id", async (req, res) => {
    const { group, id } = req.params;
    const cnt = new VirtualMachineController(group);

    const result = await cnt.get();
    res.sendStatus(result === true ? 200 : 500);
});

router.post("/info/:group/:id", async (req, res) => {
    
});

router.put("/create/:group/:id", async (req, res) => {
    const { group, id } = req.params;
    const cnt = new VirtualMachineController(group);

    const result = await cnt.create("test", "eastus", "xd");
    console.log(result);
    res.sendStatus(result === true ? 200 : 500);
});

export default router;