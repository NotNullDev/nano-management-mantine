import {TaskOptional} from "@/types/types";
import {tasksPageStore} from "@/logic/tasksPage/taskpageStore";
import {userStore} from "@/logic/common/userStore";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";


export function getEmptyTaskOptional(): TaskOptional {
    return {
        id: undefined,
        activity: "",
        comment: "",
        date: TaskUtils.formatDate(new Date()),
        duration: 8.0,
        team: tasksPageStore.getState().selectedTeam?.id || undefined,
        user: userStore.getState().user?.id || undefined,
        status: "none"
    };
}

export function updateAvailableActivities(selectedTeamId: string) {
    const activities = tasksPageStore.getState().activities;

    const availableActivities = activities.filter(
        (a) => a.team == selectedTeamId
    );

    tasksPageStore.setState((state) => {
        state.availableActivities = availableActivities;
    });

    // if there is only one activity in the selected team, select it
    if (availableActivities.length === 1) {
        tasksPageStore.setState((state) => {
            state.selectedActivity = availableActivities[0];
        });
    }
}

export function updateAvailableTeams() {
    const selectedProject = tasksPageStore.getState().selectedProject;

    const availableTeams = tasksPageStore
        .getState()
        .teams.filter((team) => team.project === selectedProject?.id);

    tasksPageStore.setState((state) => {
        state.availableTeams = availableTeams;
    });

    // if there is only one team in the selected project, select it
    if (availableTeams.length === 1) {
        tasksPageStore.setState((state) => {
            state.selectedTeam = availableTeams[0];
        });
    }
}

