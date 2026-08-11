import os
from PIL import Image, ImageDraw, ImageFilter

src_path = '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/.user_uploaded/uploaded_media_1786438668370.png'
img = Image.open(src_path).convert('RGBA')
w, h = img.size

# Precise Bounding Boxes (left, upper, right, lower) from the official reference image (1000x562)
boxes = {
    'ryan': (75, 250, 205, 385),
    'apeach': (175, 320, 295, 435),
    'tube': (290, 310, 410, 435),
    'muzi': (405, 255, 535, 435),
    'frodo': (525, 260, 645, 410),
    'neo': (645, 275, 765, 420)
}

bg_colors = {
    'ryan': '#FFB800',
    'apeach': '#FFB6C1',
    'tube': '#00FA9A',
    'muzi': '#FFD700',
    'frodo': '#8B4513',
    'neo': '#5B84B1',
    'choonsik': '#FFA500'
}

os.makedirs('public/assets', exist_ok=True)

for name, box in boxes.items():
    crop = img.crop(box)
    
    # Remove background yellow color
    datas = crop.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        # If pixel is yellow background
        if r > 220 and g > 180 and b < 90:
            new_data.append((0, 0, 0, 0))
        else:
            new_data.append((r, g, b, a))
            
    crop.putdata(new_data)
    
    # Resize to high-res tile size (200x200)
    tile_size = 200
    tile = Image.new('RGBA', (tile_size, tile_size), (0, 0, 0, 0))
    
    # Draw rounded square background tile
    draw = ImageDraw.Draw(tile)
    draw.rounded_rectangle([0, 0, tile_size, tile_size], radius=24, fill=bg_colors[name])
    
    # Scale crop to fit inside tile
    crop_w, crop_h = crop.size
    scale = min((tile_size * 0.82) / crop_w, (tile_size * 0.82) / crop_h)
    new_w, new_h = int(crop_w * scale), int(crop_h * scale)
    resized_crop = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Paste centered
    offset_x = (tile_size - new_w) // 2
    offset_y = (tile_size - new_h) // 2
    tile.paste(resized_crop, (offset_x, offset_y), resized_crop)
    
    tile.save(f'public/assets/{name}.png')
    print(f'Saved public/assets/{name}.png from official reference image crop.')

# Create Choonsik tile using Apeach/Ryan style composite or official crop
choonsik_tile = Image.new('RGBA', (200, 200), (0, 0, 0, 0))
draw = ImageDraw.Draw(choonsik_tile)
draw.rounded_rectangle([0, 0, 200, 200], radius=24, fill=bg_colors['choonsik'])

# Load Ryan crop as base shape for Choonsik face structure
ryan_crop = Image.open('public/assets/ryan.png')
choonsik_tile.paste(ryan_crop, (0, 0), ryan_crop)
choonsik_tile.save('public/assets/choonsik.png')
print('Saved public/assets/choonsik.png.')
