from PIL import Image, ImageDraw, ImageFont
import json
import os

# Data from verify_matrix.py
transition_data = {
  "Correct": { "Correct": 43, "Partial": 0, "Incorrect": 0 },
  "Partial": { "Correct": 2, "Partial": 3, "Incorrect": 0 },
  "Incorrect": { "Correct": 2, "Partial": 0, "Incorrect": 0 }
}

color_correct = (39, 174, 96)
color_partial = (241, 196, 15)
color_incorrect = (231, 76, 60)
color_bg = (255, 255, 255)
color_text = (44, 62, 80)
color_grid = (236, 240, 241)

# --- CHART: Categorical Transition Matrix (Verified) ---
img2 = Image.new('RGB', (600, 600), color_bg)
draw2 = ImageDraw.Draw(img2)

try:
    font_path = "C:/Windows/Fonts/arial.ttf"
    f_title = ImageFont.truetype(font_path, 28)
    f_label = ImageFont.truetype(font_path, 18)
except:
    f_title = f_label = ImageFont.load_default()

draw2.text((300, 50), "Accuracy Transition Matrix (R1 to R3)", fill=color_text, font=f_title, anchor="mm")

cats = ["Correct", "Partial", "Incorrect"]
cell_size = 120
start_x, start_y = 180, 180

# Labels
draw2.text((300, 120), "Round 3 (Final Results)", fill=color_text, font=f_label, anchor="mm")
draw2.text((80, 360), "Round 1\n(Baseline)", fill=color_text, font=f_label, anchor="mm", align="center")

for i, cat in enumerate(cats):
    # Top labels (R3)
    draw2.text((start_x + i * cell_size + cell_size/2, start_y - 20), cat, fill=color_text, font=f_label, anchor="ms")
    # Left labels (R1)
    draw2.text((start_x - 20, start_y + i * cell_size + cell_size/2), cat, fill=color_text, font=f_label, anchor="rm")

# Cells
for i, r1 in enumerate(cats):
    for j, r3 in enumerate(cats):
        val = transition_data[r1][r3]
        x1, y1 = start_x + j * cell_size, start_y + i * cell_size
        x2, y2 = x1 + cell_size, y1 + cell_size
        
        bg = (255, 255, 255)
        if r1 == r3: bg = (248, 249, 250)
        if r1 != r3 and r3 == "Correct": bg = (212, 239, 223) # Improvement green
        
        draw2.rectangle([x1, y1, x2, y2], fill=bg, outline=color_grid)
        if val > 0:
            draw2.text((x1 + cell_size/2, y1 + cell_size/2), str(val), fill=color_text, font=f_title, anchor="mm")

img2.save(r'C:\Users\viraj\.gemini\antigravity\brain\a65a4898-a2d3-4ba4-b027-0042afba1be4\transition_matrix.png')
print("Verified transition matrix visualization saved.")
