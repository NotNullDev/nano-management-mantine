import { showDebug } from "@/lib/debug";
import { pocketbase } from "@/lib/pocketbase";
import { Button } from "@mantine/core";
import Head from "next/head";
import React from "react";

export const LoginPage = () => {
  return (
    <>
        <Head>
            <title>Login</title>
        </Head>
      <Button
        className="bg-violet-900"
        onClick={async () => {
          const a = await pocketbase.collection("users").listAuthMethods();
          const google = a.authProviders.find((a) => a.name === "google");

          if (!google) {
            showDebug({
              message: `google not found`,
            });
            return;
          }

          await pocketbase
            .collection("users")
            .authWithOAuth2(
              google.name,
              google.codeChallenge,
              google.codeVerifier,
              "http://localhost:3000"
            );

          console.log(a);
          showDebug({
            message: `auth: ${a}`,
          });
        }}
      >
        Login with google
      </Button>
    </>
  );
};

export default LoginPage;
