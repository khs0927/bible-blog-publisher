from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import sys

# Ensure current directory is on python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models import db
from routes_bible import bible_bp
from security import cors_origins

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")

app = Flask(__name__, static_folder=static_dir, static_url_path="/")
CORS(app, origins=cors_origins(), allow_headers=["Content-Type", "Authorization", "X-Admin-Key"])

db_path = os.environ.get("DATABASE_PATH") or "sqlite:///bible_publisher.db"
app.config["SQLALCHEMY_DATABASE_URI"] = db_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

app.register_blueprint(bible_bp, url_prefix="/api")

@app.route("/")
def serve_index():
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return {"message": "Bible Blog Publisher API Server Running", "status": "ok"}

@app.route("/<path:path>")
def serve_static(path):
    if path.startswith("api/"):
        return {"error": "not found"}, 404
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

@app.route("/api/health")
def health():
    return {"status": "healthy", "service": "Bible Blog Publisher API"}

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
