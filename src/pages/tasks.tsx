import { taskManager, TaskUtils } from "@/logic/taskManager";
import { NanoUtils } from "@/logic/utils";
import { Activity, Task, TaskOptional } from "@/types/types";
import { MantineSelectedActivityType } from "@/types/utilTypes";
import { Button, NumberInput, Select, TextInput } from "@mantine/core";
import { DatePicker, DateRangePicker } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import {
  IconArrowRight,
  IconCalendar,
  IconPlus,
  IconReload,
} from "@tabler/icons-react";
import React, { useCallback, useEffect } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type TasksPageStoreType = {
  currentTask: TaskOptional;
  tasks: Task[];
};

const tasksPageStore = create<TasksPageStoreType>()(
  immer((get, set, store) => {
    return {
      currentTask: {},
      tasks: [],
    };
  })
);

const TasksPage = () => {
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
      <div className="flex gap-1 items-end">
        <TasksRangeDatePicker />
        <Button
          onClick={() => {
            taskManager.setActiveDateRange(
              ...TaskUtils.getCurrentMonthDateRange()
            );
          }}
          variant="subtle"
        >
          Current month
        </Button>
      </div>
      <div className="flex gap-3">
        <Select
          label="Project"
          placeholder="Pick one"
          searchable
          nothingFound="No options"
          data={["React", "Angular", "Svelte", "Vue"]}
        />
        <Select
          label="Team"
          placeholder="Pick one"
          searchable
          nothingFound="No options"
          data={["React", "Angular", "Svelte", "Vue"]}
        />
      </div>
    </div>
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

  return (
    <div className="flex  flex-1 p-4 shadow-xl justify-between items-center">
      <div className="flex gap-4">
        <ActivitySelector />
        <TaskDurationSelector />

        <TaskDatePicker />

        <TaskCommentTextInput />
      </div>

      <div>
        <Button size="xs">
          <IconReload />
        </Button>
        <Button size="xs">
          <IconPlus />
        </Button>
        <Button size="xs">
          <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};

const acts = [
  {
    name: "Development",
    project: {
      name: "Super project",
      tagsIds: [],
      organizationId: "",
    },
  },
  {
    name: "Testing",
    project: {
      name: "Super project",
      tagsIds: [],
      organizationId: "",
    },
  },
  {
    name: "Development",
    project: {
      name: "The best project",
      tagsIds: [],
      organizationId: "",
    },
  },
] as Activity[];

const ActivitySelector = () => {
  const selectedActivity = tasksPageStore(
    (state) => state.currentTask.activity
  );
  const [data, setData] = React.useState<MantineSelectedActivityType[]>([]);

  useEffect(() => {
    setData(acts.map(TaskUtils.activityToMantineSelectData));
  }, []);

  return (
    <>
      <Select
        label="Activity"
        size="xs"
        placeholder="Pick one"
        searchable
        nothingFound="Not found"
        withAsterisk
        // @ts-ignore
        value={selectedActivity}
        onChange={(val) => {}}
        // @ts-ignore
        data={data}
      />
    </>
  );
};

const TaskDurationSelector = () => {
  const [value, setValue] = React.useState<number>(8 * 60);
  const duration = tasksPageStore((state) => state.currentTask.duration);

  return (
    <NumberInput
      className="w-[150px]"
      size="xs"
      defaultValue={0}
      placeholder="Duration"
      label="Duration"
      radius="md"
      precision={0}
      withAsterisk
      noClampOnBlur
      min={0}
      step={30}
      value={duration ?? 0}
      onChange={(val) => {
        if (!val) return;
        tasksPageStore.setState((state) => {
          state.currentTask.duration = val;
        });
      }}
      formatter={(v) => `${NanoUtils.formatMinutes(Number(v ?? 0))}`}
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
  return (
    <TextInput placeholder="Comment" label="Comment (optional)" size="xs" />
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
