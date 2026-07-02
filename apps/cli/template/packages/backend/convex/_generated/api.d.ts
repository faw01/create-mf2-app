/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_tables from "../auth/tables.js";
import type * as auth_users from "../auth/users.js";
import type * as chat_api_messages from "../chat/api/messages.js";
import type * as chat_api_threads from "../chat/api/threads.js";
import type * as chat_api_title from "../chat/api/title.js";
import type * as chat_search_threads from "../chat/search/threads.js";
import type * as chat_tables from "../chat/tables.js";
import type * as crons from "../crons.js";
import type * as email_index from "../email/index.js";
import type * as files_storage from "../files/storage.js";
import type * as files_tables from "../files/tables.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as stripe_index from "../stripe/index.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "auth/tables": typeof auth_tables;
  "auth/users": typeof auth_users;
  "chat/api/messages": typeof chat_api_messages;
  "chat/api/threads": typeof chat_api_threads;
  "chat/api/title": typeof chat_api_title;
  "chat/search/threads": typeof chat_search_threads;
  "chat/tables": typeof chat_tables;
  crons: typeof crons;
  "email/index": typeof email_index;
  "files/storage": typeof files_storage;
  "files/tables": typeof files_tables;
  http: typeof http;
  migrations: typeof migrations;
  notifications: typeof notifications;
  "stripe/index": typeof stripe_index;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  actionRetrier: import("@convex-dev/action-retrier/_generated/component.js").ComponentApi<"actionRetrier">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  pushNotifications: import("@convex-dev/expo-push-notifications/_generated/component.js").ComponentApi<"pushNotifications">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  stripe: import("@convex-dev/stripe/_generated/component.js").ComponentApi<"stripe">;
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};
