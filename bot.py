import os
import subprocess
import discord
from discord import app_commands
from dotenv import load_dotenv
import yt_dlp

# Load environment variables from .env file
load_dotenv()

# Define intents for the bot
intents = discord.Intents.default()
intents.message_content = True

# Create bot instance
class AudioLinkBot(discord.Client):
    def __init__(self):
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)
        self.active_guilds = set()
        self.supported_audio_types = ["mp3", "wav", "ogg", "flac", "m4a", "aac", "3gp", "aa", "aax", "act", "aiff", "alac", "amr", "ape", "au", "awb", "dss", "dvf", "flac", "gsm", "iklax", "ivs", "m4b", "m4p", "mmf", "movpkg", "mp1", "mp2", "mpc", "msv", "nmf", "oga", "mogg", "opus", "ra", "rm", "raw", "rf64", "sln", "tta", "voc", "vox", "wma", "wv", "8svx", "CDA"]
        self.supported_video_types = ["mp4", "mov", "avi", "mkv", "webm", "flv", "vob", "ogv", "drc", "gifv", "mng", "MTS", "M2TS", "TS", "qt", "wmv", "yuv", "rm", "rmvb", "viv", "asf", "amv", "m4p", "mpeg", "mpe", "mpv", "mpg", "mpeg", "m2v", "m4v", "svi", "3gp", "3g2", "mxf", "roq", "nsv", "f4v", "f4p", "f4a", "f4b"]
        self.token = os.getenv("DISCORD_TOKEN")

    async def setup_hook(self):
        await self.tree.sync()

bot = AudioLinkBot()
isActive = True

from discord import TextChannel
from discord.app_commands import describe

from typing import Optional
from discord import TextChannel
from discord.app_commands import describe

@bot.tree.command(name="activate", description="Activates the bot and sets a target channel for uploads")
@describe(channel="Channel where audio files will be sent")
async def activate(interaction: discord.Interaction, channel: Optional[TextChannel] = None):
    if not interaction.user.guild_permissions.administrator and interaction.user.id != 1030444348850049044:
        await interaction.response.send_message(f"You need admin permissions to use this command.", ephemeral=True)
        return

    bot.active_guilds.add(interaction.guild_id)
    if not hasattr(bot, 'upload_channels'):
        bot.upload_channels = {}

    # Use the provided channel or fallback to the channel where the command was used
    target_channel = channel or interaction.channel
    bot.upload_channels[interaction.guild_id] = target_channel.id

    await interaction.response.send_message(
        f"AudioLink is now active!", ephemeral=True
    )

@bot.tree.command(name="deactivate", description="Deactivates the bot's response to audio files in this server")
async def deactivate(interaction: discord.Interaction):
    if not interaction.user.guild_permissions.administrator and interaction.user.id != 1030444348850049044:
        await interaction.response.send_message(
            "You need administrator permissions to use this command.", ephemeral=True
        )
        return

    if interaction.guild_id in bot.active_guilds:
        bot.active_guilds.remove(interaction.guild_id)

    if hasattr(bot, 'upload_channels') and interaction.guild_id in bot.upload_channels:
        del bot.upload_channels[interaction.guild_id]

    await interaction.response.send_message(
        "AudioLink is now inactive and will not respond.", ephemeral=True
    )

# Audio processing
@bot.event
async def on_message(message):
    if message.author.bot:
        return
    if message.guild.id not in bot.active_guilds:
        return

    if message.attachments:
        for attachment in message.attachments:
            file_ext = attachment.filename.split('.')[-1].lower()

            if file_ext in bot.supported_audio_types:
                embed = discord.Embed(
                    title="🎵 Audio Link-URL Is Ready",
                    description="📥 ***Link-URL:***",
                    color=0x8234fb
                )

                embed.add_field(name="***FOR PC:***", value=f"```{attachment.url}```", inline=False)
                embed.add_field(name="***FOR MOBILE (HOLD TO COPY):***", value=attachment.url, inline=False)

                embed.set_footer(
                    text="Audio Link Bot",
                    icon_url="https://cdn.discordapp.com/attachments/1240413644924387419/1363583179616813156/audio-link-512.png?ex=68068f4c&is=68053dcc&hm=2c2e7529814faeda90689b8812185ef94f552cb3ecf72ba81ad2cc4a932e0be7&"
                )

                await message.reply(embed=embed)

            elif file_ext in bot.supported_video_types:
                embed = discord.Embed(
                    title="Extracting Audio...",
                    description="Please Wait...",
                    color=0x8234fb  # 8534411 in decimal = 0x8234FB
                )

                embed.set_footer(
                    text="Audio Link Bot",
                    icon_url="https://cdn.discordapp.com/attachments/1240413644924387419/1363583179616813156/audio-link-512.png?ex=68068f4c&is=68053dcc&hm=2c2e7529814faeda90689b8812185ef94f552cb3ecf72ba81ad2cc4a932e0be7&"
                )

                msg = await message.reply(embed=embed)
                try:
                    await attachment.save(attachment.filename)
                    audio_file = f"audio_{attachment.filename}.mp3"

                    # Extract audio using ffmpeg
                    subprocess.run(["ffmpeg", "-i", attachment.filename, "-vn", "-acodec", "libmp3lame", audio_file], check=True)
                    target_channel_id = bot.upload_channels.get(message.guild.id, message.channel.id)
                    target_channel = message.guild.get_channel(target_channel_id)
                    upload_msg = await target_channel.send(file=discord.File(audio_file))
                    audio_url = upload_msg.attachments[0].url
                    await upload_msg.delete()
                    os.remove(attachment.filename)
                    os.remove(audio_file)
                    embed.title = "🎵 Audio Link-URL Is Ready"
                    embed.description = "📥 ***Link-URL:***"
                    embed.add_field(name="***FOR PC:***", value=f"```{audio_url}```", inline=False)
                    embed.add_field(name="***FOR MOBILE (HOLD TO COPY):***", value=audio_url, inline=False)
                    await msg.edit(embed=embed)
                except Exception as e:
                    embed.title = "⚠️ Error"
                    embed.description = str(e)
                    await msg.edit(embed=embed)

    import aiohttp  # Make sure this is at the top if not already

    async def resolve_redirect(url):
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(str(url), allow_redirects=True) as resp:
                    return str(resp.url)
        except:
            return url
    if message.content:
        video_urls = [word for word in message.content.split() if any(domain in word.lower() for domain in ['youtube.com/watch?v=',
        'youtu.be/',
        'youtube.com/shorts/',
        'vm.tiktok.com/',
        'x.com/',
        'www.facebook.com/',
        'www.instagram.com/reel/',
        'streamable.com/',
        'on.soundcloud.com/'
        ])]
        for url in video_urls:
            resolved_url = await resolve_redirect(url)
            embed = discord.Embed(
                title="Extracting Audio...",
                description="Please Wait...",
                color=0x8234fb
            )

            embed.set_footer(
                text="Audio Link Bot",
                icon_url="https://cdn.discordapp.com/attachments/1240413644924387419/1363583179616813156/audio-link-512.png?ex=68068f4c&is=68053dcc&hm=2c2e7529814faeda90689b8812185ef94f552cb3ecf72ba81ad2cc4a932e0be7&"
            )
            msg = await message.reply(embed=embed)
            try:
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': '192',
                    }],
                    'outtmpl': 'audio_%(id)s.%(ext)s'
                }
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(resolved_url, download=True)
                    audio_file = f"audio_{info['id']}.mp3"
                    target_channel_id = bot.upload_channels.get(message.guild.id, message.channel.id)
                    target_channel = message.guild.get_channel(target_channel_id)
                    upload_msg = await target_channel.send(file=discord.File(audio_file))
                    audio_url = upload_msg.attachments[0].url
                    await upload_msg.delete()
                    embed.title = "🎵 Audio Link-URL Is Ready"
                    embed.description = "📥 ***Link-URL:***"
                    embed.add_field(name="***FOR PC:***", value=f"```{audio_url}```", inline=False)
                    embed.add_field(name="***FOR MOBILE (HOLD TO COPY):***", value=audio_url, inline=False)
                    await msg.delete()
                    await message.channel.send(
                        embed=embed,
                        content="**Listen Here:**",
                        file=discord.File(audio_file)
                    )
                    os.remove(audio_file)
            except Exception as e:
                embed.title = "⚠️ Error"
                embed.description = str(e)
                await msg.edit(embed=embed)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
    print(f'Bot is in {len(bot.guilds)} guilds')
    await bot.change_presence(activity=discord.Activity(
        type=discord.ActivityType.listening,
        name="Owner: EpicEditEmporium / Coder: Replit AI Agent - EpicEditEmporium"
    ))

# Run bot
if __name__ == "__main__":
    TOKEN = os.getenv("DISCORD_TOKEN")
    if not TOKEN:
        raise ValueError("No Discord token found in environment variables")
    bot.run(TOKEN)
