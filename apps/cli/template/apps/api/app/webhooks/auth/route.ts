import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { analytics } from "@repo/analytics/server";
import type {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
  WebhookEvent,
} from "@repo/auth/server";
import { log } from "@repo/observability/log";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

const handleUserCreated = (data: UserJSON) => {
  analytics?.identify({
    distinctId: data.id,
    properties: {
      avatar: data.image_url,
      createdAt: new Date(data.created_at),
      email: data.email_addresses.at(0)?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_numbers.at(0)?.phone_number,
    },
  });

  analytics?.capture({
    distinctId: data.id,
    event: "User Created",
  });

  return new Response("User created", { status: 201 });
};

const handleUserUpdated = (data: UserJSON) => {
  analytics?.identify({
    distinctId: data.id,
    properties: {
      avatar: data.image_url,
      createdAt: new Date(data.created_at),
      email: data.email_addresses.at(0)?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      phoneNumber: data.phone_numbers.at(0)?.phone_number,
    },
  });

  analytics?.capture({
    distinctId: data.id,
    event: "User Updated",
  });

  return new Response("User updated", { status: 201 });
};

const handleUserDeleted = (data: DeletedObjectJSON) => {
  if (data.id) {
    analytics?.identify({
      distinctId: data.id,
      properties: {
        deleted: new Date(),
      },
    });

    analytics?.capture({
      distinctId: data.id,
      event: "User Deleted",
    });
  }

  return new Response("User deleted", { status: 201 });
};

const handleOrganizationCreated = (data: OrganizationJSON) => {
  analytics?.groupIdentify({
    distinctId: data.created_by,
    groupKey: data.id,
    groupType: "company",
    properties: {
      avatar: data.image_url,
      name: data.name,
    },
  });

  if (data.created_by) {
    analytics?.capture({
      distinctId: data.created_by,
      event: "Organization Created",
    });
  }

  return new Response("Organization created", { status: 201 });
};

const handleOrganizationUpdated = (data: OrganizationJSON) => {
  analytics?.groupIdentify({
    distinctId: data.created_by,
    groupKey: data.id,
    groupType: "company",
    properties: {
      avatar: data.image_url,
      name: data.name,
    },
  });

  if (data.created_by) {
    analytics?.capture({
      distinctId: data.created_by,
      event: "Organization Updated",
    });
  }

  return new Response("Organization updated", { status: 201 });
};

const handleOrganizationMembershipCreated = (
  data: OrganizationMembershipJSON
) => {
  analytics?.groupIdentify({
    distinctId: data.public_user_data.user_id,
    groupKey: data.organization.id,
    groupType: "company",
  });

  analytics?.capture({
    distinctId: data.public_user_data.user_id,
    event: "Organization Member Created",
  });

  return new Response("Organization membership created", { status: 201 });
};

const handleOrganizationMembershipDeleted = (
  data: OrganizationMembershipJSON
) => {
  analytics?.capture({
    distinctId: data.public_user_data.user_id,
    event: "Organization Member Deleted",
  });

  return new Response("Organization membership deleted", { status: 201 });
};

export const POST = async (request: NextRequest): Promise<Response> => {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Not configured", ok: false });
  }

  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request, {
      signingSecret: env.CLERK_WEBHOOK_SECRET,
    });
  } catch (error) {
    log.error("Error verifying webhook:", { error });
    return new Response("Webhook verification failed", {
      status: 400,
    });
  }

  const { id } = event.data;
  const eventType = event.type;

  log.info("Webhook", { eventType, id });

  let response: Response = new Response("", { status: 201 });

  switch (eventType) {
    case "user.created": {
      response = handleUserCreated(event.data);
      break;
    }
    case "user.updated": {
      response = handleUserUpdated(event.data);
      break;
    }
    case "user.deleted": {
      response = handleUserDeleted(event.data);
      break;
    }
    case "organization.created": {
      response = handleOrganizationCreated(event.data);
      break;
    }
    case "organization.updated": {
      response = handleOrganizationUpdated(event.data);
      break;
    }
    case "organizationMembership.created": {
      response = handleOrganizationMembershipCreated(event.data);
      break;
    }
    case "organizationMembership.deleted": {
      response = handleOrganizationMembershipDeleted(event.data);
      break;
    }
    default: {
      break;
    }
  }

  await analytics?.shutdown();

  return response;
};
