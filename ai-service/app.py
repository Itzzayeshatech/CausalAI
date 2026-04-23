from flask import Flask
from flask_cors import CORS
import os
import sys

# Add src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from api.endpoints import app

if __name__ == '__main__':
    # Configuration
    host = os.getenv('AI_SERVICE_HOST', '0.0.0.0')
    port = int(os.getenv('AI_SERVICE_PORT', 8000))
    debug = os.getenv('AI_SERVICE_DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Starting CausalAI ML Engine v2.0.0")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🐛 Debug: {debug}")
    
    app.run(host=host, port=port, debug=debug)
