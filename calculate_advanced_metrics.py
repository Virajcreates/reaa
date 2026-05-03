import json
import os

# Paths
base_dir = r"C:\Users\viraj\Documents\Virajs Projects\n8n\LegalRag\Workshop\openhandsVersion"
eval_file = os.path.join(base_dir, "eval_results.json")
reask_file = os.path.join(base_dir, "reask_results.json")
simplified_file = os.path.join(base_dir, "reask_simplified_results.json")

# Topic Mapping
topic_map = {
    "Fees & Charges": [1, 2, 3, 15, 19, 21, 30, 34, 41],
    "Registration & Deadlines": [4, 9, 12, 40, 42, 43],
    "RERA Bank Account": [5, 6, 7, 8, 33, 47, 49],
    "Penalties & Violations": [10, 11],
    "COVID-19 Measures": [13, 14, 35, 45, 46],
    "Conciliation (CDR Cell)": [16, 17, 18, 48],
    "Appeals (KREAT)": [20, 22, 44],
    "GST & Taxes": [23, 24, 25],
    "Sanction Plans & Ads": [26, 27],
    "Quarterly Updates": [28, 29],
    "Promoter Obligations": [31, 32],
    "Agreement for Sale": [36, 37, 38, 50],
    "Execution of Orders (SOP)": [39]
}

# Manual classifications of Round 1/2/3 results
# (Extracted from previous evaluation history)
def get_category(q_num, round_num):
    # Baseline for Round 1
    r1_correct = set(range(1, 51)) - {16, 22, 36, 37, 38, 48, 50}
    r1_partial = {22, 36, 37, 38, 48}
    r1_incorrect = {16, 50}
    
    # After Round 2
    r2_correct = r1_correct | {16}
    r2_partial = r1_partial
    r2_incorrect = {50}
    
    # After Round 3 (Final)
    r3_correct = r2_correct | {22, 36, 50}
    r3_partial = {37, 38, 48}
    r3_incorrect = set()
    
    if round_num == 1:
        if q_num in r1_correct: return "Correct"
        if q_num in r1_partial: return "Partial"
        return "Incorrect"
    if round_num == 3:
        if q_num in r3_correct: return "Correct"
        if q_num in r3_partial: return "Partial"
        return "Incorrect"
    return "Unknown"

# 1. Topic Breakdown (Final Results)
topic_stats = {}
for topic, q_nums in topic_map.items():
    stats = {"Correct": 0, "Partial": 0, "Incorrect": 0}
    for q in q_nums:
        cat = get_category(q, 3)
        stats[cat] += 1
    accuracy = (stats["Correct"] + stats["Partial"] * 0.5) / len(q_nums) * 100
    topic_stats[topic] = {"stats": stats, "accuracy": accuracy}

# 2. Transition Matrix (R1 vs R3)
# Rows = R1, Cols = R3
transition = {
    "Correct": {"Correct": 0, "Partial": 0, "Incorrect": 0},
    "Partial": {"Correct": 0, "Partial": 0, "Incorrect": 0},
    "Incorrect": {"Correct": 0, "Partial": 0, "Incorrect": 0}
}

for q in range(1, 51):
    r1 = get_category(q, 1)
    r3 = get_category(q, 3)
    transition[r1][r3] += 1

# Output metrics
results = {
    "topic_breakdown": topic_stats,
    "transition_matrix": transition
}

with open("advanced_metrics.json", "w") as f:
    json.dump(results, f, indent=2)

print("Advanced metrics calculated and saved to advanced_metrics.json")
