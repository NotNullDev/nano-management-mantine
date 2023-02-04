import {pocketbase} from "@/lib/pocketbase";
import {userStore} from "@/logic/common/userStore";
import {useQuery} from "@tanstack/react-query";
import {ProjectSchema, TasksHistory, TasksHistorySchema, TeamSchema} from "@/types/types";
import {tasksHistoryPageStore} from "@/logic/tasksHistory/tasksHistoryStore";

type TASKS_HISTORY_QUERY_KEYS_ENUM = "table" | "teams" | "projects";

export class TASKS_HISTORY_QUERY_KEYS {
    public static TABLE = "table" as TASKS_HISTORY_QUERY_KEYS_ENUM;
    public static TEAMS = "teams" as TASKS_HISTORY_QUERY_KEYS_ENUM;
    public static PROJECTS = "projects" as TASKS_HISTORY_QUERY_KEYS_ENUM;
}


type FetchTableDataProps = {
    userId: string
}

async function fetchTableData(params: FetchTableDataProps) {
    const result = await pocketbase.send("/tasks-history", {
        method: "GET",
    },);

    const validatedData = result.map((r: []) => TasksHistorySchema.parse(r)) as TasksHistory[] // ??

    return validatedData;
}

export async function fetchTeams() {
    const teams = await pocketbase.collection("teams").getFullList();

    const validData = teams.map((d) => TeamSchema.parse(d));
    return validData;
}

export async function fetchProjects() {
    const projects = await pocketbase.collection("projects").getFullList();

    const validData = projects.map((d) => ProjectSchema.parse(d));
    return validData;
}

export function useTeams() {
    const query = useQuery([TASKS_HISTORY_QUERY_KEYS.TEAMS], fetchTeams, {
        onSuccess: (data) => {
            tasksHistoryPageStore.setState((state) => {
                state.allTeams = data;
            });
        },
    });

    return query;
}

export function useProjects() {
    const query = useQuery([TASKS_HISTORY_QUERY_KEYS.PROJECTS], fetchProjects, {
        onSuccess: (data) => {
            tasksHistoryPageStore.setState((state) => {
                state.allProjects = data;
            });
        },
    });

    return query;
}


export function useTableData() {
    const user = userStore(state => state.user);

    useQuery([TASKS_HISTORY_QUERY_KEYS.TABLE], async context => {
        return await fetchTableData({
            userId: user?.id ?? ""
        })
    }, {
        onSuccess: (data) => {
            tasksHistoryPageStore.setState(state => {
                state.data = data;
            })
        }
    })
}


export function useTasksHistoryData() {
    useTableData();
    useTeams()
    useProjects()
}

