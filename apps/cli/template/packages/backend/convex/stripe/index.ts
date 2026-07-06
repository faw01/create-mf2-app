import { StripeSubscriptions } from "@convex-dev/stripe";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { action, query } from "../_generated/server";

const stripeClient = new StripeSubscriptions(components.stripe, {});

function getAppUrl(): string {
  const url = process.env.SITE_URL;
  if (!url) {
    throw new Error("SITE_URL environment variable is not set");
  }
  return url;
}

const subscriptionValidator = v.object({
  cancelAtPeriodEnd: v.boolean(),
  currentPeriodEnd: v.number(),
  metadata: v.optional(v.any()),
  orgId: v.optional(v.string()),
  priceId: v.string(),
  quantity: v.optional(v.number()),
  status: v.string(),
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.string(),
  userId: v.optional(v.string()),
});

const paymentValidator = v.object({
  amount: v.number(),
  created: v.number(),
  currency: v.string(),
  metadata: v.optional(v.any()),
  orgId: v.optional(v.string()),
  status: v.string(),
  stripeCustomerId: v.optional(v.string()),
  stripePaymentIntentId: v.string(),
  userId: v.optional(v.string()),
});

export const createSubscriptionCheckout = action({
  args: {
    priceId: v.string(),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      email: identity.email,
      name: identity.name,
      userId: identity.subject,
    });

    return stripeClient.createCheckoutSession(ctx, {
      cancelUrl: `${getAppUrl()}/settings/billing?canceled=true`,
      customerId: customer.customerId,
      metadata: { productType: "subscription", userId: identity.subject },
      mode: "subscription",
      priceId: args.priceId,
      quantity: args.quantity,
      subscriptionMetadata: { userId: identity.subject },
      successUrl: `${getAppUrl()}/settings/billing?success=true`,
    });
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
});

export const createPaymentCheckout = action({
  args: { priceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      email: identity.email,
      name: identity.name,
      userId: identity.subject,
    });

    return stripeClient.createCheckoutSession(ctx, {
      cancelUrl: `${getAppUrl()}/settings/billing?canceled=true`,
      customerId: customer.customerId,
      metadata: { productType: "payment", userId: identity.subject },
      mode: "payment",
      paymentIntentMetadata: { userId: identity.subject },
      priceId: args.priceId,
      successUrl: `${getAppUrl()}/settings/billing?success=true`,
    });
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
});

export const createCustomerPortal = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const customer = await stripeClient.getOrCreateCustomer(ctx, {
      email: identity.email,
      name: identity.name,
      userId: identity.subject,
    });

    return stripeClient.createCustomerPortalSession(ctx, {
      customerId: customer.customerId,
      returnUrl: `${getAppUrl()}/settings/billing`,
    });
  },
  returns: v.object({ url: v.string() }),
});

export const cancelSubscription = action({
  args: {
    immediately: v.optional(v.boolean()),
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const subscription = await ctx.runQuery(
      components.stripe.public.getSubscription,
      { stripeSubscriptionId: args.subscriptionId }
    );
    if (!subscription || subscription.userId !== identity.subject) {
      throw new Error("Subscription not found or access denied");
    }

    await stripeClient.cancelSubscription(ctx, {
      cancelAtPeriodEnd: !args.immediately,
      stripeSubscriptionId: args.subscriptionId,
    });
    return null;
  },
  returns: v.null(),
});

export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return ctx.runQuery(components.stripe.public.listSubscriptionsByUserId, {
      userId: identity.subject,
    });
  },
  returns: v.array(subscriptionValidator),
});

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return ctx.runQuery(components.stripe.public.listPaymentsByUserId, {
      userId: identity.subject,
    });
  },
  returns: v.array(paymentValidator),
});
