import { pocketbase } from "@/lib/pocketbase";
import { queryClient } from "@/lib/tanstackQuery";
import {
  getActivityFromId,
  getAvailableActivitiesForTask,
  getAvailableActivityFromName,
  getProjectFromName,
  getTeamFromName,
  taskManagementPageStore,
  TASKS_QUERY_KEYS,
  TaskUtils,
  useTaskManagementData,
} from "@/logic/taskManagementPageStore";
import { taskManager } from "@/logic/taskManager";
import { Task as NewTask, TaskOptional, TaskSchema } from "@/types/types";
import {
  Box,
  Button,
  Divider,
  NumberInput,
  Overlay,
  ScrollArea,
  Select,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  IconArrowDown,
  IconCalendar,
  IconCheck,
  IconPlus,
  IconReload,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useState } from "react";
import { ZodError } from "zod";

type TasksPageStoreType = {
  currentTask: TaskOptional;
  tasks: NewTask[];
};

const TasksPage = () => {
  useTaskManagementData();
  return (
    <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
      <h1 className="text-2xl font-bold mt-10 ml-5">Tasks management</h1>
      <NanoToolbar />
      <TasksArea />
    </ScrollArea>
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
  const tasks = taskManagementPageStore((state) => state.tasks);

  return (
    <div>
      <h2 className="text-2xl mb-4">New task</h2>
      <EditableTask />
      <Divider className="my-4" />
      <div className="flex w-full justify-between">
        <h2 className="text-2xl mb-4">Previous tasks (not accepted)</h2>
        <div className="flex gap-3">
          <Button color="violet" leftIcon={<IconArrowDown />}>
            Time descending
          </Button>
        </div>
      </div>
      {tasks.map((task) => {
        return <NewTask key={task.id} task={task} />;
      })}
    </div>
  );
};

const EditableTask = () => {
  const [task, setTask] = React.useState<TaskOptional>(
    TaskUtils.getEmptyTaskOptional()
  );
  const selectedTeam = taskManagementPageStore((state) => state.selectedTeam);

  useEffect(() => {
    if (!selectedTeam) return;
    setTask((old) => ({ ...old, team: selectedTeam.id }));
  }, [selectedTeam]);

  return <NewTask task={task} key={selectedTeam?.id} />;
};

const TasksRangeDatePicker = () => {
  const [value, setValue] = React.useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);

  const tasksChangeSubscriber = useCallback((range: [from: Date, to: Date]) => {
    setValue([range[0], range[1]]);
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

const NewTask = ({ task }: { task: TaskOptional }) => {
  const [workTask, setWorkTask] = useState<TaskOptional>(task);
  const [availableActivities, setAvailableActivities] = useState(
    getAvailableActivitiesForTask(task)
  );
  const selectedTeam = taskManagementPageStore((state) => state.selectedTeam);

  const updateTask = (newTask: TaskOptional) => {
    setWorkTask(newTask);
  };

  useEffect(() => {
    setWorkTask(task);
  }, [task]);

  useEffect(() => {
    const a = getAvailableActivitiesForTask(workTask);
    setAvailableActivities(a);
  }, [selectedTeam]);

  return (
    <Box
      className="flex flex-1 p-4 shadow-xl justify-between items-center relative"
      key={selectedTeam?.id}
    >
      {(!selectedTeam || availableActivities.length === 0) && (
        <Tooltip
          label="Select team must have at least one activity"
          withArrow
          offset={8}
        >
          <Overlay className=" bg-black/70 z-10 cursor-not-allowed " />
        </Tooltip>
      )}
      <div className="flex gap-4 ">
        <ActivitySelector task={workTask} updateTask={updateTask} />

        <TaskDurationSelector task={workTask} updateTask={updateTask} />

        <TaskDatePicker task={workTask} updateTask={updateTask} />

        <TaskCommentTextInput task={workTask} updateTask={updateTask} />
      </div>

      <NewTaskControlButton task={workTask} updateTask={updateTask} />
    </Box>
  );
};

const NewTaskControlButton = ({
  task,
  updateTask,
}: {
  task: TaskOptional;
  updateTask: (newTask: TaskOptional) => void;
}) => {
  return (
    <>
      <div>
        {/* update task */}
        {!task.id && (
          <Button size="xs" onClick={() => onAddTask(task)}>
            <IconPlus />
          </Button>
        )}
        {/* add task */}
        {task.id && (
          <Button size="xs" onClick={() => onUpdateTask(task)}>
            <IconCheck />
          </Button>
        )}
      </div>
    </>
  );
};

async function onUpdateTask(task: TaskOptional) {
  if (!task.id) return;

  let validatedTask: NewTask | undefined = undefined;

  try {
    validatedTask = TaskSchema.parse(task);
  } catch (e) {
    const err = e as ZodError;
    showNotification({
      title: "Error creating task",
      message: err.message,
      color: "red",
    });
    return;
  }

  if (!validatedTask) return;

  await pocketbase.collection("tasks").update(task.id, {
    ...validatedTask,
  });

  await queryClient.invalidateQueries([TASKS_QUERY_KEYS.TASKS]);
  showNotification({
    title: "Task updated",
    message: "Task has been updated",
    color: "blue",
  });
}

async function onAddTask(task: TaskOptional) {
  let validatedTask: NewTask | undefined = undefined;

  try {
    validatedTask = TaskSchema.parse(task);
  } catch (e) {
    const err = e as ZodError;
    showNotification({
      title: "Error creating task",
      message: err.message,
      color: "red",
    });
    return;
  }

  if (!validatedTask) return;

  await pocketbase.collection("tasks").create({
    ...validatedTask,
  });

  await queryClient.invalidateQueries([TASKS_QUERY_KEYS.TASKS]);
  showNotification({
    title: "Task created",
    message: "Task has been created",
    color: "blue",
  });
}

// async function onAddTask() {
//   const task = {
//     activity: taskManagementPageStore.getState().selectedActivity?.id,
//     comment: taskManagementPageStore.getState().selectedComment,
//     date: TaskUtils.formatDate(taskManagementPageStore.getState().selectedDate),
//     duration: taskManagementPageStore.getState().selectedDuration,
//     team: taskManagementPageStore.getState().selectedTeam?.id,
//     user: userStore.getState().user?.id,
//   } as TaskOptional;

//   let validatedTask: NewTask | undefined = undefined;

//   try {
//     validatedTask = TaskSchema.parse(task);
//   } catch (e) {
//     const err = e as ZodError;
//     showNotification({
//       title: "Error creating task",
//       message: err.message,
//       color: "red",
//     });
//     return;
//   }

//   if (!validatedTask) return;

//   await pocketbase.collection("tasks").create({
//     ...validatedTask,
//   });

//   showNotification({
//     title: "Task created",
//     message: "Task has been created",
//     color: "green",
//   });
// }

function onCopyLastTask() {
  const task = taskManagementPageStore.getState();
}

function onResetTask() {
  const task = taskManagementPageStore.getState();
}

const ActivitySelector = ({
  task,
  updateTask,
}: {
  task: TaskOptional;
  updateTask: (newTask: TaskOptional) => void;
}) => {
  const availableActivities = getAvailableActivitiesForTask(task);
  const [activity, setActivity] = useState(
    getActivityFromId(task.activity ?? "")
  );

  useEffect(() => {
    if (!task.activity) return;

    const activity = getActivityFromId(task.activity);

    if (!activity) return;

    setActivity(activity);
  }, [task.activity]);

  return (
    <>
      <Select
        label="Activity"
        size="xs"
        key={task.activity}
        placeholder="Pick one"
        searchable
        nothingFound="Not found"
        withAsterisk
        value={activity?.name}
        onChange={(e) => {
          if (!e) return;

          const activity = getAvailableActivityFromName(e);

          if (!activity) {
            return;
          }

          const updatedTask = {
            ...task,
            activity: activity.id,
          };

          updateTask(updatedTask);
        }}
        data={availableActivities?.map((activity) => activity.name)}
      />
    </>
  );
};

const updateActivity = (task: TaskOptional, activityId: string) => {
  if (!activityId) return;

  const activity = getAvailableActivityFromName(activityId);

  if (!activity) return;

  taskManagementPageStore.setState((state) => {
    const foundTask = state.tasks.find((t) => t.id === task.id);

    if (!foundTask || !activity.id) return;

    foundTask.activity = activity.id;
  });
};

const TaskDurationSelector = ({
  task,
  updateTask,
}: {
  task: TaskOptional;
  updateTask: (newTask: TaskOptional) => void;
}) => {
  const [value, setValue] = React.useState<number>(8.0);

  useEffect(() => {
    setValue(task.duration ?? 8.0);
  }, [task]);

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
      value={value}
      onChange={(e) => {
        if (!e) return;

        if (isNaN(e)) {
          showNotification({
            title: "Error",
            message: "Duration must be a number",
            color: "red",
          });
        }

        const updatedTask = {
          ...task,
          duration: e,
        };

        updateTask(updatedTask);
      }}
    />
  );
};

const TaskDatePicker = ({
  task,
  updateTask,
}: {
  task: TaskOptional;
  updateTask: (newTask: TaskOptional) => void;
}) => {
  const [value, setValue] = React.useState<Date>(new Date());

  useEffect(() => {
    if (task.date) {
      setValue(new Date(task.date));
    }
  }, [task.date]);

  return (
    <DatePicker
      allowFreeInput
      size="xs"
      placeholder="Task date"
      label="Task date"
      withAsterisk
      value={value}
      onChange={(e) => {
        if (!e) return;

        const formatted = TaskUtils.formatDate(e);

        const updatedTask = {
          ...task,
          date: formatted,
        } as TaskOptional;

        updateTask(updatedTask);
      }}
    />
  );
};

const TaskCommentTextInput = ({
  task,
  updateTask,
}: {
  task: TaskOptional;
  updateTask: (newTask: TaskOptional) => void;
}) => {
  const [selectedComment, setSelectedComment] = useState("");

  useEffect(() => {
    setSelectedComment(task.comment ?? "");
  }, [task]);

  return (
    <TextInput
      placeholder="Comment"
      label="Comment (optional)"
      size="xs"
      value={selectedComment}
      onChange={(e) => {
        const comment = e.target.value;

        const updatedTask = {
          ...task,
          comment: comment,
        } as TaskOptional;

        updateTask(updatedTask);
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
