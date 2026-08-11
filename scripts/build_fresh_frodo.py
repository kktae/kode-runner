import os
from PIL import Image, ImageDraw

size = 1024
scale_size = 2048

img = Image.new('RGBA', (scale_size, scale_size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

bg_color = (139, 69, 19, 255)
draw.rounded_rectangle([0, 0, scale_size, scale_size], radius=240, fill=bg_color)

cx = scale_size // 2
cy = scale_size // 2

outline_w = 28
black = (20, 20, 20, 255)

# 1. Dark Chocolate Brown Floppy Ears
ear_color = (92, 46, 11, 255)
draw.ellipse([cx - 780, cy - 300, cx - 380, cy + 440], fill=ear_color, outline=black, width=outline_w)
draw.ellipse([cx + 380, cy - 300, cx + 780, cy + 440], fill=ear_color, outline=black, width=outline_w)

# 2. Main Frodo Head
head_color = (184, 134, 11, 255)
draw.rounded_rectangle([cx - 480, cy - 580, cx + 480, cy + 420], radius=360, fill=head_color, outline=black, width=outline_w)

# 3. Light Cream Snout
snout_color = (245, 222, 179, 255)
draw.ellipse([cx - 360, cy + 40, cx + 360, cy + 420], fill=snout_color, outline=black, width=20)

# 4. Black Nose
draw.ellipse([cx - 110, cy + 30, cx + 110, cy + 170], fill=black)

# 5. Flat Mouth Line
draw.line([cx - 160, cy + 280, cx + 160, cy + 280], fill=black, width=24)

# 6. Oval Black Eyes
draw.ellipse([cx - 240, cy - 160, cx - 140, cy - 20], fill=black)
draw.ellipse([cx - 210, cy - 140, cx - 180, cy - 100], fill=(255, 255, 255, 255))

draw.ellipse([cx + 140, cy - 160, cx + 240, cy - 20], fill=black)
draw.ellipse([cx + 170, cy - 140, cx + 200, cy - 100], fill=(255, 255, 255, 255))

# 7. Red Collar
draw.rounded_rectangle([cx - 400, cy + 460, cx + 400, cy + 620], radius=50, fill=(230, 20, 20, 255), outline=black, width=20)

# 8. Silver Tag
draw.ellipse([cx - 90, cy + 600, cx + 90, cy + 780], fill=(210, 210, 220, 255), outline=black, width=20)

# SSAA Downsample
final_img = img.resize((size, size), Image.Resampling.LANCZOS)
final_img.save('public/assets/frodo.png')
print('Fresh SSAA Frodo asset generated successfully!')
