import os
import sys

# Add parent directory to python path for Vercel serverless function
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel entrypoint handler
handler = app
