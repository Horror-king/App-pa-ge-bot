const axios = require('axios');
const ok = 'xyz'; // Replace with the actual domain (e.g., smfahim.xyz)

module.exports = {
  name: "pm2",
  description: "Get Gemini prompt suggestions by text or image.",
  async execute(senderId, args, pageAccessToken, event = {}) {
    try {
      const promptText = args.join(" ");
      let imageUrl = null;
      let replyText = "";

      // Handle image reply
      if (event.messageReply && ["photo", "sticker"].includes(event.messageReply.attachments?.[0]?.type)) {
        imageUrl = event.messageReply.attachments[0].url;
      }

      // Handle direct image URL
      else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/gi)) {
        imageUrl = args[0];
      }

      // Get prompt for random
      if (["-r", "-random"].includes(promptText.toLowerCase())) {
        const res = await axios.get(`https://smfahim.${ok}/prompt-random`);
        replyText = res.data?.data?.prompt || "❌ No prompt found.";
      }

      // Anime prompt
      else if (["-anime", "-a"].some(f => promptText.toLowerCase().includes(f))) {
        const target = imageUrl || promptText;
        const res = await axios.get(`https://smfahim.${ok}/prompt2?url=${encodeURIComponent(target)}`);
        replyText = res.data?.data || "❌ Failed to get anime prompt.";
      }

      // Prompt from image
      else if (imageUrl) {
        const res = await axios.get(`https://smfahim.${ok}/prompt?url=${encodeURIComponent(imageUrl)}`);
        replyText = res.data?.result || "❌ Could not extract prompt from image.";
      }

      // Prompt from text
      else if (promptText) {
        const res = await axios.get(`https://smfahim.${ok}/prompt?text=${encodeURIComponent(promptText)}`);
        replyText = res.data?.prompt || res.data?.result || "❌ No prompt found.";
      }

      else {
        replyText = "⚠️ Please provide a prompt or reply to an image.\nExample:\n`-pm futuristic armor --anime`";
      }

      // Limit long replies to avoid Messenger error
      const MAX_LENGTH = 1900;
      if (replyText.length > MAX_LENGTH) {
        replyText = replyText.slice(0, MAX_LENGTH - 3) + '...';
      }

      // Send message safely
      await axios.post(
        `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
        {
          recipient: { id: senderId },
          message: { text: replyText }
        }
      );

      return;

    } catch (error) {
      console.error("PM Command Error:", error.message);

      await axios.post(
        `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
        {
          recipient: { id: senderId },
          message: { text: `❌ An error occurred: ${error.message}` }
        }
      );
    }
  }
};
