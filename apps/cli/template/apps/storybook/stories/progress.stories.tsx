import { Field, FieldLabel } from "@repo/design-system/components/ui/field";
import { Progress } from "@repo/design-system/components/ui/progress";
import { Slider } from "@repo/design-system/components/ui/slider";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";

function ProgressControlledComponent() {
  const [value, setValue] = useState([50]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress value={value[0]} />
      <Slider
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={1}
      />
    </div>
  );
}

function ProgressDemoComponent() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} className="w-[60%]" />;
}

function ProgressLabelComponent() {
  return (
    <Field className="w-full max-w-sm">
      <FieldLabel htmlFor="progress-upload">
        <span>Upload progress</span>
        <span className="ml-auto">66%</span>
      </FieldLabel>
      <Progress value={66} id="progress-upload" />
    </Field>
  );
}

const meta = {
  title: "ui/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj;

export const Controlled: Story = {
  render: () => <ProgressControlledComponent />,
};

export const Demo: Story = {
  render: () => <ProgressDemoComponent />,
};

export const Label: Story = {
  render: () => <ProgressLabelComponent />,
};
