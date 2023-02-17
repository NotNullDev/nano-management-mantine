import {pocketbase} from "@/lib/pocketbase";
import {userStore} from "@/logic/common/userStore";
import {useQuery} from "@tanstack/react-query";
import {ProjectSchema, Task, TaskSchema, TasksHistory, TasksHistorySchema, TeamSchema} from "@/types/types";
import {tasksHistoryPageStore} from "@/logic/tasksHistory/tasksHistoryStore";
import {TasksHistoryFiltersOptional} from "@/types/utilTypes";
import {tasksHistoryFilterToUrlSearchParams} from "@/logic/common/pure";
import {taskDetailsDrawerStore} from "@/components/common/TaskDetailsDrawer";
import {NanoUtils} from "@/logic/common/utils";

type TASKS_HISTORY_QUERY_KEYS_ENUM = "table" | "teams" | "projects";

export class TASKS_HISTORY_QUERY_KEYS {
    public static TABLE = "table" as TASKS_HISTORY_QUERY_KEYS_ENUM;
    public static TEAMS = "teams" as TASKS_HISTORY_QUERY_KEYS_ENUM;
    public static PROJECTS = "projects" as TASKS_HISTORY_QUERY_KEYS_ENUM;
    public static CURRENT_SELECTED_TASK = "currentSelectedTask" as TASKS_HISTORY_QUERY_KEYS_ENUM;
}


type FetchTableDataProps = {
    userId: string,
    filter: TasksHistoryFiltersOptional
}

async function fetchTableData(params: FetchTableDataProps) {
    const searchParams = tasksHistoryFilterToUrlSearchParams(params.filter);
    const result = await pocketbase.send(NanoUtils.withUrlPrefix("/tasks-history") + "?" + searchParams, {
        method: "GET",
    });

    const validatedData = result.map((r: []) => TasksHistorySchema.parse(r)) as TasksHistory[] // ??

    return validatedData;
}

export async function fetchTeams() {
    const teams = await pocketbase.collection("teams").getFullList();

    const validData = teams.map((d) => TeamSchema.parse(d));
    return validData;
}

export async function fetchTaskWithId(taskId: string): Promise<Task | undefined> {
    const res = await pocketbase.collection("tasks").getOne(taskId)

    if (!res) {
        return undefined;
    }

    const task = TaskSchema.parse(res);

    return task;
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


function useTableData() {
    const user = userStore(state => state.user);
    const filter = tasksHistoryPageStore(state => state.filter);

    useQuery([TASKS_HISTORY_QUERY_KEYS.TABLE, user, filter], async context => {
        return await fetchTableData({
            userId: user?.id ?? "",
            filter: filter
        })
    }, {
        onSuccess: (data) => {
            tasksHistoryPageStore.setState(state => {
                state.data = data;
            })
        }
    })
}

export function useSelectedTaskId() {
    const selectedTaskId = taskDetailsDrawerStore(state => state.taskId)

    useQuery([TASKS_HISTORY_QUERY_KEYS.CURRENT_SELECTED_TASK, selectedTaskId], async () => {
        if (!selectedTaskId) {
            return undefined;
        }
        return await fetchTaskWithId(selectedTaskId);
    }, {
        enabled: !!selectedTaskId,
        onSuccess: (data) => {
            taskDetailsDrawerStore.setState(state => {
                state.task = data;
            })
        }
    })

}


export function useTasksHistoryData() {
    useTableData();
    useTeams()
    useProjects()
}

