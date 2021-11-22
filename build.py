import os
import shutil
import subprocess
from pathlib import Path

import sass
from jinja2 import Environment, PackageLoader, select_autoescape

BASE_DIR = Path(__file__).resolve(strict=True).parent
SRC_DIR = os.path.join(BASE_DIR, "src")
BUILD_DIR = os.path.join(BASE_DIR, "build")


def build():
    # index.html #
    env = Environment(loader=PackageLoader("src", ""), autoescape=select_autoescape())
    template = env.get_template("index.html")

    index_build_str = template.render()
    build_index_path = os.path.join(BUILD_DIR, "index.html")

    try:
        os.mkdir(BUILD_DIR)
    except FileExistsError:
        pass
    try:  # noqa: TC101
        os.mkdir(os.path.join(BUILD_DIR, "images"))
    except FileExistsError:
        pass

    with open(build_index_path, "w+") as index_file:
        index_file.write(index_build_str)

    # scss #
    MAIN_SCSS_FILEPATH = os.path.join(SRC_DIR, "scss")
    sass.compile(dirname=(MAIN_SCSS_FILEPATH, BUILD_DIR), output_style="compressed")

    # js #
    # copy js dependencies
    try:  # noqa: TC101
        shutil.rmtree(os.path.join(BUILD_DIR, "js", "libs"))
    except FileNotFoundError:
        pass
    shutil.copytree(os.path.join(SRC_DIR, "js", "libs"), os.path.join(BUILD_DIR, "js", "libs"))

    # Run rollupjs
    rollup_cmd = ["rollup", "--config", "rollup.config.js"]
    print("cmd", rollup_cmd)
    subprocess.run(rollup_cmd)

    # images #
    # Copy src to dst. (cp src dst)
    shutil.rmtree(os.path.join(BUILD_DIR, "images"))
    shutil.copytree(os.path.join(SRC_DIR, "images"), os.path.join(BUILD_DIR, "images"))

    print("Build complete.")


if __name__ == "__main__":
    build()
