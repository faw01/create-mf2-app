import { defineSchema } from "convex/server";
import { authTables } from "./auth/tables";
import { chatTables } from "./chat/tables";
import { filesTables } from "./files/tables";

export default defineSchema({
  ...authTables,
  ...chatTables,
  ...filesTables,
});
