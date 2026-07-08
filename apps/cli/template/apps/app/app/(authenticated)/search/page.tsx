import { auth } from "@repo/auth/server";
import { notFound, redirect } from "next/navigation";
import { Header } from "../components/header";

type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    description: `Search results for ${q}`,
    title: `${q} - Search results`,
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const [{ q }, { orgId }] = await Promise.all([searchParams, auth()]);

  if (!orgId) {
    notFound();
  }

  if (!q) {
    redirect("/");
  }

  return (
    <>
      <Header page="Search" pages={["Building Your Application"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <p className="text-muted-foreground text-sm">
          No results found for &quot;{q}&quot;
        </p>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default SearchPage;
