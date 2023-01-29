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
import { MantineSelectedActivityType } from "@/types/utilTypes";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// utils

export class TaskUtils {
  static getCurrentMonthDateRange(): [Date, Date] {
    return [dayjs().startOf("month").toDate(), dayjs().endOf("month").toDate()];
  }

  static toTask(taskOptional: TaskOptional): Task {
    const res = TaskSchema.safeParse(taskOptional);

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }

  static activityToMantineSelectData(
    activity: Activity
  ): MantineSelectedActivityType {
    const project = getProjectFromId(activity.project);

    return {
      value: activity,
      label: activity.name,
      group: project?.name || "No project",
    };
  }
}

// store
export type TaskManagementPageStoreType = {
  // server data
  tasks: Task[];
  teams: Team[];
  activities: Activity[];
  projects: Project[];
  organization: Organization[];
  // internal state
  newTaskEntity: TaskOptional;
  selectedProject: Project | null;
  selectedTeam: Team | null;
  activeDateRange: [Date, Date];
  // side effects
  availableTeams: Team[]; // based on selected project
};

export const taskManagementPageStore = create<TaskManagementPageStoreType>()(
  subscribeWithSelector(
    // @ts-ignore TODO: fix this
    immer((_set, _get, _store) => {
      return {
        // server data
        tasks: [] as Task[],
        teams: [] as Team[],
        activities: [] as Activity[],
        projects: [] as Project[],
        organization: [] as Organization[],
        // internal state
        newTaskEntity: {} as TaskOptional,
        selectedProject: null,
        selectedTeam: null,
        activeDateRange: TaskUtils.getCurrentMonthDateRange(),
        // side effects
        availableTeams: [] as Team[], // based on selected project
      };
    })
  )
);

// store subscriptions (side effects)

taskManagementPageStore.subscribe(
  (state) => state.selectedProject,
  (curr, prev) => {
    if (curr) {
      const availableTeams = taskManagementPageStore
        .getState()
        .teams.filter((team) => team.project === curr.id);

      taskManagementPageStore.setState((state) => {
        state.availableTeams = availableTeams;
      });
    }
  }
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
  useQuery([TASKS_QUERY_KEYS.ACTIVITIES], fetchActivities, {
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

export function getTeamFromId(teamId: string): Team | undefined {
  const foundTeam = taskManagementPageStore
    .getState()
    .teams.find((team) => team.id === teamId);

  return foundTeam;
}

export function getTeamFromProjectId(projectId: string): Team[] {
  const foundTeams = taskManagementPageStore
    .getState()
    .teams.filter((team) => team.project === projectId);

  return foundTeams;
}
