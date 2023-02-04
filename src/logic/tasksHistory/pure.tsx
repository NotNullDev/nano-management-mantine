import {Task, TasksHistory, Team} from "@/types/types";
import {NanoUtils} from "@/logic/common/utils";
import {TaskStatus} from "@/types/utilTypes";

export {}

function getUniqueProjects(tasksHistory: TasksHistory[]) {
    return [...new Set(tasksHistory.map(t => t.projectName))]
}

export function getTeamsFromProject(tasksHistory: TasksHistory[], selectedProjectName: string) {
    const teamsForSelectedProject = tasksHistory
        .filter(t => t.projectName === selectedProjectName)
        .map(t => t.teamName);

    const uniqueTeams = NanoUtils.makeUnique(teamsForSelectedProject);

    return uniqueTeams;
}

export function getTeamsForSelectedProject(teams: Team[], selectedProjectId: string): Team[] {
    const teamsForSelectedProject = teams.filter(p => p.project === selectedProjectId);

    const uniqueTeams = NanoUtils.makeUnique(teamsForSelectedProject);

    return uniqueTeams;
}

export function getTaskStatus(task: Task): TaskStatus {
    if (task.accepted !== "") {
        return "accepted"
    }

    if (task.rejected !== "") {
        return "rejected"
    }

    return "none"
}