import "server-only";
import { Liveblocks as LiveblocksNode } from "@liveblocks/node";
import { keys } from "./keys";

type AuthenticateOptions = {
  orgId: string;
  userId: string;
  userInfo: Liveblocks["UserMeta"]["info"];
};

const secret = keys().LIVEBLOCKS_SECRET;

export const authenticate = async ({
  userId,
  orgId,
  userInfo,
}: AuthenticateOptions) => {
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET is not set");
  }

  const liveblocks = new LiveblocksNode({ secret });

  const session = liveblocks.prepareSession(userId, { userInfo });

  // Write access to every room in the user's organization.
  session.allow(`${orgId}:*`, ["*:write"]);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
};
