import { Knock } from "@knocklabs/node";
import { keys } from "./keys";

const key = keys().KNOCK_SECRET_API_KEY;

// Undefined when Knock is unconfigured; guard call sites with a skip log,
// e.g. `console.warn("Skipping notification: set KNOCK_SECRET_API_KEY to enable")`.
export const notifications = key ? new Knock({ apiKey: key }) : undefined;
