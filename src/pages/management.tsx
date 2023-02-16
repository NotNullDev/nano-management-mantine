import {showDebug} from "@/lib/debug";
import {queryClient} from "@/lib/tanstackQuery";
import {groupManagementDataByUser} from "@/logic/common/pure";
import {MANAGEMENT_QUERY_KEYS, updateTasksStatuses, useManagementData,} from "@/logic/managementPage/api";
import {GroupedManagementData} from "@/types/utilTypes";
import {Button, ScrollArea, Select, Table} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconFileExport, IconX} from "@tabler/icons-react";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {managementPageStore} from "@/logic/managementPage/managementPageStore";
import {TaskDetailsDrawer} from "@/components/common/TaskDetailsDrawer";
import Head from "next/head";

export const ManagementPage = () => {
    useManagementData();
    return (
        <>
            <Head>
                <title>Management</title>
            </Head>
            <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
                <h1 className="text-2xl font-bold mt-10 ml-5">Management</h1>
                <div className="flex w-full justify-end items-center gap-4">
                    <TeamSelector/>
                </div>
                <Summary/>
                <Tasks/>
            </ScrollArea>
        </>
    );
};

export default ManagementPage;

const TeamSelector = () => {
    const selectedTeam = managementPageStore((state) => state.selectedTeam);
    const availableTeams = managementPageStore((state) => state.teams);
    const showAll = managementPageStore((state) => state.showAllTeams);
    const [data, setData] = useState<string[]>([]);
    const [val, setVal] = useState<string | undefined>(undefined);

    useEffect(() => {
        let teamsNames = availableTeams.map((team) => team.name);
        teamsNames = ["All", ...teamsNames];

        setData(teamsNames);

        if (showAll) {
            setVal("All");
            return;
        }

        if (selectedTeam) {
            setVal(selectedTeam.name);
        }
    }, [selectedTeam, availableTeams, showAll]);

    return (
        <>
            <Select
                label="Team"
                placeholder="Pick one"
                searchable
                nothingFound="No options"
                value={val}
                data={data}
                onChange={(value) => {
                    if (value === "All") {
                        managementPageStore.setState((state) => {
                            state.selectedTeam = null;
                            state.showAllTeams = true;
                        });
                        return;
                    }

                    const t = availableTeams.find((team) => team.name === value);

                    if (!t) {
                        showDebug({
                            message: "Could not find team",
                        });
                        return;
                    }

                    managementPageStore.setState((state) => {
                        state.selectedTeam = t;
                        state.showAllTeams = false;
                    });
                }}
            />
        </>
    );
};

function Summary() {
    const tasks = managementPageStore((state) => state.tasks);
    const users = managementPageStore((state) => state.users);

    return (
        <>
            <div className="flex flex-col"></div>
        </>
    );
}

function Tasks() {
    const managementData = managementPageStore((state) => state.managementData);
    const users = managementPageStore((state) => state.users);
    const [groupedManagementData, setGroupedManagementData] = useState<GroupedManagementData[]>([]);

    useEffect(() => {
        const groupedTasks = groupManagementDataByUser(managementData);
        setGroupedManagementData(groupedTasks);
    }, [users, managementData]);

    return (
        <>
            <div className="flex flex-col gap-6 p-4 items-center">
                {groupedManagementData.map((grouped) => {
                    return <TaskGroup grouped={grouped} key={grouped.userId}/>;
                })}
                <EmptyTasksArea size={groupedManagementData.length}/>
            </div>
        </>
    );
}

function TaskGroup({grouped}: { grouped: GroupedManagementData }) {

    return (
        <>
            <div className="flex flex-col flex-1 w-4/5 rounded-xl shadow-sky-700 shadow px-4 pb-4">
                <h2 className="my-4 text-3xl">{grouped.userName}</h2>
                <Table className="" highlightOnHover>
                    <thead className="text-xl">
                    <tr>
                        <th>
                            <h3>Task</h3>
                        </th>
                        <th>
                            <h3>Duration</h3>
                        </th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {grouped.managementData.map(unit => {
                        return (
                            <tr key={unit.userId} className="cursor-pointer" onClick={() => {

                            }}>
                                <td>
                                    {unit.date} (
                                    {dayjs(unit.date, "DD.MM.YYYY").format("dddd").toString()})
                                </td>
                                <td>
                                    <span>{unit.durationSummary} hours</span>
                                </td>
                                <td className="flex gap-3">
                                    <RejectButton unit={[{date: unit.date, userId: unit.userId}]}/>
                                    <AcceptButton unit={[{date: unit.date, userId: unit.userId}]}/>
                                </td>
                            </tr>
                        );
                    })}
                    <tr className="font-bold text-xl border-t border-sky-900">
                        <td className="">
                            <div className="my-2 font-bold! !text-xl">Total</div>
                        </td>
                        <td>
                            <div className="my-2 font-bold! !text-xl">
                                {grouped.managementData.reduce(
                                    (acc, unit) => acc + unit.durationSummary,
                                    0
                                )}{" "}
                                hours
                            </div>
                        </td>
                        <td></td>
                    </tr>
                    </tbody>
                </Table>
                <div className="flex justify-between w-full mt-4">
                    <div className="flex gap-10 items-center">
                        <Button className="hover:bg-violet-800 bg-violet-900">
                            Details
                        </Button>
                        <IconFileExport
                            className="hover:scale-105 hover:cursor-pointer"
                            size={28}
                        />
                    </div>
                    <div className="flex gap-6">
                        <RejectButton unit={grouped.managementData.map(m => ({date: m.date, userId: m.userId}))}/>
                        <AcceptButton unit={grouped.managementData.map(m => ({date: m.date, userId: m.userId}))}/>
                    </div>
                </div>
            </div>
            <TaskDetailsDrawer/>
        </>
    );
}

type ChangeStatusButtonProps = {
    unit: { userId: string, date: string }[]
}

function RejectButton({unit}: ChangeStatusButtonProps) {
    return (
        <>
            <IconX
                className="hover:text-red-500 hover:cursor-pointer text-red-900"
                size={28}
                onClick={async () => {
                    updateTasksStatuses({
                        status: "rejected",
                        userId: unit[0].userId,
                        days: unit.map(u => u.date)
                    })

                    await queryClient.invalidateQueries([
                        MANAGEMENT_QUERY_KEYS.TASKS,
                    ]);

                    showNotification({
                        title: "Tasks updated",
                        message: "Tasks have been rejected",
                    });
                }}
            />
        </>
    )
}

function AcceptButton({unit}: ChangeStatusButtonProps) {
    return (
        <>
            <IconCheck
                className="hover:text-green-500 hover:cursor-pointer text-green-900"
                size={28}
                onClick={async () => {
                    updateTasksStatuses({
                        status: "accepted",
                        userId: unit[0].userId,
                        days: unit.map(u => u.date)
                    });

                    await queryClient.invalidateQueries([
                        MANAGEMENT_QUERY_KEYS.TASKS,
                    ]);

                    showNotification({
                        title: "Tasks updated",
                        message: "Tasks have been accepted",
                    });
                }}
            />
        </>
    )
}

type EmptyTasksAreaProps = {
    size: number
}

function EmptyTasksArea({size}: EmptyTasksAreaProps) {
    return (
        <>
            {size === 0 && (
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl">No tasks to manage</h2>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            await queryClient.invalidateQueries([
                                MANAGEMENT_QUERY_KEYS.TASKS,
                            ]);
                        }}
                    >
                        Refresh
                    </Button>
                </div>
            )}
        </>
    )
}