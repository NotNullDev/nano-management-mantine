import {pocketbase} from "@/lib/pocketbase";
import {User, UserSchema} from "@/types/types";
import {useQuery} from "@tanstack/react-query";
import {usersPageStore} from "@/logic/usersPage/usersPageStore";

export class USERS_QUERY_KEYS {
    public static ALL_USERS = "users"
}



export const fetchUsers = async (): Promise<User[]> => {
    const users = await pocketbase.collection("users").getFullList();

    const data = users.map((d) => UserSchema.parse(d)) as User[];;

    return data;
}



function useUsers() {
    useQuery([USERS_QUERY_KEYS.ALL_USERS],  fetchUsers, {
        onSuccess: (data) => {
            usersPageStore.setState((state) => {
                state.users = data;
            });
            console.log(data)
        }
    })
}


export function useUsersPageData() {
    useUsers()
}