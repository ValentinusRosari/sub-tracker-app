const User = require("./User");
const Subscription = require("./Subscription");

User.hasMany(Subscription, { foreignKey: "userId", onDelete: "CASCADE" });
Subscription.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Subscription };
