import Head from "next/head";
import {setTaskHistoryStoreSort, tasksHistoryPageStore} from "@/logic/tasksHistory/tasksHistoryStore";
import {Pagination, ScrollArea, Select, Table} from "@mantine/core";
import {NanoSort, TasksHistoryFiltersOptional} from "@/types/utilTypes";
import React, {useEffect, useState} from "react";
import {IconArrowDown, IconArrowUp} from "@tabler/icons-react";
import {TasksHistory} from "@/types/types";
import {taskDetailsDrawerStore} from "@/components/common/TaskDetailsDrawer";
import dayjs from "dayjs";
import {useUsersPageData} from "@/logic/usersPage/api";

export default function Users() {
    useUsersPageData();

    return (
        <>
            <Head>
                <title>Users</title>
            </Head>
            <div className="flex flex-1">
                <ScrollArea className="flex flex-col flex-1 p-4 h-screen flex-1 items-center justify-center">
                    <h1 className="text-2xl font-bold my-10 ml-5">Users</h1>
                    <ResultArea/>
                </ScrollArea>
            </div>
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
                    <AreaResultHeader title={"Username"} fieldName="teamSort"/>
                    <AreaResultHeader title={"Email"} fieldName={"userSort"}/>
                    <AreaResultHeader title={"Name"} fieldName="taskDurationSort"/>
                    <AreaResultHeader title={"Roles"} fieldName="taskDurationSort"/>
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
            <button
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
                className={"flex justify-between items-center w-full hover:bg-gray-800 p-2 px-3  rounded items-center"}>
                <div className="">{title}</div>
                <div className="">
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
            </button>
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
                        className="w-[100px]"
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