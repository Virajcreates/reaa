import urllib.request
import json
import time

url = 'http://localhost:5678/webhook/1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b/chat'

# The 7 questions that were wrong or partially incorrect
questions = [
    {
        "num": 16,
        "question": "How many days does the opposite party have to convey consent for conciliation under the CDR Cell?",
        "expected": "The opposite party has to convey his/her consent for conciliation within seven days."
    },
    {
        "num": 22,
        "question": "How should the pre-deposit of 30% of the penalty be made when filing an appeal before KREAT?",
        "expected": 'It should be made by Demand Draft or Banker\'s Cheque payable at Bengaluru in favour of "The Registrar, Karnataka Real Estate Appellate Tribunal, Bengaluru", along with a memo mentioning the respective parties\' names and appeal number.'
    },
    {
        "num": 36,
        "question": "What is the defect liability period under the RERA Agreement for Sale?",
        "expected": "Under the 2020 Agreement for Sale Rules, any structural defect or other defect in workmanship, quality, or provision of services brought to the notice of the Promoter within 5 (five) years from the date of handing over possession must be rectified without further charge within 30 (thirty) days. Under the 2018 Revised Agreement, the Promoter must rectify defects within 90 days."
    },
    {
        "num": 37,
        "question": "Within how many days must a promoter refund money to an allottee upon cancellation under the 2020 Agreement for Sale?",
        "expected": "The promoter must return the balance amount (after deducting the booking amount) within 45 days of cancellation under the 2020 Agreement for Sale Rules."
    },
    {
        "num": 38,
        "question": "Within how many days must a promoter refund money upon cancellation under the 2018 Revised Agreement of Sale?",
        "expected": "The promoter must return the balance amount within 60 days of cancellation under the 2018 Revised Agreement of Sale."
    },
    {
        "num": 48,
        "question": "What is the procedure for filing a complaint through the K-RERA Conciliation and Dispute Resolution Cell?",
        "expected": "The party initiating conciliation files an online application which is automatically emailed to the opposite party. The opposite party must convey consent within 7 days. Upon consent, the first party pays Rs. 500 as fees. The matter is then referred to the appropriate CDR Cell, and parties are intimated of the date, time, and venue. If settlement is reached, a consent agreement is drawn and signed. The consensus agreement is binding on both parties."
    },
    {
        "num": 50,
        "question": "What are the key differences between the 2020 Agreement for Sale and the 2018 Revised Agreement of Sale?",
        "expected": 'Key differences include: (1) Refund timelines - the 2020 version prescribes 45 days for refunds while the 2018 version prescribes 60 days; (2) Defect rectification - the 2020 version requires 30 days while the 2018 version allows 90 days; (3) The 2018 version includes FAR (Floor Area Ratio) disclosure requirements for promoters in the Additional Constructions clause; (4) The 2018 version includes provisions for phased developments under Section 15.4; (5) The 2018 version explicitly addresses HUF-connected land scenarios under warranty clause (X); (6) The 2020 version specifically references the Karnataka Apartment Ownership Act, 1972 and the Karnataka Ownership Flats Act, 1972, while the 2018 version uses generic state law references.'
    }
]

def ask_n8n(question):
    # Use a NEW session ID so we don't get cached/context-influenced answers
    data = {"chatInput": question, "sessionId": "reask_session_002"}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    try:
        response = urllib.request.urlopen(req, timeout=60)
        res_body = response.read().decode('utf-8')
        res_json = json.loads(res_body)
        ai_res = res_json.get('message') or res_json.get('output') or res_json.get('text') or json.dumps(res_json)
        return ai_res
    except Exception as e:
        return f"Error: {e}"

results = []
for i, q in enumerate(questions):
    print(f"Re-asking Q{q['num']} ({i+1}/{len(questions)})...", flush=True)
    start = time.time()
    actual = ask_n8n(q['question'])
    duration = time.time() - start
    results.append({
        'q_num': q['num'],
        'question': q['question'],
        'expected': q['expected'],
        'actual': actual,
        'time': round(duration, 2)
    })
    with open('reask_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    time.sleep(1)

print("Done. Results saved to reask_results.json.", flush=True)
