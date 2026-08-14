import subprocess, json, sys

BASE = "http://localhost:8000"

def curl(method, path, data=None):
    cmd = ["curl.exe", "-s", "-X", method, BASE + path, "-H", "Content-Type: application/json"]
    if data:
        cmd += ["-d", json.dumps(data)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(result.stdout)
    except Exception:
        return result.stdout

# STEP 1: Get fresh user XP before the test
user_before = curl("GET", "/api/users/1")
print(f"\n[BEFORE] user xp_total={user_before.get('xp_total')}, hearts={user_before.get('hearts')}")

# STEP 2: Start lesson → get attempt_id
attempt_id = curl("POST", "/api/lessons/1/start/1")
print(f"\n[STEP 1] /start -> attempt_id={attempt_id}")
assert isinstance(attempt_id, int), f"Expected int, got {attempt_id}"

# STEP 3: Submit 1 CORRECT answer (exercise 1 = multiple_choice, answer "Hola")
r = curl("POST", "/api/lessons/1/check-answer", {
    "exercise_id": 1, "attempt_id": attempt_id, "user_answer": "Hola"
})
print(f"[STEP 2] correct answer -> {r}")
assert r.get("correct") == True, "Expected correct=True"
assert r.get("xp_earned") == 10, "Expected xp_earned=10"

# STEP 4: Submit 1 WRONG answer (exercise 2, wrong text)
r2 = curl("POST", "/api/lessons/1/check-answer", {
    "exercise_id": 2, "attempt_id": attempt_id, "user_answer": "DEFINITELY WRONG"
})
print(f"[STEP 3] wrong answer -> {r2}")
assert r2.get("correct") == False, "Expected correct=False"
assert r2.get("xp_earned") == 0, "Expected xp_earned=0"

# STEP 5: EXPLOIT ATTEMPT — send xp_earned=99999. Server must ignore it.
# Expected: xp_earned in response = 10 (1 correct * 10), hearts_lost = 1
exploit_body = {"attempt_id": attempt_id, "xp_earned": 99999, "hearts_lost": 0, "passed": True}
result = curl("POST", "/api/lessons/1/complete/1", exploit_body)
print(f"\n[STEP 4] /complete (exploit attempt) -> {result}")

if isinstance(result, dict) and "xp_earned" in result:
    print(f"\n{'='*60}")
    print(f"SECURITY RESULT:")
    print(f"  xp_earned in response  = {result['xp_earned']}  (expected 10, not 99999)")
    print(f"  hearts_lost in response = {result['hearts_lost']} (expected 1)")
    print(f"  passed                  = {result['passed']}")
    print(f"  new_xp_total            = {result['new_xp_total']}")
    if result["xp_earned"] == 99999:
        print("  [FAIL] EXPLOIT SUCCEEDED -- server trusted client values! Fix failed.")
        sys.exit(1)
    elif result["xp_earned"] == 10:
        print("  [PASS] EXPLOIT BLOCKED -- server ignored xp_earned:99999, used 10 (server-computed).")
    else:
        print("  [WARN] Unexpected xp_earned={result['xp_earned']}")
else:
    print(f"  Unexpected response: {result}")

# STEP 6: Verify user XP increment
user_after = curl("GET", "/api/users/1")
xp_diff = user_after.get("xp_total", 0) - user_before.get("xp_total", 0)
print(f"\n[AFTER] user xp_total={user_after.get('xp_total')}, hearts={user_after.get('hearts')}")
print(f"  XP delta = {xp_diff} (expected 10)")

# STEP 7: Replay attack — try to complete the same attempt again
replay = curl("POST", "/api/lessons/1/complete/1", {"attempt_id": attempt_id})
print(f"\n[STEP 5] Replay attempt -> {replay}")
if isinstance(replay, dict) and replay.get("detail"):
    print("  [PASS] REPLAY BLOCKED -- server rejected already-completed attempt.")
else:
    print("  [FAIL] REPLAY SUCCEEDED -- double-completion not prevented!")
