import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { mustGetCurrentUser } from "../auth/users";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await mustGetCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
  returns: v.string(),
});

export const saveFile = mutation({
  args: {
    contentType: v.optional(v.string()),
    filename: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db.insert("files", {
      contentType: args.contentType,
      filename: args.filename,
      storageId: args.storageId,
      userId: user._id,
    });
  },
  returns: v.id("files"),
});

export const getUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const fileRecord = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique();

    if (!fileRecord || fileRecord.userId !== user._id) {
      return null;
    }

    return await ctx.storage.getUrl(args.storageId);
  },
  returns: v.union(v.string(), v.null()),
});

export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const fileRecord = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique();

    if (!fileRecord) {
      throw new Error("File not found");
    }
    if (fileRecord.userId !== user._id) {
      throw new Error("Unauthorized: you do not own this file");
    }

    await ctx.storage.delete(args.storageId);
    await ctx.db.delete("files", fileRecord._id);
    return null;
  },
  returns: v.null(),
});
