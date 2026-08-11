import os
import shutil

generated_assets = {
    'ryan': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/ryan_mascot_1786438889343.png',
    'apeach': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/apeach_mascot_1786438915464.png',
    'choonsik': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/choonsik_clean_1786439632865.png',
    'tube': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/tube_clean_1786439662406.png',
    'muzi': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/muzi_clean_1786439738550.png',
    'frodo': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/frodo_clean_1786439765721.png',
    'neo': '/Users/whales/.gemini/antigravity-cli/brain/6108503c-a112-4eff-9c90-8ce99ee81b30/neo_clean_1786439795684.png'
}

dest_dir = 'public/assets'
os.makedirs(dest_dir, exist_ok=True)

# Clean up old assets in public/assets/
for f in os.listdir(dest_dir):
    file_path = os.path.join(dest_dir, f)
    if os.path.isfile(file_path):
        os.remove(file_path)

# Copy clean generated PNGs
for name, src in generated_assets.items():
    dst = os.path.join(dest_dir, f'{name}.png')
    shutil.copyfile(src, dst)
    print(f'Copied {src} -> {dst}')

print('Clean asset replacement complete!')
