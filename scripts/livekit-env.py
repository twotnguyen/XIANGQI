#!/usr/bin/env python3
"""Prepare private LiveKit credentials and switch only the three media variables."""
import argparse
import ipaddress
import json
import os
from pathlib import Path
import re
import secrets
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / '.local/livekit'
KEYS = ('LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET')


def private_write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as out:
            out.write(content)
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def media_values(body):
    result = {}
    for key in KEYS:
        matches = re.findall(r'^' + key + r'=(.*)$', body, re.M)
        if len(matches) != 1:
            raise ValueError('Missing or duplicate variable: ' + key)
        value = matches[0].strip()
        if value.startswith('"'):
            value = json.loads(value)
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1]
        if not value or '\n' in value:
            raise ValueError('Empty/invalid variable: ' + key)
        result[key] = value
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['prepare', 'local', 'cloud'])
    parser.add_argument('--host', default='127.0.0.1', help='IPv4 of Docker host; default same-machine only')
    parser.add_argument('--url', help='For LAN, a trusted wss:// endpoint proxying port 7880')
    args = parser.parse_args()
    body = (ROOT / '.env').read_text()
    active = media_values(body)
    PRIVATE.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(PRIVATE, 0o700)
    cloud_file = PRIVATE / 'cloud.json'
    local_file = PRIVATE / 'local.json'

    if args.action == 'prepare':
        host = str(ipaddress.IPv4Address(args.host))
        if host == '0.0.0.0':
            raise ValueError('--host must be a reachable address, not 0.0.0.0')
        if host != '127.0.0.1' and not (args.url or '').startswith('wss://'):
            raise ValueError('LAN requires --url wss://... and a trusted TLS proxy; see guide')
        if not cloud_file.exists():
            if not active['LIVEKIT_URL'].startswith('wss://'):
                raise ValueError('Prepare first while .env contains the Cloud configuration')
            private_write(cloud_file, json.dumps(active, indent=2) + '\n')
        if local_file.exists():
            local = json.loads(local_file.read_text())
        else:
            local = dict(zip(KEYS, ['ws://localhost:7880', 'local_' + secrets.token_hex(8), secrets.token_hex(32)]))
        local['LIVEKIT_URL'] = args.url or 'ws://localhost:7880'
        private_write(local_file, json.dumps(local, indent=2) + '\n')
        # JSON is valid YAML; writing it avoids interpolating secrets in Compose.
        config = {
            'port': 7880, 'bind_addresses': ['0.0.0.0'],
            'rtc': {'tcp_port': 7881, 'udp_port': 7882,
                    'use_external_ip': False, 'node_ip': host,
                    'enable_loopback_candidate': host == '127.0.0.1'},
            'keys': {local['LIVEKIT_API_KEY']: local['LIVEKIT_API_SECRET']},
            'logging': {'level': 'info'},
        }
        private_write(PRIVATE / 'livekit.yaml', json.dumps(config, indent=2) + '\n')
        private_write(PRIVATE / 'docker.env', 'LIVEKIT_BIND_IP=' + host + '\n')
        print('Prepared private local configuration; active .env and Cloud keys unchanged.')
        return

    target_file = local_file if args.action == 'local' else cloud_file
    if not target_file.exists():
        raise ValueError('Run prepare first')
    target = json.loads(target_file.read_text())
    if args.action == 'local' and active != json.loads(local_file.read_text()):
        # Preserve the latest Cloud keys before leaving Cloud, including rotations.
        if active['LIVEKIT_URL'].startswith('wss://') and '.livekit.cloud' in active['LIVEKIT_URL']:
            private_write(cloud_file, json.dumps(active, indent=2) + '\n')
        elif active != json.loads(cloud_file.read_text()):
            raise ValueError('Active media values are unknown; reconcile private profiles first')
    for key in KEYS:
        value = target[key]
        if not isinstance(value, str) or not value or '\n' in value:
            raise ValueError('Invalid profile variable: ' + key)
        body = re.sub(r'^' + key + r'=.*$', lambda _: key + '=' + json.dumps(value), body, flags=re.M)
    for path in [ROOT / '.env', ROOT / 'apps/web/.env', ROOT / 'apps/server/.env']:
        private_write(path, body)
    print('Selected ' + args.action + '; all three private .env files synchronized. Restart app processes.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError) as error:
        # Avoid echoing file contents, credentials, or connection URLs in errors.
        print('Configuration failed (' + type(error).__name__ + '). Check private files and arguments.', file=sys.stderr)
        sys.exit(1)
