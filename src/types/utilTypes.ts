import {Activity, Project, Task, Team, User} from "./types";

export type MantineSelectedActivityType = {
  value: Activity;
  label: string;
  group: string;
};

export type MantineSelectedProjectType = {
  value: Project;
  label: string;
  group: string;
};

export type MantineSelectedTeamType = {
  value: Team;
  label: string;
  group: string;
};

export type NanoSortType = "asc" | "desc";

export type TasksGroupedByUser = {
  user: User;
  tasks: Task[];
};

export type GroupedSummary = {
  teamName: string;
  months: {
    date: string;
    tasksSum: number;
  }[];
};

export const TaskStatusOptions = ["accepted", "rejected", "none"] as const;
export type TaskStatus = typeof TaskStatusOptions[number];

