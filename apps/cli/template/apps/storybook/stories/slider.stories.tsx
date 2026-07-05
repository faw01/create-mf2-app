import { Label } from "@repo/design-system/components/ui/label";
import { Slider } from "@repo/design-system/components/ui/slider";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

function SliderControlledComponent() {
  const [value, setValue] = useState([0.3, 0.7]);

  return (
    <div className="mx-auto grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="slider-demo-temperature">Temperature</Label>
        <span className="text-sm text-muted-foreground">
          {value.join(", ")}
        </span>
      </div>
      <Slider
        id="slider-demo-temperature"
        value={value}
        onValueChange={setValue}
        min={0}
        max={1}
        step={0.1}
      />
    </div>
  );
}

function SliderDemoComponent() {
  return (
    <Slider
      defaultValue={[75]}
      max={100}
      step={1}
      className="mx-auto w-full max-w-xs"
    />
  );
}

function SliderDisabledComponent() {
  return (
    <Slider
      defaultValue={[50]}
      max={100}
      step={1}
      disabled
      className="mx-auto w-full max-w-xs"
    />
  );
}

function SliderMultipleComponent() {
  return (
    <Slider
      defaultValue={[10, 20, 70]}
      max={100}
      step={10}
      className="mx-auto w-full max-w-xs"
    />
  );
}

function SliderRangeComponent() {
  return (
    <Slider
      defaultValue={[25, 50]}
      max={100}
      step={5}
      className="mx-auto w-full max-w-xs"
    />
  );
}

function SliderVerticalComponent() {
  return (
    <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-6">
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        orientation="vertical"
        className="h-40"
      />
      <Slider
        defaultValue={[25]}
        max={100}
        step={1}
        orientation="vertical"
        className="h-40"
      />
    </div>
  );
}

const meta = {
  title: "ui/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj;

export const Controlled: Story = {
  render: () => <SliderControlledComponent />,
};

export const Demo: Story = {
  render: () => <SliderDemoComponent />,
};

export const Disabled: Story = {
  render: () => <SliderDisabledComponent />,
};

export const Multiple: Story = {
  render: () => <SliderMultipleComponent />,
};

export const Range: Story = {
  render: () => <SliderRangeComponent />,
};

export const Vertical: Story = {
  render: () => <SliderVerticalComponent />,
};
