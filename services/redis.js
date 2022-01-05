const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);

(async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
})();

module.exports = client;
