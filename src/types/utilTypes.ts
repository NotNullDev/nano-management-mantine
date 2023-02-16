import {Activity, ManagementData, Project, Task, TaskStatusOptions, Team, User} from "./types";
import {z} from "zod";

export type MantineSelectedActivityType = {
    value: Activity;
    label: string;
    group: string;
};

export type TasksGroupedByUser = {
    user: User;
    tasks: Task[];
};

export type GroupedManagementData = {
    userId: string;
    userName: string;
    userEmail: string;
    managementData: ManagementData[]
}

export type GroupedSummary = {
    teamName: string;
    months: {
        date: string;
        tasksSum: number;
    }[];
};

export const NanoSortOptions = ["asc", "desc", ""] as const;
export type NanoSort = typeof NanoSortOptions[number];


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

const UsersFiltersSchema = z.object({
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


export type UsersFilters = z.infer<typeof TasksHistoryFiltersSchema>
export type UsersFiltersOptional = Partial<TasksHistoryFilters>