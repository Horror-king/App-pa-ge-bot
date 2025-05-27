const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "menu", "cmds"],
    version: "1.0",
    author: "Hassan",
    countDown: 2,
    role: 0,
    shortDescription: "List available commands",
    longDescription: "Displays all available commands with descriptions and categories.",
    category: "system",
    guide: {
      en: "{pn} - list all commands\n{pn} <command> - details about one command"
    }
  },

  onStart: async function ({ message, args }) {
    const commandsDir = path.join(__dirname);
    const allCommands = [];

    const files = fs.readdirSync(commandsDir);
    for (const file of files) {
      if (file.endsWith(".js") && file !== "help.js") {
        const cmd = require(path.join(commandsDir, file));
        if (cmd.config?.name) {
          allCommands.push(cmd.config);
        }
      }
    }

    if (args.length > 0) {
      const query = args[0].toLowerCase();
      const command = allCommands.find(cmd =>
        cmd.name === query || (cmd.aliases && cmd.aliases.includes(query))
      );

      if (!command) return message.reply(`❌ | Command "${query}" not found.`);

      const details = `🔹 Command: ${command.name}
${command.aliases?.length ? `🔸 Aliases: ${command.aliases.join(", ")}` : ""}
📂 Category: ${command.category || "uncategorized"}
📄 Description: ${command.longDescription || command.shortDescription || "No description"}
📘 Usage: ${command.guide?.en || "No usage example"}`;

      return message.reply(details);
    }

    // Group commands by category
    const grouped = {};
    for (const cmd of allCommands) {
      const cat = cmd.category || "uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd.name);
    }

    let replyText = "🧠 Available Commands:\n\n";
    for (const category in grouped) {
      replyText += `📁 ${category}:\n- ${grouped[category].join(", ")}\n\n`;
    }

    replyText += "Type `-help <command>` to view more details.";

    return message.reply(replyText);
  }
};
