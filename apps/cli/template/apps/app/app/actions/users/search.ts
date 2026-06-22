"use server";

import { auth, clerkClient } from "@repo/auth/server";
import { parseError } from "@repo/observability/error";
import Fuse from "fuse.js";
import { getMemberName } from "@/lib/collaboration-user";

export const searchUsers = async (
  query: string
): Promise<{ data: string[] } | { error: string }> => {
  try {
    const { orgId } = await auth();

    if (!orgId) {
      throw new Error("Not logged in");
    }

    const clerk = await clerkClient();

    const members = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
      limit: 100,
    });

    // Liveblocks resolves mentions by Clerk user ID, not membership ID.
    const users = members.data.flatMap((member) => {
      const userId = member.publicUserData?.userId;
      if (!userId) {
        return [];
      }
      return [
        {
          id: userId,
          name: getMemberName(member),
        },
      ];
    });

    const fuse = new Fuse(users, {
      keys: ["name"],
      minMatchCharLength: 1,
      threshold: 0.3,
    });

    const results = fuse.search(query);
    const data = results.map((result) => result.item.id);

    return { data };
  } catch (error) {
    return { error: parseError(error) };
  }
};
