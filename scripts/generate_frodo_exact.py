import math
from PIL import Image, ImageDraw

width = 1024
height = 1024

# Create 1024x1024 canvas
img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background rounded square
bg_color = (139, 69, 19, 255) # #8B4513
draw.rounded_rectangle([0, 0, width, height], radius=120, fill=bg_color)

# Center offsets
cx = width // 2
cy = height // 2

# 1. Dark Brown Floppy Ears on Left & Right
ear_color = (92, 46, 11, 255) # #5C2E0B
outline_color = (0, 0, 0, 255)
outline_width = 14

# Left Ear
draw.ellipse([cx - 380, cy - 160, cx - 180, cy + 220], fill=ear_color, outline=outline_color, width=outline_width)
# Right Ear
draw.ellipse([cx + 180, cy - 160, cx + 380, cy + 220], fill=ear_color, outline=outline_color, width=outline_width)

# 2. Main Frodo Dog Head (Vertical Long Oval / Rounded Rect)
head_color = (184, 134, 11, 255) # #B8860B
draw.rounded_rectangle([cx - 240, cy - 280, cx + 240, cy + 220], radius=180, fill=head_color, outline=outline_color, width=outline_width)

# 3. Tan/Cream Snout Area (Large Oval)
snout_color = (245, 222, 179, 255) # #F5DEB3
draw.ellipse([cx - 180, cy + 20, cx + 180, cy + 210], fill=snout_color, outline=outline_color, width=10)

# 4. Large Black Nose
draw.ellipse([cx - 55, cy + 15, cx + 55, cy + 85], fill=(20, 20, 20, 255))

# 5. Flat Dog Mouth Line
draw.line([cx - 80, cy + 140, cx + 80, cy + 140], fill=(20, 20, 20, 255), width=12)

# 6. Calm Eyes (Oval black eyes with white glare dots, NO Ryan eyebrows!)
# Left Eye
draw.ellipse([cx - 120, cy - 80, cx - 70, cy - 10], fill=(20, 20, 20, 255))
draw.ellipse([cx - 105, cy - 70, cx - 90, cy - 50], fill=(255, 255, 255, 255))

# Right Eye
draw.ellipse([cx + 70, cy - 80, cx + 120, cy - 10], fill=(20, 20, 20, 255))
draw.ellipse([cx + 85, cy - 70, cx + 100, cy - 50], fill=(255, 255, 255, 255))

# 7. Red Collar
draw.rounded_rectangle([cx - 200, cy + 230, cx + 200, cy + 310], radius=25, fill=(230, 20, 20, 255), outline=outline_color, width=10)

# 8. Silver Round Medallion Tag
draw.ellipse([cx - 45, cy + 300, cx + 45, cy + 390], fill=(200, 200, 210, 255), outline=outline_color, width=10)

# Save
img.save('public/assets/frodo.png')
print('Frodo exact asset generated successfully!')
