import {useEffect, useState} from "react";
import {useStore} from "zustand";
import {userStore} from "@/logic/common/userStore";
import {useRouter} from "next/router";

export default function OfflinePage() {
    const online = useOnlineStatus()
    useOnlineBack();

    return (
        <pre className="flex-1 justify-center items-center flex flex-col">
            {
                !online && (
                    <div>Internet access is required to use Nano Management</div>
                )
            }
            {
                online && (
                    <div>Sorry, it seems like we have trouble connecting to our servers.</div>
                )
            }
            <div>Please try again later.</div>
        </pre>
    )
}

const useOnlineBack = () => {
    const {serverStatus} = useStore(userStore)
    const router = useRouter()

    useEffect(() => {
        if (serverStatus === "online") {
            router.push("/");
        }
    }, [serverStatus])
}

const useOnlineStatus = () => {
    const [online, setOnline] = useState(true)

    useEffect(() => {
        setOnline(navigator.onLine)
    }, [navigator.onLine])

    return online;
}