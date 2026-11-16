#!/usr/bin/env python3
"""Verify JIN2 runtime data, or reconstruct it from the pinned public source.

Default: stdlib-only checksum verification.
Rebuild: needs NumPy; uses --source CHECKOUT or clones to a temporary directory.
The source checkout stays outside the destination repository.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile
import zlib

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'jin2-data-manifest.json').read_text())


def digest(data):
    return hashlib.sha256(data).hexdigest()


def verify(target):
    for item in MANIFEST['files']:
        path = target / item['path']
        data = path.read_bytes()
        if len(data) != item['bytes'] or digest(data) != item['sha256']:
            raise RuntimeError(f'Byte count or SHA-256 mismatch: {item["path"]}')
    raw = gzip.decompress((target / 'catknight_frames.bin.gz').read_bytes())
    meta = MANIFEST['gzip']
    if len(raw) != meta['expanded_bytes'] or digest(raw) != meta['expanded_sha256']:
        raise RuntimeError('Cat Knight expanded data does not match.')
    if struct.unpack('<4s5I', raw[:24]) != (b'J2CK', 1, 600, 87, 154, 30):
        raise RuntimeError('Invalid Cat Knight header.')
    print(f'PASS: {len(MANIFEST["files"])} files match SHA-256 and byte counts.')
    print(f'Expanded Cat Knight: {len(raw)} bytes, SHA-256 {digest(raw)}')


def rebuild(source, target):
    import numpy as np

    revision = subprocess.check_output(
        ['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True
    ).strip()
    if revision != MANIFEST['source']['commit']:
        raise RuntimeError('Source checkout must be at ' + MANIFEST['source']['commit'])
    if source.resolve() == target.resolve() or target.resolve() in source.resolve().parents:
        raise RuntimeError('Keep the upstream checkout outside the destination repo.')
    sprites = source / 'GOOD-LUCK' / 'sprites'
    destination = target / 'jin2' / 'goodluck-sprites'
    destination.mkdir(parents=True, exist_ok=True)
    for item in MANIFEST['files']:
        if item['path'].startswith('jin2/goodluck-sprites/'):
            shutil.copyfile(sprites / Path(item['path']).name, target / item['path'])

    # The exact planes/metadata conversion supplied in task 1.
    d = np.load(source / 'CAT-KNIGHT' / 'cat_knight_frames.npz')
    char = d['char'].astype(np.uint8)
    lum = np.clip(np.round(d['lum'].astype(np.float32) * 255), 0, 255).astype(np.uint8)
    tag = d['tag'].astype(np.uint8)
    colors = d['colors'].astype('<f4')
    zoom = d['zoom'].astype('<f4')
    wind = d['wind'].astype('<f4')
    frames, rows, cols = char.shape
    parts = [b'J2CK' + struct.pack('<5I', 1, frames, rows, cols, 30),
             colors.tobytes(), zoom.tobytes(), wind.tobytes()]
    for i in range(frames):
        parts += [char[i].tobytes(), lum[i].tobytes(), tag[i].tobytes()]
    raw = b''.join(parts)
    if digest(raw) != MANIFEST['gzip']['expanded_sha256']:
        raise RuntimeError('Converted ASCII data differs from the original conversion.')
    meta = MANIFEST['gzip']
    # Freeze the original gzip filename and mtime to reproduce its header as well.
    with (target / 'catknight_frames.bin.gz').open('wb') as output:
        with gzip.GzipFile(filename=meta['filename'], mode='wb', fileobj=output,
                           compresslevel=meta['compresslevel'], mtime=meta['mtime']) as stream:
            stream.write(raw)
    if zlib.ZLIB_VERSION != meta['zlib_version']:
        print('Note: deflate bytes can vary by zlib version; original used zlib '
              + meta['zlib_version'] + '. Expanded data already verified.')
    verify(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rebuild', action='store_true')
    parser.add_argument('--source', type=Path, help='Existing pinned upstream checkout outside the repo')
    parser.add_argument('--target-dir', type=Path, default=ROOT)
    args = parser.parse_args()
    if not args.rebuild:
        verify(args.target_dir)
        return
    if args.source:
        rebuild(args.source, args.target_dir)
        return
    with tempfile.TemporaryDirectory(prefix='jin2-source-') as temporary:
        source = Path(temporary) / 'upstream'
        subprocess.run(['git', 'clone', '--depth', '1', MANIFEST['source']['url'], str(source)], check=True)
        revision = MANIFEST['source']['commit']
        subprocess.run(['git', '-C', str(source), 'fetch', '--depth', '1', 'origin', revision], check=True)
        subprocess.run(['git', '-C', str(source), 'checkout', '--detach', revision], check=True)
        rebuild(source, args.target_dir)


if __name__ == '__main__':
    main()
