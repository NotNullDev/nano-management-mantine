// fetch functions

import {pocketbase} from "@/lib/pocketbase";
import {ActivitySchema, OrganizationSchema, ProjectSchema, TaskSchema, TeamSchema} from "@/types/types";
import {NanoSortType} from "@/types/utilTypes";
import {useQuery} from "@tanstack/react-query";
import {tasksPageStore} from "@/logic/tasksPage/taskpageStore";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";
import {NanoUtils} from "@/logic/common/utils";

export async function fetchTaskManagementData() {
    const tasks = await pocketbase.collection("tasks").getFullList();

    const teams = await pocketbase.collection("teams").getFullList();

    const projects = await pocketbase.collection("projects").getFullList();

    const organizations = await pocketbase
        .collection("organizations")
        .getFullList();

    console.log(tasks);
    console.log(teams);
    console.log(projects);
    console.log(organizations);
}

export async function fetchTasks() {
    const tasks = await pocketbase.collection("tasks").getFullList();

    const validData = tasks.map((d) => TaskSchema.parse(d));

    return validData;
}

export async function fetchTasksWhereTeamAndDateBetween(
    teamId: string,
    sort: NanoSortType,
    rejectedOnly: boolean,
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

    if (rejectedOnly) {
        filters.push(`rejected != ''`)
    }

    const f = NanoUtils.joinAndFilters(
        filters
    );


    const tasks = await pocketbase.collection("tasks").getFullList(undefined, {
        filter: f,
        sort: `${sortSign}date`,
    });

    const validData = tasks.map((d) => TaskSchema.parse(d));

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

const fetchActivities = async () => {
    const activities = await pocketbase.collection("activities").getFullList();

    const validData = activities.map((d) => ActivitySchema.parse(d));

    return validData;
};

// hooks

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

export function useTasks() {
    const selectedTeam = tasksPageStore((state) => state.selectedTeam);
    const activeRange = tasksPageStore((state) => state.activeDateRange)
    const selectedRejectedOnly = tasksPageStore(state => state.selectedRejectedOnly)
    const selectedTasksSortType = tasksPageStore(state => state.selectedTasksSortType)

    const query = useQuery(
        [
            TASKS_QUERY_KEYS.TASKS,
            selectedTeam?.id,
            selectedTasksSortType,
            selectedRejectedOnly,
            activeRange
        ],
        async () => {

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
                selectedRejectedOnly,
                formattedDateStart,
                formattedDateEnd,
            );
        },
        {
            onSuccess: (data) => {
                tasksPageStore.setState((state) => {
                    state.tasks = data;
                });
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