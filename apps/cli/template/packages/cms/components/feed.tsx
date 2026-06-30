import { log } from "@repo/observability/log";
import { Pump, type PumpProps, type PumpQuery } from "basehub/react-pump";
import { unstable_rethrow } from "next/navigation";
import { keys } from "../keys";

// Pump throws at render time when BASEHUB_TOKEN is unset ("Token not found")
// or rejected by the API, so degrade to empty content instead of crashing the
// page. Pump awaits children internally, so Next.js control-flow errors from
// them (notFound, redirect) must be rethrown, not swallowed.
export const Feed = async <Queries extends PumpQuery[], Bind = undefined>(
  props: PumpProps<Queries, Bind>
) => {
  if (!keys().BASEHUB_TOKEN) {
    return null;
  }

  try {
    return await Pump<Queries, Bind>(props);
  } catch (error) {
    unstable_rethrow(error);
    log.error(`Failed to fetch CMS content from BaseHub: ${error}`);
    return null;
  }
};
