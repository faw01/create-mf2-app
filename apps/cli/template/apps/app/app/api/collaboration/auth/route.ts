import { auth, currentUser } from "@repo/auth/server";
import { authenticate } from "@repo/collaboration/auth";
import { getUserColor } from "@/lib/collaboration-user";

export const POST = async () => {
  const user = await currentUser();
  const { orgId } = await auth();

  if (!(user && orgId)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return authenticate({
    orgId,
    userId: user.id,
    userInfo: {
      avatar: user.imageUrl ?? undefined,
      color: getUserColor(user.id),
      name:
        user.fullName ?? user.emailAddresses.at(0)?.emailAddress ?? undefined,
    },
  });
};
