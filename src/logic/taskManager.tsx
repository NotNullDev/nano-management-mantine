import {
  Activity,
  Project,
  Task,
  TaskOptional,
  TaskSchema,
} from "@/types/types";
import { MantineSelectedActivityType } from "@/types/utilTypes";
import dayjs from "dayjs";
import { create } from "zustand";
import { getProjectFromId } from "./taskManagementPageStore";

export class TaskUtils {
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
    const project = getProjectFromId(activity.project);

    return {
      value: activity,
      label: activity.name,
      group: project?.name || "No project",
    };
  }
}

type TasksStore = {
  tasks: Task[];
};

const tasksStoreInitialState: TasksStore = {
  tasks: [],
};

const tasksStore = create<TasksStore>()((set, get, store) => {
  return tasksStoreInitialState;
});

type TasksStoreZustandType = typeof tasksStore;

export interface TaskManager {
  addTask(task: Task): Promise<Task>;
  removeTask(task: Task): Promise<void>;
  updateTask(task: Task): Promise<Task>;
  acceptTask(task: Task): Promise<Task>;
  rejectTask(task: Task, reason: string): Promise<Task>;
  refetchTasks(): Promise<void>;
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void;

  getActiveDateRange(): [Date, Date];
  setActiveDateRange(from: Date, to: Date): void;
  subscribeToActiveDateRange(
    callback: (dateRange: [Date, Date]) => void
  ): () => void;
}

class TaskManagerImpl implements TaskManager {
  // subscribers
  private tasksSubscribers: ((tasks: Task[]) => void)[] = [];
  private activeDateRangeSubscribers: ((dateRange: [Date, Date]) => void)[] =
    [];

  private project: Project | null = null;
  private team: string | null = null;

  private activeDateRange: [Date, Date] = TaskUtils.getCurrentMonthDateRange();

  constructor(private readonly taskStore: TasksStoreZustandType) {}

  subscribeToActiveDateRange(
    callback: (dateRange: [Date, Date]) => void
  ): () => void {
    if (this.activeDateRangeSubscribers.includes(callback)) {
      return () => {
        this.activeDateRangeSubscribers =
          this.activeDateRangeSubscribers.filter(
            (subscriber) => subscriber !== callback
          );
      };
    }

    this.activeDateRangeSubscribers.push(callback);

    return () => {
      this.activeDateRangeSubscribers = this.activeDateRangeSubscribers.filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  refetchTasks(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  setActiveDateRange(from: Date, to: Date): void {
    this.activeDateRange = [from, to];

    this.activeDateRangeSubscribers.forEach((callback) => {
      callback(this.activeDateRange);
    });
  }
  getActiveDateRange(): [Date, Date] {
    return this.activeDateRange;
  }

  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    if (this.tasksSubscribers.includes(callback)) {
      return () => {
        this.tasksSubscribers = this.tasksSubscribers.filter(
          (subscriber) => subscriber !== callback
        );
      };
    }
    this.tasksSubscribers.push(callback);

    return () => {
      this.tasksSubscribers = this.tasksSubscribers.filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  addTask(task: Task): Promise<Task> {
    throw new Error("Method not implemented.");
  }

  removeTask(task: Task): Promise<void> {
    throw new Error("Method not implemented.");
  }

  updateTask(task: Task): Promise<Task> {
    throw new Error("Method not implemented.");
  }

  acceptTask(task: Task): Promise<Task> {
    throw new Error("Method not implemented.");
  }

  rejectTask(task: Task, reason: string): Promise<Task> {
    throw new Error("Method not implemented.");
  }
}

export const taskManager = new TaskManagerImpl(tasksStore);
