const fs = require('fs');
const path = require('path');

module.exports = {
  name: "help",
  description: "Shows a list of available commands or help for a specific command.",
  async execute(senderId, args, pageAccessToken) {
    try {
      const commandsDir = path.join(__dirname);
      const files = fs.readdirSync(commandsDir);
      const allCommands = [];

      for (const file of files) {
        if (file.endsWith(".js")) {
          const cmd = require(path.join(commandsDir, file));
          if (cmd.name && cmd.description) {
            allCommands.push(cmd);
          }
        }
      }

      // Show help for a specific command
      if (args.length > 0) {
        const cmdName = args[0].toLowerCase();
        const command = allCommands.find(
          c => c.name === cmdName || (c.aliases && c.aliases.includes(cmdName))
        );

        if (!command) {
          return sendText(senderId, `❌ Unknown command: ${cmdName}`, pageAccessToken);
        }

        let details = `🔹 Command: ${command.name}\n`;
        if (command.aliases) details += `🔸 Aliases: ${command.aliases.join(", ")}\n`;
        details += `📄 Description: ${command.description}\n`;

        return sendText(senderId, details, pageAccessToken);
      }

      // List all commands
      let replyText = "🧠 Available Commands:\n\n";
      for (const cmd of allCommands) {
        replyText += `- ${cmd.name}: ${cmd.description}\n`;
      }

      replyText += "\nType `-help <command>` for more details.";
      return sendText(senderId, replyText, pageAccessToken);

    } catch (err) {
      console.error("Help command error:", err.message);
      return sendText(senderId, "❌ An error occurred while loading the help menu.", pageAccessToken);
    }
  }
};

async function sendText(senderId, text, token) {
  const axios = require('axios');
  await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${token}`, {
    recipient: { id: senderId },
    message: { text }
  });
}
