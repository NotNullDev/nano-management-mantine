import {ScrollArea, TextInput} from "@mantine/core";
import React from "react";

const TasksHistoryPage = () => {
    return (
        <>
            <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
                <h1 className="text-2xl font-bold my-10 ml-5">Dashboard</h1>
                <div className="flex gap-4 ">
                    <TextInput label="Project"/>
                    <TextInput label="Team"/>
                    <TextInput label="Person"/>
                    <TextInput label="Status"/>
                </div>
            </ScrollArea>
        </>
    )
}


export default TasksHistoryPage;