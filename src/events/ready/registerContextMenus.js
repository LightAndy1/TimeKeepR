require("colors");
const { testServerId } = require("../../config.json");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client) => {
  try {
    const [localContextMenus, applicationContextMenus] = await Promise.all([
      getLocalContextMenus(),
      getApplicationContextMenus(client, testServerId),
    ]);

    for (const localContextMenu of localContextMenus) {
      const { data, deleted } = localContextMenu;
      const { name: contextMenuName, type: contextMenuType } = data;

      const existingContextMenu = await applicationContextMenus.cache.find(
        (cmd) => cmd.name === contextMenuName
      );

      if (deleted) {
        if (existingContextMenu) {
          await applicationContextMenus.delete(existingContextMenu.id);
          console.log(
            `[CONTEXT MENU REGISTRY] Deleted context menu: ${contextMenuName}`
              .red
          );
        } else {
          console.log(
            `[CONTEXT MENU REGISTRY] Context menu skipped: ${contextMenuName}`
              .grey
          );
        }
      } else {
        if (existingContextMenu) {
          continue;
        } else {
          await applicationContextMenus.create({
            name: contextMenuName,
            type: contextMenuType,
          });
          console.log(
            `[CONTEXT MENU REGISTRY] Created context menu: ${contextMenuName}`
              .green
          );
        }
      }
    }
  } catch (error) {
    console.log(
      `[ERROR] An error has occured inside the context menu registry:\n${error.stack}`
        .red
    );
  }
};
