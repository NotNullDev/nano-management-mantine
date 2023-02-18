import {showNotification} from "@mantine/notifications";
import {QueryClient} from "@tanstack/react-query";
import {ZodError} from "zod";
import {userStore} from "@/logic/common/userStore";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            onError: (error) => {
                const serverStatus = userStore.getState().serverStatus;
                if (serverStatus === "offline") {
                    return;
                }

                if (userStore.getState().user && error instanceof ZodError) {
                    console.log(error);

                    const errorMessage = error.errors
                        .map(
                            (e) =>
                                `field: [${e.path}], code: ${e.code}, message: [${e.message}]`
                        )
                        .join("\n");


                    showNotification({
                        title: "Failed to validate data from the server",
                        message: errorMessage,
                        autoClose: false,
                        color: "red",
                    });

                    return;
                }

                showNotification({
                    title: "Failed to fetch or validate data from the server",
                    message: "Something went wrong...",
                    autoClose: false,
                    color: "red",
                });
            },
        },
    },
});
