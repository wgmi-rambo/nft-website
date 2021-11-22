import http.server
import os
import socketserver
from functools import partial
from pathlib import Path

BASE_DIR = Path(__file__).resolve(strict=True).parent
BUILD_DIR = os.path.join(BASE_DIR, "build")

PORT = 9000

Handler = partial(http.server.SimpleHTTPRequestHandler, directory=BUILD_DIR)


def run():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at: http://localhost:{PORT}/")
        try:
            httpd.serve_forever()
        except:  # noqa: E722
            httpd.server_close()


if __name__ == "__main__":
    run()
