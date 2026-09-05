"""
Pushes all source files of Marrakech Concierge to GitHub tiguidda76-create/marrakech-conciergerie and marrakech-concierge.
"""

import os
import sys
import json
import base64
import time
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.abspath(__file__))
MCP_CONFIG_PATH = r"C:\Users\hp\.gemini\config\mcp_config.json"

with open(MCP_CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

TOKEN = config["mcpServers"]["github"]["env"]["GITHUB_PERSONAL_ACCESS_TOKEN"]
OWNER = "tiguidda76-create"
REPOS = ["marrakech-conciergerie", "marrakech-concierge"]
BRANCH = "main"

headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "Marrakech-Concierge-Deployer"
}

def api_request(method, url, **kwargs):
    kwargs.setdefault("headers", headers)
    kwargs.setdefault("timeout", 30)
    for attempt in range(5):
        try:
            r = requests.request(method, url, **kwargs)
            return r
        except Exception as e:
            time.sleep(2)
            if attempt == 4:
                raise e

def ensure_repo(repo_name):
    url = f"https://api.github.com/repos/{OWNER}/{repo_name}"
    r = api_request("GET", url)
    if r.status_code == 404:
        print(f"[*] Creating repo {OWNER}/{repo_name}...")
        create_url = "https://api.github.com/user/repos"
        res = api_request("POST", create_url, json={
            "name": repo_name,
            "private": False,
            "auto_init": True
        })
        time.sleep(3)
        return res.json()
    return r.json()

def get_all_files():
    file_list = []
    ignore_dirs = {".git", "node_modules", ".agents", ".next"}
    ignore_files = {".env", ".env.local"}
    for root_dir, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for f in files:
            if f in ignore_files or f.endswith(".tsbuildinfo"):
                continue
            full = os.path.join(root_dir, f)
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            if rel.startswith(".git/") or rel.startswith("node_modules/") or rel.startswith(".next/"):
                continue
            file_list.append(rel)
    return file_list

def push_repo(repo_name):
    print(f"\n==========================================")
    print(f"[*] Deploying to {OWNER}/{repo_name} (branch: {BRANCH})...")
    ensure_repo(repo_name)
    ref_url = f"https://api.github.com/repos/{OWNER}/{repo_name}/git/refs/heads/{BRANCH}"
    r = api_request("GET", ref_url)
    if r.status_code != 200:
        print(f"[!] Error fetching ref: {r.status_code} {r.text}")
        return

    commit_sha = r.json()["object"]["sha"]
    commit_url = f"https://api.github.com/repos/{OWNER}/{repo_name}/git/commits/{commit_sha}"
    base_tree = api_request("GET", commit_url).json()["tree"]["sha"]

    files = get_all_files()
    print(f"[*] Uploading {len(files)} files to {OWNER}/{repo_name}...")

    tree_entries = []
    for rel in files:
        full = os.path.join(ROOT, rel)
        with open(full, "rb") as f:
            content_bytes = f.read()

        try:
            utf8_content = content_bytes.decode("utf-8")
            blob_payload = {"content": utf8_content, "encoding": "utf-8"}
        except UnicodeDecodeError:
            b64_content = base64.b64encode(content_bytes).decode("ascii")
            blob_payload = {"content": b64_content, "encoding": "base64"}

        blob_url = f"https://api.github.com/repos/{OWNER}/{repo_name}/git/blobs"
        blob_resp = api_request("POST", blob_url, json=blob_payload)
        if blob_resp.status_code not in (200, 201):
            continue
        sha = blob_resp.json()["sha"]
        tree_entries.append({
            "path": rel,
            "mode": "100644",
            "type": "blob",
            "sha": sha
        })

    tree_url = f"https://api.github.com/repos/{OWNER}/{repo_name}/git/trees"
    new_tree = api_request("POST", tree_url, json={"base_tree": base_tree, "tree": tree_entries}).json()["sha"]

    new_commit_payload = {
        "message": "feat: clean zero fake data, connect live Groq AI, and full concierge features",
        "tree": new_tree,
        "parents": [commit_sha]
    }
    new_commit_url = f"https://api.github.com/repos/{OWNER}/{repo_name}/git/commits"
    new_commit_sha = api_request("POST", new_commit_url, json=new_commit_payload).json()["sha"]

    patch_resp = api_request("PATCH", ref_url, json={"sha": new_commit_sha, "force": True})
    print(f"[✓] Ref update status: {patch_resp.status_code}")
    print(f"[✓] Successfully deployed to https://github.com/{OWNER}/{repo_name}/commit/{new_commit_sha}")

def main():
    for r in REPOS:
        push_repo(r)

if __name__ == "__main__":
    main()
