const { ActivityType } = require("discord.js");
const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URL;
require("colors");

module.exports = async (client) => {
  await client.user.setActivity("starting...", { type: ActivityType.Playing });
  console.log(`[INFO] ${client.user.username} is online!`.blue);

  if (!mongoURL) return;
  mongoose.set("strictQuery", true);
  if (await mongoose.connect(mongoURL)) {
    console.log(`[INFO] Connected to the database!`.green);

    await client.user.setActivity("started", { type: ActivityType.Playing });

    setTimeout(async () => {
      await client.user.setActivity("/shifts start", {
        type: ActivityType.Playing,
      });
    }, 10_000);
  } else {
    console.log("[ERROR] Failed to connect to the database!".red);
  }
};
