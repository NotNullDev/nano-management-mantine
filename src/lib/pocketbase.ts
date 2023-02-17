import Pocketbase from "pocketbase";

const isProd = process.env.NODE_ENV === "production";

let pocketbaseUrl = "";

if (!isProd) {
    pocketbaseUrl = "http://localhost:8090";
}

export const pocketbase = new Pocketbase(pocketbaseUrl);
