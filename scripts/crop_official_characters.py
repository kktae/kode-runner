import math
from PIL import Image, ImageDraw

src_banner = '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/.user_uploaded/uploaded_media_1786438668370.png'
src_frodo = '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/.user_uploaded/uploaded_media_1786446983353.png'

img_banner = Image.open(src_banner).convert('RGB')
img_frodo = Image.open(src_frodo).convert('RGB')

# Character configuration: (source_image, crop_box, bg_hex)
# crop_box format: (left, upper, right, lower)
char_config = {
    'ryan': (img_banner, (120, 110, 290, 280), (255, 184, 0)),     # Ryan Amber Yellow #FFB800
    'apeach': (img_banner, (270, 140, 440, 310), (255, 160, 180)),  # Apeach Pink #FFA0B4
    'choonsik': (img_banner, (420, 160, 580, 320), (255, 165, 0)),  # Choonsik Orange #FFA500
    'tube': (img_banner, (560, 130, 720, 290), (0, 250, 154)),      # Tube Mint #00FA9A
    'muzi': (img_banner, (680, 110, 850, 280), (255, 215, 0)),      # Muzi Gold #FFD700
    'frodo': (img_frodo, (200, 100, 804, 684), (200, 142, 62)),     # Frodo Golden Brown #C88E3E
    'neo': (img_banner, (800, 150, 960, 310), (30, 144, 255))       # Neo Cyan Blue #1E90FF
}

tile_size = 512

for name, (src_img, crop_box, bg_color) in char_config.items():
    crop = src_img.crop(crop_box)
    crop_w, crop_h = crop.size

    # Create high-res square tile with character's primary background color
    tile = Image.new('RGB', (tile_size, tile_size), bg_color)

    # Scale crop to fill tile nicely
    scale = (tile_size * 0.88) / max(crop_w, crop_h)
    new_w, new_h = int(crop_w * scale), int(crop_h * scale)
    resized = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # If from banner, smooth yellow background replacement
    if src_img == img_banner:
        pixels = resized.load()
        bg_target_r, bg_target_g, bg_target_b = 254, 218, 48 # Banner yellow background
        for y in range(new_h):
            for x in range(new_w):
                r, g, b = pixels[x, y]
                dist = math.sqrt((r - bg_target_r)**2 + (g - bg_target_g)**2 + (b - bg_target_b)**2)
                if dist < 45:
                    pixels[x, y] = bg_color
                elif dist < 90:
                    t = (dist - 45) / 45.0
                    nr = int(bg_color[0] * (1 - t) + r * t)
                    ng = int(bg_color[1] * (1 - t) + g * t)
                    nb = int(bg_color[2] * (1 - t) + b * t)
                    pixels[x, y] = (nr, ng, nb)

    # Paste centered onto tile
    offset_x = (tile_size - new_w) // 2
    offset_y = (tile_size - new_h) // 2
    tile.paste(resized, (offset_x, offset_y))

    dst_path = f'public/assets/{name}.png'
    tile.save(dst_path)
    print(f'Cropped & blended official artwork for {name} -> {dst_path}')

print('All 7 official Kakao Friends character assets generated successfully!')
