import { log } from "@repo/observability/log";
import { Toolbar as BasehubToolbar } from "basehub/next-toolbar";
import { unstable_rethrow } from "next/navigation";
import { keys } from "../keys";

// The BaseHub toolbar throws at render time when BASEHUB_TOKEN is unset
// ("Token not found") or rejected by the API, so render nothing instead of
// crashing every page that mounts it.
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
