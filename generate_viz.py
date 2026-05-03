# Data from walkthrough.md
rounds = ['Round 1', 'Round 2', 'Round 3']
correct = [43, 44, 47]
partial = [4, 4, 3]
incorrect = [3, 2, 0]
total_q = 50

# Colors
color_correct = '#27ae60'
color_partial = '#f1c40f'
color_incorrect = '#e74c3c'
color_line = '#3498db'

# SVG Constants
width = 800
height = 500
padding = 60
chart_width = width - 2 * padding
chart_height = height - 2 * padding
bar_spacing = 40
bar_width = (chart_width - (len(rounds) - 1) * bar_spacing) / len(rounds)
sub_bar_width = bar_width / 3.5

# Calculate scale
max_val = 55
scale = chart_height / max_val

svg_parts = [
    f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
    ' <rect width="100%" height="100%" fill="#f8f9fa"/>',
    f' <text x="{width/2}" y="35" text-anchor="middle" font-size="24" font-family="Arial, sans-serif" font-weight="bold" fill="#2c3e50">RAG Accuracy Progression</text>'
]

# Draw axes and grid lines
for i in range(0, 60, 10):
    y_pos = height - padding - i * scale
    svg_parts.append(f' <line x1="{padding}" y1="{y_pos}" x2="{width-padding}" y2="{y_pos}" stroke="#ced4da" stroke-width="1" stroke-dasharray="5,5"/>')
    svg_parts.append(f' <text x="{padding-10}" y="{y_pos+5}" text-anchor="end" font-size="12" font-family="Arial" fill="#6c757d">{i}</text>')

svg_parts.append(f' <line x1="{padding}" y1="{height-padding}" x2="{width-padding}" y2="{height-padding}" stroke="#2c3e50" stroke-width="2"/>')

# Draw bars
prev_accuracy_pos = None
for i, r in enumerate(rounds):
    x_base = padding + i * (bar_width + bar_spacing)
    
    # Correct Bar
    h_c = correct[i] * scale
    svg_parts.append(f' <rect x="{x_base}" y="{height-padding-h_c}" width="{sub_bar_width}" height="{h_c}" fill="{color_correct}" rx="2"/>')
    svg_parts.append(f' <text x="{x_base + sub_bar_width/2}" y="{height-padding-h_c-5}" text-anchor="middle" font-size="12" font-weight="bold" fill="{color_correct}">{correct[i]}</text>')
    
    # Partial Bar
    h_p = partial[i] * scale
    svg_parts.append(f' <rect x="{x_base + sub_bar_width + 5}" y="{height-padding-h_p}" width="{sub_bar_width}" height="{h_p}" fill="{color_partial}" rx="2"/>')
    svg_parts.append(f' <text x="{x_base + sub_bar_width + 5 + sub_bar_width/2}" y="{height-padding-h_p-5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#d4ac0d">{partial[i]}</text>')
    
    # Incorrect Bar
    h_i = incorrect[i] * scale
    svg_parts.append(f' <rect x="{x_base + 2*(sub_bar_width + 5)}" y="{height-padding-h_i}" width="{sub_bar_width}" height="{h_i}" fill="{color_incorrect}" rx="2"/>')
    svg_parts.append(f' <text x="{x_base + 2*(sub_bar_width + 5) + sub_bar_width/2}" y="{height-padding-h_i-5}" text-anchor="middle" font-size="12" font-weight="bold" fill="{color_incorrect}">{incorrect[i]}</text>')
    
    # Round Label
    svg_parts.append(f' <text x="{x_base + bar_width/2}" y="{height-padding+25}" text-anchor="middle" font-size="14" font-weight="bold" fill="#2c3e50">{r}</text>')
    
    # Accuracy Line Data (scaled 80-100 to chart height)
    acc_pct = (correct[i] + partial[i]) / total_q * 100
    acc_y = height - padding - (acc_pct - 80) * (chart_height / 25) 
    
    if prev_accuracy_pos:
        svg_parts.append(f' <line x1="{prev_accuracy_pos[0]}" y1="{prev_accuracy_pos[1]}" x2="{x_base + bar_width/2}" y2="{acc_y}" stroke="{color_line}" stroke-width="3" stroke-linecap="round"/>')
    
    svg_parts.append(f' <circle cx="{x_base + bar_width/2}" cy="{acc_y}" r="5" fill="{color_line}" stroke="white" stroke-width="2"/>')
    svg_parts.append(f' <text x="{x_base + bar_width/2}" y="{acc_y-15}" text-anchor="middle" font-size="14" font-weight="bold" fill="{color_line}">{acc_pct:.0f}%</text>')
    
    prev_accuracy_pos = (x_base + bar_width/2, acc_y)

# Legend
legend_x = width - padding - 180
legend_y = padding - 10
svg_parts.append(f' <rect x="{legend_x}" y="{legend_y}" width="160" height="110" fill="white" stroke="#ced4da" rx="5"/>')
svg_parts.append(f' <rect x="{legend_x+10}" y="{legend_y+15}" width="15" height="15" fill="{color_correct}" rx="2"/><text x="{legend_x+35}" y="{legend_y+28}" font-size="12">Correct</text>')
svg_parts.append(f' <rect x="{legend_x+10}" y="{legend_y+40}" width="15" height="15" fill="{color_partial}" rx="2"/><text x="{legend_x+35}" y="{legend_y+53}" font-size="12">Partial</text>')
svg_parts.append(f' <rect x="{legend_x+10}" y="{legend_y+65}" width="15" height="15" fill="{color_incorrect}" rx="2"/><text x="{legend_x+35}" y="{legend_y+78}" font-size="12">Incorrect</text>')
svg_parts.append(f' <line x1="{legend_x+10}" y1="{legend_y+95}" x2="{legend_x+25}" y2="{legend_y+95}" stroke="{color_line}" stroke-width="3"/><circle cx="{legend_x+17}" cy="{legend_y+95}" r="3" fill="{color_line}"/><text x="{legend_x+35}" y="{legend_y+100}" font-size="12">Accuracy (C+P %)</text>')

svg_parts.append('</svg>')

# Save SVG
save_path = r'C:\Users\viraj\.gemini\antigravity\brain\a65a4898-a2d3-4ba4-b027-0042afba1be4\accuracy_progression.svg'
with open(save_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(svg_parts))

print(f"Visualization saved to: {save_path}")
