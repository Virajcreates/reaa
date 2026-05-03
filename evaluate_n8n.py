import urllib.request
import json
import re
import time
import os

url = 'http://localhost:5678/webhook/1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b/chat'

def parse_test_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    
    # regex to match Q and A blocks
    q_pattern = re.compile(r'Q(\d+):\s*(.*?)\nA(\d+):\s*(.*?)(?=\nQ\d+:|\Z)', re.DOTALL)
    
    for match in q_pattern.finditer(content):
        q_num = match.group(1)
        question = match.group(2).strip()
        expected = match.group(4).strip()
        questions.append({
            'num': int(q_num),
            'question': question,
            'expected': expected
        })
    return questions

def ask_n8n(question):
    data = {"chatInput": question, "sessionId": "eval_session_001"}
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
    req.add_header('Content-Type', 'application/json')
    try:
        response = urllib.request.urlopen(req, timeout=60)
        res_body = response.read().decode('utf-8')
        res_json = json.loads(res_body)
        
        # Check if response has the message/output
        ai_res = res_json.get('message') or res_json.get('output') or res_json.get('text') or json.dumps(res_json)
        return ai_res
    except Exception as e:
        return f"Error: {e}"

def main():
    filepath = 'TEST.txt'
    questions = parse_test_file(filepath)
    print(f"Parsed {len(questions)} questions.")
    
    results = []
    for i, q in enumerate(questions):
        print(f"Asking Q{q['num']} ({i+1}/{len(questions)})...", flush=True)
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
        
        # Write intermediate results just in case
        with open('eval_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
            
        time.sleep(1) # small delay to avoid overwhelming webhook

    # Final write
    with open('eval_results.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
        
    print("Done. Results saved to eval_results.json.", flush=True)

if __name__ == '__main__':
    main()
