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
import { userStore } from "./userStore";
import { NanoUtils } from "./utils";

type MANAGEMENT_QUERY_KEYS_ENUM = "tasks" | "teams" | "users";

export class MANAGEMENT_QUERY_KEYS {
  public static TASKS = "tasks" as MANAGEMENT_QUERY_KEYS_ENUM;
  public static TEAMS = "teams" as MANAGEMENT_QUERY_KEYS_ENUM;
  public static USERS = "users" as MANAGEMENT_QUERY_KEYS_ENUM;
}

export type ManagementPageStore = {
  teams: Team[];
  tasks: Task[];
  users: User[];
  selectedProject: Project | null;
  selectedTeam: Team | null;
};

export const managementPageStore = create<ManagementPageStore>()(
  immer((set, get, store) => {
    return {
      teams: [],
      tasks: [],
      users: [],
      selectedProject: null,
      selectedTeam: null,
    };
  })
);

async function fetchTeams(): Promise<Team[]> {
  const currentUserId = userStore.getState().user?.id ?? "";

  const teams = await pocketbase.collection("teams").getFullList(undefined, {
    filter: `managers.id ?= '${currentUserId}'`,
  });

  const validatedTeams = teams.map((t) => TeamSchema.parse(t));

  return validatedTeams;
}

async function fetchTasks(teamId: string): Promise<Task[]> {
  const currentUserId = userStore.getState().user?.id ?? "";

  const filters: string[] = [];

  if (teamId && teamId !== "") {
    filters.push(`team.id = '${teamId}'`);
  }

  if (currentUserId) {
    filters.push(`team.managers.id = '${currentUserId}'`);
  }

  const teams = await pocketbase.collection("tasks").getFullList(undefined, {
    filter: NanoUtils.joinAndFilters(filters),
  });

  const validatedTeams = teams.map((t) => TaskSchema.parse(t));

  return validatedTeams;
}

async function fetchUsers(userIds: string[]): Promise<User[]> {
  const queries = userIds.map((id) => `id = '${id}'`);

  const filters = NanoUtils.joinOrFilters(queries);

  const users = await pocketbase.collection("users").getFullList(undefined, {
    filter: filters,
  });

  const validatedData = users.map((u) => UserSchema.parse(u));

  return validatedData;
}

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
  useQuery(
    [MANAGEMENT_QUERY_KEYS.TASKS, selectedTeamId],
    () => {
      if (!selectedTeamId) {
        return [];
      }

      return fetchTasks(selectedTeamId);
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

  useQuery(
    [MANAGEMENT_QUERY_KEYS.USERS, selectedTeam],
    () => {
      if (!selectedTeam?.id) {
        return [];
      }

      return fetchUsers(selectedTeam.members);
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

export function useManagementData() {
  useTeams();
  useTasks();
  useUsers();
}
