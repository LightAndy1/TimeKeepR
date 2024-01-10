require("colors");
const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL;

module.exports = async (client) => {
  console.log(`[INFO] ${client.user.username} is online!`.blue);

  if (!mongoURL) return;
  mongoose.set("strictQuery", true);
  if (await mongoose.connect(mongoURL)) {
    console.log(`[INFO] Connected to the database!`.green);
  } else {
    console.log("[ERROR] Failed to connect to the database!".red);
  }
};
