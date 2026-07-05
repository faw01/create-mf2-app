import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";

function FormDemoComponent() {
  const form = useForm({ defaultValues: { email: "" } });

  return (
    <Form {...form}>
      <form className="w-full max-w-xs space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>Where we send your receipts.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

const meta = {
  title: "ui/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Form>;

export default meta;
// Stories are render-only; deriving from meta would force per-story args
// because the component has required props.
type Story = StoryObj;

export const Default: Story = {
  render: () => <FormDemoComponent />,
};
