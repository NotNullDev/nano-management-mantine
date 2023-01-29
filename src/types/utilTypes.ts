import { Activity, Project, Team } from "./types";

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
