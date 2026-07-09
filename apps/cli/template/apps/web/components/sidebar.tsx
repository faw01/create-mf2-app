import { capitalize } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

const publishedDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "America/New_York",
  year: "numeric",
});

type SidebarProperties = {
  readonly date: Date;
  readonly dateLabel?: string;
  readonly readingTime: string;
  readonly tags?: string[];
  readonly children?: ReactNode;
};

export const Sidebar = async ({
  date,
  dateLabel = "Published",
  readingTime,
  tags,
  children,
}: SidebarProperties) => (
  <div className="col-span-4 flex w-72 flex-col items-start gap-8 border-foreground/10 border-l px-6 lg:col-span-2">
    <div className="grid gap-2">
      <p className="text-muted-foreground text-sm">{dateLabel}</p>
      <p className="rounded-sm text-foreground text-sm">
        {publishedDateFormatter.format(date)}
      </p>
    </div>
    <div className="grid gap-2">
      <p className="text-muted-foreground text-sm">Reading Time</p>
      <p className="rounded-sm text-foreground text-sm">{readingTime}</p>
    </div>
    {tags ? (
      <div className="grid gap-2">
        <p className="text-muted-foreground text-sm">Tags</p>
        <p className="rounded-sm text-foreground text-sm">
          {tags.map(capitalize).join(", ")}
        </p>
      </div>
    ) : null}
    {children ? (
      <div className="-mx-2">
        <div className="grid gap-2 p-2">
          <p className="text-muted-foreground text-sm">Sections</p>
          {children}
        </div>
      </div>
    ) : null}
  </div>
);
