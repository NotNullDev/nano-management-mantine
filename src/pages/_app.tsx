import { initLibraries } from "@/lib/common";
import { queryClient } from "@/lib/tanstackQuery";
import { logoutUser } from "@/logic/userStore";
import { MantineProvider, Menu } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import {
  IconHome,
  IconSettings,
  IconTimeline,
  IconUsers,
} from "@tabler/icons-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import "../styles/globals.css";

{
  initLibraries();
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          withGlobalStyles
          withCSSVariables
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: "dark",
          }}
        >
          <NotificationsProvider>
            <div className="flex-1 flex">
              <Sidebar />
              <Component {...pageProps} />
            </div>
          </NotificationsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </div>
  );
}

const Header = () => {
  return <div className="text-2xl">NM</div>;
};

const Sidebar = () => {
  return (
    <div className="text-2xl flex flex-col p-6 border-r border-1 border-gray-600 justify-between">
      <div className="flex flex-col gap-5 items-center">
        <Link
          href="/"
          className="p-2 hover:bg-gray-700 rounded-xl w-min h-min mb-5"
        >
          <Header />
        </Link>
        {Links.map((link) => (
          <NanoLink link={link} key={link.path} />
        ))}
      </div>
      <div className="flex items-center justify-center">
        <SettingsButton />
      </div>
    </div>
  );
};

const SettingsButton = () => {
  return (
    <>
      <Menu
        shadow="md"
        position="right-end"
        width={120}
        offset={12}
        withArrow
        arrowPosition="center"
      >
        <Menu.Target>
          <button className="p-2 hover:bg-hover-dark rounded-xl w-min h-min">
            <IconSettings />
          </button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            component="button"
            onClick={() => {
              logoutUser();
            }}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

const IconCorpo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
};

const Links = [
  {
    name: "/",
    path: "/",
    icon: <IconHome />,
  },
  {
    name: "/",
    path: "/tasks",
    icon: <IconTimeline />,
  },
  {
    name: "/teams",
    path: "/teams",
    icon: <IconUsers />,
  },
  {
    name: "/organizations",
    path: "/organizations",
    icon: <IconCorpo />,
  },
];

const NanoLink = ({ link }: { link: typeof Links[number] }) => {
  const router = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (router.asPath === link.path) setActive(true);
    else setActive(false);
  }, [router.asPath]);

  return (
    <Link
      key={link.path}
      href={link.path}
      className={
        "p-2 hover:bg-hover-dark rounded-xl w-min h-min " +
        (active ? " border" : "")
      }
    >
      {link.icon}
    </Link>
  );
};
