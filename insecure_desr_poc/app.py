from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import base64
import pickle

app = Flask(__name__)

# Allow frontend (e.g. http://localhost:5173) to send cookies to backend (http://127.0.0.1:5000)
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5173"])

# insecure serialization/deserialization using pickle
def encode_session(obj: dict) -> str:
    raw = pickle.dumps(obj)
    return base64.urlsafe_b64encode(raw).decode('utf-8')

def decode_session(data: str) -> dict:
    raw = base64.urlsafe_b64decode(data.encode('utf-8'))
    return pickle.loads(raw)

def get_session():
    cookie = request.cookies.get('session')
    if not cookie:
        return None
    try:
        session = decode_session(cookie)
        return session
    except Exception as e:
        print(f"Error decoding session: {e}")
        return None
    

@app.route("/api/login", methods=["POST", "GET"])
def login():

    body = request.get_json(silent=True) or {}
    user = body.get("user") or request.args.get("user") or "guest"


    session_obj = {"user": user, "is_admin": False}

    response = make_response(jsonify({"message": "logged_in", "user": user}))
    response.set_cookie("session",
                        encode_session(session_obj),
                        httponly=True,
                        samesite='Lax',
                        secure=False,
                        path='/',)
    return response

@app.post("/api/logout")
def logout():
    response = make_response(jsonify({"message": "logged_out"}))
    response.set_cookie("session", "", expires=0, path='/')
    return response

@app.get("/api/me")
def me():
    session = get_session()
    if not session:
        return jsonify({"authenticated": False}), 401

    return jsonify({
        "authenticated": True,
        "user": session.get("user", "unknown"),
        "is_admin": bool(session.get("is_admin", False)),
    })

@app.get("/api/admin")
def admin():
    session = get_session()
    if not session:
        return jsonify({"ok": False, "error": "no_session"}), 401

    if session.get("is_admin") is True:
        return jsonify({"ok": True, "message": "welcome_admin"})
    return jsonify({"ok": False, "error": "forbidden"}), 403

if __name__ == "__main__":
    app.run(debug=True)