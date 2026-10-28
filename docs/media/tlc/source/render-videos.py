#!/usr/bin/env python3
"""Rebuild the TLC portfolio videos from the included, unmodified slide PNGs.

Python 3 standard library only. Supply a local FFmpeg with libx264, or install
imageio-ffmpeg beside this script as described in VIDEO-REBUILD.md.
"""

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys


SOURCE = Path(__file__).resolve().parent
sys.path.insert(0, str(SOURCE / ".video-deps"))


def ffmpeg_path(explicit):
    if explicit:
        return explicit
    if os.environ.get("FFMPEG_BINARY"):
        return os.environ["FFMPEG_BINARY"]
    system = shutil.which("ffmpeg")
    if system:
        return system
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        raise SystemExit("FFmpeg is required. See VIDEO-REBUILD.md for local setup.")


def png_dimensions(path):
    with path.open("rb") as handle:
        header = handle.read(24)
    if header[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit("Not a PNG: " + str(path))
    return struct.unpack(">II", header[16:24])


def has_faststart(path):
    atoms = []
    with path.open("rb") as handle:
        size = path.stat().st_size
        while handle.tell() + 8 <= size:
            offset = handle.tell()
            length, kind = struct.unpack(">I4s", handle.read(8))
            if length == 1:
                length = struct.unpack(">Q", handle.read(8))[0]
            elif length == 0:
                length = size - offset
            if length < 8:
                return False
            atoms.append(kind)
            handle.seek(offset + length)
    return b"moov" in atoms and b"mdat" in atoms and atoms.index(b"moov") < atoms.index(b"mdat")


def render(ffmpeg, manifest, aspect, output, input_root):
    settings = manifest["variants"][aspect]
    width, height = settings["width"], settings["height"]
    fps = manifest["frames_per_second"]
    frames = round(manifest["seconds_per_card"] * fps)
    args = [ffmpeg, "-hide_banner", "-y"]
    filters = []
    labels = []
    for index, card in enumerate(manifest["cards"]):
        png = input_root / aspect / card["file"]
        if not png.exists():
            raise SystemExit("Missing slide: " + str(png))
        if png_dimensions(png) != (width, height):
            raise SystemExit("Unexpected dimensions: " + str(png))
        args.extend(["-i", str(png)])
        label = "v" + str(index)
        # Oversample before zoompan so a slow center zoom remains smooth.
        filters.append(
            f"[{index}:v]scale={width * 2}:{height * 2}:flags=lanczos,"
            f"zoompan=z='1+0.03*on/{frames - 1}':"
            "x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':"
            f"d={frames}:s={width}x{height}:fps={fps},"
            f"setsar=1,format=yuv420p[{label}]"
        )
        labels.append("[" + label + "]")
    filters.append("".join(labels) + f"concat=n={len(labels)}:v=1:a=0[outv]")
    output.mkdir(parents=True, exist_ok=True)
    destination = output / settings["filename"]
    args.extend([
        "-filter_complex", ";".join(filters), "-map", "[outv]", "-an",
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", str(fps),
        "-frames:v", str(frames * len(labels)),
        "-movflags", "+faststart", str(destination),
    ])
    print("Rendering", destination, flush=True)
    subprocess.run(args, check=True)
    return destination


def verify(ffmpeg, path, settings, fps):
    # FFmpeg reports the MP4 metadata even on systems with no ffprobe installed.
    result = subprocess.run(
        [ffmpeg, "-hide_banner", "-i", str(path), "-map", "0:v:0", "-c", "copy", "-f", "null", "-"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True,
    )
    report = result.stderr
    dimensions = f"{settings['width']}x{settings['height']}"
    if ("00:00:20.00" not in report or "h264" not in report
            or "yuv420p" not in report or dimensions not in report
            or f"{fps} fps" not in report
            or not re.search(r"frame=\s*600\b", report)
            or "Audio:" in report or not has_faststart(path)):
        raise SystemExit("Unexpected output metadata:\n" + report)
    summary = (
        f"PASS: 20.00 seconds; 600 frames; {fps} fps; {dimensions}; "
        "H.264; yuv420p; no audio stream; faststart moov atom before mdat.\n"
    )
    print(summary + report)
    return summary + report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", help="Path to an FFmpeg executable with libx264")
    parser.add_argument("--variant", choices=["all", "landscape", "portrait"], default="all")
    parser.add_argument("--input", type=Path, default=SOURCE / "video-slides")
    parser.add_argument("--output", type=Path, default=SOURCE.parent / "videos")
    args = parser.parse_args()
    manifest = json.loads((SOURCE / "video-timing.json").read_text())
    ffmpeg = ffmpeg_path(args.ffmpeg)
    selected = list(manifest["variants"]) if args.variant == "all" else [args.variant]
    reports = []
    for variant in selected:
        destination = render(ffmpeg, manifest, variant, args.output, args.input)
        reports.append(str(destination) + "\n" + verify(
            ffmpeg, destination, manifest["variants"][variant], manifest["frames_per_second"]
        ))
    (args.output / "video-verification.txt").write_text("\n\n".join(reports))


if __name__ == "__main__":
    main()
