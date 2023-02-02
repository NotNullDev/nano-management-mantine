import { pocketbase } from "@/lib/pocketbase";
import {
  Project,
  Task,
  TaskSchema,
  Team,
  TeamSchema,
  User,
  UserSchema,
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userStore } from "../common/userStore";
import { NanoUtils } from "../common/utils";


export type ManagementPageStore = {
  teams: Team[];
  tasks: Task[];
  users: User[];
  selectedProject: Project | null;
  selectedTeam: Team | null;
  showAllTeams: boolean;
};

export const managementPageStore = create<ManagementPageStore>()(
  immer((set, get, store) => {
    return {
      teams: [],
      tasks: [],
      users: [],
      selectedProject: null,
      selectedTeam: null,
      showAllTeams: false,
    };
  })
);
