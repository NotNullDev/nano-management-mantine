import {groupDashboardSummaryByDate} from "@/logic/common/pure";
import {useIndexData} from "@/logic/indexPage/api";
import {authenticateAdmin, authenticateUser, userStore,} from "@/logic/common/userStore";
import {GroupedSummary} from "@/types/utilTypes";
import {Button, Paper, ScrollArea, useMantineTheme} from "@mantine/core";
import dayjs from "dayjs";
import Head from "next/head";
import {Admin, Record} from "pocketbase";
import React, {useEffect, useState} from "react";
import {indexPageStore} from "@/logic/indexPage/indexPageStore";

export default function Home() {
    useIndexData();
    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            <main className="flex flex-col flex-1 ">
                <ScrollArea className="flex flex-col flex-1 p-4 h-screen">
                    <h1 className="text-2xl font-bold my-10 ml-5">Dashboard</h1>
                    <UserStatsComponent/>
                </ScrollArea>
            </main>
    </>
  );
}

const UserStatsComponent = () => {
  const [user, setUser] = useState<Admin | Record | null>(null);
  const authUser = userStore((state) => state.user);
  const dashboardSummary = indexPageStore((state) => state.summary);
  const [groupedSummary, setGroupedSummary] = useState<GroupedSummary[]>([]);

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  useEffect(() => {
    const grouped = groupDashboardSummaryByDate(dashboardSummary);
    setGroupedSummary(grouped);
  }, [dashboardSummary]);

  if (user) {
    return (
      <>
          <div className="text-3xl w-full text-center mb-10">
              <span className="">Welcome back</span>
              <span className="font-bold ml-3 text-indigo-600">{user.email}</span>
          </div>
          <div className="w-4/5">
              <h2 className="text-start text-2xl w-full mb-2">
                  Summary per team
              </h2>
              <div className="flex gap-4 justify-start w-full ">
                  {groupedSummary.map((summary, idx) => {
                      return <ProjectSummary key={idx} dashboardSummary={summary}/>;
                  })}
              </div>
        </div>
      </>
    );
  }

  return (
    <>
    </>
  );
};

type ProjectSummaryProps = {
  dashboardSummary: GroupedSummary;
};

function ProjectSummary({ dashboardSummary }: ProjectSummaryProps) {
  const theme = useMantineTheme();

  return (
    <Paper
      className="
    flex flex-col rounded-xl
    px-8 py-4 w-[400px] bg-[#202030] hover:scale-[102%] transition-transform duration-500"
    >
      <h2 className="text-xl text-center mb-4">{dashboardSummary.teamName}</h2>
      {dashboardSummary.months.map((s) => {
        const isThisMonth = dayjs().format("MM.YYYY").toString() === s.date;
        const isPrevMonth =
          dayjs().add(-1, "month").format("MM.YYYY").toString() === s.date;

        return (
          <>
            <div className="flex justify-between" key={s.date}>
              <div>
                {s.date} {isThisMonth && "(current month)"}{" "}
                {isPrevMonth && "(previous month)"}
              </div>
              <div>{s.tasksSum} hours</div>
            </div>
          </>
        );
      })}
    </Paper>
  );
}
