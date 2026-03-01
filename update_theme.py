import re

with open('index.html', 'r') as f:
    html = f.read()

# Root vars
new_root = """:root {
            --navy: #eaddb6; 
            --gold: #935A31; 
            --gold-light: #C39C6B; 
            --cream: #3A2419; 
            --dark: #F3E4B2; 
            --text: #412f22; 
            --accent-red: #792822; 
            --transition: 0.3s ease;
        }"""
html = re.sub(r':root\s*\{[^}]+\}', new_root, html)

# Theme background colors and opacities
html = html.replace('rgba(7, 14, 24, 0.95)', 'rgba(243, 228, 178, 0.95)')
html = html.replace('rgba(15, 28, 46, 0.5)', 'rgba(234, 221, 182, 0.8)')
html = html.replace('rgba(15, 28, 46, 0.6)', 'rgba(243, 228, 178, 0.8)')
html = html.replace('rgba(255,255,255,0.05)', 'rgba(58, 36, 25, 0.1)')

# Logo filter for light theme 
html = html.replace('filter: brightness(0) invert(1);', 'filter: brightness(0.2) sepia(1) hue-rotate(330deg) saturate(3);')
html = html.replace('filter: brightness(0) invert(1)', 'filter: brightness(0.2) sepia(1) hue-rotate(330deg) saturate(3)') # fallback

# Hero background gradient
html = html.replace('background: radial-gradient(circle at center, var(--navy) 0%, var(--dark) 100%);', 'background: radial-gradient(circle at center, #fffcee 0%, var(--dark) 100%);')

# Gold borders/accents replacement
html = html.replace('rgba(184, 134, 11, 0.2)', 'rgba(147, 90, 49, 0.3)')
html = html.replace('rgba(184, 134, 11, 0.3)', 'rgba(147, 90, 49, 0.4)')
html = html.replace('rgba(184, 134, 11, 0.1)', 'rgba(147, 90, 49, 0.2)')
html = html.replace('rgba(184, 134, 11, 0.15)', 'rgba(147, 90, 49, 0.25)')
html = html.replace('rgba(184,134,11,0.05)', 'rgba(147, 90, 49, 0.1)')
html = html.replace('rgba(184,134,11,0.1)', 'rgba(147, 90, 49, 0.15)')

# Specific color corrections 
html = html.replace('color: #a0aab8;', 'color: var(--text);')
html = html.replace('box-shadow: 0 10px 30px rgba(0,0,0,0.5)', 'box-shadow: 0 10px 30px rgba(58, 36, 25, 0.15)')
html = html.replace('background: #2a3441', 'background: #eaddb6')

# Button text color fix (navy was dark, now it's light, so buttons need light text if bg is gold)
html = html.replace('color: var(--navy); border: 2px solid var(--gold);', 'color: #FDFBF7; border: 2px solid var(--gold);')
html = html.replace('.btn-gold:hover { background: transparent; color: var(--gold); }', '.btn-gold:hover { background: transparent; color: var(--cream); border-color: var(--cream); }')

# Fix progress bar gradient map
html = html.replace('linear-gradient(90deg, #8B6914, #B8860B)', 'linear-gradient(90deg, var(--gold-light), var(--gold))')
html = html.replace('color: var(--navy)', 'color: #FDFBF7')

with open('index.html', 'w') as f:
    f.write(html)
