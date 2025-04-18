import { 
  Client, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  Collection
} from "discord.js";

export async function registerCommands(client: Client) {
  // Define commands
  const commands = [
    new SlashCommandBuilder()
      .setName("activate")
      .setDescription("Activate the bot to respond to audio file uploads with download links"),
    
    new SlashCommandBuilder()
      .setName("deactivate")
      .setDescription("Deactivate the bot to stop responding to audio file uploads"),
  ];

  try {
    console.log("Started refreshing application (/) commands.");

    // Discord bot token and client ID
    const token = process.env.DISCORD_BOT_TOKEN;
    
    if (!token) {
      throw new Error("DISCORD_BOT_TOKEN environment variable not set");
    }
    
    // Wait for client to be ready before registering commands
    if (!client.isReady()) {
      console.log("Client not ready, waiting for client to initialize...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Try to get client ID from client or environment variable
    const clientId = process.env.DISCORD_CLIENT_ID || client.user?.id;
    
    if (!clientId) {
      console.log("Client ID not available yet, skipping command registration");
      return; // Skip command registration for now
    }

    // Create REST instance
    const rest = new REST({ version: '10' }).setToken(token);

    // Register slash commands globally
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands.map(command => command.toJSON()) }
    );

    console.log(`Successfully registered ${Array.isArray(data) ? data.length : 0} application commands.`);
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
}
