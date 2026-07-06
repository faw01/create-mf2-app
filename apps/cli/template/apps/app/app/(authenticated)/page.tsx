import { auth } from "@repo/auth/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { AvatarStack } from "./components/avatar-stack";
import { Cursors } from "./components/cursors";
import { Header } from "./components/header";

const title = "Acme Inc";
const description = "My application.";

const CollaborationProvider = dynamic(() =>
  import("./components/collaboration-provider").then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  description,
  title,
};

const App = async () => {
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header page="Data Fetching" pages={["Building Your Application"]}>
        {env.LIVEBLOCKS_SECRET ? (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        ) : null}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
