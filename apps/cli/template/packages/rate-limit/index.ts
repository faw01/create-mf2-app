import { Ratelimit, type RatelimitConfig } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { keys } from "./keys";

let redis: Redis | undefined;

export const getRedis = (): Redis => {
  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = keys();

  if (!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)) {
    throw new Error(
      "Rate limiting is not configured: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
    );
  }

  redis ??= new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
};

export const createRateLimiter = (props: Omit<RatelimitConfig, "redis">) =>
  new Ratelimit({
    redis: getRedis(),
    limiter: props.limiter ?? Ratelimit.slidingWindow(10, "10 s"),
    prefix: props.prefix ?? "mf2",
  });

export const { slidingWindow } = Ratelimit;
