import TokenManager from "./Tokenmanager.js"
import { env } from "process"

export const listResourceGroups = async function() {
    const token = await TokenManager.getToken();
    const res = await fetch(`https://management.azure.com/subscriptions/${env.SUBSCRIPTION_ID}/resourcegroups?api-version=2021-04-01`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        }
    })

    const resObj = await res.json();
    const resourceGroups = resObj?.value;

    if (resourceGroups === undefined) return [];

    return resourceGroups;
}

