#!/usr/bin/env python3
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


DEFAULT_MODEL = Path.home() / ".agent-reach" / "models" / "ggml-base.bin"


def run(cmd, *, cwd=None, capture=True):
    return subprocess.run(
        cmd,
        cwd=cwd,
        check=True,
        text=True,
        capture_output=capture,
    )


def require_binary(name):
    path = shutil.which(name)
    if not path:
        raise SystemExit(f"missing required binary: {name}")
    return path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Download a Bilibili video's audio, transcribe it locally, and clean up temp files."
    )
    parser.add_argument("url", help="Bilibili video URL")
    parser.add_argument("--model", default=str(DEFAULT_MODEL), help="Path to a whisper.cpp GGML model")
    parser.add_argument("--lang", default="zh", help="Language hint for whisper-cli")
    parser.add_argument("--keep-temp", action="store_true", help="Keep the temporary working directory")
    return parser.parse_args()


def load_metadata(url):
    result = run(["yt-dlp", "--dump-single-json", "--skip-download", url])
    data = json.loads(result.stdout)
    return {
        "id": data.get("id"),
        "title": data.get("title"),
        "description": data.get("description"),
        "uploader": data.get("uploader"),
        "duration": data.get("duration"),
        "view_count": data.get("view_count"),
        "like_count": data.get("like_count"),
        "comment_count": data.get("comment_count"),
        "upload_date": data.get("upload_date"),
        "webpage_url": data.get("webpage_url") or url,
    }


def download_audio(url, workdir):
    output_template = str(workdir / "audio.%(ext)s")
    run(
        [
            "yt-dlp",
            "-f",
            "ba[ext=m4a]/ba",
            "-o",
            output_template,
            url,
        ],
        cwd=workdir,
    )
    matches = sorted(workdir.glob("audio.*"))
    if not matches:
        raise RuntimeError("audio download failed: no output file found")
    return matches[0]


def convert_to_wav(audio_path, wav_path):
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(audio_path),
            "-ar",
            "16000",
            "-ac",
            "1",
            str(wav_path),
        ]
    )


def transcribe(wav_path, model_path, lang, workdir):
    prefix = workdir / "transcript"
    run(
        [
            "whisper-cli",
            "-m",
            str(model_path),
            "-l",
            lang,
            "-f",
            str(wav_path),
            "-otxt",
            "-of",
            str(prefix),
        ]
    )
    transcript_path = prefix.with_suffix(".txt")
    if not transcript_path.exists():
        raise RuntimeError("transcription failed: transcript file not produced")
    return transcript_path.read_text(encoding="utf-8").strip()


def main():
    args = parse_args()

    require_binary("yt-dlp")
    require_binary("ffmpeg")
    require_binary("whisper-cli")

    model_path = Path(args.model).expanduser()
    if not model_path.exists():
        raise SystemExit(
            "missing whisper model: "
            f"{model_path}\n"
            "install example:\n"
            "  mkdir -p ~/.agent-reach/models\n"
            "  curl -L -o ~/.agent-reach/models/ggml-base.bin "
            "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin"
        )

    if args.keep_temp:
        tmp = Path(tempfile.mkdtemp(prefix="bilibili-video-reader-"))
        cleanup = False
    else:
        tmp_ctx = tempfile.TemporaryDirectory(prefix="bilibili-video-reader-")
        tmp = Path(tmp_ctx.name)
        cleanup = True

    try:
        metadata = load_metadata(args.url)
        audio_path = download_audio(args.url, tmp)
        wav_path = tmp / "audio.wav"
        convert_to_wav(audio_path, wav_path)
        transcript = transcribe(wav_path, model_path, args.lang, tmp)

        payload = {
            "metadata": metadata,
            "transcript": transcript,
            "temp_dir": None if cleanup else str(tmp),
            "cleanup": "automatic" if cleanup else "kept",
        }
        json.dump(payload, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
    finally:
        if cleanup:
            tmp_ctx.cleanup()


if __name__ == "__main__":
    main()
