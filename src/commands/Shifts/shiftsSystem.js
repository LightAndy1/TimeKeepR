const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const setupSchema = require("../../schemas/shiftSetup");
const shiftSchema = require("../../schemas/shift");
const mConfig = require("../../messageConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shifts")
    .setDescription("Shifts for timekeeping")
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("setup")
        .setDescription("Setup the shifts system for this server")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add the shifts system to this server")
            .addChannelOption((option) =>
              option
                .setName("channel")
                .setDescription(
                  "Set the channel for shifts. If left empty it, you can use the command in any channel."
                )
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
            .addRoleOption((option) =>
              option
                .setName("role")
                .setDescription(
                  "Set the role for shifts. If left empty, @everyone can use the command."
                )
                .setRequired(false)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove the shifts system from this server")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Start your shift by running this command")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("stop")
        .setDescription("Stop your shift by running this command")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("stats").setDescription("View your shift statistics")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .toJSON(),
  userPermissions: [PermissionFlagsBits.Administrator],
  botPermissions: [],
  run: async (client, interaction) => {
    try {
      const { options, guildId, member } = interaction;

      const channel = options.getChannel("channel") || null;
      const role = options.getRole("role") || null;
      const subcmd = options.getSubcommand();

      if (!["add", "remove", "start", "stop", "stats"].includes(subcmd)) return;

      await interaction.deferReply({ ephemeral: true });

      const rEmbed = new EmbedBuilder()
        .setColor(mConfig.embedColor)
        .setDescription(
          "`⌛` New server detected: Configuring the shifts system..."
        )
        .setFooter({ text: mConfig.footerWhite })
        .setTimestamp();

      let dataSS = await setupSchema.findOne({ guildId });
      let dataS = await shiftSchema.findOne({ guildId, userId: member.id });
      let nowDate,
        timestamp,
        checkTime,
        startTime,
        endTime,
        currentTime,
        lastTime;

      function formatTime(usedTime) {
        const hours = Math.floor(usedTime / 3600);
        const minutes = Math.floor((usedTime % 3600) / 60);
        const seconds = usedTime % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
      }

      switch (subcmd) {
        case "add":
          if (!dataSS) {
            await interaction.editReply({
              embeds: [rEmbed],
              fetchReply: true,
            });

            dataSS = new setupSchema({
              guildId,
              channelId: channel?.id,
              roleId: role?.id,
            });
            dataSS.save();

            setTimeout(async () => {
              await interaction.editReply({
                embeds: [
                  rEmbed
                    .setColor(mConfig.embedColorGreen)
                    .setDescription(
                      "`✅` Successfully configured the shifts system."
                    )
                    .addFields(
                      {
                        name: "Channel",
                        value: `${channel || "`None`"}`,
                        inline: true,
                      },
                      {
                        name: "Role",
                        value: `${role || "@everyone"}`,
                        inline: true,
                      }
                    )
                    .setFooter({ text: mConfig.footerGreen }),
                ],
              });
            }, 2_000);
          } else {
            await setupSchema.findOneAndUpdate(
              { guildId },
              { channelId: channel?.id || null, roleId: role?.id || null }
            );

            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedColorGreen)
                  .setDescription(
                    "`✅` Successfully updated the shifts system."
                  )
                  .addFields(
                    {
                      name: "Channel",
                      value: `${channel || "`None`"}`,
                      inline: true,
                    },
                    {
                      name: "Role",
                      value: `${role || "@everyone"}`,
                      inline: true,
                    }
                  )
                  .setFooter({ text: mConfig.footerGreen }),
              ],
            });
          }
          break;
        case "remove":
          const removed = await setupSchema.findOneAndDelete({ guildId });
          if (removed) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedColorGreen)
                  .setDescription(
                    "`✅` Successfully removed the shifts system."
                  )
                  .setFooter({ text: mConfig.footerGreen }),
              ],
            });
          } else {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` This server isn't configured yet.\n`💡` Use </shifts setup add:1194665403385925752> to start setting it up."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }
        case "start":
          if (!dataSS) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` This server isn't configured yet. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          if (
            dataSS.channelId &&
            dataSS.channelId !== interaction.channel?.id
          ) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` You are in the wrong channel. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          if (dataSS.roleId && !member.roles.cache.has(dataSS.roleId)) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` You don't have the right role to use this command. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          nowDate = new Date();
          timestamp = Math.floor(nowDate.getTime() / 1000);

          if (!dataS) {
            dataS = await shiftSchema.create({
              guildId,
              userId: member.id,
              startTime: nowDate,
              active: true,
            });
            dataS.save();
          } else if (dataS?.active === true) {
            const startTime = Math.floor(dataS.startTime.getTime() / 1000);

            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor("#ffb02e")
                  .setTitle("`🔥` You already have an active shift.")
                  .setDescription(
                    "`💡`You can use </shifts stop:1194665403385925752> to stop the current shift."
                  )
                  .addFields(
                    {
                      name: "Start time",
                      value: `<t:${startTime}:T>`,
                      inline: true,
                    },
                    {
                      name: "Time spent",
                      value: `<t:${startTime}:R>`,
                      inline: true,
                    }
                  )
                  .setFooter({
                    text: mConfig.footerYellow,
                  }),
              ],
            });
          } else {
            checkTime = dataS.todayTime || 0;
            if (checkTime > 12 * 3600) {
              dataS.todayTime = 0;
              dataS.save();
            }

            dataS.startTime = nowDate;
            dataS.endTime = null;
            dataS.active = true;
            dataS.save();
          }

          return await interaction.editReply({
            embeds: [
              rEmbed
                .setColor("#f92f60")
                .setTitle("`🫡` Shift started!")
                .setDescription(
                  `\`🚀\`Your shift started <t:${timestamp}:R>.\n\`💡\`You can use </shifts stop:1194665403385925752> to stop the current shift.`
                )
                .setFooter({
                  text: mConfig.footerRed,
                }),
            ],
          });
        case "stop":
          if (!dataSS) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` This server isn't configured yet. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          if (
            dataSS.channelId &&
            dataSS.channelId !== interaction.channel?.id
          ) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` You are in the wrong channel. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          nowDate = new Date();
          endTime = Math.floor(nowDate.getTime() / 1000);

          if (!dataS) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle("`🤔` You don't have an active shift.")
                  .setDescription(
                    "`💡` You can use </shifts start:1194665403385925752> to start."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          } else if (dataS?.active === true) {
            startTime = Math.floor(dataS.startTime.getTime() / 1000);
            currentTime = endTime - startTime;

            let todayTime = dataS.todayTime || 0;
            let totalTime = dataS.totalTime || 0;
            todayTime += currentTime;
            totalTime += currentTime;

            dataS = await shiftSchema.findOneAndUpdate(
              { guildId, userId: member.id },
              {
                $set: {
                  active: false,
                  endTime: nowDate,
                  currentTime,
                  todayTime,
                  totalTime,
                },
              }
            );
            dataS.save();
          }

          return await interaction.editReply({
            embeds: [
              rEmbed
                .setColor("#ffb02e")
                .setTitle("`🫡` Shift stopped!")
                .setDescription("Here are your stats:")
                .addFields(
                  {
                    name: "Time spent this shift",
                    value: `\`${formatTime(currentTime)}\``,
                  },
                  {
                    name: "Time spent today",
                    value: `\`${formatTime(todayTime)}\``,
                  },
                  {
                    name: "Total time",
                    value: `\`${formatTime(totalTime)}\``,
                  }
                )
                .setFooter({ text: mConfig.footerYellow }),
            ],
          });
        case "stats":
          if (!dataSS) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` This server isn't configured yet. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          if (
            dataSS.channelId &&
            dataSS.channelId !== interaction.channel?.id
          ) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` You are in the wrong channel. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          if (dataSS.roleId && !member.roles.cache.has(dataSS.roleId)) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle(mConfig.embedErrorTitle)
                  .setDescription(
                    "`❌` You don't have the right role to use this command. Please contact a staff member to solve this."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          }

          nowDate = new Date();
          endTime = Math.floor(nowDate.getTime() / 1000);

          if (!dataS) {
            return await interaction.editReply({
              embeds: [
                rEmbed
                  .setColor(mConfig.embedErrorColor)
                  .setTitle("`🤔` You don't have a shift at all.")
                  .setDescription(
                    "`💡` You can use </shifts start:1194665403385925752> to start your first one."
                  )
                  .setFooter({ text: mConfig.footerYellow }),
              ],
            });
          } else {
            nowDate = new Date();
            timestamp = Math.floor(nowDate.getTime() / 1000);
            startTime = Math.floor(dataS.startTime.getTime() / 1000);
            endTime = Math.floor(dataS.endTime.getTime() / 1000);
            lastTime = endTime - startTime;
            todayTime = dataS.todayTime;
            totalTime = dataS.totalTime;
          }

          let randomCommand = [
            "</shifts start:1194665403385925752>",
            "</shifts stop:1194665403385925752>",
          ];
          randomCommand = randomCommand[Math.floor(Math.random() * 2)];

          return await interaction.editReply({
            embeds: [
              rEmbed
                .setColor("#00d26a")
                .setTitle("`📊` Here are your statistics!")
                .setDescription(`Check out this command: ${randomCommand}`)
                .addFields(
                  {
                    name: "Time spent last shift",
                    value: `\`${formatTime(lastTime)}\``,
                  },
                  {
                    name: "Time spent today",
                    value: `\`${formatTime(todayTime)}\``,
                  },
                  {
                    name: "Total time",
                    value: `\`${formatTime(totalTime)}\``,
                  }
                )
                .setFooter({ text: mConfig.footerGreen }),
            ],
          });
      }
    } catch (err) {
      console.error(err);
      return await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setColor(mConfig.embedErrorColor)
            .setTitle("`⚠️` It's not you, it's us...")
            .setDescription(
              "There was a problem with the bot, please contact the developer for help."
            )
            .setFooter({ text: mConfig.footerYellow })
            .setTimestamp(),
        ],
      });
    }
  },
};
