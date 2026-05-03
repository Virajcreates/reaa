from PIL import Image, ImageDraw, ImageFont
import os

# Data from walkthrough.md
rounds = ['Round 1', 'Round 2', 'Round 3']
correct = [43, 44, 47]
partial = [4, 4, 3]
incorrect = [3, 2, 0]
total_q = 50

# Colors
color_correct = (39, 174, 96)    # Green
color_partial = (241, 196, 15)   # Yellow
color_incorrect = (231, 76, 60)  # Red
color_line = (52, 152, 219)      # Blue
color_bg = (248, 249, 250)
color_text = (44, 62, 80)
color_grid = (206, 212, 218)

# Canvas setup
width, height = 1000, 700
padding = 100
chart_w = width - 2 * padding
chart_h = height - 2 * padding
img = Image.new('RGB', (width, height), color_bg)
draw = ImageDraw.Draw(img)

# Try to load a font, otherwise use default
try:
    # On Windows, Arial is usually in this path
    font_path = "C:/Windows/Fonts/arial.ttf"
    font_title = ImageFont.truetype(font_path, 32)
    font_label = ImageFont.truetype(font_path, 20)
    font_value = ImageFont.truetype(font_path, 16)
    font_legend = ImageFont.truetype(font_path, 18)
except:
    font_title = font_label = font_value = font_legend = ImageFont.load_default()

# Title
draw.text((width/2, 40), "RAG Evaluation Accuracy Progression", fill=color_text, font=font_title, anchor="mm")

# Draw axes and grid lines
max_val = 55
scale = chart_h / max_val

for i in range(0, 60, 10):
    y = height - padding - i * scale
    draw.line([(padding, y), (width - padding, y)], fill=color_grid, width=1)
    draw.text((padding - 15, y), str(i), fill=color_text, font=font_value, anchor="rm")

draw.line([(padding, height - padding), (width - padding, height - padding)], fill=color_text, width=2)
draw.line([(padding, padding), (padding, height - padding)], fill=color_text, width=2)

# Bar calculations
bar_group_w = chart_w / len(rounds)
bar_w = 40
gap = 10

# Plot bars and line
prev_acc_pt = None
for i, r in enumerate(rounds):
    x_center = padding + (i + 0.5) * bar_group_w
    
    # Correct Bar (Left)
    c_h = correct[i] * scale
    c_x = x_center - 1.5 * bar_w - gap
    draw.rectangle([c_x, height - padding - c_h, c_x + bar_w, height - padding], fill=color_correct)
    draw.text((c_x + bar_w/2, height - padding - c_h - 10), str(correct[i]), fill=color_correct, font=font_value, anchor="mb")
    
    # Partial Bar (Center)
    p_h = partial[i] * scale
    p_x = x_center - bar_w/2
    draw.rectangle([p_x, height - padding - p_h, p_x + bar_w, height - padding], fill=color_partial)
    draw.text((p_x + bar_w/2, height - padding - p_h - 10), str(partial[i]), fill=color_partial, font=font_value, anchor="mb")
    
    # Incorrect Bar (Right)
    i_h = incorrect[i] * scale
    i_x = x_center + bar_w/2 + gap
    draw.rectangle([i_x, height - padding - i_h, i_x + bar_w, height - padding], fill=color_incorrect)
    draw.text((i_x + bar_w/2, height - padding - i_h - 10), str(incorrect[i]), fill=color_incorrect, font=font_value, anchor="mb")
    
    # Round Label
    draw.text((x_center, height - padding + 30), r, fill=color_text, font=font_label, anchor="mt")
    
    # Accuracy Line Pt (scaled 80-100 to chart_h region)
    acc_pct = (correct[i] + partial[i]) / total_q * 100
    acc_y = height - padding - (acc_pct - 80) * (chart_h / 25) # Fit 80-100% in a portion of height
    
    curr_acc_pt = (x_center, acc_y)
    if prev_acc_pt:
        draw.line([prev_acc_pt, curr_acc_pt], fill=color_line, width=4)
    
    draw.ellipse([curr_acc_pt[0]-6, curr_acc_pt[1]-6, curr_acc_pt[0]+6, curr_acc_pt[1]+6], fill=color_line, outline="white", width=2)
    draw.text((curr_acc_pt[0], curr_acc_pt[1] - 25), f"{acc_pct:.0f}%", fill=color_line, font=font_label, anchor="mb")
    
    prev_acc_pt = curr_acc_pt

# Legend
leg_x, leg_y = width - padding - 220, padding + 20
draw.rectangle([leg_x, leg_y, leg_x + 200, leg_y + 130], outline=color_grid, width=1)
draw.rectangle([leg_x + 10, leg_y + 15, leg_x + 30, leg_y + 35], fill=color_correct)
draw.text((leg_x + 40, leg_y + 25), "Correct (✅)", fill=color_text, font=font_legend, anchor="lm")

draw.rectangle([leg_x + 10, leg_y + 45, leg_x + 30, leg_y + 65], fill=color_partial)
draw.text((leg_x + 40, leg_y + 55), "Partial (⚠️)", fill=color_text, font=font_legend, anchor="lm")

draw.rectangle([leg_x + 10, leg_y + 75, leg_x + 30, leg_y + 95], fill=color_incorrect)
draw.text((leg_x + 40, leg_y + 85), "Incorrect (❌)", fill=color_text, font=font_legend, anchor="lm")

draw.line([(leg_x + 10, leg_y + 115), (leg_x + 30, leg_y + 115)], fill=color_line, width=3)
draw.text((leg_x + 40, leg_y + 115), "Accuracy (C+P %)", fill=color_text, font=font_legend, anchor="lm")

# Save
save_path = r'C:\Users\viraj\.gemini\antigravity\brain\a65a4898-a2d3-4ba4-b027-0042afba1be4\accuracy_progression.png'
img.save(save_path)
print(f"Visualization saved to: {save_path}")
