import os

os.makedirs('public/assets', exist_ok=True)

svg_assets = {
    'ryan': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Ryan Amber Background -->
  <rect width="100" height="100" rx="18" fill="#FFB800"/>
  
  <!-- Ears -->
  <circle cx="22" cy="22" r="11" fill="#FFB800" stroke="#222222" stroke-width="4"/>
  <circle cx="78" cy="22" r="11" fill="#FFB800" stroke="#222222" stroke-width="4"/>
  
  <!-- Signature Straight Horizontal Eyebrows -->
  <path d="M 18,38 L 40,38" stroke="#222222" stroke-width="6" stroke-linecap="round"/>
  <path d="M 60,38 L 82,38" stroke="#222222" stroke-width="6" stroke-linecap="round"/>
  
  <!-- Dot Eyes -->
  <circle cx="29" cy="52" r="5" fill="#222222"/>
  <circle cx="71" cy="52" r="5" fill="#222222"/>
  
  <!-- White Infinity Muzzle -->
  <circle cx="43" cy="68" r="9" fill="#FFFFFF"/>
  <circle cx="57" cy="68" r="9" fill="#FFFFFF"/>
  
  <!-- Center Black Nose -->
  <circle cx="50" cy="64" r="5" fill="#222222"/>
</svg>''',

    'apeach': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Apeach Pastel Pink Background -->
  <rect width="100" height="100" rx="18" fill="#FFA0B4"/>
  
  <!-- Peach Cleft Top -->
  <path d="M 38,18 Q 50,6 62,18 Z" fill="#FF7A95"/>
  
  <!-- Pink Blush Cheeks -->
  <circle cx="24" cy="62" r="10" fill="#FF69B4" opacity="0.65"/>
  <circle cx="76" cy="62" r="10" fill="#FF69B4" opacity="0.65"/>
  
  <!-- Eyes -->
  <circle cx="32" cy="46" r="5" fill="#222222"/>
  <circle cx="68" cy="46" r="5" fill="#222222"/>
  <circle cx="30" cy="45" r="2" fill="#FFFFFF"/>
  <circle cx="66" cy="45" r="2" fill="#FFFFFF"/>
  
  <!-- Playful Open Smile -->
  <path d="M 38,62 A 12,12 0 0,0 62,62 Z" fill="#222222"/>
  <!-- Bucktooth -->
  <rect x="46" y="62" width="8" height="5" fill="#FFFFFF"/>
</svg>''',

    'choonsik': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Choonsik Sweet Potato Orange Background -->
  <rect width="100" height="100" rx="18" fill="#FFA500"/>
  
  <!-- Triangular Cat Ears with Dark Tips -->
  <path d="M 15,35 L 28,12 L 40,28 Z" fill="#8B4513"/>
  <path d="M 60,28 L 72,12 L 85,35 Z" fill="#8B4513"/>
  
  <!-- Cream Snout -->
  <ellipse cx="50" cy="62" rx="22" ry="16" fill="#FFF8DC"/>
  
  <!-- Dot Eyes -->
  <circle cx="32" cy="48" r="5" fill="#222222"/>
  <circle cx="68" cy="48" r="5" fill="#222222"/>
  
  <!-- Black Nose -->
  <circle cx="50" cy="58" r="4" fill="#222222"/>
  
  <!-- Cat Whiskers -->
  <path d="M 28,60 L 12,58 M 28,65 L 12,68" stroke="#222222" stroke-width="3" stroke-linecap="round"/>
  <path d="M 72,60 L 88,58 M 72,65 L 88,68" stroke="#222222" stroke-width="3" stroke-linecap="round"/>
</svg>''',

    'muzi': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Muzi White Rabbit Hood Frame -->
  <rect width="100" height="100" rx="18" fill="#FFFFFF"/>
  
  <!-- Rabbit Ears at Top -->
  <ellipse cx="32" cy="18" rx="8" ry="18" transform="rotate(-6 32 18)" fill="#FFFFFF"/>
  <ellipse cx="68" cy="18" rx="8" ry="18" transform="rotate(6 68 18)" fill="#FFFFFF"/>
  
  <!-- Yellow Muzi Face Center -->
  <circle cx="50" cy="55" r="34" fill="#FFD700"/>
  
  <!-- Dot Eyes -->
  <circle cx="35" cy="50" r="5" fill="#222222"/>
  <circle cx="65" cy="50" r="5" fill="#222222"/>
  
  <!-- White Snout Patch -->
  <circle cx="50" cy="62" r="8" fill="#FFFFFF"/>
  <circle cx="50" cy="60" r="3.5" fill="#222222"/>
</svg>''',

    'frodo': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Frodo Golden Brown Fur Background -->
  <rect width="100" height="100" rx="18" fill="#C88E3E"/>
  
  <!-- Folded Brown Ears on Top -->
  <circle cx="28" cy="24" r="10" fill="#9A6224" stroke="#222222" stroke-width="3"/>
  <circle cx="72" cy="24" r="10" fill="#9A6224" stroke="#222222" stroke-width="3"/>
  
  <!-- White Oval Eyes with Pupils & Eyelid Line -->
  <ellipse cx="34" cy="44" rx="10" ry="6" fill="#FFFFFF" stroke="#222222" stroke-width="3"/>
  <ellipse cx="66" cy="44" rx="10" ry="6" fill="#FFFFFF" stroke="#222222" stroke-width="3"/>
  <circle cx="34" cy="45" r="4" fill="#222222"/>
  <circle cx="66" cy="45" r="4" fill="#222222"/>
  
  <!-- Black Nose -->
  <ellipse cx="50" cy="58" rx="6" ry="4" fill="#222222"/>
  
  <!-- Straight Mouth Line -->
  <line x1="42" y1="68" x2="58" y2="68" stroke="#222222" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Red Collar & Silver Tag -->
  <rect x="20" y="80" width="60" height="8" fill="#D32F2F"/>
  <circle cx="50" cy="88" r="6" fill="#C0C0C0" stroke="#222222" stroke-width="2"/>
</svg>''',

    'neo': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Neo Cyan Blue Background -->
  <rect width="100" height="100" rx="18" fill="#1E90FF"/>
  
  <!-- Glossy Black Bob Cut Wig Hair -->
  <path d="M 12,38 A 38,38 0 0,1 88,38 L 88,73 L 76,73 L 76,38 A 26,26 0 0,0 24,38 L 24,73 L 12,73 Z" fill="#111111"/>
  <!-- Hair Sheen Gloss -->
  <circle cx="35" cy="22" r="14" fill="#FFFFFF" opacity="0.32"/>
  
  <!-- Cat Eyes -->
  <circle cx="36" cy="54" r="5" fill="#222222"/>
  <circle cx="64" cy="54" r="5" fill="#222222"/>
  <circle cx="35" cy="53" r="2" fill="#FFFFFF"/>
  <circle cx="63" cy="53" r="2" fill="#FFFFFF"/>
  
  <!-- Pink Nose -->
  <circle cx="50" cy="62" r="4" fill="#FFA0B4"/>
</svg>''',

    'tube': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <!-- Tube Mint Green Background -->
  <rect width="100" height="100" rx="18" fill="#00FA9A"/>
  
  <!-- White Duck Head -->
  <circle cx="50" cy="48" r="34" fill="#FFFFFF"/>
  
  <!-- Dot Eyes -->
  <circle cx="36" cy="42" r="4" fill="#222222"/>
  <circle cx="64" cy="42" r="4" fill="#222222"/>
  
  <!-- Wide Orange Duck Beak -->
  <ellipse cx="50" cy="60" rx="22" ry="12" fill="#FF9900"/>
  <!-- Beak Center Line -->
  <line x1="32" y1="60" x2="68" y2="60" stroke="#E67E00" stroke-width="3"/>
</svg>'''
}

for name, code in svg_assets.items():
    path = f'public/assets/{name}.svg'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f'Saved {path}')

print('All 7 Vector SVG assets generated successfully!')
