"""로컬 미리보기 서버: 캐시를 꺼서 수정한 파일이 바로 보이게 한다. python3 serve.py → http://localhost:4820"""
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    root = os.path.dirname(os.path.abspath(__file__))
    ThreadingHTTPServer(("127.0.0.1", 4820), partial(NoCacheHandler, directory=root)).serve_forever()
