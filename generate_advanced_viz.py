from PIL import Image, ImageDraw, ImageFont
import json
import os

# Load data
with open("advanced_metrics.json", "r") as f:
    data = json.load(f)

topic_data = data["topic_breakdown"]
transition_data = data["transition_matrix"]

# Colors
color_correct = (39, 174, 96)
color_partial = (241, 196, 15)
color_incorrect = (231, 76, 60)
color_bg = (255, 255, 255)
color_text = (44, 62, 80)
color_grid = (236, 240, 241)

# --- CHART 1: Topic Accuracy Breakdown ---
width, height = 1000, 600
img1 = Image.new('RGB', (width, height), color_bg)
draw1 = ImageDraw.Draw(img1)

try:
    font_path = "C:/Windows/Fonts/arial.ttf"
    f_title = ImageFont.truetype(font_path, 28)
    f_label = ImageFont.truetype(font_path, 18)
    f_val = ImageFont.truetype(font_path, 16)
except:
    f_title = f_label = f_val = ImageFont.load_default()

draw1.text((width/2, 40), "Topic-wise RAG Accuracy (Final Round)", fill=color_text, font=f_title, anchor="mm")

topics = sorted(topic_data.keys(), key=lambda x: topic_data[x]["accuracy"])
y_start = 100
row_h = (height - y_start - 60) / len(topics)
chart_left = 300
chart_right = width - 100

for i, topic in enumerate(topics):
    y = y_start + i * row_h
    acc = topic_data[topic]["accuracy"]
    
    # Label
    draw1.text((chart_left - 20, y + row_h/2), topic, fill=color_text, font=f_label, anchor="rm")
    
    # Bar background
    draw1.rectangle([chart_left, y + 10, chart_right, y + row_h - 10], outline=color_grid, width=1)
    
    # Accuracy bar
    bar_w = (chart_right - chart_left) * (acc / 100)
    bar_color = color_correct if acc > 90 else (color_partial if acc > 70 else color_incorrect)
    draw1.rectangle([chart_left, y + 10, chart_left + bar_w, y + row_h - 10], fill=bar_color)
    
    # Value
    draw1.text((chart_left + bar_w + 10, y + row_h/2), f"{acc:.1f}%", fill=color_text, font=f_val, anchor="lm")

img1.save(r'C:\Users\viraj\.gemini\antigravity\brain\a65a4898-a2d3-4ba4-b027-0042afba1be4\topic_accuracy.png')

# --- CHART 2: Categorical Transition Matrix (Confusion Equivalent) ---
img2 = Image.new('RGB', (600, 600), color_bg)
draw2 = ImageDraw.Draw(img2)

draw2.text((300, 50), "Accuracy Transition Matrix (R1 to R3)", fill=color_text, font=f_title, anchor="mm")

cats = ["Correct", "Partial", "Incorrect"]
cell_size = 120
start_x, start_y = 180, 180

# Labels
draw2.text((300, 120), "Round 1 (Baseline)", fill=color_text, font=f_label, anchor="mm")
draw2.text((80, 360), "Round 3\n(Final)", fill=color_text, font=f_label, anchor="mm", align="center")

for i, cat in enumerate(cats):
    # Top labels
    draw2.text((start_x + i * cell_size + cell_size/2, start_y - 20), cat, fill=color_text, font=f_label, anchor="ms")
    # Left labels
    draw2.text((start_x - 20, start_y + i * cell_size + cell_size/2), cat, fill=color_text, font=f_label, anchor="rm")

# Cells
for i, r1 in enumerate(cats):
    for j, r3 in enumerate(cats):
        val = transition_data[r1][r3]
        x1, y1 = start_x + j * cell_size, start_y + i * cell_size
        x2, y2 = x1 + cell_size, y1 + cell_size
        
        # Color based on health (Correct -> Correct is best, Incorrect -> Correct is great)
        bg = (255, 255, 255)
        if r1 == r3: bg = (248, 249, 250)
        if r1 != r3 and r3 == "Correct": bg = (212, 239, 223) # Improvement green
        
        draw2.rectangle([x1, y1, x2, y2], fill=bg, outline=color_grid)
        if val > 0:
            draw2.text((x1 + cell_size/2, y1 + cell_size/2), str(val), fill=color_text, font=f_title, anchor="mm")

img2.save(r'C:\Users\viraj\.gemini\antigravity\brain\a65a4898-a2d3-4ba4-b027-0042afba1be4\transition_matrix.png')

print("Advanced visualizations saved.")
