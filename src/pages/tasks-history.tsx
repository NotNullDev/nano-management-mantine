import {Button, Pagination, ScrollArea, Select, Table, TextInput} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
import {useTasksHistoryData} from "@/logic/tasksHistory/api";
import {
    setTaskHistoryStoreFilter,
    setTaskHistoryStoreSort,
    tasksHistoryPageStore
} from "@/logic/tasksHistory/tasksHistoryStore";
import {getTeamsForSelectedProject} from "@/logic/tasksHistory/pure";
import {TasksHistory, TaskStatusOptions, TaskStatusSchema} from "@/types/types";
import dayjs from "dayjs";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";
import {DateRangePicker} from "@mantine/dates";
import {IconArrowDown, IconArrowUp, IconCalendar} from "@tabler/icons-react";
import {NanoSort, TasksHistoryFiltersOptional} from "@/types/utilTypes";
import {TaskDetailsDrawer, taskDetailsDrawerStore} from "@/components/common/TaskDetailsDrawer";
import {showDebug} from "@/lib/debug";

type TasksHistoryPageStoreInternalType = {
    drawerOpen: boolean
}

const tasksHistoryPageStoreInternal = create<TasksHistoryPageStoreInternalType>()(
    immer(
        (set, get, store) => {
            return {
                drawerOpen: false
            }
        }
    )
)

const TasksHistoryPage = () => {
    useTasksHistoryData()

    return (
        <div className="flex flex-1">
            <ScrollArea className="flex flex-col flex-1 p-4 h-screen flex-1 items-center justify-center">
                <h1 className="text-2xl font-bold my-10 ml-5">Tasks history</h1>
                <div className="flex gap-4 mb-8">
                    <ProjectSelector/>
                    <TeamSelector/>
                    <UserInputFilter/>
                    <TaskStatusFilter/>
                    <DateRangeSelector/>
                </div>

                <ResultArea/>

            </ScrollArea>
            <TaskDetailsDrawer/>
        </div>
    )
}

function TaskStatusFilter() {
    return (
        <Select
            label="Status"
            defaultValue={"All"}
            onChange={(e) => {
                if (!e || e === "All") {
                    setTaskHistoryStoreFilter("statusFilter", undefined)
                    return
                }

                const nextStatus = TaskStatusSchema.parse(e)

                showDebug({
                    message: `${nextStatus}`
                })

                setTaskHistoryStoreFilter("statusFilter", nextStatus);
            }}
            data={["All", ...TaskStatusOptions]}
            searchable
        >
        </Select>
    )
}

function UserInputFilter() {
    const val = tasksHistoryPageStore(
        (state) => state.filter.userFilter
    );
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (val && inputRef.current) {
            inputRef.current.value = val;
        }
    }, [val])

    return (
        <TextInput
            label="User"
            ref={inputRef}
            onBlur={() => {
                setTaskHistoryStoreFilter("userFilter", inputRef.current?.value ?? "")
            }}
            placeholder="Email or name"
            className="w-[200px]"
        />
    )
}

export default TasksHistoryPage;

function DateRangeSelector() {
    const [value, setValue] = React.useState<[Date, Date] | undefined>(
        TaskUtils.getCurrentMonthDateRange()
    );

    const activeDateRange = tasksHistoryPageStore(
        (state) => state.activeDateRange
    );

    useEffect(() => {
        setValue(activeDateRange);
        // queryClient.invalidateQueries([TASKS_QUERY_KEYS.TASKS]);
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
                    tasksHistoryPageStore.setState((state) => {
                        state.filter.dateFromFilter = undefined;
                        state.filter.dateToFilter = undefined;
                    });
                    return;
                }
                ;

                const [from, to] = val;

                tasksHistoryPageStore.setState((state) => {
                    state.filter.dateFromFilter = TaskUtils.formatDate(from);
                    state.filter.dateToFilter = TaskUtils.formatDate(to);
                });
            }}
        />
    );
}

function ProjectSelector() {
    const projects = tasksHistoryPageStore(state => state.allProjects);
    const selectedProjectId = tasksHistoryPageStore(state => state.selectedProjectId);
    const [projectNames, setProjectNames] = useState<string[]>([]);
    const [currentValue, setCurrentValue] = useState<string | undefined>();

    useEffect(() => {
        setProjectNames([...new Set(projects.map(d => d.name))]);
    }, [projects])

    useEffect(() => {
        const name = projects.find(p => p.id === selectedProjectId)?.name
        setCurrentValue(name ?? undefined);
    }, [selectedProjectId])


    return (
        <>
            <Select
                value={currentValue ?? "All"}
                data={["All", ...projectNames]}
                searchable
                clearable
                onChange={(e) => {
                    const projectId = projects.find(p => p.name === e)?.id

                    if (!projectId || e === "All") {
                        tasksHistoryPageStore.setState(state => {
                            state.selectedProjectId = undefined
                            state.selectedTeamId = undefined
                            state.filter.teamFilter = undefined
                            state.filter.projectFilter = undefined
                        })
                    }

                    tasksHistoryPageStore.setState(state => {
                        state.selectedProjectId = projectId
                        state.selectedTeamId = undefined
                    })

                    setTaskHistoryStoreFilter("projectFilter", projectId)
                    setTaskHistoryStoreFilter("teamFilter", undefined)
                }} label="Project"/>
        </>
    )
}

function TeamSelector() {
    const selectedProjectId = tasksHistoryPageStore(state => state.selectedProjectId);
    const teams = tasksHistoryPageStore(state => state.allTeams);
    const selectedTeamId = tasksHistoryPageStore(state => state.selectedTeamId)

    const [selectedName, setSelectedName] = useState<string | undefined>();
    const [teamsNames, setTeamsNames] = useState<string[]>([])

    useEffect(() => {
        let teamNames: string[] = [];

        if (selectedProjectId) {
            const teamsForSelectedProject = getTeamsForSelectedProject(teams, selectedProjectId);
            teamNames = teamsForSelectedProject.map(t => t.name)
        }

        setTeamsNames(teamNames);
    }, [selectedProjectId, teams])

    useEffect(() => {
        if (selectedTeamId) {
            const foundTeamName = teams.find(t => t.id === selectedTeamId)?.name;
            setSelectedName(foundTeamName ?? undefined);
        } else {
            setSelectedName(undefined);
        }
    }, [selectedTeamId, teams, selectedProjectId])

    return (
        <>
            <Select
                clearable
                placeholder="find by name"
                searchable
                data={["All", ...teamsNames]}
                value={selectedName ?? "All"}
                onChange={(e) => {
                    const foundId = teams.find(t => t.name === e)?.id;

                    if (!foundId || e === "All") {
                        tasksHistoryPageStore.setState(state => {
                            tasksHistoryPageStore.setState(state => {
                                state.selectedTeamId = undefined
                                state.filter.teamFilter = undefined
                            })
                        })
                    }

                    tasksHistoryPageStore.setState(state => {
                        state.selectedTeamId = foundId
                    })
                    setTaskHistoryStoreFilter("teamFilter", foundId)
                }}
                label="Team"/>
        </>
    )
}

function ResultArea() {
    const data = tasksHistoryPageStore(state => state.data)
    return (
        <>
            <Table
                highlightOnHover
                className="">
                <thead>
                <tr>
                    <AreaResultHeader title={"Team"} fieldName="teamSort"/>
                    <AreaResultHeader title={"User"} fieldName={"userSort"}/>
                    <AreaResultHeader title={"Task duration"} fieldName="taskDurationSort"/>
                    <AreaResultHeader title={"Task status"} fieldName="taskStatusSort"/>
                    <AreaResultHeader title={"Date"} fieldName={"dateSort"}/>
                </tr>
                </thead>
                <tbody>
                {
                    data.map(el => {
                        return <ResultAreaRow taskHistoryRecord={el} key={el.taskId}/>
                    })
                }
                </tbody>
            </Table>
            <TablePagination/>
        </>
    )
}

type AreaResultHeaderProps = {
    title: string
    onClick?: (sort: NanoSort) => void
    fieldName: keyof TasksHistoryFiltersOptional
}

function AreaResultHeader({onClick, title, fieldName}: AreaResultHeaderProps) {
    const value = tasksHistoryPageStore(state => state.filter[fieldName]) as NanoSort;
    const [sort, setSort] = useState<NanoSort>("");

    useEffect(() => {
        setSort(value ?? "");
    })

    return (
        <th>
            <Button variant="subtle" color="gray"
                    unstyled={false}
                    onClick={() => {
                        let nextSort: NanoSort = "";

                        if (sort === "asc") {
                            nextSort = "desc";
                        }
                        if (sort === "desc") {
                            nextSort = "";
                        }
                        if (sort === "") {
                            nextSort = "asc";
                        }

                        setTaskHistoryStoreSort(nextSort, fieldName)
                    }}
                    className={"flex justify-between items-center w-full"}>
                <div className="flex flex-1">{title}</div>
                <div>
                    {
                        /* to preserve spacing */
                        sort === "" && <IconArrowDown className="invisible"/>
                    }
                    {
                        sort === "desc" && <IconArrowDown/>
                    }
                    {
                        sort === "asc" && <IconArrowUp/>
                    }
                </div>
            </Button>
        </th>
    )
}

function TablePagination() {
    const tasks = tasksHistoryPageStore(state => state.data)
    const selectedPageSize = tasksHistoryPageStore(state => state.filter.limit);

    const allCount = tasks[0]?.allCount;

    const totalPages = Math.ceil(allCount / (selectedPageSize || 10))

    return (
        <>
            <div className="flex items-end justify-center gap-2" >
                <Pagination total={totalPages ?? 0} className="mt-5" position="center"
                            onChange={(page) => {
                                tasksHistoryPageStore.setState(state => {
                                    state.filter.page = page
                                });
                            }}
                />
                <Select data={["10", "20", "50", "100"]} value={(selectedPageSize ?? 10).toString()}
                        onChange={(e) => {
                            tasksHistoryPageStore.setState(state => {
                                state.filter.limit = Number(e ?? 10)
                            })}
                        }/>
            </div>
        </>
    )
}

type ResultAreaRowType = {
    taskHistoryRecord: TasksHistory
}

function ResultAreaRow({taskHistoryRecord}: ResultAreaRowType) {


    return (
        <>
            <tr
                className="cursor-pointer"

                onClick={() => {
                    taskDetailsDrawerStore.setState(state => {
                        state.open = true;
                        state.taskId = taskHistoryRecord.taskId;
                    })
                }}

            >
                {/* team */}
                <td>{taskHistoryRecord.teamName}</td>
                {/* person */}
                <td>{taskHistoryRecord.userName}</td>
                {/* task duration */}
                <td>{taskHistoryRecord.taskDuration}</td>
                {/* task status */}
                <td>{taskHistoryRecord.taskStatus}</td>
                {/* task date */}
                <td>{dayjs(taskHistoryRecord.taskDate).format("DD.MM.YYYY")}</td>
            </tr>
        </>
    )
}

