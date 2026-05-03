from PIL import Image, ImageDraw, ImageFont
import os

output_dir = r"c:\Users\viraj\Documents\Virajs Projects\n8n\LegalRag\Workshop\openhandsVersion\RAG_Posters"

color_bg = (179, 198, 214) 
color_card = (255, 255, 255)
color_text = (0, 0, 0)
color_heading = (43, 58, 103)

try:
    font_path_bold = "C:/Windows/Fonts/arialbd.ttf"
    font_path_reg = "C:/Windows/Fonts/arial.ttf"
    f_h1 = ImageFont.truetype(font_path_bold, 48)
    f_h2 = ImageFont.truetype(font_path_bold, 36)
    f_body = ImageFont.truetype(font_path_reg, 28)
    f_body_bold = ImageFont.truetype(font_path_bold, 28)
    
    f_table_body = ImageFont.truetype(font_path_reg, 24)
    f_table_bold = ImageFont.truetype(font_path_bold, 24)
    f_diag_title = ImageFont.truetype(font_path_bold, 20)
    f_diag = ImageFont.truetype(font_path_bold, 18)
except:
    f_h1 = f_h2 = f_body = f_body_bold = f_table_body = f_table_bold = f_diag_title = f_diag = ImageFont.load_default()

def wrap_text(draw, text, font, max_width):
    # Splits by space but ignores newlines
    lines = []
    words = text.split(' ')
    current_line = []
    for word in words:
        if not word: continue
        current_line.append(word)
        # Using simple width check
        w = draw.textbbox((0, 0), " ".join(current_line), font=font)[2]
        if w > max_width:
            current_line.pop()
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines

def draw_bullet_points(draw, points, start_pos, max_width):
    x, y = start_pos
    for bold_text, reg_text in points:
        draw.text((x, y), bold_text, font=f_body_bold, fill=color_text)
        w_bold = draw.textbbox((x, y), bold_text, font=f_body_bold)[2] - draw.textbbox((x, y), bold_text, font=f_body_bold)[0]
        
        if reg_text:
            lines = []
            for raw_line in reg_text.split('\n'):
                lines.extend(wrap_text(draw, raw_line, f_body, max_width - w_bold - 10))
            if lines:
                draw.text((x + w_bold + 10, y), lines[0], font=f_body, fill=color_text)
                y += 40
                for line in lines[1:]:
                    draw.text((x + w_bold + 10, y), line, font=f_body, fill=color_text)
                    y += 40
            else:
                y += 40
        else:
            y += 40
            
    return y + 10

def draw_arrow_right(draw, x1, y1, x2, width=3):
    draw.line([(x1, y1), (x2, y1)], fill=color_heading, width=width)
    draw.polygon([(x2, y1), (x2-12, y1-8), (x2-12, y1+8)], fill=color_heading)

def draw_arrow_down(draw, x1, y1, y2, width=3):
    draw.line([(x1, y1), (x1, y2)], fill=color_heading, width=width)
    draw.polygon([(x1, y2), (x1-8, y2-12), (x1+8, y2-12)], fill=color_heading)

def draw_arrow_left(draw, x1, y1, x2, width=3):
    draw.line([(x1, y1), (x2, y1)], fill=color_heading, width=width)
    draw.polygon([(x2, y1), (x2+12, y1-8), (x2+12, y1+8)], fill=color_heading)

def draw_arrow_up(draw, x1, y1, y2, width=3):
    draw.line([(x1, y1), (x1, y2)], fill=color_heading, width=width)
    draw.polygon([(x1, y2), (x1-8, y2+12), (x1+8, y2+12)], fill=color_heading)

# --- IMAGE 1: Abstract & Introduction ---
img1 = Image.new('RGB', (1000, 1200), color_bg)
draw1 = ImageDraw.Draw(img1)

draw1.rectangle([30, 30, 970, 700], fill=color_card)
draw1.text((500, 60), "Abstract", font=f_h1, fill=color_heading, anchor="ms")

y_pos = 140
points_abstract = [
    ("Challenge:", "General LLMs struggle with specific legal & construction regulatory nuances, often confusing document updates."),
    ("Approach:", "Automated evaluation of an n8n-RAG pipeline against 50 ground-truth questions, using iterative prompt tuning."),
    ("Performance:", "")
]
y_pos = draw_bullet_points(draw1, points_abstract, (60, y_pos), 850)

perfs = [
    "1. Baseline Strict Accuracy: 86%",
    "2. Final Strict Accuracy: 94%",
    "3. Outperforms untuned baseline with 100% Useful Accuracy"
]
for p in perfs:
    draw1.text((90, y_pos), p, font=f_body_bold, fill=color_text)
    y_pos += 45

y_pos += 20
draw_bullet_points(draw1, [("Impact:", "Delivers a robust, domain-specific AI Assistant for accurate construction policy retrieval and decision support.")], (60, y_pos), 850)

draw1.rectangle([30, 730, 970, 1170], fill=color_card)
draw1.text((500, 780), "Introduction", font=f_h1, fill=color_heading, anchor="ms")

y_pos = 850
points_intro = [
    ("Industry Gap:", "Off-the-shelf text models struggle with domain-specific details in construction and overlapping legal clauses (e.g., 2018 vs 2020 K-RERA agreements)."),
    ("Objective:", "Develop a lightweight, highly accurate RAG system for legal compliance by adapting n8n workflows and targeted prompt engineering.")
]
draw_bullet_points(draw1, points_intro, (60, y_pos), 850)

img1.save(os.path.join(output_dir, 'poster_rag_part1.png'))


# --- IMAGE 2: Methodology (DETAILED) ---
img2 = Image.new('RGB', (1000, 1400), color_bg)
draw2 = ImageDraw.Draw(img2)
draw2.rectangle([30, 30, 970, 1370], fill=color_card)
draw2.text((60, 70), "Methodology", font=f_h1, fill=color_heading, anchor="ls")

draw2.text((500, 160), "Architecture: Iterative n8n RAG Evaluation Pipeline", font=f_h2, fill=color_text, anchor="ms")

def draw_box(draw, x, y, w, h, text, fill_col=(230, 240, 250), font=f_diag, outline_col=color_heading, line_w=2):
    draw.rounded_rectangle([x, y, x+w, y+h], radius=15, fill=fill_col, outline=outline_col, width=line_w)
    # Respect explicit newlines
    raw_lines = text.split('\n')
    lines = []
    for rl in raw_lines:
        lines.extend(wrap_text(draw, rl, font, w-20))
        
    line_h = 24 # Smaller line height for 18pt font
    ty = y + (h - len(lines)*line_h)/2
    for line in lines:
        # Changed anchor to 'ma' to prevent mm vertical jitter based on characters
        draw.text((x+w/2, ty), line, font=font, fill=color_text, anchor="ma")
        ty += line_h

def draw_dashed_rect(draw, x1, y1, x2, y2, fill=None, outline=color_heading, width=2, dash_len=10):
    if fill:
        draw.rectangle([x1, y1, x2, y2], fill=fill)
    for x in range(int(x1), int(x2), dash_len*2):
        draw.line([(x, y1), (min(x+dash_len, x2), y1)], fill=outline, width=width)
    for x in range(int(x1), int(x2), dash_len*2):
        draw.line([(x, y2), (min(x+dash_len, x2), y2)], fill=outline, width=width)
    for y in range(int(y1), int(y2), dash_len*2):
        draw.line([(x1, y), (x1, min(y+dash_len, y2))], fill=outline, width=width)
    for y in range(int(y1), int(y2), dash_len*2):
        draw.line([(x2, y), (x2, min(y+dash_len, y2))], fill=outline, width=width)

# Increased heights for ALL boxes so text comfortably wraps inside

# 1. EVALUATION SUITE
es_x, es_y, es_w, es_h = 40, 230, 270, 360 # Taller box
draw_dashed_rect(draw2, es_x, es_y, es_x+es_w, es_y+es_h, fill=(245, 248, 252))
draw2.text((es_x + 10, es_y + 10), "Evaluation Suite (Python)", font=f_diag_title, fill=color_heading)

p1_x, p1_y = 60, 280
draw_box(draw2, p1_x, p1_y, 230, 100, "TEST.txt Parser\n(50 Ground Truth Qs)", font=f_diag)

p2_x, p2_y = 60, 440
draw_box(draw2, p2_x, p2_y, 230, 100, "API Request Builder\n(Iterative Re-asking)", font=f_diag)

draw_arrow_down(draw2, p1_x + 115, p1_y + 100, p2_y)

# 2. n8n RAG BACKEND
rag_x, rag_y, rag_w, rag_h = 360, 230, 600, 360 # Taller box
draw_dashed_rect(draw2, rag_x, rag_y, rag_x+rag_w, rag_y+rag_h, fill=(255, 252, 240))
draw2.text((rag_x + 10, rag_y + 10), "n8n RAG Backend (Agent Workflow)", font=f_diag_title, fill=color_heading)

wh_x, wh_y = 390, 280
draw_box(draw2, wh_x, wh_y, 180, 100, "Webhook Trigger\n(Receives Query)", font=f_diag, fill_col=(255, 220, 200))

vs_x, vs_y = 740, 280
draw_box(draw2, vs_x, vs_y, 190, 100, "Vector Store\n(Qdrant Context)", font=f_diag, fill_col=(220, 255, 220))

llm_x, llm_y = 550, 440
draw_box(draw2, llm_x, llm_y, 230, 110, "LLM Synthesis Node\n(Query + Context)", font=f_diag, fill_col=(220, 220, 255))

# Internal RAG arrows
draw_arrow_right(draw2, wh_x + 180, wh_y + 50, vs_x)
draw2.text((wh_x + 200, wh_y + 15), "Extract\nKey Terms", font=f_diag, fill=color_heading)

# VS -> LLM
draw2.line([(vs_x + 95, vs_y + 100), (vs_x + 95, llm_y + 55), (llm_x + 230, llm_y + 55)], fill=color_heading, width=3)
draw_arrow_left(draw2, llm_x + 230, llm_y + 55, llm_x + 230) 
draw2.polygon([(llm_x+230, llm_y+55), (llm_x+242, llm_y+47), (llm_x+242, llm_y+63)], fill=color_heading)
draw2.text((vs_x + 10, vs_y + 120), "Provide Docs", font=f_diag, fill=color_heading)

# WH -> LLM
draw2.line([(wh_x + 90, wh_y + 100), (wh_x + 90, llm_y + 55), (llm_x, llm_y + 55)], fill=color_heading, width=3)
draw_arrow_right(draw2, llm_x - 30, llm_y + 55, llm_x)
draw2.text((wh_x - 10, wh_y + 120), "Forward Query", font=f_diag, fill=color_heading)


# Cross-Box Arrows
draw_arrow_right(draw2, p2_x + 230, p2_y + 50, wh_x)
draw2.text((p2_x + 245, p2_y + 10), "POST \n/chat", font=f_diag, fill=color_heading)

# 3. ACCURACY GRADER (Bottom Center)
g_x, g_y = 350, 680
draw_box(draw2, g_x, g_y, 300, 100, "Accuracy Grader & Analytics\n(Transition Matrix)", font=f_diag)

# LLM back to Suite (JSON Response)
draw2.line([(llm_x + 115, llm_y + 110), (llm_x + 115, 620), (p2_x + 115, 620), (p2_x + 115, p2_y + 100)], fill=color_heading, width=3)
draw_arrow_up(draw2, p2_x + 115, 610, p2_y + 100) 
draw2.text((llm_x + 130, 590), "Return JSON Response", font=f_diag, fill=color_heading)

# Suite to Grader
out_x = p2_x + 180
draw2.line([(out_x, p2_y + 100), (out_x, 650), (g_x + 150, 650)], fill=color_heading, width=3)
draw_arrow_down(draw2, g_x + 150, 650, g_y)
draw2.text((out_x + 10, 625), "Save eval_results.json", font=f_diag, fill=color_heading)


draw2.text((500, 830), "Model Evaluation Parameters", font=f_h2, fill=color_heading, anchor="ms")

table_data = [
    ["Parameter", "Value", "Description"],
    ["Test Dataset Size", "50", "Ground-truth Q&A pairs (K-RERA regulations)"],
    ["Execution Webhook", "localhost:5678", "n8n automated chat workflow target endpoint"],
    ["Evaluation Iterations", "3 Rounds", "Iterative refinement via re-asking partial failures"],
    ["Grader Threshold", "Strict / Useful", "Strict (100% matched) vs Useful (Partial matches)"]
]

col_w = [220, 220, 440]
start_x = 60
y_table = 880
row_h = 90 

for i, row in enumerate(table_data):
    cx = start_x
    font_t = f_table_bold if i == 0 else f_table_body
    
    draw2.line([(start_x, y_table + i*row_h), (start_x + sum(col_w), y_table + i*row_h)], fill=color_text, width=3 if i==0 else 1)
    for j, cell in enumerate(row):
        lines = []
        for raw_line in cell.split("\n"):
            lines.extend(wrap_text(draw2, raw_line, font_t, col_w[j] - 20))
        ty = y_table + i*row_h + 15
        for line in lines:
            draw2.text((cx + 10, ty), line, font=font_t, fill=color_text)
            ty += 28
        
        cx += col_w[j]
        draw2.line([(start_x + sum(col_w[:j+1]), y_table), (start_x + sum(col_w[:j+1]), y_table + len(table_data)*row_h)], fill=color_text, width=1)
        
draw2.line([(start_x, y_table), (start_x, y_table + len(table_data)*row_h)], fill=color_text, width=1)
draw2.line([(start_x, y_table + len(table_data)*row_h), (start_x + sum(col_w), y_table + len(table_data)*row_h)], fill=color_text, width=3)

img2.save(os.path.join(output_dir, 'poster_rag_part2.png'))


# --- IMAGE 3: Results ---
img3 = Image.new('RGB', (1000, 1400), color_bg) 
draw3 = ImageDraw.Draw(img3)
draw3.rectangle([30, 30, 970, 1370], fill=color_card)
draw3.text((60, 70), "Results", font=f_h1, fill=color_heading, anchor="ls")
draw3.text((100, 140), "Metrics Comparison", font=f_h2, fill=color_heading, anchor="ls")

m_table = [
    ["Metric", "Score (Baseline)", "Score (Final)", "Target"],
    ["Strict Accuracy", "0.86", "0.94", "0.90"],
    ["Useful Accuracy", "0.96", "1.00", "0.95"],
    ["Regressions", "0", "0", "0"]
]
y_mt = 200
col_w3 = [250, 200, 200, 150]
sx_mt = 100
row_h3 = 70

for i, row in enumerate(m_table):
    cx = sx_mt
    font_t = f_table_bold if i == 0 else f_table_body
    draw3.line([(sx_mt, y_mt + i*row_h3), (sx_mt + sum(col_w3), y_mt + i*row_h3)], fill=color_text, width=3 if i==0 else 1)
    
    for j, cell in enumerate(row):
        draw3.text((cx + 15, y_mt + i*row_h3 + 20), cell, font=font_t, fill=color_text)
        cx += col_w3[j]
        draw3.line([(sx_mt + sum(col_w3[:j+1]), y_mt), (sx_mt + sum(col_w3[:j+1]), y_mt + len(m_table)*row_h3)], fill=color_text, width=1)
        
draw3.line([(sx_mt, y_mt), (sx_mt, y_mt + len(m_table)*row_h3)], fill=color_text, width=1)
draw3.line([(sx_mt, y_mt + len(m_table)*row_h3), (sx_mt + sum(col_w3), y_mt + len(m_table)*row_h3)], fill=color_text, width=3)


text_result = "Our structured evaluation demonstrates improved legal compliance retrieval by utilizing targeted context re-asking. Following three iterative rounds of testing against identical K-RERA scenarios, the robust n8n backend corrected complex failure cases yielding increased overall reliability, surpassing the baseline without adding speculative errors."

ly = y_mt + len(m_table)*row_h3 + 50
for line in wrap_text(draw3, text_result, f_body_bold, 800):
    draw3.text((100, ly), line, font=f_body_bold, fill=color_text)
    ly += 40

brain_dir = r"C:\Users\viraj\.gemini\antigravity\brain\a65a4898-a2d3-4ba4-b027-0042afba1be4"
tm_path = os.path.join(brain_dir, 'transition_matrix.png')
if os.path.exists(tm_path):
    tm_img = Image.open(tm_path)
    target_width = 550
    ratio = target_width / tm_img.width
    tm_img = tm_img.resize((target_width, int(tm_img.height * ratio)), Image.Resampling.LANCZOS)
    paste_x = int((1000 - target_width) / 2)
    paste_y = ly + 40
    
    img3.paste(tm_img, (paste_x, paste_y))

img3.save(os.path.join(output_dir, 'poster_rag_part3.png'))

print(f"Generated successfully fixed diagrams with padded borders.")
