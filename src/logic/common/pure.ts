import {DashboardSummary, Task, User} from "@/types/types";
import {GroupedSummary, TasksGroupedByUser, TasksHistoryFiltersOptional} from "@/types/utilTypes";
import dayjs from "dayjs";

export {};

export function groupTasksByUser(
    tasks: Task[],
    users: User[],
    sort: "asc" | "desc" = "desc",
    reduceSameDays: boolean = true
): TasksGroupedByUser[] {
  let groupedTasks: TasksGroupedByUser[] = [];

  users.forEach((user) => {
    const tasksByUser = tasks.filter((task) => task.user === user.id);

    groupedTasks.push({
      user,
      tasks: tasksByUser,
    });
  });

  groupedTasks.map((u) => {
    u.tasks = sortTasks(u.tasks, sort);

    // reduceSameDays
    let reducedTasks: Task[] = [];
    let lastDate: string | undefined = undefined;

    u.tasks.forEach((task) => {
      if (!lastDate || !dayjs(lastDate).isSame(task.date, "day")) {
        reducedTasks.push({ ...task });
      } else {
        let lastTask = reducedTasks[reducedTasks.length - 1];
        reducedTasks[reducedTasks.length - 1] = {
          ...lastTask,
          duration: lastTask.duration + task.duration,
        };
      }

      lastDate = task.date;
    });

    console.log("reducedTasks", reducedTasks);

    u.tasks = reducedTasks;

    return u;
  });

  groupedTasks = groupedTasks.filter((u) => u.tasks.length > 0);

  return groupedTasks;
}

export function sortTasks(tasks: Task[], sort: "asc" | "desc" = "desc") {
  return tasks.sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    if (sort === "asc") {
      return bDate.getTime() - aDate.getTime();
    }

    return aDate.getTime() - bDate.getTime();
  });
}

// sample data for two months:
// [ { start: 01.01.2022, end: 31.01.2022 }, { start: 01.02.2022, end: 28.02.2022 } ]
export function getNextXMonthsDateRanges(refData: Date, months: number) {
  const dateRanges: { start: Date; end: Date }[] = [];

  for (let i = 0; i < months; i++) {
    const start = dayjs(refData).add(i, "month").startOf("month").toDate();
    const end = dayjs(refData).add(i, "month").endOf("month").toDate();

    dateRanges.push({ start, end });
  }

  return dateRanges;
}

export function groupTasksByUser2(
    tasks: Task[],
    users: User[],
    sort: "asc" | "desc" = "desc",
    reduceSameDays: boolean = true
) {
  const result: TasksGroupedByUser[] = [];

  for (const user of users) {
    const currentUserTasks = tasks.filter(t => t.user === user.id)

    if (sort === "asc") {
      tasks = tasks.sort((a, b) => {return dayjs(a.date).diff(b.date)})
    } else {
      tasks = tasks.sort((a, b) => {return dayjs(b.date).diff(a.date)})
    }

    if (reduceSameDays) {
      const days = [] as string[]

      for (const task of tasks) {
        const day = task.date;

        const dayInArr = days.find(d => d === day);

        if (!dayInArr) {

        }

      }
    }

    const tasksGroup = {
      user: user,
      tasks: currentUserTasks
    } as TasksGroupedByUser
  }

}

export function groupDashboardSummaryByDate(
  summaries: DashboardSummary[]
): GroupedSummary[] {
  let groupedSummaries: GroupedSummary[] = [];

  summaries.forEach((summary) => {
    const foundGroup = groupedSummaries.find(
      (group) => group.teamName === summary.teamName
    );

    if (foundGroup) {
      foundGroup.months.push({
        date: summary.date,
        tasksSum: summary.tasksSum,
      });
    } else {
      groupedSummaries.push({
        teamName: summary.teamName,
        months: [
          {
            date: summary.date,
            tasksSum: summary.tasksSum,
          },
        ],
      });
    }
  });

  return groupedSummaries;
}

export function tasksHistoryFilterToUrlSearchParams(filter: TasksHistoryFiltersOptional) {
  const params = new URLSearchParams()

  let keys = Object.keys(filter) as (keyof TasksHistoryFiltersOptional)[]

  keys.forEach(key => {
    if (filter[key]) {
      params.append(key, (filter[key] as String).toString())
    }
  })

  return params;
}

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
