import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType;

export const initializeRedisClient = async () => {
  redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`,
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.on("connect", () => console.log("Redis Client Connected"));

  await redisClient.connect().catch(console.error);
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error(
      "Redis client not initialized. Call initializeRedisClient first."
    );
  }
  return redisClient;
};
