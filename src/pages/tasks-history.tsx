import {Button, Drawer, Pagination, ScrollArea, Select, Table, TextInput} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
import {useSelectedTaskId, useTasksHistoryData} from "@/logic/tasksHistory/api";
import {tasksHistoryPageStore} from "@/logic/tasksHistory/tasksHistoryStore";
import {getTaskStatus, getTeamsForSelectedProject} from "@/logic/tasksHistory/pure";
import {TasksHistory} from "@/types/types";
import dayjs from "dayjs";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";
import {TaskStatusSelect} from "@/components/common/TaskStatusSelect";

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
            {/*<div className="w-[100px]">*/}

            {/*    <h2 className="text-center text-xl font-bold">Export</h2>*/}

            {/*    <Divider className="my-2"/>*/}

            {/*    <div className="items-center flex flex-col justify-center gap-2">*/}
            {/*        <Button>Excel</Button>*/}
            {/*        <Button>CSV</Button>*/}
            {/*    </div>*/}

            {/*</div>*/}
            <ScrollArea className="flex flex-col flex-1 p-4 h-screen flex-1 items-center justify-center">
                <h1 className="text-2xl font-bold my-10 ml-5">Tasks history</h1>
                <div className="flex gap-4 mb-8">
                    <ProjectSelector/>
                    <TeamSelector/>
                    <Select data={[]} label="Person"/>
                    <Select data={[]} label="Status"/>
                </div>

                <ResultArea/>

            </ScrollArea>
            <TaskDetailsDrawer/>
        </div>
    )
}

export default TasksHistoryPage;

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
                data={projectNames}
                searchable
                clearable
                onChange={(e) => {
                    const projectId = projects.find(p => p.name === e)?.id

                    if (!projectId) {
                        return
                    }

                    tasksHistoryPageStore.setState(state => {
                        state.selectedProjectId = projectId
                        state.selectedTeamId = undefined
                    })
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
                data={teamsNames}
                value={selectedName ?? "All"}
                onChange={(e) => {
                    const foundId = teams.find(t => t.name === e)?.id;

                    if (!foundId) {
                        return;
                    }

                    tasksHistoryPageStore.setState(state => {
                        state.selectedTeamId = foundId
                    })

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
                withColumnBorders
                striped
                className="w-4/5 mx-auto">
                <thead>
                <th>Team</th>
                <th>Person</th>
                <th>Task duration</th>
                <th>Task status</th>
                <th>Date</th>
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

function TablePagination() {
    return (
        <Pagination total={100} className="mt-5" position="center"/>
    )
}

type ResultAreaRowType = {
    taskHistoryRecord: TasksHistory
}

function ResultAreaRow({taskHistoryRecord}: ResultAreaRowType) {

    const getTaskStatus = (accepted: string, rejected: string) => {
        if (accepted !== "") {
            return "accepted";
        }

        if (rejected !== "") {
            return "rejected"
        }

        return "fresh"
    }

    return (
        <>
            <tr
                className="cursor-pointer"

                onClick={() => {
                    tasksHistoryPageStoreInternal.setState(state => {
                        state.drawerOpen = true;
                    })
                    tasksHistoryPageStore.setState(state => {
                        state.selectedTaskId = taskHistoryRecord.taskId
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
                <td>{getTaskStatus(taskHistoryRecord.taskAccepted, taskHistoryRecord.taskRejected)}</td>
                {/* task date */}
                <td>{dayjs(taskHistoryRecord.taskDate).format("DD.MM.YYYY")}</td>
            </tr>
        </>
    )
}

function TaskDetailsDrawer() {
    const drawerOpen = tasksHistoryPageStoreInternal(state => state.drawerOpen)
    const task = tasksHistoryPageStore(state => state.currentlySelectedTask)
    useSelectedTaskId()
    return (
        <>
            <Drawer
                opened={drawerOpen}
                onClose={() => {
                    tasksHistoryPageStoreInternal.setState(state => {
                        state.drawerOpen = false;
                    })
                }}
                title="Task details"
                padding="xl"
                size="xl"
                position="right"
            >
                {/* Drawer content */}
                {
                    task && (
                        <>
                            <ScrollArea>
                                <TextInput label={"Task ID"} value={task.id} disabled/>
                                <TextInput label={"Comment"} value={task.comment} disabled/>
                                <TextInput label={"Duration"} value={task.duration} disabled/>
                                <TextInput label={"Date"} value={TaskUtils.formatDateString(task.date)} disabled/>
                                <TextInput label={"User"} value={task?.user} disabled/>
                                <TaskStatusSelect onChange={() => {
                                }} initialStatus={getTaskStatus(task)}/>
                                <TextInput label={"Team"} value={task?.team} disabled/>
                                <div className="w-full justify-end items-end flex">
                                    <Button className="bg-red-900 hover:bg-red-800 mt-2">Delete</Button>
                                </div>
                            </ScrollArea>
                        </>
                    )
                }
            </Drawer>
        </>
    )
}