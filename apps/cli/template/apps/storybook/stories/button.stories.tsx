import { Button } from "@repo/design-system/components/ui/button";
import { Spinner } from "@repo/design-system/components/ui/spinner";
import type { Meta, StoryObj } from "@storybook/react";
import { IconGitBranch } from "@tabler/icons-react";
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  CircleFadingArrowUpIcon,
} from "lucide-react";
import Link from "next/link";

function ButtonAschildComponent() {
  return (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
}

function ButtonDefaultComponent() {
  return <Button>Button</Button>;
}

function ButtonDemoComponent() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

function ButtonDestructiveComponent() {
  return <Button variant="destructive">Destructive</Button>;
}

function ButtonGhostComponent() {
  return <Button variant="ghost">Ghost</Button>;
}

function ButtonIconComponent() {
  return (
    <Button variant="outline" size="icon">
      <CircleFadingArrowUpIcon />
    </Button>
  );
}

function ButtonLinkComponent() {
  return <Button variant="link">Link</Button>;
}

function ButtonOutlineComponent() {
  return <Button variant="outline">Outline</Button>;
}

function ButtonRoundedComponent() {
  return (
    <div className="flex flex-col gap-8">
      <Button variant="outline" size="icon" className="rounded-full">
        <ArrowUpIcon />
      </Button>
    </div>
  );
}

function ButtonSecondaryComponent() {
  return <Button variant="secondary">Secondary</Button>;
}

function ButtonSizeComponent() {
  return (
    <div className="flex flex-col items-start gap-8 sm:flex-row">
      <div className="flex items-start gap-2">
        <Button size="xs" variant="outline">
          Extra Small
        </Button>
        <Button size="icon-xs" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="icon-sm" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline">Default</Button>
        <Button size="icon" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Button variant="outline" size="lg">
          Large
        </Button>
        <Button size="icon-lg" aria-label="Submit" variant="outline">
          <ArrowUpRightIcon />
        </Button>
      </div>
    </div>
  );
}

function ButtonSpinnerComponent() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" disabled>
        <Spinner data-icon="inline-start" />
        Generating
      </Button>
      <Button variant="secondary" disabled>
        Downloading
        <Spinner data-icon="inline-start" />
      </Button>
    </div>
  );
}

function ButtonWithIconComponent() {
  return (
    <Button variant="outline" size="sm">
      <IconGitBranch /> New Branch
    </Button>
  );
}

const meta = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj;

export const Aschild: Story = {
  render: () => <ButtonAschildComponent />,
};

export const Default: Story = {
  render: () => <ButtonDefaultComponent />,
};

export const Demo: Story = {
  render: () => <ButtonDemoComponent />,
};

export const Destructive: Story = {
  render: () => <ButtonDestructiveComponent />,
};

export const Ghost: Story = {
  render: () => <ButtonGhostComponent />,
};

export const Icon: Story = {
  render: () => <ButtonIconComponent />,
};

export const ButtonLink: Story = {
  render: () => <ButtonLinkComponent />,
};

export const Outline: Story = {
  render: () => <ButtonOutlineComponent />,
};

export const Rounded: Story = {
  render: () => <ButtonRoundedComponent />,
};

export const Secondary: Story = {
  render: () => <ButtonSecondaryComponent />,
};

export const Size: Story = {
  render: () => <ButtonSizeComponent />,
};

export const ButtonSpinner: Story = {
  render: () => <ButtonSpinnerComponent />,
};

export const WithIcon: Story = {
  render: () => <ButtonWithIconComponent />,
};
