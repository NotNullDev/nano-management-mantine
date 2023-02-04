import {Project, Task, TasksHistory, Team} from "@/types/types";
import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

export type TasksPageStoreType = {
    data: TasksHistory[]

    allTeams: Team[]
    allProjects: Project[]

    selectedProjectId?: string
    selectedTeamId?: string
    selectedTaskId?: string

    currentlySelectedTask?: Task
};

export const tasksHistoryPageStore = create<TasksPageStoreType>()(
    subscribeWithSelector(
        immer((_set, _get, _store) => {
            return {
                data: [],
                allTeams: [],
                allProjects: []
            };
        })
    )
);