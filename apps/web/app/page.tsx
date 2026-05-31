import { Button } from "@repo/design-system/components/ui/button";
import Link from "next/link";
import { CopyCommand } from "@/components/copy-command";
import { DashedLine } from "@/components/dashed-line";
import { GitHub } from "@/components/icons/github";

const Home = () => (
  <div className="flex min-h-svh w-full items-center justify-center overflow-hidden">
    <div className="relative mx-auto w-full max-w-[1216px] p-6 text-center md:p-12">
      <DashedLine direction="top" />
      <DashedLine direction="bottom" />
      <DashedLine direction="left" />
      <DashedLine direction="right" />
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-center font-mono text-4xl tracking-tighter md:whitespace-nowrap md:text-6xl">
            Move{" "}
            <a
              className="underline decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground"
              href="https://faw.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              faw
            </a>
            king fast and break nothing.
          </h1>
          <p className="text-center font-mono text-muted-foreground text-sm tracking-tight md:whitespace-nowrap">
            The production-ready SaaS monorepo with auth, payments, database,
            AI, analytics, and email. Ship your startup in one command.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <CopyCommand command="bunx create-mf2-app" />
          <div className="flex items-center gap-2">
            <Button asChild className="font-mono" variant="ghost">
              <Link href="https://mf2.dev/docs">Docs</Link>
            </Button>
            <Button asChild className="font-mono" size="icon" variant="ghost">
              <a
                href="https://github.com/faw01/create-mf2-app"
                rel="noopener noreferrer"
                target="_blank"
              >
                <GitHub className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Home;
