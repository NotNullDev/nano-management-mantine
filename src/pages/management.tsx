import { showDebug } from "@/lib/debug";
import { groupTasksByUser } from "@/logic/common/pure";
import {
  managementPageStore,
  useManagementData,
} from "@/logic/managementPageStore";
import { Task } from "@/types/types";
import { TasksGroupedByUser } from "@/types/utilTypes";
import { Checkbox, ScrollArea, Select, Table } from "@mantine/core";
import { IconCheck, IconFileExport, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";

export const ManagementPage = () => {
  useManagementData();
  return (
    <>
      <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
        <h1 className="text-2xl font-bold mt-10 ml-5">Management</h1>
        <div className="flex w-full justify-end items-center gap-4">
          <Checkbox label="hide empty" />
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

  return (
    <>
      <Select
        label="Team"
        placeholder="Pick one"
        searchable
        nothingFound="No options"
        value={selectedTeam?.name}
        data={availableTeams.map((team) => team.name)}
        onChange={(value) => {
          const t = availableTeams.find((team) => team.name === value);

          if (!t) {
            showDebug({
              message: "Could not find team",
            });
            return;
          }

          managementPageStore.setState((state) => {
            state.selectedTeam = t;
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
      <div className="flex flex-col">
        <div>
          Found <span>{tasks.length} tasks.</span>
        </div>
        <div>
          Found <span>{users.length} users.</span>
        </div>
        <div>
          You have {tasks.length} tasks to verify created by {users.length}{" "}
          users.
        </div>
      </div>
    </>
  );
}

function Tasks() {
  const tasks = managementPageStore((state) => state.tasks);
  const users = managementPageStore((state) => state.users);

  return (
    <>
      <div key={tasks.length} className="flex flex-col gap-6 p-4 items-center">
        {groupTasksByUser(tasks, users).map((grouped) => {
          return <TaskGroup taskGroup={grouped} key={grouped.user.id} />;
        })}
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
                <tr key={task.id} className="">
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
          <div>
            <IconFileExport />
          </div>
          <div className="flex gap-6">
            <IconX
              className="hover:text-red-500 hover:cursor-pointer text-red-900"
              size={28}
            />
            <IconCheck
              className="hover:text-green-500 hover:cursor-pointer text-green-900"
              size={28}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function TaskToBeVerified({ task }: { task: Task }) {
  return <></>;
}
