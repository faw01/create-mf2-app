import type { OrganizationMembership } from "@repo/auth/server";

export const getMemberName = (
  member: OrganizationMembership
): string | undefined => {
  const { firstName, lastName, identifier } = member.publicUserData ?? {};

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  return firstName ?? identifier;
};

const colors = [
  "var(--color-red-500)",
  "var(--color-orange-500)",
  "var(--color-amber-500)",
  "var(--color-yellow-500)",
  "var(--color-lime-500)",
  "var(--color-green-500)",
  "var(--color-emerald-500)",
  "var(--color-teal-500)",
  "var(--color-cyan-500)",
  "var(--color-sky-500)",
  "var(--color-blue-500)",
  "var(--color-indigo-500)",
  "var(--color-violet-500)",
  "var(--color-purple-500)",
  "var(--color-fuchsia-500)",
  "var(--color-pink-500)",
  "var(--color-rose-500)",
];

// Hash the user ID so a user keeps the same color across mentions,
// presence, and repeated resolver calls.
export const getUserColor = (userId: string): string => {
  let hash = 0;
  for (const char of userId) {
    hash = (hash * 31 + char.charCodeAt(0)) % colors.length;
  }
  return colors[hash];
};
