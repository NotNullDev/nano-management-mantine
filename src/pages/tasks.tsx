import { showDebug } from "@/lib/debug";
import { pocketbase } from "@/lib/pocketbase";
import {
  getAvailableActivityFromName,
  getProjectFromName,
  getTeamFromName,
  taskManagementPageStore,
  TaskUtils,
  useTaskManagementData,
} from "@/logic/taskManagementPageStore";
import { taskManager } from "@/logic/taskManager";
import { userStore } from "@/logic/userStore";
import { Task, TaskOptional, TaskSchema } from "@/types/types";
import {
  Box,
  Button,
  NumberInput,
  Overlay,
  Select,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  IconArrowRight,
  IconCalendar,
  IconPlus,
  IconReload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { ZodError } from "zod";

type TasksPageStoreType = {
  currentTask: TaskOptional;
  tasks: Task[];
};

const TasksPage = () => {
  useTaskManagementData();
  return (
    <div className="flex flex-col flex-1 p-4">
      <h1 className="text-2xl font-bold mt-10 ml-5">Tasks management</h1>
      <NanoToolbar />
      <TasksArea />
    </div>
  );
};

export default TasksPage;

const NanoToolbar = () => {
  return (
    <div className="flex justify-between my-10">
      <div className="flex gap-2 items-end">
        <TasksRangeDatePicker />
        <IconReload
          onClick={() => {
            taskManager.setActiveDateRange(
              ...TaskUtils.getCurrentMonthDateRange()
            );
          }}
          className="cursor-pointer active:rotate-[359deg] transition-all mb-2"
        />
      </div>
      <div className="flex gap-3">
        <ProjectSelector />
        <TeamSelector />
      </div>
    </div>
  );
};

const ProjectSelector = () => {
  const availableProjects = taskManagementPageStore((state) => state.projects);
  const selectedProject = taskManagementPageStore(
    (state) => state.selectedProject
  );

  return (
    <>
      <Select
        label="Project"
        placeholder="Pick one"
        searchable
        nothingFound="No options"
        value={selectedProject?.name}
        data={availableProjects.map((project) => project.name)}
        onChange={(value) => {
          if (!value) return;

          const project = getProjectFromName(value);

          if (!project) return;

          taskManagementPageStore.setState((state) => {
            state.selectedProject = project;
          });
        }}
      />
    </>
  );
};

const TeamSelector = () => {
  const availableTeams = taskManagementPageStore(
    (state) => state.availableTeams
  );
  const selectedTeam = taskManagementPageStore((state) => state.selectedTeam);
  const selectedProject = taskManagementPageStore(
    (state) => state.selectedProject
  );

  return (
    <>
      <Select
        label="Team"
        key={selectedProject?.name}
        placeholder="Pick one"
        searchable
        nothingFound="No options"
        disabled={!selectedProject}
        value={selectedTeam?.name}
        data={availableTeams.map((team) => team.name)}
        onChange={(value) => {
          if (!value) return;

          const team = getTeamFromName(value);

          if (!team) return;

          taskManagementPageStore.setState((state) => {
            state.selectedTeam = team;
          });
        }}
      />
    </>
  );
};

const TasksArea = () => {
  return (
    <div>
      <Task />
    </div>
  );
};

const TasksRangeDatePicker = () => {
  const [value, setValue] = React.useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  const tasksChangeSubscriber = useCallback((range: [from: Date, to: Date]) => {
    setValue([range[0], range[1]]);
    showNotification({
      message: "hahaa!",
    });
  }, []);

  useEffect(() => {
    setValue(taskManager.getActiveDateRange());

    const unsub = taskManager.subscribeToActiveDateRange(tasksChangeSubscriber);

    return () => {
      unsub();
    };
  }, []);

  return (
    <DateRangePicker
      icon={<IconCalendar size={16} />}
      amountOfMonths={3}
      placeholder="Pick date range"
      label="Date range"
      className="w-[350px]"
      value={value}
      onChange={(val) => {
        if (!val || val.length !== 2 || !val[0] || !val[1]) return;
        const [from, to] = val;

        taskManager.setActiveDateRange(from, to);
      }}
      clearable={false}
    />
  );
};

const Task = () => {
  const [task, setTask] = React.useState<TaskOptional>({});
  const selectedTeam = taskManagementPageStore((state) => state.selectedTeam);
  const availableActivities = taskManagementPageStore(
    (state) => state.availableActivities
  );

  return (
    <Box className="flex  flex-1 p-4 shadow-xl justify-between items-center relative">
      {(!selectedTeam || availableActivities.length === 0) && (
        <Tooltip
          label="Select team must have at least one activity"
          withArrow
          offset={8}
        >
          <Overlay className=" bg-black/70 z-10 cursor-not-allowed" />
        </Tooltip>
      )}
      <div className="flex gap-4 ">
        <ActivitySelector />

        <TaskDurationSelector />

        <TaskDatePicker />

        <TaskCommentTextInput />
      </div>

      <NewTaskControlButton />
    </Box>
  );
};

const NewTaskControlButton = () => {
  return (
    <>
      <div>
        <Button size="xs" onClick={onResetTask}>
          <IconReload />
        </Button>
        <Button size="xs" onCanPlay={onCopyLastTask}>
          <IconPlus />
        </Button>
        <Button size="xs" onClick={onAddTask}>
          <IconArrowRight />
        </Button>
      </div>
    </>
  );
};

async function onAddTask() {
  const task = {
    activity: taskManagementPageStore.getState().selectedActivity?.id,
    comment: taskManagementPageStore.getState().selectedComment,
    date: dayjs(taskManagementPageStore.getState().selectedDate)
      .format("YYYY-MM-DD HH:mm:ss.SSS")
      .toString(),
    duration: taskManagementPageStore.getState().selectedDuration,
    team: taskManagementPageStore.getState().selectedTeam?.id,
    user: userStore.getState().user?.id,
  } as TaskOptional;

  try {
    TaskSchema.parse(task);
  } catch (e) {
    const err = e as ZodError;
    showNotification({
      title: "Error creating task",
      message: err.message,
      color: "red",
    });
    return;
  }

  await pocketbase.collection("tasks").create({
    ...task,
  });
  showNotification({
    message: "Task added",
  });
}

function onCopyLastTask() {
  const task = taskManagementPageStore.getState();

  showDebug({
    message: "Task added",
  });
}

function onResetTask() {
  const task = taskManagementPageStore.getState();

  showDebug({
    message: "Task added",
  });
}

const ActivitySelector = () => {
  const availableActivities = taskManagementPageStore(
    (state) => state.availableActivities
  );
  const selectedActivity = taskManagementPageStore(
    (state) => state.selectedActivity
  );
  const selectedTeam = taskManagementPageStore((state) => state.selectedTeam);

  return (
    <>
      <Select
        label="Activity"
        size="xs"
        key={selectedTeam?.id}
        placeholder="Pick one"
        searchable
        nothingFound="Not found"
        withAsterisk
        value={selectedActivity?.name}
        onChange={(val) => {
          if (!val) return;

          const activity = getAvailableActivityFromName(val);

          if (!activity) return;

          taskManagementPageStore.setState((state) => {
            state.selectedActivity = activity;
          });
        }}
        data={availableActivities?.map((activity) => activity.name)}
      />
    </>
  );
};

const TaskDurationSelector = () => {
  const [value, setValue] = React.useState<number>(8.0);
  const formattedValue = useState("");
  const duration = taskManagementPageStore((state) => state.selectedDuration);

  return (
    <NumberInput
      className="w-[150px]"
      size="xs"
      defaultValue={8}
      placeholder="Duration"
      label="Duration (hours)"
      radius="md"
      precision={1}
      withAsterisk
      onFocus={(e) => {
        e.currentTarget.select();
      }}
      min={0}
      step={0.5}
      max={24}
      onBlur={(e) => {}}
      value={duration}
      onChange={(val) => {
        if (!val) return;
        taskManagementPageStore.setState((state) => {
          state.selectedDuration = val;
        });
      }}
    />
  );
};

const TaskDatePicker = () => {
  const [value, setValue] = React.useState<Date>(new Date());

  return (
    <DatePicker
      allowFreeInput
      size="xs"
      placeholder="Task date"
      label="Task date"
      withAsterisk
      value={value}
      onChange={(val) => {
        if (!val) return;
        setValue(val);
      }}
    />
  );
};

const TaskCommentTextInput = () => {
  const selectedComment = taskManagementPageStore(
    (state) => state.selectedComment
  );

  return (
    <TextInput
      placeholder="Comment"
      label="Comment (optional)"
      size="xs"
      value={selectedComment}
      onChange={(e) => {
        taskManagementPageStore.setState((state) => {
          state.selectedComment = e.currentTarget.value;
        });
      }}
    />
  );
};

type TasksGroupProps = {
  children: React.ReactNode;
};

const MonthTasksGroup = ({ children }: TasksGroupProps) => {
  return (
    <div className="p-4">
      <h1>Januray</h1>
      <div>{children}</div>
    </div>
  );
};

const WeekTasksGroup = ({ children }: TasksGroupProps) => {
  return (
    <div className="p-4">
      <h1>Week 1</h1>
      <div>{children}</div>
    </div>
  );
};
