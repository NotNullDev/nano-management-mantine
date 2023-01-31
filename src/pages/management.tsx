import { showDebug } from "@/lib/debug";
import {
  managementPageStore,
  useManagementData,
} from "@/logic/managementPageStore";
import { ScrollArea, Select } from "@mantine/core";

export const ManagementPage = () => {
  useManagementData();
  return (
    <>
      <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
        <h1 className="text-2xl font-bold mt-10 ml-5">Management</h1>
        <div className="flex w-full justify-end">
          <TeamSelector />
        </div>
        <Summary />
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
      </div>
    </>
  );
}
