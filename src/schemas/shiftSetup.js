const { model, Schema } = require("mongoose");

let setupSchema = new Schema(
  {
    guildId: String,
    channelId: String,
    roleId: String,
  },
  { strict: false }
);

module.exports = model("shift-setup", setupSchema);
