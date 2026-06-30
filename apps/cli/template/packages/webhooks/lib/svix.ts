import "server-only";
import { auth } from "@repo/auth/server";
import { log } from "@repo/observability/log";
import { Svix } from "svix";
import { keys } from "../keys";

const svixToken = keys().SVIX_TOKEN;
const svix = svixToken ? new Svix(svixToken) : undefined;

export const send = async (
  eventType: string,
  payload: Record<string, unknown>,
  options?: { orgId?: string }
) => {
  if (!svix) {
    log.warn(`Skipping ${eventType} webhook: set SVIX_TOKEN to enable`);
    return;
  }

  // An explicit orgId lets server-side callers without a Next request
  // context (crons, Convex-triggered handlers) emit events; by default the
  // org comes from the Clerk session.
  const orgId = options?.orgId ?? (await auth()).orgId;

  if (!orgId) {
    throw new Error(
      `Cannot send ${eventType} webhook without an active organization`
    );
  }

  return svix.message.create(orgId, {
    eventType,
    payload: {
      eventType,
      ...payload,
    },
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};

export const getAppPortal = async () => {
  if (!svix) {
    throw new Error("SVIX_TOKEN is not set");
  }

  const { orgId } = await auth();

  if (!orgId) {
    log.warn("Skipping webhook portal access: no active organization");
    return;
  }

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};
