import { env } from "process"

export default class TokenManager {
    static #token = "";
    static #expiryDate = 0;

    static async #fetchToken() {
        const requestBody = {
            scope: "https://management.azure.com//.default",
            grant_type: "client_credentials",
            client_id: env.CLIENT_ID,
            client_secret: env.CLIENT_SECRET,
        };

        const response = await fetch(`https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`, {
            method: "POST",
            body: new URLSearchParams(requestBody)
        });

        const resObj = await response.json();
        
        this.#token = resObj?.access_token;
        this.#expiryDate = Date.now() + resObj?.expires_in * 1000;
    }

    static async getToken() {
        if (Date.now() >= this.#expiryDate) await this.#fetchToken();
        return this.#token;
    }
}