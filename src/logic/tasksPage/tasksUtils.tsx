import {Activity, Project, Task, TaskOptional, TaskSchema, Team} from "@/types/types";
import dayjs from "dayjs";
import {MantineSelectedActivityType, NanoSortType} from "@/types/utilTypes";
import {getProjectFromId, getTeamFromId} from "@/logic/tasksPage/pure";

export class TaskUtils {
  static formatDate(date: Date): string {
    const formattedDate = dayjs(date)
        .format("YYYY-MM-DD HH:mm:ss.SSS")
        .toString();

    return formattedDate;
  }

  static formatDateString(date: string): string {
    const formattedDate = dayjs(date)
        .format("YYYY-MM-DD HH:mm:ss.SSS")
        .toString();

    return formattedDate;
  }

  static getNanoSortTypeAsString(type: NanoSortType): string {
    if (type === "asc") {
      return "+";
    }

    return "-";
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
    activity: Activity,
    teams: Team[],
    projects: Project[]
  ): MantineSelectedActivityType {
    const team = getTeamFromId(activity.team, teams);
    const project = getProjectFromId(team?.project || "", projects);

    const groupLabel =
      project && team ? `${team.name} | ${project.name}` : "No team";

    return {
      value: activity,
      label: activity.name,
      group: groupLabel,
    };
  }
}
