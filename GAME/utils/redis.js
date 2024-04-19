const redis = require("redis");
const redis_client = redis.createClient(6379);
try {
  redis_client.connect();
} catch (error) {
  console.log("[*] Err Connecting to Redis [*]");
}
module.exports = { redis_client };
