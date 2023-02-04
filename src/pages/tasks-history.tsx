import {Drawer, ScrollArea, Select, Table} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
import {useTasksHistoryData} from "@/logic/tasksHistory/api";
import {tasksHistoryPageStore} from "@/logic/tasksHistory/tasksHistoryStore";
import {getTeamsForSelectedProject} from "@/logic/tasksHistory/pure";
import {TasksHistory} from "@/types/types";
import dayjs from "dayjs";

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
            <Table highlightOnHover className="w-4/5 mx-auto">
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
        </>
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
                <div>hello world</div>
            </Drawer>
        </>
    )
}