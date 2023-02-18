import {userStore} from "@/logic/common/userStore";
import {useStore} from "zustand";
import {useEffect} from "react";
import {useRouter} from "next/router";

export const useAuthGuard = () => {
    const {user, serverStatus} = useStore(userStore)
    const router = useRouter()

    useEffect(() => {

        if (serverStatus === "offline" && router.asPath !== "/offline") {
            router.push("/offline")
            return;
        }

        if (!user) {
            router.push("/login")
        }

    }, [user, serverStatus, router.asPath])


    if (serverStatus === "offline") {
        return {
            user: null
        }
    }

    return {
        user
    }
}