const jwt = require("jsonwebtoken");
const { builtinModules } = require("module");
async function decode(token) {
  return await jwt.decode(
    token,
    "PRATEEKKUMARISMYNAMEBAYAANKRDUJYADATUMSUNOTOSAHI"
  );
}
module.exports = { decode };
