import { Button } from "@repo/design-system/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@repo/design-system/components/ui/field";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import type { Meta, StoryObj } from "@storybook/react";

function TextareaButtonComponent() {
  return (
    <div className="grid w-full gap-2">
      <Textarea placeholder="Type your message here." />
      <Button>Send message</Button>
    </div>
  );
}

function TextareaDemoComponent() {
  return <Textarea placeholder="Type your message here." />;
}

function TextareaDisabledComponent() {
  return (
    <Field data-disabled>
      <FieldLabel htmlFor="textarea-disabled">Message</FieldLabel>
      <Textarea
        id="textarea-disabled"
        placeholder="Type your message here."
        disabled
      />
    </Field>
  );
}

function TextareaFieldComponent() {
  return (
    <Field>
      <FieldLabel htmlFor="textarea-message">Message</FieldLabel>
      <FieldDescription>Enter your message below.</FieldDescription>
      <Textarea id="textarea-message" placeholder="Type your message here." />
    </Field>
  );
}

function TextareaInvalidComponent() {
  return (
    <Field data-invalid>
      <FieldLabel htmlFor="textarea-invalid">Message</FieldLabel>
      <Textarea
        id="textarea-invalid"
        placeholder="Type your message here."
        aria-invalid
      />
      <FieldDescription>Please enter a valid message.</FieldDescription>
    </Field>
  );
}

const meta = {
  title: "ui/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj;

export const TextareaButton: Story = {
  render: () => <TextareaButtonComponent />,
};

export const Demo: Story = {
  render: () => <TextareaDemoComponent />,
};

export const Disabled: Story = {
  render: () => <TextareaDisabledComponent />,
};

export const TextareaField: Story = {
  render: () => <TextareaFieldComponent />,
};

export const Invalid: Story = {
  render: () => <TextareaInvalidComponent />,
};
