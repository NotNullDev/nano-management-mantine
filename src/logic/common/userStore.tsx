import { pocketbase } from "@/lib/pocketbase";
import { showNotification } from "@mantine/notifications";
import { Admin, Record } from "pocketbase";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type UserStore = {
  user: Admin | Record | null;
};

export const userStore = create<UserStore>()(
  persist(
    immer((set, get, store) => {
      pocketbase.authStore.onChange((token, model) => {
        set((state) => {
          state.user = model;
        });
      });

      return {
        user: null,
      };
    }),
    {
      name: "userStore",
    }
  )
);

export async function authenticateAdmin() {
  const data = await pocketbase.admins.authWithPassword(
    "symmetric777@gmail.com",
    "1234567890"
  );

  if (data) {
    showNotification({
      message: "You are logged in as admin",
    });
  }
}

export async function authenticateUser() {
  const data = await pocketbase
    .collection("users")
    .authWithPassword("test", "1234567890");

  if (data) {
    showNotification({
      message: "You are logged in as user",
    });
  }
}

export async function logoutUser() {
  await pocketbase.authStore.clear();
}
