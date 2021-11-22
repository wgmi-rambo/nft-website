import os
import time
from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

import build

BASE_DIR = Path(__file__).resolve(strict=True).parent
SRC_DIR = os.path.join(BASE_DIR, "src")


class OnMyWatch:
    # Set the directory on watch
    watchDirectory = SRC_DIR

    def __init__(self):
        self.observer = Observer()

    def run(self):
        event_handler = Handler()
        self.observer.schedule(event_handler, self.watchDirectory, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except:  # noqa: E722
            self.observer.stop()
            print("Observer Stopped")

        self.observer.join()


class Handler(FileSystemEventHandler):
    @staticmethod
    def on_any_event(event):
        if event.is_directory:
            return None

        else:
            try:
                build.build()
            except Exception as e:
                print("Build failed:", e)

        if event.event_type == "created":
            # Event is created, you can process it now
            print("Watchdog received created event - % s." % event.src_path)
        elif event.event_type == "modified":
            # Event is modified, you can process it now
            print("Watchdog received modified event - % s." % event.src_path)


if __name__ == "__main__":
    build.build()

    print("Watching 'src' dir for changes...")

    watch = OnMyWatch()
    watch.run()
