"use server";

import { auth, clerkClient } from "@repo/auth/server";
import { parseError } from "@repo/observability/error";
import { getMemberName, getUserColor } from "@/lib/collaboration-user";

export const getUsers = async (
  userIds: string[]
): Promise<{ data: Liveblocks["UserMeta"]["info"][] } | { error: string }> => {
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

    const membersByUserId = new Map(
      members.data.flatMap((member) => {
        const userId = member.publicUserData?.userId;
        return userId ? [[userId, member] as const] : [];
      })
    );

    // Liveblocks expects one info entry per requested ID, in order.
    const data: Liveblocks["UserMeta"]["info"][] = userIds.map((userId) => {
      const member = membersByUserId.get(userId);
      return {
        name: member ? getMemberName(member) : undefined,
        avatar: member?.publicUserData?.imageUrl,
        color: getUserColor(userId),
      };
    });

    return { data };
  } catch (error) {
    return { error: parseError(error) };
  }
};
