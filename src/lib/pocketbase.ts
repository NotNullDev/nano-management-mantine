import Pocketbase from "pocketbase";
import {userStore} from "@/logic/common/userStore";
import {useTimeout} from "@mantine/hooks";

const isProd = process.env.NODE_ENV === "production";

let pocketbaseUrl = "";

if (!isProd) {
    pocketbaseUrl = "http://localhost:8090";
}

export const pocketbase = new Pocketbase(pocketbaseUrl);

pocketbase.afterSend = (response, data) => {
    console.log("OMGGGGGGGGGGGGGGGGg")
    if (response.status === 401) {
        pocketbase.authStore.clear();
        return data;
    }

    if (response.status !== 200) {
        console.log("something went wrong", response, data);
    }

    return data;
}

if (typeof window !== "undefined") {
    setInterval(async () => {
        let ok = false;
        try {
            const resp = await pocketbase.health.check();
            if (resp.code === 200) {
                ok = true;
            }
        } catch (e) {}

        userStore.setState(state => {
            state.serverStatus = ok ? "online" : "offline";
        })
    }, 5000)
}

// if (typeof window !== "undefined") {
//     const windowFetch = window.fetch;
//
//     window.fetch = async (url, params) => {
//         let resp;
//         try {
//             resp = await windowFetch(url, params)
//         } catch (e) {
//             throw e;
//         }
//
//         return resp;
//     }
//
// }