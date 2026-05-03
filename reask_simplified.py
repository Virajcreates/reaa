import urllib.request
import json
import time

url = 'http://localhost:5678/webhook/1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b/chat'

# Remaining 6 questions, rephrased to be simpler/more specific
questions = [
    {
        "num": 22,
        "original_question": "How should the pre-deposit of 30% of the penalty be made when filing an appeal before KREAT?",
        "simplified_question": "When filing an appeal before KREAT, should the 30% pre-deposit of penalty be paid by Demand Draft or Banker's Cheque? In whose favour should it be made?",
        "expected": 'It should be made by Demand Draft or Banker\'s Cheque payable at Bengaluru in favour of "The Registrar, Karnataka Real Estate Appellate Tribunal, Bengaluru", along with a memo mentioning the respective parties\' names and appeal number.'
    },
    {
        "num": 36,
        "original_question": "What is the defect liability period under the RERA Agreement for Sale?",
        "simplified_question": "Compare the defect rectification timelines: Under the 2020 Agreement for Sale Rules, within how many days must a promoter rectify defects? And under the 2018 Revised Agreement of Sale, within how many days must defects be rectified?",
        "expected": "Under the 2020 Agreement for Sale Rules, any structural defect or other defect in workmanship, quality, or provision of services brought to the notice of the Promoter within 5 (five) years from the date of handing over possession must be rectified without further charge within 30 (thirty) days. Under the 2018 Revised Agreement, the Promoter must rectify defects within 90 days."
    },
    {
        "num": 37,
        "original_question": "Within how many days must a promoter refund money to an allottee upon cancellation under the 2020 Agreement for Sale?",
        "simplified_question": "Under the 2020 Agreement for Sale Rules (Annexure-A), when an allottee cancels without fault of the promoter, within how many days must the promoter return the balance amount after deducting the booking amount?",
        "expected": "The promoter must return the balance amount (after deducting the booking amount) within 45 days of cancellation under the 2020 Agreement for Sale Rules."
    },
    {
        "num": 38,
        "original_question": "Within how many days must a promoter refund money upon cancellation under the 2018 Revised Agreement of Sale?",
        "simplified_question": "Under the 2018 Revised Agreement of Sale dated 09-05-2018, when an allottee cancels without any fault of the promoter, within how many days must the promoter return the balance amount to the allottee?",
        "expected": "The promoter must return the balance amount within 60 days of cancellation under the 2018 Revised Agreement of Sale."
    },
    {
        "num": 48,
        "original_question": "What is the procedure for filing a complaint through the K-RERA Conciliation and Dispute Resolution Cell?",
        "simplified_question": "In the K-RERA CDR Cell conciliation process, after the online application is emailed to the opposite party, how many days does the opposite party have to convey consent? Is it 5 days or 7 days? Also, is the consensus agreement binding on both parties?",
        "expected": "The party initiating conciliation files an online application which is automatically emailed to the opposite party. The opposite party must convey consent within 7 days. Upon consent, the first party pays Rs. 500 as fees. The matter is then referred to the appropriate CDR Cell, and parties are intimated of the date, time, and venue. If settlement is reached, a consent agreement is drawn and signed. The consensus agreement is binding on both parties."
    },
    {
        "num": 50,
        "original_question": "What are the key differences between the 2020 Agreement for Sale and the 2018 Revised Agreement of Sale?",
        "simplified_question": "List the specific differences between the 2020 Agreement for Sale (Annexure-A) and the 2018 Revised Agreement of Sale regarding: (1) refund timelines in days upon cancellation, (2) defect rectification timelines in days, (3) FAR disclosure requirements, (4) phased development provisions, (5) HUF-connected land scenarios, and (6) references to Karnataka state-specific Acts.",
        "expected": 'Key differences include: (1) Refund timelines - the 2020 version prescribes 45 days for refunds while the 2018 version prescribes 60 days; (2) Defect rectification - the 2020 version requires 30 days while the 2018 version allows 90 days; (3) The 2018 version includes FAR (Floor Area Ratio) disclosure requirements for promoters in the Additional Constructions clause; (4) The 2018 version includes provisions for phased developments under Section 15.4; (5) The 2018 version explicitly addresses HUF-connected land scenarios under warranty clause (X); (6) The 2020 version specifically references the Karnataka Apartment Ownership Act, 1972 and the Karnataka Ownership Flats Act, 1972, while the 2018 version uses generic state law references.'
    }
]

def ask_n8n(question):
    data = {"chatInput": question, "sessionId": "reask_easy_session_003"}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    try:
        response = urllib.request.urlopen(req, timeout=90)
        res_body = response.read().decode('utf-8')
        res_json = json.loads(res_body)
        ai_res = res_json.get('message') or res_json.get('output') or res_json.get('text') or json.dumps(res_json)
        return ai_res
    except Exception as e:
        return f"Error: {e}"

results = []
for i, q in enumerate(questions):
    print(f"Re-asking Q{q['num']} ({i+1}/{len(questions)}) with simplified question...", flush=True)
    start = time.time()
    actual = ask_n8n(q['simplified_question'])
    duration = time.time() - start
    results.append({
        'q_num': q['num'],
        'original_question': q['original_question'],
        'simplified_question': q['simplified_question'],
        'expected': q['expected'],
        'actual': actual,
        'time': round(duration, 2)
    })
    with open('reask_simplified_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    time.sleep(1)

print("Done. Results saved to reask_simplified_results.json.", flush=True)
