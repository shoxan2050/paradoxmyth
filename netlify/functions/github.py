import subprocess
import sys

REPO_PATH = r"C:\Users\user\.gemini\antigravity\scratch\edu-platform"

def run(cmd):
    print(f"> {cmd}")
    result = subprocess.run(
        cmd,
        shell=True,
        cwd=REPO_PATH
    )
    if result.returncode != 0:
        print("❌ Xato yuz berdi, jarayon to‘xtadi")
        sys.exit(1)

# 1. Git indexdan hammasini o‘chirish (fayllar joyida qoladi)
run("git rm -r --cached .")

# 2. Hammasini qayta qo‘shish
run("git add .")

# 3. Commit
run('git commit -m "force reupload all files"')

# 4. Force push
run("git push -f origin main")

print("🔥 Hammasi majburan qayta yuklandi")
