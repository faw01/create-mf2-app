import { webhooks } from "@repo/webhooks";
import { notFound } from "next/navigation";
import { env } from "@/env";

export const metadata = {
  description: "Send webhooks to your users.",
  title: "Webhooks",
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
        // The Svix-hosted portal is cross-origin and needs scripts plus its
        // own cookies/storage (allow-same-origin refers to the portal's
        // origin, not ours), so this pairing cannot escape into our page.
        // The sandbox still blocks top-navigation and pointer capture.
        // react-doctor-disable-next-line react-doctor/iframe-missing-sandbox
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        src={response.url}
        title="Webhooks"
      />
    </div>
  );
};

export default WebhooksPage;
