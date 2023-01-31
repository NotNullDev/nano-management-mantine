export {};

// import { Activity, Organization, Project, Task } from "@/types/types";

// export function getAvailableActivitiesFromTeam(
//   teamId: string,
//   activities: Activity[]
// ) {
//   const availableActivities = activities.filter(
//     (activity) => activity.team === teamId
//   );

//   return availableActivities;
// }

// export function getOrganizationFromTask(
//   task: Task,
//   organizations: Organization[]
// ): Organization | undefined {
//   const project = getProject(task);

//   if (!project) {
//     return project;
//   }

//   const foundOrganization = organizations.find(
//     (org) => org.id === project.organization
//   );

//   return foundOrganization;
// }

// export function getProjectFromTask(
//   task: Task,
//   projects: Project[]
// ): Project | undefined {
//   const team = getTeam(task);

//   const foundProject = projects.find((project) => project.id === team?.project);

//   return foundProject;
// }

// export function getProjectFromId(projectId: string): Project | undefined {
//   const foundProject = taskManagementPageStore
//     .getState()
//     .projects.find((project) => project.id === projectId);

//   return foundProject;
// }

// export function getTeam(task: Task): Team | undefined {
//   const foundTeam = taskManagementPageStore
//     .getState()
//     .teams.find((team) => team.id === task.team);

//   return foundTeam;
// }

// export function getTeamFromId(teamId: string): Team | undefined {
//   const foundTeam = taskManagementPageStore
//     .getState()
//     .teams.find((team) => team.id === teamId);

//   return foundTeam;
// }

// export function getTeamFromProjectId(projectId: string): Team[] {
//   const foundTeams = taskManagementPageStore
//     .getState()
//     .teams.filter((team) => team.project === projectId);

//   return foundTeams;
// }

// export function getProjectFromName(name: string): Project | undefined {
//   const foundProject = taskManagementPageStore
//     .getState()
//     .projects.find((project) => project.name === name);

//   return foundProject;
// }

// export function getTeamFromName(name: string): Team | undefined {
//   const foundTeam = taskManagementPageStore
//     .getState()
//     .teams.find((team) => team.name === name);

//   return foundTeam;
// }

// export function getActivityFromId(id: string): Activity | undefined {
//   const foundActivity = taskManagementPageStore
//     .getState()
//     .activities.find((activity) => activity.id === id);

//   return foundActivity;
// }

// export function getAvailableActivityFromName(
//   name: string
// ): Activity | undefined {
//   const foundActivity = taskManagementPageStore
//     .getState()
//     .activities.find((activity) => activity.name === name);

//   return foundActivity;
// }
