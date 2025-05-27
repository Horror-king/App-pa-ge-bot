// commands/help.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  name: "help",
  description: "Lists all available commands.",

  async execute(senderId, args, pageAccessToken) {
    try {
      const commandsDir = path.join(__dirname);
      const files = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js") && file !== "help.js");

      const commands = [];

      for (const file of files) {
        try {
          const command = require(path.join(commandsDir, file));
          const name = command.name || command.config?.name;
          const description = command.description || command.config?.shortDescription || "No description.";
          if (name && description) {
            commands.push({ name, description });
          }
        } catch (e) {
          console.warn(`⚠️ Skipping command ${file}: ${e.message}`);
        }
      }

      if (commands.length === 0) {
        return await sendText(senderId, pageAccessToken, "⚠️ No commands found.");
      }

      // Build help message
      let messageText = "Here are the available commands:\n\n";
      for (const cmd of commands) {
        messageText += `• -${cmd.name}: ${cmd.description}\n`;
      }

      // Truncate if too long for Messenger
      const MAX_LENGTH = 1990;
      if (messageText.length > MAX_LENGTH) {
        messageText = messageText.slice(0, MAX_LENGTH - 3) + "...";
      }

      return await sendText(senderId, pageAccessToken, messageText);

    } catch (err) {
      console.error("Help command error:", err.message);
      return await sendText(senderId, pageAccessToken, "❌ Something went wrong while loading commands.");
    }
  }
};

async function sendText(senderId, token, text) {
  try {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${token}`, {
      recipient: { id: senderId },
      message: { text }
    });
  } catch (error) {
    console.error("❌ Failed to send help message:", error.message);
  }
}
