// commands/help.js
module.exports = {
    name: 'help', // The command name (e.g., if user types -help)
    description: 'Displays available commands.',
    async execute(senderId, args, pageAccessToken) {
        // In a real bot, you might want to dynamically list all loaded commands
        let response = "Available commands:\n";
        response += "- help: Displays this message.\n";
        response += "- hello: Says hello back.\n"; // Assuming you also have a hello.js
        response += "- cmd: A test command.";
        return response;
    },
};