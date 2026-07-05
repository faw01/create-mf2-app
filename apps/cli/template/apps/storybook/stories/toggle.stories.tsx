import { Toggle } from "@repo/design-system/components/ui/toggle";
import type { Meta, StoryObj } from "@storybook/react";
import { BoldIcon, BookmarkIcon, ItalicIcon } from "lucide-react";

function ToggleDemoComponent() {
  return (
    <Toggle aria-label="Toggle bookmark" size="sm" variant="outline">
      <BookmarkIcon className="group-data-[state=on]/toggle:fill-foreground" />
      Bookmark
    </Toggle>
  );
}

function ToggleDisabledComponent() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Toggle disabled" disabled>
        Disabled
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle disabled outline" disabled>
        Disabled
      </Toggle>
    </div>
  );
}

function ToggleOutlineComponent() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="outline" aria-label="Toggle italic">
        <ItalicIcon />
        Italic
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle bold">
        <BoldIcon />
        Bold
      </Toggle>
    </div>
  );
}

function ToggleSizesComponent() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="outline" aria-label="Toggle small" size="sm">
        Small
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle default" size="default">
        Default
      </Toggle>
      <Toggle variant="outline" aria-label="Toggle large" size="lg">
        Large
      </Toggle>
    </div>
  );
}

function ToggleTextComponent() {
  return (
    <Toggle aria-label="Toggle italic">
      <ItalicIcon />
      Italic
    </Toggle>
  );
}

const meta = {
  title: "ui/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj;

export const Demo: Story = {
  render: () => <ToggleDemoComponent />,
};

export const Disabled: Story = {
  render: () => <ToggleDisabledComponent />,
};

export const Outline: Story = {
  render: () => <ToggleOutlineComponent />,
};

export const Sizes: Story = {
  render: () => <ToggleSizesComponent />,
};

export const Text: Story = {
  render: () => <ToggleTextComponent />,
};
