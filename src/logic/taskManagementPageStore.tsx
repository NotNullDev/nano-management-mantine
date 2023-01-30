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
import { userStore } from "./userStore";

// utils

export class TaskUtils {
  static formatDate(date: Date): string {
    const formattedDate = dayjs(date)
      .format("YYYY-MM-DD HH:mm:ss.SSS")
      .toString();

    return formattedDate;
  }

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
    const team = getTeamFromId(activity.team);
    const project = getProjectFromId(team?.project || "");

    const groupLabel =
      project && team ? `${team.name} | ${project.name}` : "No team";

    return {
      value: activity,
      label: activity.name,
      group: groupLabel,
    };
  }

  static getEmptyTaskOptional(): TaskOptional {
    return {
      id: undefined,
      activity: "",
      comment: "",
      date: TaskUtils.formatDate(new Date()),
      duration: 8.0,
      team: taskManagementPageStore.getState().selectedTeam?.id || undefined,
      user: userStore.getState().user?.id || undefined,
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
  selectedActivity: Activity | null;
  selectedComment: string;
  selectedDate: Date;
  selectedDuration: number;
  activeDateRange: [Date, Date];
  // side effects
  availableTeams: Team[]; // based on selected project
  availableActivities: Activity[]; // based on selected team
  availableTasks: Task[]; // based on selected team
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
        selectedComment: "",
        // 2022-06-25 11:03:50.052
        selectedDate: new Date(),
        selectedDuration: 8.0,
        activeDateRange: TaskUtils.getCurrentMonthDateRange(),
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

      // if there is only one team in the selected project, select it
      if (availableTeams.length === 1) {
        taskManagementPageStore.setState((state) => {
          state.selectedTeam = availableTeams[0];
        });
      }
    }
  }
);

// if there is only one project, select it

// ON SERVER PROJECTS CHANGE

taskManagementPageStore.subscribe(
  (state) => state.projects,
  (curr, prev) => {
    if (curr.length === 1) {
      taskManagementPageStore.setState((state) => {
        state.selectedProject = curr[0];
      });
    }
  }
);

// ON SELECTED TEAM CHANGE

taskManagementPageStore.subscribe(
  (state) => state.selectedTeam,
  (curr, prev) => {
    if (curr && curr.id) {
      updateAvailableActivities(curr.id);
    }
  }
);

// ON SELCETED PROJECT CHANGE

taskManagementPageStore.subscribe(
  (state) => state.selectedProject,
  (curr, prev) => {
    if (curr && curr.id) {
      updateAvailableTeams();
    }
  }
);

taskManagementPageStore.subscribe(
  (state) => state.activities,
  (curr) => {
    const selectedTeam = taskManagementPageStore.getState().selectedTeam;

    if (selectedTeam && selectedTeam.id) {
      updateAvailableActivities(selectedTeam.id);
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

export async function fetchTasksWhereTeam(teamId: string) {
  const tasks = await pocketbase.collection("tasks").getFullList(undefined, {
    filter: `team.id = '${teamId}'`,
  });

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
  const selectedTeam = taskManagementPageStore((state) => state.selectedTeam);

  const query = useQuery(
    [TASKS_QUERY_KEYS.TASKS, selectedTeam?.id],
    async () => {
      return fetchTasksWhereTeam(selectedTeam?.id ?? "---");
    },
    {
      onSuccess: (data) => {
        taskManagementPageStore.setState((state) => {
          state.tasks = data;
        });
      },
      enabled: !!selectedTeam?.id,
    }
  );

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

export function getProjectFromName(name: string): Project | undefined {
  const foundProject = taskManagementPageStore
    .getState()
    .projects.find((project) => project.name === name);

  return foundProject;
}

export function getTeamFromName(name: string): Team | undefined {
  const foundTeam = taskManagementPageStore
    .getState()
    .teams.find((team) => team.name === name);

  return foundTeam;
}

export function getActivityFromId(id: string): Activity | undefined {
  const foundActivity = taskManagementPageStore
    .getState()
    .activities.find((activity) => activity.id === id);

  return foundActivity;
}

export function getAvailableActivityFromName(
  name: string
): Activity | undefined {
  const foundActivity = taskManagementPageStore
    .getState()
    .activities.find((activity) => activity.name === name);

  return foundActivity;
}

function updateAvailableActivities(selectedTeamId: string) {
  const availableActivities = taskManagementPageStore
    .getState()
    .activities.filter((activity) => activity.team === selectedTeamId);

  taskManagementPageStore.setState((state) => {
    state.availableActivities = availableActivities;
  });

  // if there is only one activity in the selected team, select it
  if (availableActivities.length === 1) {
    taskManagementPageStore.setState((state) => {
      state.selectedActivity = availableActivities[0];
    });
  }
}

function updateAvailableTeams() {
  const selectedProject = taskManagementPageStore.getState().selectedProject;

  const availableTeams = taskManagementPageStore
    .getState()
    .teams.filter((team) => team.project === selectedProject?.id);

  taskManagementPageStore.setState((state) => {
    state.availableTeams = availableTeams;
  });

  // if there is only one team in the selected project, select it
  if (availableTeams.length === 1) {
    taskManagementPageStore.setState((state) => {
      state.selectedTeam = availableTeams[0];
    });
  }
}

export function getAvailableActivitiesForTask(task: TaskOptional) {
  let selectedTeam = task.team;

  if (!task.id) {
    selectedTeam = taskManagementPageStore.getState().selectedTeam?.id;
  }

  const availableActivities = taskManagementPageStore
    .getState()
    .activities.filter((activity) => activity.team === selectedTeam);

  return availableActivities;
}
