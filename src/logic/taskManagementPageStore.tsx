import { pocketbase } from "@/lib/pocketbase";
import { Organization, Project, Task, TaskOptional, Team } from "@/types/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// store

export type TaskManagementPageStoreType = {
  currentTask: TaskOptional;
  tasks: Task[];
  teams: Team[];
  projects: Project[];
  organization: Organization[];
  activeDateRange: [Date, Date];
};

export const taskManagementPageStore = create<TaskManagementPageStoreType>()(
  // @ts-ignore
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

// helper functions

export function getOrganization(task: Task): Organization | undefined {
  const project = getProject(task);

  if (!project) {
    return project;
  }

  const foundOrganization = taskManagementPageStore
    .getState()
    .organization.find((org) => org.id === project.organizationId);

  return foundOrganization;
}

export function getProject(task: Task): Project | undefined {
  const foundProject = taskManagementPageStore
    .getState()
    .projects.find((project) => project.id === task.projectId);

  return foundProject;
}

export function getTeam(task: Task): Team | undefined {
  const foundTeam = taskManagementPageStore
    .getState()
    .teams.find((team) => team.id === task.teamId);

  return foundTeam;
}
