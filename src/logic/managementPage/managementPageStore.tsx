import {ManagementData, Project, Task, Team, User,} from "@/types/types";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";


export type ManagementPageStore = {
    teams: Team[];
    tasks: Task[];
    users: User[];
    selectedProject: Project | null;
    selectedTeam: Team | null;
    showAllTeams: boolean;
    managementData: ManagementData[]
};

export const managementPageStore = create<ManagementPageStore>()(
    immer((set, get, store) => {
        return {
            teams: [],
            tasks: [],
            users: [],
            managementData: [],
            selectedProject: null,
            selectedTeam: null,
            showAllTeams: false,
        };
    })
);
