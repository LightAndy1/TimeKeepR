const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client, interaction) => {
  if (!interaction.isContextMenuCommand) return;

  const localContextMenus = getLocalContextMenus();
  const menuObject = localContextMenus.find(
    (cmd) => cmd.data.name === interaction.commandName
  );

  if (!menuObject) return;

  const createEmbed = (color, description) =>
    new EmbedBuilder().setColor(color).setDescription(description);

  if (menuObject.devOnly && !developersId.includes(interaction.member.id)) {
    const rEmbed = createEmbed(mConfig.embedColorErorr, mConfig.commandDevOnly);
    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
  }

  if (menuObject.testMode && interaction.guildId !== testServerId) {
    const rEmbed = createEmbed(
      mConfig.embedColorErorr,
      mConfig.commandTestMode
    );
    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
  }

  for (const permission of menuObject.userPermissions || []) {
    if (!interaction.member.permissions.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorErorr,
        mConfig.userNoPermission
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }

  const bot = interaction.guild.members.me;
  for (const permission of menuObject.botPermissions || []) {
    if (!bot.permissions.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorErorr,
        mConfig.botNoPermission
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }

  try {
    await menuObject.run(client, interaction);
  } catch (error) {
    console.log(
      `[ERROR] An error has occured inside the context menu command validator:\n${error.stack}`
        .red
    );
  }
};
