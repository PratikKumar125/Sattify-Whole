const jsonwebtoken = require("jsonwebtoken");
const userModel = require("../db/models/user.js");
const getUserDetails = require("../utils/firebase.js");

async function login(req, res) {
  try {
    const { uid } = req.body;
    const user = await getUserDetails(uid);
    const doesUserExists = await userModel.find({ email: user.email });
    if (doesUserExists) {
      const token = await jsonwebtoken.sign(
        { user: doesUserExists[0] },
        "PRATEEKKUMARISMYNAMEBAYAANKRDUJYADATUMSUNOTOSAHI"
      );
      return res.status(200).send({ user: doesUserExists[0], token });
    }
    const new_user = await userModel.create({
      name: user.displayName,
      email: user.email,
      profileSlug: user.photoURL,
    });
    const token = await jsonwebtoken.sign(
      { user: new_user[0] },
      "PRATEEKKUMARISMYNAMEBAYAANKRDUJYADATUMSUNOTOSAHI"
    );
    return res.status(200).send({ user: new_user, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { login };
