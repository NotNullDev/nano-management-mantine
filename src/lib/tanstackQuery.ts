import { showNotification } from "@mantine/notifications";
import { QueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      onError: (error) => {
        if (error instanceof ZodError) {
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
        });
      },
    },
  },
});
