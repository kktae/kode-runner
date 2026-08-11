import os

svgs = {
    # 1. RYAN (라이언)
    'ryan': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#FFB800"/>
  <!-- Ears -->
  <circle cx="20" cy="20" r="13" fill="#FFB800" stroke="#000000" stroke-width="3"/>
  <circle cx="80" cy="20" r="13" fill="#FFB800" stroke="#000000" stroke-width="3"/>
  <!-- Head Cover -->
  <circle cx="50" cy="54" r="38" fill="#FFB800" stroke="#000000" stroke-width="3.5"/>
  <!-- White Muzzle -->
  <ellipse cx="42" cy="62" rx="10" ry="9" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
  <ellipse cx="58" cy="62" rx="10" ry="9" fill="#FFFFFF" stroke="#000000" stroke-width="2"/>
  <!-- Black Nose -->
  <circle cx="50" cy="56" r="4.5" fill="#000000"/>
  <!-- Eyes -->
  <circle cx="30" cy="50" r="4.5" fill="#000000"/>
  <circle cx="70" cy="50" r="4.5" fill="#000000"/>
  <!-- Eyebrows -->
  <rect x="18" y="36" width="22" height="5" rx="2.5" fill="#000000"/>
  <rect x="60" y="36" width="22" height="5" rx="2.5" fill="#000000"/>
</svg>''',

    # 2. APEACH (어피치)
    'apeach': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#FFB6C1"/>
  <!-- Peach Contour Head -->
  <path d="M50,15 C20,15 12,42 12,62 C12,82 32,88 50,88 C68,88 88,82 88,62 C88,42 80,15 50,15 Z" fill="#FFC0CB" stroke="#000000" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Peach Stem Tip -->
  <path d="M50,15 Q54,6 58,12 Z" fill="#FF69B4" stroke="#000000" stroke-width="2"/>
  <!-- Pink Cheeks -->
  <ellipse cx="28" cy="66" rx="8" ry="5" fill="#FF69B4" opacity="0.6"/>
  <ellipse cx="72" cy="66" rx="8" ry="5" fill="#FF69B4" opacity="0.6"/>
  <!-- Eyes -->
  <ellipse cx="34" cy="52" rx="4.5" ry="5.5" fill="#000000"/>
  <ellipse cx="66" cy="52" rx="4.5" ry="5.5" fill="#000000"/>
  <!-- Eyebrows -->
  <rect x="24" y="38" width="18" height="4" rx="2" fill="#000000"/>
  <rect x="58" y="38" width="18" height="4" rx="2" fill="#000000"/>
  <!-- Cute Smile -->
  <path d="M42,66 Q50,74 58,66" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
</svg>''',

    # 3. TUBE (튜브)
    'tube': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#00FA9A"/>
  <!-- White Duck Head -->
  <ellipse cx="50" cy="50" rx="38" ry="34" fill="#FFFFFF" stroke="#000000" stroke-width="3.5"/>
  <!-- Large Wide Orange Beak -->
  <path d="M20,54 Q50,46 80,54 Q82,72 50,72 Q18,72 20,54 Z" fill="#FF8C00" stroke="#000000" stroke-width="3"/>
  <line x1="22" y1="58" x2="78" y2="58" stroke="#000000" stroke-width="2.5"/>
  <!-- Eyes -->
  <ellipse cx="34" cy="38" rx="4" ry="5" fill="#000000"/>
  <ellipse cx="66" cy="38" rx="4" ry="5" fill="#000000"/>
  <!-- Eyebrows -->
  <rect x="24" y="26" width="18" height="4" rx="2" fill="#000000"/>
  <rect x="58" y="26" width="18" height="4" rx="2" fill="#000000"/>
</svg>''',

    # 4. MUZI (무지)
    'muzi': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#FFD700"/>
  <!-- Rabbit Ears -->
  <ellipse cx="32" cy="18" rx="7" ry="16" fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
  <ellipse cx="68" cy="18" rx="7" ry="16" fill="#FFFFFF" stroke="#000000" stroke-width="3"/>
  <ellipse cx="32" cy="18" rx="3.5" ry="10" fill="#FFB6C1"/>
  <ellipse cx="68" cy="18" rx="3.5" ry="10" fill="#FFB6C1"/>
  <!-- White Rabbit Hood -->
  <circle cx="50" cy="56" r="38" fill="#FFFFFF" stroke="#000000" stroke-width="3.5"/>
  <!-- Yellow Inner Face -->
  <circle cx="50" cy="58" r="28" fill="#FFD700" stroke="#000000" stroke-width="2.5"/>
  <!-- Eyes -->
  <ellipse cx="36" cy="52" rx="4.5" ry="5.5" fill="#000000"/>
  <ellipse cx="64" cy="52" rx="4.5" ry="5.5" fill="#000000"/>
  <circle cx="34" cy="50" r="1.5" fill="#FFFFFF"/>
  <circle cx="66" cy="50" r="1.5" fill="#FFFFFF"/>
  <!-- Eyebrows -->
  <rect x="28" y="40" width="15" height="3.5" rx="1.5" fill="#000000"/>
  <rect x="57" y="40" width="15" height="3.5" rx="1.5" fill="#000000"/>
  <!-- Nose & Mouth -->
  <circle cx="50" cy="60" r="2.5" fill="#000000"/>
  <path d="M44,65 Q50,70 56,65" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
</svg>''',

    # 5. FRODO (프로도)
    'frodo': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#8B4513"/>
  <!-- Floppy Ears -->
  <ellipse cx="15" cy="42" rx="9" ry="20" fill="#5C2E0B" stroke="#000000" stroke-width="3"/>
  <ellipse cx="85" cy="42" rx="9" ry="20" fill="#5C2E0B" stroke="#000000" stroke-width="3"/>
  <!-- Dog Head -->
  <ellipse cx="50" cy="48" rx="35" ry="32" fill="#B8860B" stroke="#000000" stroke-width="3.5"/>
  <!-- Tan Snout -->
  <ellipse cx="50" cy="58" rx="20" ry="14" fill="#F5DEB3" stroke="#000000" stroke-width="2"/>
  <ellipse cx="50" cy="52" rx="6" ry="4" fill="#000000"/>
  <!-- Eyes -->
  <circle cx="32" cy="42" r="4.5" fill="#000000"/>
  <circle cx="68" cy="42" r="4.5" fill="#000000"/>
  <!-- Eyebrows -->
  <rect x="22" y="30" width="18" height="4" rx="2" fill="#000000"/>
  <rect x="60" y="30" width="18" height="4" rx="2" fill="#000000"/>
  <!-- Mouth -->
  <line x1="38" y1="62" x2="62" y2="62" stroke="#000000" stroke-width="2.5"/>
  <!-- Red Collar & Silver Tag -->
  <rect x="22" y="76" width="56" height="9" rx="3" fill="#FF0000" stroke="#000000" stroke-width="2"/>
  <circle cx="50" cy="85" r="5" fill="#C0C0C0" stroke="#000000" stroke-width="2"/>
</svg>''',

    # 6. NEO (네오)
    'neo': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#5B84B1"/>
  <!-- Blue Cat Ears -->
  <polygon points="18,28 32,8 44,26" fill="#5B84B1" stroke="#000000" stroke-width="3"/>
  <polygon points="56,26 68,8 82,28" fill="#5B84B1" stroke="#000000" stroke-width="3"/>
  <!-- Glossy Black Bob Haircut -->
  <path d="M12,42 C12,16 88,16 88,42 L88,70 L72,70 L66,50 L34,50 L28,70 L12,70 Z" fill="#111111" stroke="#000000" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Blue Cat Face Cutout -->
  <circle cx="50" cy="56" r="24" fill="#5B84B1" stroke="#000000" stroke-width="2.5"/>
  <!-- Jagged Hair Bangs -->
  <polygon points="28,40 36,48 44,40 50,48 56,40 64,48 72,40 68,36 32,36" fill="#111111"/>
  <!-- Eyes -->
  <ellipse cx="36" cy="55" rx="5" ry="6" fill="#FFFFFF" stroke="#000000" stroke-width="1.5"/>
  <ellipse cx="64" cy="55" rx="5" ry="6" fill="#FFFFFF" stroke="#000000" stroke-width="1.5"/>
  <circle cx="36" cy="55" r="3" fill="#000000"/>
  <circle cx="64" cy="55" r="3" fill="#000000"/>
  <!-- Eyebrows -->
  <rect x="28" y="44" width="15" height="3" rx="1.5" fill="#000000"/>
  <rect x="57" y="44" width="15" height="3" rx="1.5" fill="#000000"/>
  <!-- White Snout Area -->
  <ellipse cx="50" cy="65" rx="8" ry="5" fill="#FFFFFF"/>
  <circle cx="50" cy="62" r="2" fill="#000000"/>
</svg>''',

    # 7. CHOONSIK (춘식이)
    'choonsik': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#FFA500"/>
  <!-- Cat Ears -->
  <polygon points="12,26 26,6 40,22" fill="#FFA500" stroke="#000000" stroke-width="3"/>
  <polygon points="60,22 74,6 88,26" fill="#FFA500" stroke="#000000" stroke-width="3"/>
  <polygon points="18,24 26,11 34,22" fill="#FFB6C1"/>
  <polygon points="66,22 74,11 82,24" fill="#FFB6C1"/>
  <!-- Round Head -->
  <ellipse cx="50" cy="54" rx="38" ry="34" fill="#FFA500" stroke="#000000" stroke-width="3.5"/>
  <!-- Cream Muzzle -->
  <ellipse cx="50" cy="62" rx="18" ry="12" fill="#FFFDD0" stroke="#000000" stroke-width="2"/>
  <!-- Eyes -->
  <circle cx="32" cy="46" r="4.5" fill="#000000"/>
  <circle cx="68" cy="46" r="4.5" fill="#000000"/>
  <!-- Eyebrows -->
  <rect x="22" y="34" width="18" height="4" rx="2" fill="#000000"/>
  <rect x="60" y="34" width="18" height="4" rx="2" fill="#000000"/>
  <!-- Brown Nose & Cat Mouth -->
  <ellipse cx="50" cy="58" rx="3.5" ry="2.5" fill="#8B4513"/>
  <path d="M43,63 Q46,67 50,63 Q54,67 57,63" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Whiskers -->
  <line x1="12" y1="56" x2="26" y2="58" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="12" y1="66" x2="26" y2="66" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="88" y1="56" x2="74" y2="58" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="88" y1="66" x2="74" y2="66" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
</svg>'''
}

os.makedirs('public/assets', exist_ok=True)
for name, svg_content in svgs.items():
    path = f'public/assets/{name}.svg'
    with open(path, 'w') as f:
        f.write(svg_content)
    print(f'Wrote {path}')

print('All 7 Kakao Friends SVGs generated successfully!')
