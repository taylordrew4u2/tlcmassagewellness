# Rebuild the portfolio videos

Both videos are intentionally silent. Five four-second cards form a 20-second showcase. Each card uses a restrained center zoom from 100% to 103%; simple cuts keep the text legible. Landscape is 1920 × 1080 and vertical is 1080 × 1920, both at 30 fps.

The exact input PNGs are included in `video-slides/landscape/` and `video-slides/portrait/`. Keep their numbered filenames. `video-timing.json` records the timing and encoding settings.

## Requirements

- Python 3
- FFmpeg compiled with `libx264`

The script uses only the Python standard library. If FFmpeg is installed and on your path, run this command from the extracted media kit:

```sh
python3 source/render-videos.py
```

If FFmpeg is not installed, install a bundled binary into this source folder, without changing system packages:

```sh
python3 -m pip install --target source/.video-deps imageio-ffmpeg
python3 source/render-videos.py
```

Or supply an existing binary:

```sh
python3 source/render-videos.py --ffmpeg /absolute/path/to/ffmpeg
```

Use `--variant landscape` or `--variant portrait` to render one version. Use `--output /absolute/path/to/folder` to change the destination. Defaults resolve relative to the script, so it can be run from any working directory after extracting the kit.

Outputs use H.264, `yuv420p`, a constant rate factor of 18 and the slow encoder preset. Faststart metadata supports progressive playback. The script checks FFmpeg's metadata after export and saves `video-verification.txt` beside the videos.

The bundled source PNGs are designed cards, not editable text layers. The other media-kit sources document the layouts and assets used to produce them.
