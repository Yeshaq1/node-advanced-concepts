const mongoose = require("mongoose");

const client = require("./redis");

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have a value for key in redis, if so return it

  const cacheValue = await client.hGet(this.hashKey, key);

  if (cacheValue) {
    console.log("cache");
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // Otherwise issue query and store in Redis.
  const result = await exec.apply(this, arguments);

  client.hSet(this.hashKey, key, JSON.stringify(result), { EX: 10 });
  console.log("Mongo");
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
