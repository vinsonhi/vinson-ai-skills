#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / ".runtime" / "android"
PACKAGE = "com.xingin.xhs"


def run(cmd, check=True, capture_output=True, text=True):
    return subprocess.run(cmd, check=check, capture_output=capture_output, text=text)


def adb_base(serial=None):
    base = ["adb"]
    if serial:
      base += ["-s", serial]
    return base


def adb(serial, *args, check=True, capture_output=True, text=True):
    return run(adb_base(serial) + list(args), check=check, capture_output=capture_output, text=text)


def ensure_runtime():
    RUNTIME.mkdir(parents=True, exist_ok=True)


def connected_devices():
    result = run(["adb", "devices"], check=True)
    lines = result.stdout.strip().splitlines()[1:]
    devices = []
    for line in lines:
        if not line.strip():
            continue
        serial, status = line.split("\t", 1)
        devices.append({"serial": serial.strip(), "status": status.strip()})
    return devices


def detect_serial(explicit_serial=None):
    if explicit_serial:
        return explicit_serial
    devices = [item for item in connected_devices() if item["status"] == "device"]
    if len(devices) == 1:
        return devices[0]["serial"]
    if not devices:
        raise SystemExit("No adb device detected.")
    raise SystemExit("Multiple adb devices detected. Pass --serial.")


def shell(serial, *args):
    return adb(serial, "shell", *args)


def launch_xhs(serial):
    shell(serial, "monkey", "-p", PACKAGE, "-c", "android.intent.category.LAUNCHER", "1")


def input_text(serial, text):
    safe = text.replace(" ", "%s")
    shell(serial, "input", "text", safe)


def tap(serial, x, y):
    shell(serial, "input", "tap", str(x), str(y))


def swipe(serial, x1, y1, x2, y2, duration_ms):
    shell(serial, "input", "swipe", str(x1), str(y1), str(x2), str(y2), str(duration_ms))


def screencap(serial, output_path):
    remote = "/sdcard/xhs-capture.png"
    adb(serial, "shell", "screencap", "-p", remote)
    adb(serial, "pull", remote, str(output_path))
    adb(serial, "shell", "rm", remote)


def uidump(serial, output_path):
    remote = "/sdcard/window_dump.xml"
    adb(serial, "shell", "uiautomator", "dump", remote)
    adb(serial, "pull", remote, str(output_path))
    adb(serial, "shell", "rm", remote)


def current_app(serial):
    result = shell(serial, "dumpsys", "window", "windows")
    for line in result.stdout.splitlines():
        if "mCurrentFocus" in line or "mFocusedApp" in line:
            return line.strip()
    return ""


def snapshot(serial, label):
    ensure_runtime()
    ts = time.strftime("%Y%m%d-%H%M%S")
    target = RUNTIME / f"{ts}-{label}"
    target.mkdir(parents=True, exist_ok=True)
    screenshot = target / "screen.png"
    xml = target / "window_dump.xml"
    screencap(serial, screenshot)
    uidump(serial, xml)
    meta = {
        "serial": serial,
        "label": label,
        "current_app": current_app(serial),
        "screenshot": str(screenshot),
        "xml": str(xml),
    }
    (target / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(str(target))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--serial")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("devices")
    sub.add_parser("launch")

    snap = sub.add_parser("snapshot")
    snap.add_argument("--label", default="manual")

    text = sub.add_parser("text")
    text.add_argument("value")

    tap_cmd = sub.add_parser("tap")
    tap_cmd.add_argument("x", type=int)
    tap_cmd.add_argument("y", type=int)

    swipe_cmd = sub.add_parser("swipe")
    swipe_cmd.add_argument("x1", type=int)
    swipe_cmd.add_argument("y1", type=int)
    swipe_cmd.add_argument("x2", type=int)
    swipe_cmd.add_argument("y2", type=int)
    swipe_cmd.add_argument("--duration-ms", type=int, default=300)

    args = parser.parse_args()

    if args.command == "devices":
        print(json.dumps(connected_devices(), ensure_ascii=False, indent=2))
        return

    serial = detect_serial(args.serial)

    if args.command == "launch":
        launch_xhs(serial)
        return
    if args.command == "snapshot":
        snapshot(serial, args.label)
        return
    if args.command == "text":
        input_text(serial, args.value)
        return
    if args.command == "tap":
        tap(serial, args.x, args.y)
        return
    if args.command == "swipe":
        swipe(serial, args.x1, args.y1, args.x2, args.y2, args.duration_ms)
        return

    raise SystemExit(f"Unknown command: {args.command}")


if __name__ == "__main__":
    main()
