from flask import Flask, render_template, jsonify
import threading
import time
import os
from bot import bot, isActive  # Import our bot instance and status

app = Flask(__name__)

# Store bot statistics
stats = {
    'download_count': 0,
    'active_guilds': 0,
    'start_time': time.time()
}

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    uptime = int(time.time() - stats['start_time'])
    active_guilds = len(bot.active_guilds)
    total_guilds = len(bot.guilds) if bot.is_ready() else 0

    return jsonify({
        'uptime': uptime,
        'download_count': stats['download_count'],
        'active_guilds': active_guilds,
        'total_guilds': total_guilds,
        'isActive': isActive
    })

@app.route('/api/bot/activate/<guild_id>', methods=['POST'])
def activate_bot(guild_id):
    try:
        bot.active_guilds.add(int(guild_id))
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/bot/deactivate/<guild_id>', methods=['POST'])
def deactivate_bot(guild_id):
    try:
        bot.active_guilds.remove(int(guild_id))
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Create templates directory
if not os.path.exists('templates'):
    os.makedirs('templates')

# Create a simple HTML template
@app.route('/template')
def create_template():
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AudioLink Bot Dashboard</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #36393f;
                color: #dcddde;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .status-cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .card {
                background-color: #2f3136;
                border-radius: 5px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            .card h3 {
                margin-top: 0;
                color: #ffffff;
            }
            .commands {
                background-color: #2f3136;
                border-radius: 5px;
                padding: 20px;
                margin-bottom: 30px;
            }
            .command {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #40444b;
            }
            .command:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .status-dot {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 5px;
            }
            .online {
                background-color: #43b581;
            }
            .offline {
                background-color: #f04747;
            }
            button {
                background-color: #7289da;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }
            button:hover {
                background-color: #677bc4;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div>
                    <h1>AudioLink Bot</h1>
                    <p><span class="status-dot online"></span> Online</p>
                </div>
                <button onclick="window.location.reload()">Refresh</button>
            </header>
            
            <div class="status-cards">
                <div class="card">
                    <h3>Uptime</h3>
                    <p id="uptime">Loading...</p>
                </div>
                <div class="card">
                    <h3>Active Servers</h3>
                    <p id="active-guilds">Loading...</p>
                </div>
                <div class="card">
                    <h3>Total Servers</h3>
                    <p id="total-guilds">Loading...</p>
                </div>
                <div class="card">
                    <h3>Downloads</h3>
                    <p id="downloads">Loading...</p>
                </div>
            </div>
            
            <div class="commands">
                <h2>Bot Commands</h2>
                <div class="command">
                    <h3>/activate</h3>
                    <p>Activates the bot to respond to audio files in your server.</p>
                    <p><small>Requires administrator permissions</small></p>
                </div>
                <div class="command">
                    <h3>/deactivate</h3>
                    <p>Deactivates the bot's response to audio files in your server.</p>
                    <p><small>Requires administrator permissions</small></p>
                </div>
            </div>
            
            <div class="card">
                <h3>Supported Audio Formats</h3>
                <p>MP3, WAV, OGG, FLAC, M4A, AAC</p>
            </div>
        </div>
        
        <script>
            // Function to update stats
            function updateStats() {
                fetch('/api/stats')
                    .then(response => response.json())
                    .then(data => {
                        // Format uptime
                        const hours = Math.floor(data.uptime / 3600);
                        const minutes = Math.floor((data.uptime % 3600) / 60);
                        const seconds = data.uptime % 60;
                        document.getElementById('uptime').textContent = 
                            `${hours}h ${minutes}m ${seconds}s`;
                        
                        // Update other stats
                        document.getElementById('active-guilds').textContent = 
                            data.active_guilds;
                        document.getElementById('total-guilds').textContent = 
                            data.total_guilds;
                        document.getElementById('downloads').textContent = 
                            data.download_count;
                    });
            }
            
            // Update stats every second
            updateStats();
            setInterval(updateStats, 1000);
        </script>
    </body>
    </html>
    """
    
    # Create the template file
    with open('templates/index.html', 'w') as f:
        f.write(html)
    
    return "Template created successfully"

# Function to run the Discord bot
def run_bot():
    bot.run(bot.token)

# Main function to start both Flask and Discord bot
def main():
    # Create the template before starting
    with app.app_context():
        create_template()
    
    # Start the Discord bot in a separate thread
    bot_thread = threading.Thread(target=run_bot)
    bot_thread.daemon = True
    bot_thread.start()
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    main()