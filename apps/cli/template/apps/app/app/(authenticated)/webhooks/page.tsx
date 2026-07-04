import { webhooks } from "@repo/webhooks";
import { notFound } from "next/navigation";
import { env } from "@/env";

export const metadata = {
  title: "Webhooks",
  description: "Send webhooks to your users.",
};

const WebhooksPage = async () => {
  if (!env.SVIX_TOKEN) {
    notFound();
  }

  const response = await webhooks.getAppPortal();

  if (!response?.url) {
    notFound();
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <iframe
        allow="clipboard-write"
        className="h-full w-full border-none"
        loading="lazy"
        src={response.url}
        title="Webhooks"
      />
    </div>
  );
};

export default WebhooksPage;
