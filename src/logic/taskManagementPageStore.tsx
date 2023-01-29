import { pocketbase } from "@/lib/pocketbase";
import {
  Activity,
  ActivitySchema,
  Organization,
  OrganizationSchema,
  Project,
  ProjectSchema,
  Task,
  TaskOptional,
  TaskSchema,
  Team,
  TeamSchema,
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// store

export type TaskManagementPageStoreType = {
  currentTask: TaskOptional;
  tasks: Task[];
  teams: Team[];
  activities: Activity[];
  projects: Project[];
  organization: Organization[];
  activeDateRange: [Date, Date];
};

export const taskManagementPageStore = create<TaskManagementPageStoreType>()(
  // @ts-ignore (unused variables)
  immer((set, get, store) => {
    return {
      activeDateRange: [new Date(), new Date()],
      currentTask: null,
      projects: [],
      teams: [],
      tasks: [],
      organizations: [],
    };
  })
);

// fetch functions

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
  const query = useQuery([TASKS_QUERY_KEYS.TASKS], fetchTasks, {
    onSuccess: (data) => {
      taskManagementPageStore.setState((state) => {
        state.tasks = data;
      });
    },
  });

  return query;
}

export function useTeams() {
  const query = useQuery([TASKS_QUERY_KEYS.TEAMS], fetchTeams, {
    onSuccess: (data) => {
      taskManagementPageStore.setState((state) => {
        state.teams = data;
      });
    },
  });

  return query;
}

export function useProjects() {
  const query = useQuery([TASKS_QUERY_KEYS.PROJECTS], fetchProjects, {
    onSuccess: (data) => {
      taskManagementPageStore.setState((state) => {
        state.projects = data;
      });
    },
  });

  return query;
}

export function useOrganizations() {
  const query = useQuery([TASKS_QUERY_KEYS.ORGANIZATIONS], fetchOrganizations, {
    onSuccess: (data) => {
      taskManagementPageStore.setState((state) => {
        state.organization = data;
      });
    },
  });

  return query;
}

export function useActivities() {
  const query = useQuery([TASKS_QUERY_KEYS.ACTIVITIES], fetchActivities, {
    onSuccess: (data) => {
      taskManagementPageStore.setState((state) => {
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

// helper functions

export function getOrganization(task: Task): Organization | undefined {
  const project = getProject(task);

  if (!project) {
    return project;
  }

  const foundOrganization = taskManagementPageStore
    .getState()
    .organization.find((org) => org.id === project.organization);

  return foundOrganization;
}

export function getProject(task: Task): Project | undefined {
  const team = getTeam(task);

  const foundProject = taskManagementPageStore
    .getState()
    .projects.find((project) => project.id === team?.project);

  return foundProject;
}

export function getProjectFromId(projectId: string): Project | undefined {
  const foundProject = taskManagementPageStore
    .getState()
    .projects.find((project) => project.id === projectId);

  return foundProject;
}

export function getTeam(task: Task): Team | undefined {
  const foundTeam = taskManagementPageStore
    .getState()
    .teams.find((team) => team.id === task.team);

  return foundTeam;
}
