import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Monitor } from "lucide-react";

export const App = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-foreground">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Monitor className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">mf2 Desktop</CardTitle>
        <CardDescription>
          Edit{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            src/renderer/src/app.tsx
          </code>{" "}
          to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          onClick={() => window.api.openExternal("https://mf2.dev")}
          variant="outline"
        >
          Documentation
        </Button>
      </CardContent>
    </Card>
  </div>
);
