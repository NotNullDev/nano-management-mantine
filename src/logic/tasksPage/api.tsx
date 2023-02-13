// fetch functions

import {pocketbase} from "@/lib/pocketbase";
import {ActivitySchema, OrganizationSchema, ProjectSchema, TaskSchema, TeamSchema} from "@/types/types";
import {useQuery} from "@tanstack/react-query";
import {tasksPageStore} from "@/logic/tasksPage/taskpageStore";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";
import {NanoUtils} from "@/logic/common/utils";
import {NanoSort} from "@/types/utilTypes";


type TASKS_QUERY_KEYS_ENUM =
    | "tasks"
    | "teams"
    | "projects"
    | "organizations"
    | "activities";

export class TASKS_QUERY_KEYS {
    public static TASKS = "tasks" as TASKS_QUERY_KEYS_ENUM;
    public static TEAMS = "teams" as TASKS_QUERY_KEYS_ENUM;
    public static PROJECTS = "projects" as TASKS_QUERY_KEYS_ENUM;
    public static ORGANIZATIONS = "organizations" as TASKS_QUERY_KEYS_ENUM;
    public static ACTIVITIES = "activities" as TASKS_QUERY_KEYS_ENUM;
}

// hooks

export async function fetchTasksWhereTeamAndDateBetween(
    teamId: string,
    sort: NanoSort,
    selectedStatus: "none" | "rejected" | "all",
    dateStart?: string,
    dateEnd?: string,
) {
    const sortSign = TaskUtils.getNanoSortTypeAsString(sort);

    const teamFilter = `team.id = '${teamId}'`;
    const onlyAcceptedFilter = `accepted = ''`;

    const filters = [teamFilter, onlyAcceptedFilter];

    if (dateStart && dateEnd) {
        filters.push(
            `date >= "${dateStart}"`,
            `date <= "${dateEnd}"`
        )
    }

    filters.push(`status != 'accepted'`)

    if (selectedStatus === "rejected") {
        filters.push(`status = 'rejected'`)
    }

    if (selectedStatus === "none") {
        filters.push(`status = 'none'`)
    }

    const f = NanoUtils.joinAndFilters(
        filters
    );


    const tasks = await pocketbase.collection("tasks").getList(1, 10, {
        filter: f,
        sort: `${sortSign}date`
    });

    const validData = tasks.items.map((d) => TaskSchema.parse(d));

    return validData;
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

export async function fetchOrganizations() {
    const organizations = await pocketbase
        .collection("organizations")
        .getFullList();

    const validData = organizations.map((d) => OrganizationSchema.parse(d));
    return validData;
}

export const fetchActivities = async () => {
    const activities = await pocketbase.collection("activities").getFullList();

    const validData = activities.map((d) => ActivitySchema.parse(d));

    return validData;
};

export function useTasks() {
    const selectedTeam = tasksPageStore((state) => state.selectedTeam);
    const activeRange = tasksPageStore((state) => state.activeDateRange)
    const selectedStatus = tasksPageStore(state => state.selectedStatus)
    const selectedTasksSortType = tasksPageStore(state => state.selectedTasksSortType)

    const query = useQuery(
        [
            TASKS_QUERY_KEYS.TASKS,
            selectedTeam?.id,
            selectedTasksSortType,
            selectedStatus,
            activeRange
        ],
        async () => {

            tasksPageStore.setState(state => {
                state.tasksLoading = true;
            })

            let formattedDateStart: string | undefined = undefined;
            let formattedDateEnd: string | undefined = undefined;

            if (activeRange) {
                const [start, end] = activeRange;
                formattedDateStart = TaskUtils.formatDate(start);
                formattedDateEnd = TaskUtils.formatDate(end);
            }

            return fetchTasksWhereTeamAndDateBetween(
                selectedTeam?.id ?? "---",
                selectedTasksSortType,
                selectedStatus,
                formattedDateStart,
                formattedDateEnd,
            );
        },
        {
            onSuccess: (data) => {
                tasksPageStore.setState((state) => {
                    state.tasks = data
                });
            },
            onSettled: () => {
                tasksPageStore.setState(state => {
                    state.tasksLoading = false;
                })
            },
            enabled: !!selectedTeam?.id,
        }
    );

    return query;
}

export function useTeams() {
    const query = useQuery([TASKS_QUERY_KEYS.TEAMS], fetchTeams, {
        onSuccess: (data) => {
            tasksPageStore.setState((state) => {
                state.teams = data;
            });
        },
    });

    return query;
}

export function useProjects() {
    const query = useQuery([TASKS_QUERY_KEYS.PROJECTS], fetchProjects, {
        onSuccess: (data) => {
            tasksPageStore.setState((state) => {
                state.projects = data;
            });
        },
    });

    return query;
}

export function useOrganizations() {
    const query = useQuery([TASKS_QUERY_KEYS.ORGANIZATIONS], fetchOrganizations, {
        onSuccess: (data) => {
            tasksPageStore.setState((state) => {
                state.organizations = data;
            });
        },
    });

    return query;
}

export function useActivities() {
    useQuery([TASKS_QUERY_KEYS.ACTIVITIES], fetchActivities, {
        onSuccess: (data) => {
            tasksPageStore.setState((state) => {
                state.activities = data;
            });
        },
    });
}

export const useTaskManagementData = () => {
    useTasks();
    useTeams();
    useProjects();
    useOrganizations();
    useActivities();
};
