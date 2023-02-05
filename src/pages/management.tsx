import {showDebug} from "@/lib/debug";
import {queryClient} from "@/lib/tanstackQuery";
import {groupTasksByUser} from "@/logic/common/pure";
import {acceptTasks, MANAGEMENT_QUERY_KEYS, rejectTasks, useManagementData,} from "@/logic/managementPage/api";
import {Task} from "@/types/types";
import {TasksGroupedByUser} from "@/types/utilTypes";
import {Button, ScrollArea, Select, Table} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconFileExport, IconX} from "@tabler/icons-react";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {managementPageStore} from "@/logic/managementPage/managementPageStore";
import {TaskDetailsDrawer, taskDetailsDrawerStore} from "@/components/common/TaskDetailsDrawer";

export const ManagementPage = () => {
    useManagementData();
    return (
        <>
            <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
        <h1 className="text-2xl font-bold mt-10 ml-5">Management</h1>
        <div className="flex w-full justify-end items-center gap-4">
          <TeamSelector />
        </div>
        <Summary />
        <Tasks />
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
  const tasks = managementPageStore((state) => state.tasks);
  const users = managementPageStore((state) => state.users);
  const showAll = managementPageStore((state) => state.showAllTeams);
  const [groupedTasks, setGroupedTasks] = useState<TasksGroupedByUser[]>([]);

  useEffect(() => {
    const groupedTasks = groupTasksByUser(tasks, users);
    setGroupedTasks(groupedTasks);
  }, [tasks, users, showAll]);

  return (
    <>
      <div key={tasks.length} className="flex flex-col gap-6 p-4 items-center">
        {groupedTasks.map((grouped) => {
          return <TaskGroup taskGroup={grouped} key={grouped.user.id} />;
        })}
        {groupedTasks.length === 0 && (
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
      </div>
    </>
  );
}

function TaskGroup({ taskGroup }: { taskGroup: TasksGroupedByUser }) {
  return (
    <>
      <div className="flex flex-col flex-1 w-4/5 rounded-xl shadow-sky-700 shadow px-4 pb-4">
        <h2 className="my-4 text-3xl">{taskGroup.user.name}</h2>
        <Table className="" highlightOnHover>
          <thead className="text-xl">
            <th>
              <h3>Task</h3>
            </th>
            <th>
              <h3>Duration</h3>
            </th>
          </thead>
          <tbody>
            {taskGroup.tasks.map((task) => {
              return (
                  <tr key={task.id} className="cursor-pointer" onClick={() => {
                      taskDetailsDrawerStore.setState(state => {
                          state.taskId = task.id
                          state.open = true
                      })
                  }}>
                      <td>
                          {dayjs(task.date).format("DD.MM.YYYY")} (
                          {dayjs(task.date).format("dddd")})
                      </td>
                      <td>
                          <span>{task.duration} hours</span>
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
                  {taskGroup.tasks.reduce(
                    (acc, task) => acc + task.duration,
                    0
                  )}{" "}
                  hours
                </div>
              </td>
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
            <IconX
              className="hover:text-red-500 hover:cursor-pointer text-red-900"
              size={28}
              onClick={async () => {
                showNotification({
                  title: "Tasks updated",
                  message: "Tasks have been rejected" + taskGroup.tasks.length,
                });

                const tasksToReject = managementPageStore.getState().tasks
                    .filter(t => t.user === taskGroup.user.id)
                    .map(t => t.id ?? "")

                await rejectTasks(tasksToReject);
                await queryClient.invalidateQueries([
                  MANAGEMENT_QUERY_KEYS.TASKS,
                ]);
                showNotification({
                  title: "Tasks updated",
                  message: "Tasks have been rejected" + taskGroup.tasks.length,
                });
              }}
            />
            <IconCheck
              className="hover:text-green-500 hover:cursor-pointer text-green-900"
              size={28}
              onClick={async () => {

                const tasksToAccept = managementPageStore.getState().tasks
                    .filter(t => t.user === taskGroup.user.id)
                    .map(t => t.id ?? "")

                  await acceptTasks(tasksToAccept);

                await queryClient.invalidateQueries([
                  MANAGEMENT_QUERY_KEYS.TASKS,
                ]);
                  showNotification({
                      title: "Tasks updated",
                      message: "Tasks have been accepted",
                  });
              }}
            />
          </div>
        </div>
      </div>
        <TaskDetailsDrawer/>
    </>
  );
}

function TaskToBeVerified({ task }: { task: Task }) {
  return <></>;
}
