import { defineTable } from "convex/server";
import { v } from "convex/values";

export const filesTables = {
  files: defineTable({
    contentType: v.optional(v.string()),
    filename: v.optional(v.string()),
    storageId: v.id("_storage"),
    userId: v.id("users"),
  })
    .index("by_storageId", ["storageId"])
    .index("by_userId", ["userId"]),
};
