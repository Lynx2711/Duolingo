import urllib.request, json

BASE = "http://localhost:8000"

def test_lesson(lesson_id, answers):
    req = urllib.request.Request(f"{BASE}/api/lessons/{lesson_id}/start/1", method="POST")
    with urllib.request.urlopen(req) as resp:
        att = json.loads(resp.read())
    print(f"\n--- TESTING LESSON {lesson_id} (Attempt #{att}) ---")

    for ex_id, payload in answers:
        payload["exercise_id"] = ex_id
        payload["attempt_id"] = att
        req_ex = urllib.request.Request(
            f"{BASE}/api/lessons/{lesson_id}/check-answer",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req_ex) as r:
            res = json.loads(r.read())
            is_corr = res.get("correct")
            mark = "[PASS] CORRECT" if is_corr else "[FAIL] INCORRECT"
            inp = payload.get("user_answer") or payload.get("user_pairs")
            print(f"Ex {ex_id}: Input='{inp}' -> {mark} | Server correct_answer: '{res.get('correct_answer')}'")

# Test Lesson 1
test_lesson(1, [
    (1, {"user_answer": "Hola"}),
    (2, {"user_answer": "Good morning"}),
    (3, {"user_answer": "Adios"}),
    (4, {"user_answer": "Buenas"}),
    (5, {"user_pairs": [["Hola", "Hello"], ["Adi\u00f3s", "Goodbye"], ["Gracias", "Thank you"], ["Por favor", "Please"]]})
])

# Test Lesson 2
test_lesson(2, [
    (1, {"user_answer": "Good afternoon"}),
    (2, {"user_answer": "Nice to meet you"}),
    (3, {"user_answer": "Buenos dias"}),
    (4, {"user_answer": "estas"}),
    (5, {"user_pairs": [["Buenos d\u00eda", "Good morning"], ["Buenas tardes", "Good afternoon"], ["Buenas noches", "Good night"], ["\u00bfC\u00f3mo est\u00e1s?", "How are you?"]]})
])
