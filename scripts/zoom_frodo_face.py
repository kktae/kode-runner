from PIL import Image

src_path = '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/frodo_exact_ref_1786447046431.png'
img = Image.open(src_path)
w, h = img.size # 1024x1024

# Crop head, ears, face, and red collar (zoom in on head!)
# Bounding box in 1024x1024: left=220, upper=100, right=804, lower=684
head_crop = img.crop((220, 100, 804, 684))

# Resize to high-res tile (1024x1024)
face_tile = head_crop.resize((1024, 1024), Image.Resampling.LANCZOS)
face_tile.save('public/assets/frodo.png')

print('Frodo face-only tile created successfully!')
