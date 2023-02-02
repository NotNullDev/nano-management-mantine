import {Activity, Organization, Project, Task, TaskOptional, Team} from "@/types/types";

export function getAvailableActivitiesForTask(task: TaskOptional, allActivities: Activity[], selectedTeamId: string | undefined) {
    let selectedTeam = task.team;

    if (!task.id) {
        selectedTeam = selectedTeamId ?? "";
    }

    allActivities = allActivities.filter((activity) => activity.team === selectedTeam);

    return allActivities;
}

export function getAvailableActivityFromName(
    name: string,
    activities: Activity[]
): Activity | undefined {
    const foundActivity = activities.find((activity) => activity.name === name);

    return foundActivity;
}

export function getOrganizationFromTask(task: Task, organizations: Organization[], projects: Project[], teams: Team[]): Organization | undefined {
    const project = getProject(task, projects, teams);

    if (!project) {
        return project;
    }

    const foundOrganization = organizations.find((org) => org.id === project.organization);

    return foundOrganization;
}

export function getProject(task: Task, projects: Project[], teams: Team[]): Project | undefined {
    const team = getTeam(task, teams);

    const foundProject = projects.find((project) => project.id === team?.project);

    return foundProject;
}

export function getProjectFromId(projectId: string, projects: Project[]): Project | undefined {
    const foundProject = projects.find((project) => project.id === projectId);

    return foundProject;
}

export function getTeam(task: Task, teams: Team[]): Team | undefined {
    const foundTeam = teams.find((team) => team.id === task.team);

    return foundTeam;
}

export function getTeamFromId(teamId: string, teams: Team[]): Team | undefined {
    const foundTeam = teams.find((team) => team.id === teamId);

    return foundTeam;
}

export function getTeamFromProjectId(projectId: string, teams: Team[]): Team[] {
    const foundTeams = teams.filter((team) => team.project === projectId);

    return foundTeams;
}

export function getProjectFromName(name: string, projects: Project[]): Project | undefined {
    const foundProject = projects.find((project) => project.name === name);

    return foundProject;
}

export function getTeamFromName(name: string, teams: Team[]): Team | undefined {
    const foundTeam = teams.find((team) => team.name === name);

    return foundTeam;
}

export function getActivityFromId(id: string, activities: Activity[]): Activity | undefined {
    const foundActivity = activities.find((activity) => activity.id === id);

    return foundActivity;
}