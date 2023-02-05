import {useSelectedTaskId} from "@/logic/tasksHistory/api";
import {Button, Drawer, ScrollArea, TextInput} from "@mantine/core";
import {TaskUtils} from "@/logic/tasksPage/tasksUtils";
import {TaskStatusSelect} from "@/components/common/TaskStatusSelect";
import React from "react";
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
import {Task} from "@/types/types";


export type TaskDetailsDrawerStoreType = {
    open: boolean;
    task: Task | undefined
    taskId: string | undefined // used to refetch the task in useSelectedTaskId()
}

export const taskDetailsDrawerStore = create<TaskDetailsDrawerStoreType>()(
    immer(
        (set, get, store) => {
            return {
                open: false,
                task: undefined,
                taskId: undefined
            }
        }
    )
)

export function TaskDetailsDrawer() {
    const drawerOpen = taskDetailsDrawerStore(state => state.open)
    const task = taskDetailsDrawerStore(state => state.task)
    useSelectedTaskId()
    return (
        <>
            <Drawer
                opened={drawerOpen}
                key={task?.id ?? ""}
                onClose={() => {
                    taskDetailsDrawerStore.setState(state => {
                        state.open = false;
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
                                }} initialStatus={task.status}/>
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