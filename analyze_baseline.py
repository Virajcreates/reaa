import json
import os

base_dir = r"C:\Users\viraj\Documents\Virajs Projects\n8n\LegalRag\Workshop\openhandsVersion"
eval_file = os.path.join(base_dir, "eval_results.json")

with open(eval_file, "r") as f:
    r1_data = json.load(f)

# Hard-coded evaluation of Round 1 from early steps
# (I need to check why I thought 3 were incorrect initially)
# Q1-Q15 Correct. Q16 Incorrect (Insufficient info).
# Q17-Q21 Correct. Q22 Partial (Challan).
# Q23-Q35 Correct. Q36 Partial (Only 30 days).
# Q37 Partial, Q38 Partial.
# Q39-Q47 Correct. Q48 Partial (Can't determine 5/7).
# Q49 Correct. Q50 Incorrect (Generic).

# Let's count them:
# Incorrect: Q16, Q50 (Total 2)
# Partial: Q22, Q36, Q37, Q38, Q48 (Total 5)
# Correct: 50 - 2 - 5 = 43.

# Wait! My early report said 86% (43/50) but I said 3 Incorrect.
# If 3 Incorrect, then 4 Partial. (43 + 4 + 3 = 50)
# Let's see which one I classified as Incorrect instead of Partial.
# Q48 was "does not specify exact number of days" but it gave the binding agreement part.
# Q22 gave the Challan (partially correct technically, but wrong payment method).
# Q50 was VERY generic.

# Let's find out which 7 I re-asked initially.
# Re-ask list: Q16, Q22, Q36, Q37, Q38, Q48, Q50.
# That's 7 questions.
# 43 + 7 = 50.

# If I said 3 Incorrect and 4 Partial:
# Maybe Q22 was Incorrect? Or Q48?
# Let's look at my early Round 1 summary in Step Id 251 (or similar).
# Step 251: "RAG Evaluation - Round 1 (86% Strict Accuracy)"
# " ✅ 43 Fully Correct"
# " ⚠️ 4 Partially Correct (Q22, Q36, Q37, Q38)"
# " ❌ 3 Incorrect (Q16, Q48, Q50)"

# Ah! In Round 1, I classified Q48 as Incorrect because it missed the days.
# But in Round 3, I classified Q48 as Partial (it got the binding part right).
# AND I classified Q48 as Partial in Round 2.
# Wait, let's re-evaluate Q48.
# R1 Q48: "procedure for filing complaint" -> "Actual: Insufficient information available." (Wait, let me check eval_results.json for Q48)

# Checking Q48 in eval_results.json...
# 335: "actual": "The procedure for filing a complaint through the K-RERA Conciliation and Dispute Resolution Cell (KCDRC)... (6 steps given)"
# 335: "actual": "Upon receiving the online application, the other party is required to convey their consent for conciliation within five (05) days..." (Wait, it says 5 days! Expected is 7 days).
# So in R1, it gave a wrong day (5 instead of 7) but got the rest of the procedure. 
# So it was PARTIAL.

# Let me check Q16 in eval_results.json.
# 111: "actual": "Insufficient information available." -> INCORRECT.

# Let me check Q50 in eval_results.json.
# 349: "actual": "The Karnataka Real Estate (Regulation and Development) (Agreement for Sale) Rules, 2020... Rule 8A... formats... allottee rights..."
# It missed 5 out of 6 comparison points. So it was Incorrect or very weak Partial.

# Okay, let's re-run the transition script with a STABILIZED categorization.
