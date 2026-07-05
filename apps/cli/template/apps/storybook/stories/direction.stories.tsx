import { DirectionProvider } from "@repo/design-system/components/ui/direction";
import type { Meta, StoryObj } from "@storybook/react";

function DirectionDemoComponent() {
  return (
    <DirectionProvider dir="rtl">
      <div className="w-64 rounded-md border p-4 text-sm" dir="rtl">
        Content rendered inside a right-to-left DirectionProvider.
      </div>
    </DirectionProvider>
  );
}

const meta = {
  title: "ui/Direction",
  component: DirectionProvider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DirectionProvider>;

export default meta;
// Stories are render-only; deriving from meta would force per-story args
// because the component has required props.
type Story = StoryObj;

export const Default: Story = {
  render: () => <DirectionDemoComponent />,
};
