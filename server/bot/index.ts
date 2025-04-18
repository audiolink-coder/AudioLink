import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import { IStorage } from "../storage";
import { LogEntryType, SUPPORTED_AUDIO_FORMATS } from "@shared/schema";
import { registerCommands } from "./commands";

// Check if we have a bot token
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.warn("Warning: DISCORD_BOT_TOKEN not found in environment variables.");
}

export async function setupBot(storage: IStorage) {
  // Create a new Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel],
  });

  // Bot state
  let isActive = false;

  // Initialize bot
  async function init() {
    try {
      // Get initial state from storage
      const settings = await storage.getBotSettings();
      isActive = settings.isActive;

      // Set up slash commands
      registerCommands(client);

      // Handle ready event
      client.once(Events.ClientReady, async (readyClient) => {
        console.log(`Discord bot logged in as ${readyClient.user.tag}`);
        
        // Log bot startup
        await storage.addLogEntry({
          type: LogEntryType.BOT_ACTION,
          message: `Bot started and ready to use. Use /activate to start responding to audio files.`,
        });
      });

      // Handle slash commands
      client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const { commandName } = interaction;

        if (commandName === "activate") {
          isActive = true;
          await storage.updateBotSettings({ isActive: true });
          
          await interaction.reply("Bot activated! I will now respond to audio file uploads with download links.");
          
          // Log activation
          const channelName = interaction.channel?.type === 0 ? interaction.channel.name : "unknown";
          await storage.addLogEntry({
            type: LogEntryType.BOT_ACTION,
            message: `Bot activated in channel #${channelName} by @${interaction.user.username}`,
            channelId: interaction.channelId,
            userId: interaction.user.id,
          });
        }
        
        if (commandName === "deactivate") {
          isActive = false;
          await storage.updateBotSettings({ isActive: false });
          
          await interaction.reply("Bot deactivated! I will no longer respond to audio file uploads.");
          
          // Log deactivation
          const channelName = interaction.channel?.type === 0 ? interaction.channel.name : "unknown";
          await storage.addLogEntry({
            type: LogEntryType.BOT_ACTION,
            message: `Bot deactivated in channel #${channelName} by @${interaction.user.username}`,
            channelId: interaction.channelId,
            userId: interaction.user.id,
          });
        }
      });

      // Handle message events to check for audio attachments
      client.on(Events.MessageCreate, async (message) => {
        // Ignore bot messages and messages without attachments
        if (message.author.bot || !message.attachments.size || !isActive) return;

        // Check each attachment for audio files
        message.attachments.forEach(async (attachment) => {
          const fileName = attachment.name;
          if (!fileName) return;
          
          // Check if the file has an audio extension
          const isAudioFile = SUPPORTED_AUDIO_FORMATS.some(format => 
            fileName.toLowerCase().endsWith(format)
          );

          if (isAudioFile) {
            // Get file size in MB for display
            const fileSizeInMB = (attachment.size / (1024 * 1024)).toFixed(2);
            const downloadUrl = attachment.url;
            
            // Log the detected audio file
            await storage.addLogEntry({
              type: LogEntryType.DETECTED,
              message: `Audio file detected: ${fileName} (${fileSizeInMB} MB)`,
              channelId: message.channelId,
              userId: message.author.id,
              fileName: fileName,
              fileSize: attachment.size,
              downloadUrl: downloadUrl,
            });
            
            // Reply with the download link using an embed
            try {
              const reply = await message.reply({
                embeds: [{
                  title: '🎵 Audio File Detected',
                  description: `**File name:** ${fileName}\n📥 **Link:**\n***FOR PC:***\n\`\`\`${downloadUrl}\`\`\`\n***FOR MOBILE (Hold To Copy):***\n${downloadUrl}`,
                  color: 0x7289DA,
                  footer: {
                    text: 'Audio Link Bot'
                  },
                  timestamp: new Date()
                }]
              });
              
              // Log the response
              await storage.addLogEntry({
                type: LogEntryType.BOT_ACTION,
                message: `Responded with download link for: ${fileName}`,
                channelId: message.channelId,
                userId: message.author.id,
                fileName: fileName,
                downloadUrl: downloadUrl,
              });
            } catch (error) {
              console.error("Error responding to message:", error);
              
              // Log the error
              await storage.addLogEntry({
                type: LogEntryType.ERROR,
                message: `Error responding to audio file: ${fileName}. Error: ${error}`,
                channelId: message.channelId,
                userId: message.author.id,
                fileName: fileName,
              });
            }
          } else {
            // Not an audio file, we can log this as an error if we want to track attempted file uploads
            await storage.addLogEntry({
              type: LogEntryType.ERROR,
              message: `Invalid file format detected: ${fileName} - Not an audio file`,
              channelId: message.channelId,
              userId: message.author.id,
              fileName: fileName,
            });
          }
        });
      });

      // Login to Discord
      if (BOT_TOKEN) {
        await client.login(BOT_TOKEN);
      } else {
        console.error("Cannot start bot: No Discord token provided");
        
        // Log the error
        await storage.addLogEntry({
          type: LogEntryType.ERROR,
          message: "Failed to start bot: No Discord token provided",
        });
      }
    } catch (error) {
      console.error("Error initializing bot:", error);
      
      // Log the error
      await storage.addLogEntry({
        type: LogEntryType.ERROR,
        message: `Error initializing bot: ${error}`,
      });
    }
  }

  // Start initialization
  await init();

  // Return an object with methods to control the bot
  return {
    async activate() {
      isActive = true;
      return isActive;
    },
    async deactivate() {
      isActive = false;
      return isActive;
    },
    isActive() {
      return isActive;
    },
    client
  };
}
