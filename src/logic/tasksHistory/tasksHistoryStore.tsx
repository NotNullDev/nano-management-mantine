import {Project, Task, TasksHistory, Team} from "@/types/types";
import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import {NanoSort, TasksHistoryFiltersOptional} from "@/types/utilTypes";

export type TasksPageStoreType = {
    data: TasksHistory[]

    allTeams: Team[]
    allProjects: Project[]

    selectedProjectId?: string
    selectedTeamId?: string
    selectedTaskId?: string
    activeDateRange: [Date, Date] | undefined;

    currentlySelectedTask?: Task

    filter: TasksHistoryFiltersOptional
};

export const tasksHistoryPageStore = create<TasksPageStoreType>()(
    subscribeWithSelector(
        immer((_set, _get, _store) => {
            return {
                data: [],
                allTeams: [],
                allProjects: [],
                filter: {
                    page: 1,
                    limit: 10,
                    dateSort: "desc",
                    taskDurationSort: "asc",
                },
                activeDateRange: undefined
            };
        })
    )
);

export function setTaskHistoryStoreSort(sort: NanoSort, field: keyof TasksHistoryFiltersOptional) {
    if (!field.endsWith("Sort")) {
        return;
    }

    tasksHistoryPageStore.setState((state) => {
        // @ts-ignore
        state.filter[field] = sort;

        for (const key in state.filter) {
            if (key.endsWith("Sort") && key !== field) {
                // @ts-ignore
                state.filter[key] = "";
            }
        }

    });
}

export function setTaskHistoryStoreFilter<T extends keyof TasksHistoryFiltersOptional>(field: T, value: TasksHistoryFiltersOptional[T]) {
    if (!field.endsWith("Filter")) {
        console.warn("setTaskHistoryStoreFilter: field should end with 'Filter' suffix", field)
        return;
    }

    tasksHistoryPageStore.setState((state) => {
        state.filter[field] = value;
    });
}