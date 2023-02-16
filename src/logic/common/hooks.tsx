import {userStore} from "@/logic/common/userStore";
import {useStore} from "zustand";
import {useEffect} from "react";
import {useRouter} from "next/router";

export const AuthGuard = () => {
    const {user, serverStatus} = useStore(userStore)
    const router = useRouter()

    useEffect(() => {

        if (serverStatus === "offline") {
            router.push("/offline");
            return;
        }

        if (!user) {
            router.push("/login")
        }
    }, [user, serverStatus])


    if (serverStatus === "offline") {
        return {
            user: null
        }
    }

    return {
        user
    }
}