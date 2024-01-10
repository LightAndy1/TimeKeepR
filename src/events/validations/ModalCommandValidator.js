const { EmbedBuilder } = require("discord.js");
const { developersId, testServerId } = require("../../config.json");
const mConfig = require("../../messageConfig.json");
const getModals = require("../../utils/getModals");

module.exports = async (client, interaction) => {
  if (!interaction.isModalSubmit) return;

  const modals = getModals();
  const modalObject = modals.find(
    (modal) => modal.customId === interaction.customId
  );

  if (!modalObject) return;

  const createEmbed = (color, description) =>
    new EmbedBuilder().setColor(color).setDescription(description);

  if (modalObject.devOnly && !developersId.includes(interaction.member.id)) {
    const rEmbed = createEmbed(mConfig.embedColorErorr, mConfig.commandDevOnly);
    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
  }

  if (modalObject.testMode && interaction.guildId !== testServerId) {
    const rEmbed = createEmbed(
      mConfig.embedColorErorr,
      mConfig.commandTestMode
    );
    return interaction.reply({ embeds: [rEmbed], ephemeral: true });
  }

  for (const permission of modalObject.userPermissions || []) {
    if (!interaction.member.permissions.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorErorr,
        mConfig.userNoPermission
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }

  const bot = interaction.guild.members.me;
  for (const permission of modalObject.botPermissions || []) {
    if (!bot.permissions.has(permission)) {
      const rEmbed = createEmbed(
        mConfig.embedColorErorr,
        mConfig.botNoPermission
      );
      return interaction.reply({ embeds: [rEmbed], ephemeral: true });
    }
  }

  try {
    await modalObject.run(client, interaction);
  } catch (error) {
    console.log(
      `[ERROR] An error has occured inside the modal validator:\n${error.stack}`
        .red
    );
  }
};
