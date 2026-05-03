import json
import os

base_dir = r"C:\Users\viraj\Documents\Virajs Projects\n8n\LegalRag\Workshop\openhandsVersion"
r1_file = os.path.join(base_dir, "eval_results.json")
r2_file = os.path.join(base_dir, "reask_results.json")
r3_file = os.path.join(base_dir, "reask_simplified_results.json")

def load_json(path):
    if not os.path.exists(path): return {}
    with open(path, "r") as f:
        data = json.load(f)
        return {item["q_num"] if "q_num" in item else item.get("question_num", 0): item for item in data}

r1 = load_json(r1_file)
r2 = load_json(r2_file)
r3 = load_json(r3_file)

# Categorization Logic (Manual Verification based on content)
def classify(q_num, round_idx):
    # These are the questions that were NOT correct in Round 1
    # Q16, Q22, Q36, Q37, Q38, Q48, Q50
    if q_num not in [16, 22, 36, 37, 38, 48, 50]:
        return "Correct"
    
    # Q16 (Insufficient info)
    if q_num == 16:
        if round_idx == 1: return "Incorrect"
        return "Correct" # Fixed in Round 2
    
    # Q22 (KREAT pre-deposit)
    if q_num == 22:
        if round_idx <= 2: return "Partial" # Challan given instead of DD
        return "Correct" # Fixed in Round 3
    
    # Q36 (Defect timelines)
    if q_num == 36:
        if round_idx <= 2: return "Partial" # Only 30 days given
        return "Correct" # Both 30 & 90 days given in R3
        
    # Q37 (Refund 2020)
    if q_num == 37:
        return "Partial" # Always gives both 45 & 60 days
        
    # Q38 (Refund 2018)
    if q_num == 38:
        return "Partial" # Always gives both 45 & 60 days
        
    # Q48 (CDR consent)
    if q_num == 48:
        # In R1 it said 5 days (wrong) -> Partial
        # In R3 it said "doesn't specify" -> Partial
        return "Partial"
        
    # Q50 (Comparison)
    if q_num == 50:
        if round_idx <= 2: return "Incorrect" # Generic answer
        return "Correct" # Detailed comparison in R3
        
    return "Error"

# Build Transition Matrix
matrix = {
    "Correct": {"Correct": 0, "Partial": 0, "Incorrect": 0},
    "Partial": {"Correct": 0, "Partial": 0, "Incorrect": 0},
    "Incorrect": {"Correct": 0, "Partial": 0, "Incorrect": 0}
}

for q in range(1, 51):
    c1 = classify(q, 1)
    c3 = classify(q, 3)
    matrix[c1][c3] += 1

print(json.dumps(matrix, indent=2))

# Check Round 1 totals
r1_totals = {"Correct": 0, "Partial": 0, "Incorrect": 0}
for q in range(1, 51):
    r1_totals[classify(q, 1)] += 1
print(f"Round 1 Totals: {r1_totals}")

# Check Round 3 totals
r3_totals = {"Correct": 0, "Partial": 0, "Incorrect": 0}
for q in range(1, 51):
    r3_totals[classify(q, 3)] += 1
print(f"Round 3 Totals: {r3_totals}")
