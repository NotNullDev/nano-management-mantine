import {Activity, Project, Task, Team, User} from "./types";
import {z} from "zod";

export type MantineSelectedActivityType = {
    value: Activity;
    label: string;
    group: string;
};

export type MantineSelectedProjectType = {
    value: Project;
    label: string;
    group: string;
};

export type MantineSelectedTeamType = {
    value: Team;
    label: string;
    group: string;
};

export type TasksGroupedByUser = {
    user: User;
    tasks: Task[];
};

export type GroupedSummary = {
    teamName: string;
    months: {
        date: string;
        tasksSum: number;
    }[];
};

//
// export const TaskHistorySortSchema = z.object({
//     team: z.enum(["asc", "desc"] as const),
//     user: z.enum(["asc", "desc"] as const),
//     taskDuration: z.enum(["asc", "desc"] as const),
//     date: z.enum(["asc", "desc"] as const)
// })
// export type TaskHistorySort = z.infer<typeof TaskHistorySortSchema>
// export type TaskHistorySortOptional = Partial<TaskHistorySort>


export const NanoSortOptions = ["asc", "desc", ""] as const;
export type NanoSort = typeof NanoSortOptions[number];

export const TaskStatusOptions = ["accepted", "rejected", "none"] as const;
export type TaskStatus = typeof TaskStatusOptions[number];

const TasksHistoryFiltersSchema = z.object({
    idFilter: z.string(),
    teamFilter: z.string(),
    projectFilter: z.string(),
    userFilter: z.string(),
    statusFilter: z.enum(TaskStatusOptions),
    dateFromFilter: z.string(),
    dateToFilter: z.string(),

    page: z.number(),
    limit: z.number(),

    teamSort: z.enum(NanoSortOptions),
    userSort: z.enum(NanoSortOptions),
    taskDurationSort: z.enum(NanoSortOptions),
    dateSort: z.enum(NanoSortOptions),
    taskStatusSort: z.enum(NanoSortOptions)
})


export type TasksHistoryFilters = z.infer<typeof TasksHistoryFiltersSchema>
export type TasksHistoryFiltersOptional = Partial<TasksHistoryFilters>