// commands/bible.js
const axios = require('axios');

module.exports = {
    name: 'bible',
    description: 'Sends a Bible verse with your fixed background image.',
    async execute(senderId, args, pageAccessToken) {
        const apiKey = '319fdb38c5048bd8009ac3e888193602'; // Replace with your actual API key
        const bibleId = 'de4e12af7f28f599-01'; // Default: KJV

        try {
            if (args.length === 0) {
                return "Please provide a verse like:\n`-bible John 3:16`";
            }

            const passage = args.join(' ');
            const res = await axios.get(`https://api.scripture.api.bible/v1/bibles/${bibleId}/passages`, {
                headers: {
                    'api-key': apiKey
                },
                params: {
                    'content-type': 'text',
                    'include-verse-numbers': true,
                    'q': passage
                }
            });

            const data = res.data;
            const reference = data.data.reference;
            const verseText = data.data.content.replace(/<[^>]+>/g, ''); // Remove HTML tags

            // 1. Send fixed background image
            await axios.post(
                `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
                {
                    recipient: { id: senderId },
                    message: {
                        attachment: {
                            type: 'image',
                            payload: {
                                url: 'https://i.ibb.co/twFkLsf8/c625222cc2252539c9d8997096c51ecd.jpg',
                                is_reusable: true
                            }
                        }
                    }
                }
            );

            // 2. Send the verse text
            return `${reference}\n${verseText.trim()}`;

        } catch (error) {
            console.error('Bible API error:', error.message);

            // Send image even if fetch fails
            await axios.post(
                `https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`,
                {
                    recipient: { id: senderId },
                    message: {
                        attachment: {
                            type: 'image',
                            payload: {
                                url: 'https://i.ibb.co/twFkLsf8/c625222cc2252539c9d8997096c51ecd.jpg',
                                is_reusable: true
                            }
                        }
                    }
                }
            );

            return "Sorry, I couldn't fetch a verse right now.";
        }
    },
};