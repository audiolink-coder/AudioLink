import os
import discord
from discord import app_commands
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define intents for the bot
intents = discord.Intents.default()
intents.message_content = True  # Enable message content intent

# Create bot instance
class AudioLinkBot(discord.Client):
    def __init__(self):
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)
        self.active_guilds = set()  # Set to store active guild IDs
        self.supported_audio_types = [
            "mp3", "wav", "ogg", "flac", "m4a", "aac"
        ]
    
    async def setup_hook(self):
        # This is called when the bot is ready
        await self.tree.sync()  # Sync commands globally

# Initialize the bot
bot = AudioLinkBot()
isActive = True  # Add global isActive variable

# Define slash commands
@bot.tree.command(name="activate", description="Activates the bot to respond to audio files in this server")
async def activate(interaction: discord.Interaction):
    # Check if user has admin permissions
    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message("You need administrator permissions to use this command.", ephemeral=True)
        return
    
    # Add guild to active guilds
    bot.active_guilds.add(interaction.guild_id)
    await interaction.response.send_message("AudioLink is now active and will respond to audio files!")

@bot.tree.command(name="deactivate", description="Deactivates the bot's response to audio files in this server")
async def deactivate(interaction: discord.Interaction):
    # Check if user has admin permissions
    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message("You need administrator permissions to use this command.", ephemeral=True)
        return
    
    # Remove guild from active guilds
    if interaction.guild_id in bot.active_guilds:
        bot.active_guilds.remove(interaction.guild_id)
    
    await interaction.response.send_message("AudioLink is now inactive and will not respond to audio files.")

# Message listener for handling audio file uploads
@bot.event
async def on_message(message):
    # Don't respond to bot messages
    if message.author.bot:
        return
    
    # Check if bot is active in this guild
    if message.guild.id not in bot.active_guilds:
        return
    
    # Check if message has attachments
    if not message.attachments:
        return
    
    # Process audio file attachments
    for attachment in message.attachments:
        file_ext = attachment.filename.split('.')[-1].lower()
        if file_ext in bot.supported_audio_types:
            # Create download link response
            response = f"Here's your download link for the audio file: {attachment.url}"
            await message.reply(response)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
    print(f'Bot is in {len(bot.guilds)} guilds')
    
    # Set bot activity status
    await bot.change_presence(activity=discord.Activity(
        type=discord.ActivityType.listening, 
        name="audio files | /activate"
    ))

# Run the bot
if __name__ == "__main__":
    TOKEN = os.getenv("DISCORD_TOKEN")
    if not TOKEN:
        raise ValueError("No Discord token found in environment variables")
    
    bot.run(TOKEN)