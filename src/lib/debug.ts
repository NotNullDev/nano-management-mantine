import { showNotification } from "@mantine/notifications";

export type ShowDebugProps = {
  message: string;
  title?: string;
};

export function showDebug({ message, title }: ShowDebugProps) {
  showNotification({
    message: message,
    title: title,
    color: "indigo",
    autoClose: false,
  });
}
