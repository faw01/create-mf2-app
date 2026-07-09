import { log } from "@repo/observability/log";
import { Pump, type PumpProps, type PumpQuery } from "basehub/react-pump";
import { unstable_rethrow } from "next/navigation";
import { keys } from "../keys";

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
