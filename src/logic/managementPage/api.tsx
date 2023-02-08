import {
    ManagementData,
    ManagementDataSchema,
    Task,
    TaskSchema,
    Team,
    TeamSchema,
    User,
    UserSchema
} from "@/types/types";
import {userStore} from "@/logic/common/userStore";
import {pocketbase} from "@/lib/pocketbase";
import {NanoUtils} from "@/logic/common/utils";
import {useQuery} from "@tanstack/react-query";
import {managementPageStore} from "@/logic/managementPage/managementPageStore";
import {showDebug} from "@/lib/debug";


type MANAGEMENT_QUERY_KEYS_ENUM = "tasks" | "teams" | "users";

export class MANAGEMENT_QUERY_KEYS {
    public static TASKS = "tasks" as MANAGEMENT_QUERY_KEYS_ENUM;
    public static TEAMS = "teams" as MANAGEMENT_QUERY_KEYS_ENUM;
    public static USERS = "users" as MANAGEMENT_QUERY_KEYS_ENUM;
    public static SUMMARY = "users" as MANAGEMENT_QUERY_KEYS_ENUM;
}

// fetch functions

async function fetchTeams(): Promise<Team[]> {
    const currentUserId = userStore.getState().user?.id ?? "";

    const teams = await pocketbase.collection("teams").getFullList(undefined, {
        filter: `managers.id ?= '${currentUserId}'`,
    });

    const validatedTeams = teams.map((t) => TeamSchema.parse(t));

    return validatedTeams;
}

async function fetchTasks(
    teamId: string | undefined,
    showAll: boolean
): Promise<Task[]> {
    const currentUserId = userStore.getState().user?.id ?? "";

    const filters: string[] = [];

    if (teamId && teamId !== "" && !showAll) {
        filters.push(`team.id = '${teamId}'`)
        showDebug({
            message: `selected team: ${teamId}`
        })

    }

    if (currentUserId) {
        filters.push(`team.managers.id = '${currentUserId}'`);
    }

    filters.push("status = 'none'");

    const teams = await pocketbase.collection("tasks").getFullList(undefined, {
        filter: NanoUtils.joinAndFilters(filters),
    });

    const validatedTeams = teams.map((t) => TaskSchema.parse(t));

    return validatedTeams;
}

async function fetchUsers(
    userIds: string[],
    fetchAll: boolean
): Promise<User[]> {
    let filters = "";
    if (!fetchAll) {
        const queries = userIds.map((id) => `id = '${id}'`);
        filters = NanoUtils.joinOrFilters(queries);
    }

    const users = await pocketbase.collection("users").getFullList(undefined, {
        filter: filters,
    });

    const validatedData = users.map((u) => UserSchema.parse(u));

    return validatedData;
}

async function fetchManagementData() {
    const resp = await pocketbase.send("/management-data", {})

    const validatedData = resp.map((r: any) => ManagementDataSchema.parse(r)) as ManagementData[];

    return validatedData;
}

export async function acceptTasks(tasksIds: string[]): Promise<void> {
    const currentUserId = userStore.getState().user?.id ?? "";

    for (const tId of tasksIds) {
        await pocketbase.collection("tasks").update(tId, {
            status: "accepted",
        });
    }
}

export async function rejectTasks(tasksIds: string[]): Promise<void> {
    const currentUserId = userStore.getState().user?.id ?? "";

    for (const tId of tasksIds) {
        await pocketbase.collection("tasks").update(tId, {
            status: "rejected",
        });
    }
}

export async function rejectTasksRange(userId: string, day: string): Promise<void> {
    const params = new URLSearchParams();

    params.append("userId", userId);
    params.append("day", day);

    await pocketbase.send("/reject-tasks?" + params, {
        method: "POST",
    })
}

export async function updateTasksStatuses(tasksToUpdate: {
    days: string[],
    userId: string,
    status: string,
}): Promise<void> {
    const params = new URLSearchParams();

    await pocketbase.send("/update-tasks-statuses?" + params, {
        method: "POST",
        body: JSON.stringify(tasksToUpdate),
    })
}

// hooks

function useTeams() {
    useQuery([MANAGEMENT_QUERY_KEYS.TEAMS], fetchTeams, {
        onSuccess: (teams) => {
            managementPageStore.setState((state) => {
                state.teams = teams;
            });
        },
    });
}

function useTasks() {
    const selectedTeamId = managementPageStore((state) => state.selectedTeam?.id);
    const showAllTeams = managementPageStore((state) => state.showAllTeams);
    useQuery(
        [MANAGEMENT_QUERY_KEYS.TASKS, selectedTeamId, showAllTeams],
        () => {
            if (!selectedTeamId && !showAllTeams) {
                return [];
            }

            return fetchTasks(selectedTeamId, showAllTeams);
        },
        {
            onSuccess: (tasks) => {
                managementPageStore.setState((state) => {
                    state.tasks = tasks;
                });
            },
        }
    );
}

function useUsers() {
    const selectedTeam = managementPageStore((state) => state.selectedTeam);
    const fetchAll = managementPageStore((state) => state.showAllTeams);

    useQuery(
        [MANAGEMENT_QUERY_KEYS.USERS, selectedTeam, fetchAll],
        () => {
            if (!selectedTeam?.id && !fetchAll) {
                return [];
            }

            return fetchUsers(selectedTeam?.members ?? [], fetchAll);
        },
        {
            onSuccess: (users) => {
                managementPageStore.setState((state) => {
                    state.users = users;
                });
            },
        }
    );
}

function useSummary() {
    useQuery([MANAGEMENT_QUERY_KEYS.SUMMARY], fetchManagementData, {
        onSuccess: (data) => {
            managementPageStore.setState((state) => {
                state.managementData = data;
            });
        },
    });
}

export function useManagementData() {
    useTeams();
    useTasks();
    useUsers();
    useSummary();
}
