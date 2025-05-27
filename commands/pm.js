// commands/pm.js
// Author: Team Calyx (Styled by Hassan)

const axios = require('axios');
const ok = 'xyz'; // Replace with actual subdomain

module.exports = {
  name: "pm",
  description: "Get Gemini prompt suggestions by text or image.",
  async execute(senderId, args, pageAccessToken, event = {}) {
    try {
      const promptText = args.join(" ");
      let imageUrl = null;
      let replyText = "";

      // Case 1: Check for image reply
      if (event.messageReply && ["photo", "sticker"].includes(event.messageReply.attachments?.[0]?.type)) {
        imageUrl = event.messageReply.attachments[0].url;
      }

      // Case 2: Direct image URL in args
      else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/gi)) {
        imageUrl = args[0];
      }

      // Case 3: Random prompt
      if (["-r", "-random"].includes(promptText.toLowerCase())) {
        const res = await axios.get(`https://smfahim.${ok}/prompt-random`);
        replyText = res.data?.data?.prompt || "❌ No prompt found.";
      }

      // Case 4: Anime prompt
      else if (["-anime", "-a"].some(f => promptText.toLowerCase().includes(f))) {
        const target = imageUrl || promptText;
        const res = await axios.get(`https://smfahim.${ok}/prompt2?url=${encodeURIComponent(target)}`);
        replyText = res.data?.data || "❌ Failed to get anime prompt.";
      }

      // Case 5: Image URL only
      else if (imageUrl) {
        const res = await axios.get(`https://smfahim.${ok}/prompt?url=${encodeURIComponent(imageUrl)}`);
        replyText = res.data?.result || "❌ Could not extract prompt from image.";
      }

      // Case 6: Prompt text only
      else if (promptText) {
        const res = await axios.get(`https://smfahim.${ok}/prompt?text=${encodeURIComponent(promptText)}`);
        replyText = res.data?.prompt || res.data?.result || "❌ No prompt found.";
      }

      else {
        replyText = "⚠️ Please provide a prompt or reply to an image.\nExample:\n`-pm futuristic armor --anime`";
      }

      // Send result
      await axios.post(
        `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
        {
          recipient: { id: senderId },
          message: { text: replyText }
        }
      );

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
