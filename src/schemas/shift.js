const { model, Schema } = require("mongoose");

let shiftSchema = new Schema(
  {
    guildId: String,
    userId: String,
    startTime: Date,
    endTime: Date,
    totalTime: Number,
    todayTime: Number,
    currentTime: Number,
    active: Boolean,
  },
  { strict: false }
);

module.exports = model("shift", shiftSchema);
