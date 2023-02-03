import {showDebug} from "@/lib/debug";
import {pocketbase} from "@/lib/pocketbase";
import {queryClient} from "@/lib/tanstackQuery";
import {TaskUtils,} from "@/logic/tasksPage/tasksUtils";
import {Task as SingleTask, TaskOptional, TaskSchema} from "@/types/types";
import {
    Box,
    Button,
    Checkbox,
    Divider,
    LoadingOverlay,
    NumberInput,
    Overlay,
    ScrollArea,
    Select,
    TextInput,
    Tooltip,
} from "@mantine/core";
import {DatePicker, DateRangePicker} from "@mantine/dates";
import {showNotification} from "@mantine/notifications";
import {
    IconArrowDown,
    IconArrowUp,
    IconCalendar,
    IconCheck,
    IconPlus,
    IconQuestionMark,
    IconReload,
    IconX
} from "@tabler/icons-react";
import React, {useEffect, useRef, useState} from "react";
import {ZodError} from "zod";
import {tasksPageStore} from "@/logic/tasksPage/taskpageStore";
import {TASKS_QUERY_KEYS, useTaskManagementData} from "@/logic/tasksPage/api";
import {
    getActivityFromId,
    getAvailableActivitiesForTask,
    getAvailableActivityFromName,
    getProjectFromName,
    getTeamFromName
} from "@/logic/tasksPage/pure";
import {getEmptyTaskOptional} from "@/logic/tasksPage/aa";
import {useClipboard} from "@mantine/hooks";

type TasksPageStoreType = {
    currentTask: TaskOptional;
    tasks: SingleTask[];
};

const TasksPage = () => {
    useTaskManagementData();
    return (
        <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
            <h1 className="text-2xl font-bold mt-10 ml-5">Tasks management</h1>
            <NanoToolbar/>
            <TasksArea/>
        </ScrollArea>
    );
};

export default TasksPage;

const NanoToolbar = () => {
    return (
        <div className="flex justify-between my-10">
            <div className="flex gap-2 items-end">

            </div>
            <div className="flex gap-3">
                <ProjectSelector/>
                <TeamSelector/>
            </div>
        </div>
    );
};

const ProjectSelector = () => {
    const availableProjects = tasksPageStore((state) => state.projects);
    const selectedProject = tasksPageStore(
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

                    const project = getProjectFromName(value, tasksPageStore.getState().projects);

                    if (!project) return;

                    tasksPageStore.setState((state) => {
                        state.selectedProject = project;
                    });
                }}
            />
        </>
    );
};

const TeamSelector = () => {
    const availableTeams = tasksPageStore(
        (state) => state.availableTeams
    );
    const selectedTeam = tasksPageStore((state) => state.selectedTeam);
    const selectedProject = tasksPageStore(
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

                    const team = getTeamFromName(value, tasksPageStore.getState().teams);

                    if (!team) return;

                    tasksPageStore.setState((state) => {
                        state.selectedTeam = team;
                    });
                }}
            />
        </>
    );
};

const TasksArea = () => {
    const tasks = tasksPageStore((state) => state.tasks);

    return (
        <div className="px-4">
            <h2 className="text-2xl mb-4 ">New task</h2>
            <EditableTask/>
            <Divider className="my-4"/>
            <div className="flex w-full justify-between">
                <h2 className="text-2xl mb-4 mt-4">
                    Previous tasks (not accepted by manager yet)
                </h2>
            </div>
            <div className="flex justify-between w-full my-2 mb-6">
                <div className="flex gap-4 items-end">
                    <TasksRangeDatePicker/>
                    <IconReload
                        onClick={() => {
                            tasksPageStore.setState((state) => {
                                state.activeDateRange = TaskUtils.getCurrentMonthDateRange();
                            });
                        }}
                        className="cursor-pointer active:rotate-[359deg] transition-all mb-2"
                    />
                </div>
                <ExistingTasksFilteButtons/>
            </div>
            <TaskSearchInput/>
            <div className="mb-2"></div>
            {tasks.map((task) => {
                return <SingleTask key={task.id} task={task}/>;
            })}
        </div>
    );
};

function TaskSearchInput() {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <>
            <TextInput placeholder="Search by id" className="max-w-[200px]" ref={inputRef}
                       onBlur={() => {
                           showDebug({
                               message: inputRef?.current?.value ?? ""
                           })
                       }}
            />
        </>
    )
}

const ExistingTasksFilteButtons = () => {
    const sort = tasksPageStore((state) => state.selectedTasksSortType);

    return (
        <div className="flex gap-6 items-center">
            <Checkbox
                size="md"
                label="Rejected only"
                color="violet"
                onChange={(e) => {
                    const rejectedOnly = e.currentTarget.checked ?? false;

                    tasksPageStore.setState((state) => {
                        state.selectedRejectedOnly = rejectedOnly;
                    });
                }}
            />
            <div className="flex gap-3">
                {sort === "desc" && (
                    <Button
                        className="bg-violet-900 hover:bg-violet-800"
                        onClick={() => {
                            tasksPageStore.setState((state) => {
                                state.selectedTasksSortType = "asc";
                            });
                        }}
                        leftIcon={<IconArrowDown/>}
                    >
                        Time descending
                    </Button>
                )}
                {sort === "asc" && (
                    <Button
                        className="bg-violet-900 hover:bg-violet-800"
                        onClick={() => {
                            tasksPageStore.setState((state) => {
                                state.selectedTasksSortType = "desc";
                            });
                        }}
                        leftIcon={<IconArrowUp/>}
                    >
                        Time ascending
                    </Button>
                )}
            </div>
        </div>
    );
};

const EditableTask = () => {
    const [task, setTask] = React.useState<TaskOptional>(
        getEmptyTaskOptional()
    );
    const selectedTeam = tasksPageStore((state) => state.selectedTeam);

    useEffect(() => {
        if (!selectedTeam) return;
        // test
        setTask((old) => ({...old, team: selectedTeam.id}));
    }, [selectedTeam]);

    return <SingleTask task={task} key={selectedTeam?.id}/>;
};

const TasksRangeDatePicker = () => {
    const [value, setValue] = React.useState<[Date, Date] | undefined>(
        TaskUtils.getCurrentMonthDateRange()
    );

    const activeDateRange = tasksPageStore(
        (state) => state.activeDateRange
    );

    useEffect(() => {
        setValue(activeDateRange);
        queryClient.invalidateQueries([TASKS_QUERY_KEYS.TASKS]);
    }, [activeDateRange]);

    return (
        <DateRangePicker
            icon={<IconCalendar size={16}/>}
            amountOfMonths={3}
            placeholder="Pick date range"
            label="Date range"
            className="w-[350px]"
            value={value}
            clearable={true}
            clearButtonLabel="clear"
            onChange={(val) => {
                if (!val || val.length !== 2 || !val[0] || !val[1]) {
                    tasksPageStore.setState((state) => {
                        state.activeDateRange = undefined;
                    });
                    return;
                }
                ;

                const [from, to] = val;

                tasksPageStore.setState((state) => {
                    state.activeDateRange = [from, to];
                });
            }}
        />
    );
};

const SingleTask = ({task}: { task: TaskOptional }) => {
    const [workTask, setWorkTask] = useState<TaskOptional>(task);
    const [availableActivities, setAvailableActivities] = useState(
        getAvailableActivitiesForTask(
            task,
            tasksPageStore.getState().activities,
            tasksPageStore.getState().selectedTeam?.id
        )
    );
    const selectedTeam = tasksPageStore((state) => state.selectedTeam);

    const updateTask = (newTask: TaskOptional) => {
        setWorkTask(newTask);
    };

    useEffect(() => {
        setWorkTask(task);
    }, [task]);

    useEffect(() => {
        const a = getAvailableActivitiesForTask(workTask, tasksPageStore.getState().activities, tasksPageStore.getState().selectedTeam?.id);
        setAvailableActivities(a);
    }, [selectedTeam]);

    return (
        <Box
            className="flex flex-1 p-4 shadow-xl justify-between items-center relative flex-wrap"
            key={selectedTeam?.id}
        >
            {(!selectedTeam || availableActivities.length === 0) && (
                <Tooltip
                    label="Selected team must have at least one activity"
                    withArrow
                    offset={8}
                >
                    <Overlay className=" bg-black/70 z-10 cursor-not-allowed "/>
                </Tooltip>
            )}
            <div className="flex gap-4">

                <TaskStatusIcon task={workTask}/>

                {
                    workTask.id &&
                    <TaskId task={workTask}/>
                }

                <ActivitySelector task={workTask} updateTask={updateTask}/>

                <TaskDurationSelector task={workTask} updateTask={updateTask}/>

                <TaskDatePicker task={workTask} updateTask={updateTask}/>

                <TaskCommentTextInput task={workTask} updateTask={updateTask}/>
            </div>

            <NewTaskControlButton task={workTask} updateTask={updateTask}/>
        </Box>
    );
};

type TaskIdProps = {
    task: TaskOptional
}

function TaskIdLabel({task}: TaskIdProps) {
    return (
        <div>
            {task.id}
        </div>
    )
}

function TaskId({task}: TaskIdProps) {
    const clipboard = useClipboard();

    return (
        <div className="flex justify-end items-center cursor-pointer min-h-full">
            <Tooltip label={
                clipboard.copied
                    ? "Copied"
                    : <TaskIdLabel task={task}/>
            } onClick={() => {
                clipboard.copy(task.id)
            }}>
                <div>
                    ID
                </div>
            </Tooltip>
        </div>
    )
}

type TaskStatusIconProps = {
    task: TaskOptional
}

function TaskStatusIcon({task}: TaskStatusIconProps) {

    return (
        <div className="flex justify-center items-center min-h-full">
            {
                task.accepted !== "" &&
                task.rejected === "" &&
                <Tooltip label={"Task accept"}>
                    <IconCheck className="text-sky-900"/>
                </Tooltip>
            }

            {
                task.rejected !== "" &&
                task.accepted === "" &&
                <Tooltip label={"Task rejected (to be corrected)"}>
                    <IconX/>
                </Tooltip>
            }

            {
                task.rejected === "" &&
                task.accepted === "" &&
                <Tooltip label={"New task (to be reviewed by manager)"}>
                    <IconQuestionMark/>
                </Tooltip>
            }
        </div>
    )
}

const NewTaskControlButton = ({
                                  task,
                                  updateTask,
                              }: {
    task: TaskOptional;
    updateTask: (newTask: TaskOptional) => void;
}) => {
    const loadingStatus = tasksPageStore(state => state.tasksLoading)

    return (
        <>
            <div>
                {/* update task */}
                {!task.id && (
                    <Button size="xs" onClick={() => onAddTask(task)}>
                        <IconPlus/>
                    </Button>
                )}
                {/* add task */}
                {task.id && (
                    <div className="relative">
                        <LoadingOverlay visible={loadingStatus} overlayBlur={1}
                                        className="p-5 rounded-xl flex justify-center items-center"/>
                        <Button size="xs" onClick={() => onUpdateTask(task)}>
                            <IconCheck/>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

async function onUpdateTask(task: TaskOptional) {
    if (!task.id) return;

    let validatedTask: SingleTask | undefined = undefined;

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

    validatedTask.rejected = '';

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
    let validatedTask: SingleTask | undefined = undefined;

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
//     activity: tasksPageStore.getState().selectedActivity?.id,
//     comment: tasksPageStore.getState().selectedComment,
//     date: TaskUtils.formatDate(tasksPageStore.getState().selectedDate),
//     duration: tasksPageStore.getState().selectedDuration,
//     team: tasksPageStore.getState().selectedTeam?.id,
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
    const task = tasksPageStore.getState();
}

function onResetTask() {
    const task = tasksPageStore.getState();
}

const ActivitySelector = ({
                              task,
                              updateTask,
                          }: {
    task: TaskOptional;
    updateTask: (newTask: TaskOptional) => void;
}) => {
    const availableActivities = getAvailableActivitiesForTask(task, tasksPageStore.getState().activities,
        tasksPageStore.getState().selectedTeam?.id);
    const [activity, setActivity] = useState(
        getActivityFromId(task.activity ?? "", tasksPageStore.getState().activities)
    );

    useEffect(() => {
        if (!task.activity) return;

        const activity = getActivityFromId(task.activity, tasksPageStore.getState().activities);

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

                    const activity = getAvailableActivityFromName(e, tasksPageStore.getState().activities);

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

    const activity = getAvailableActivityFromName(activityId, tasksPageStore.getState().activities);

    if (!activity) return;

    tasksPageStore.setState((state) => {
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
            onBlur={(e) => {
            }}
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

const MonthTasksGroup = ({children}: TasksGroupProps) => {
    return (
        <div className="p-4">
            <h1>Januray</h1>
            <div>{children}</div>
        </div>
    );
};

const WeekTasksGroup = ({children}: TasksGroupProps) => {
    return (
        <div className="p-4">
            <h1>Week 1</h1>
            <div>{children}</div>
        </div>
    );
};
