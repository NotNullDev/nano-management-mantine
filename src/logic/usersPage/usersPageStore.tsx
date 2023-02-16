import {createStore} from "zustand";
import {User} from "@/types/types";
import {immer} from "zustand/middleware/immer";

export type UsersPageStoreType = {
    users: User[];
}


export const usersPageStore = createStore<UsersPageStoreType>()(
    immer((set, get, store) => {
        return {
            users: [] as User[],
        }
    })
)
