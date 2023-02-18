import {Button} from "@mantine/core";
import Head from "next/head";
import React from "react";
import {authenticateUser, userStore} from "@/logic/common/userStore";
import {useStore} from "zustand";
import {useRouter} from "next/router";

export const LoginPage = () => {
    useLoginStatus();

    return (
        <>
            <Head>
                <title>Login</title>
            </Head>
            <div className="flex-1 flex flex-col justify-center items-center">
                <Button
                    className="bg-violet-900"
                    onClick={async () => {
                        authenticateUser();
                    }}
                >
                    Login as test user
                </Button>
            </div>
        </>
    );
};

export default LoginPage;


const useLoginStatus = () => {
    const {user} = useStore(userStore)
    const router = useRouter()

    if (user) {
        router.push("/");
    }
}