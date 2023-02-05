import {Select} from "@mantine/core";
import {TaskStatus, TaskStatusOptions} from "@/types/types";

type TaskStatusSelectType = {
    onChange: (taskStatus: TaskStatus) => void
    className?: string
    initialStatus?: TaskStatus
}

export function TaskStatusSelect({onChange, className, initialStatus}: TaskStatusSelectType) {
    return (
        <Select
            label="Status"
            defaultValue={initialStatus}
            onChange={(e) => {
                if (e) {
                    onChange(e as TaskStatus)
                }
            }}
            data={[...TaskStatusOptions]}
            searchable
        >
        </Select>
    )
}