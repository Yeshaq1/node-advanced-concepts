const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  await next();
  // great way to trigger middelware after request handler is complete
  clearHash(req.user.id);
};
