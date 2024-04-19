const users = require("../../users");
const userModel = require("../db/models/user");
const seedUsers = async () => {
  console.log("****** SEEDING USERS *******");
  var userBulkUp = userModel.collection.initializeOrderedBulkOp();
  users.forEach((user) => {
    userBulkUp
      .find({ email: user.email })
      .upsert()
      .update({
        $setOnInsert: { isBot: true },
        $set: user,
      });
    userBulkUp.insert(user);
  });
  userBulkUp.execute();
  console.log("****** USERS SEEDED SUCCESFULLY *******");
};
module.exports = seedUsers;
