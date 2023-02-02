import {Activity, Organization, Project, Task, TaskOptional, Team,} from "@/types/types";
import {NanoSortType} from "@/types/utilTypes";
import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";
import {updateAvailableActivities, updateAvailableTeams} from "@/logic/tasksPage/aa";

// store
export type TasksPageStoreType = {
    // server data
    tasks: Task[];
    teams: Team[];
    activities: Activity[];
    projects: Project[];
    organizations: Organization[];
    // internal state
    newTaskEntity: TaskOptional;
    selectedProject: Project | null;
    selectedTeam: Team | null;
    selectedActivity: Activity | null;
    selectedComment: string;
    selectedDate: Date;
    selectedDuration: number;
    selectedTasksSortType: NanoSortType;
    selectedRejectedOnly: boolean;
    activeDateRange: [Date, Date] | null;
    // side effects
    availableTeams: Team[]; // based on selected project
    availableActivities: Activity[]; // based on selected team
    availableTasks: Task[]; // based on selected team
};

export const tasksPageStore = create<TasksPageStoreType>()(
    subscribeWithSelector(
        immer((_set, _get, _store) => {
            return {
                // server data
                tasks: [] as Task[],
                teams: [] as Team[],
                activities: [] as Activity[],
                projects: [] as Project[],
                organizations: [] as Organization[],
                // internal state
                newTaskEntity: {} as TaskOptional,
                selectedProject: null,
                selectedTeam: null,
                selectedComment: "",
                selectedDate: new Date(),
                selectedDuration: 8.0,
                activeDateRange: TaskUtils.getCurrentMonthDateRange(),
                selectedTasksSortType: "desc",
                selectedActivity: null,
                selectedRejectedOnly: false,

                // side effects
                availableTeams: [] as Team[], // based on selected project
                availableActivities: [] as Activity[], // based on selected team
                availableTasks: [] as Task[], // based on selected team
            };
        })
    )
);

// store subscriptions (side effects)

// ON SELECTED PROJECT CHANGE

tasksPageStore.subscribe(
    (state) => state.selectedProject,
    (curr, prev) => {
        if (curr) {
            const availableTeams = tasksPageStore
                .getState()
                .teams.filter((team) => team.project === curr.id);

            tasksPageStore.setState((state) => {
                state.availableTeams = availableTeams;
            });

            // if there is only one team in the selected project, select it
            if (availableTeams.length === 1) {
                tasksPageStore.setState((state) => {
                    state.selectedTeam = availableTeams[0];
                });
            }
        }
    }
);

// ON SERVER PROJECTS CHANGE

tasksPageStore.subscribe(
    (state) => state.projects,
    (curr, prev) => {
        if (curr.length === 1) {
            tasksPageStore.setState((state) => {
                state.selectedProject = curr[0];
            });
        }
    }
);

// ON SELECTED TEAM CHANGE

tasksPageStore.subscribe(
    (state) => state.selectedTeam,
    (curr, prev) => {
        if (curr && curr.id) {
            updateAvailableActivities(curr.id);
        }
    }
);

// ON SELCETED PROJECT CHANGE

tasksPageStore.subscribe(
    (state) => state.selectedProject,
    (curr, prev) => {
        if (curr && curr.id) {
            updateAvailableTeams();
        }
    }
);

tasksPageStore.subscribe(
    (state) => state.activities,
    (curr) => {
        const selectedTeam = tasksPageStore.getState().selectedTeam;

        if (selectedTeam && selectedTeam.id) {
            updateAvailableActivities(selectedTeam.id);
        }
    }
);

// helper functions

