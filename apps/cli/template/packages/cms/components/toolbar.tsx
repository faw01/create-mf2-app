import { log } from "@repo/observability/log";
import { Toolbar as BasehubToolbar } from "basehub/next-toolbar";
import { unstable_rethrow } from "next/navigation";
import { keys } from "../keys";

export const Toolbar = async () => {
  if (!keys().BASEHUB_TOKEN) {
    return null;
  }

  try {
    return await BasehubToolbar({});
  } catch (error) {
    unstable_rethrow(error);
    log.error(`Failed to render BaseHub toolbar: ${error}`);
    return null;
  }
};
