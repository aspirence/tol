import re

with open('style.css', 'r') as f:
    css = f.read()

# 1. Update Design Tokens
tokens = """
:root {
  --theme-color: #7b8665;
  --theme-light: rgba(123, 134, 101, 0.1);
  --gold:        #C9A84C;
  --gold-light:  #daba73;
  --gold-pale:   #fbf8ef;
  --gold-dim:    rgba(201,168,76,0.12);
  --dark:        #fdfdfc;
  --dark2:       #f7f6f2;
  --dark3:       #ffffff;
  --dark4:       #f0efe9;
  --text:        #2d2d2d;
  --text-muted:  #6c6c6c;
  --green:       #3a8b66;
  --green-dark:  #215c41;
  --red:         #d64933;
  --red-dark:    #8b2f21;
  --radius:      8px;
  --transition:  0.3s ease;
}
"""
css = re.sub(r':root\s*\{[^}]*\}', tokens.strip(), css, count=1)

# Fix hardcoded colors to var(--text) or var(--theme-color)
css = re.sub(r'color:\s*#fff(?:fff)?;', 'color: var(--text);', css)
css = re.sub(r'color:\s*rgba\(255,255,255,[^)]+\);', 'color: var(--text-muted);', css)

# Hero section background and gradient fixes
css = re.sub(r'linear-gradient\([^)]+#0D0D0D[^)]+\)', 'linear-gradient(160deg, #fdfdfc 0%, #f4f2e9 50%, #fdfdfc 100%)', css)
css = re.sub(r'linear-gradient\(135deg,\s*#0f0e0a[^)]+\)', 'linear-gradient(135deg, #fdfdfc 0%, #f7f6f2 100%)', css)

# Replace other dark gradients
css = re.sub(r'linear-gradient\(to bottom,\s*var\(--dark\)\s*0%,\s*var\(--dark2\)\s*100%\)', 'linear-gradient(to bottom, #fdfdfc 0%, #f7f6f2 100%)', css)

# Change specific elements to use olive green & light theme 
css = re.sub(r'\.hero h1 \{(.*?)\}', r'.hero h1 {\1 color: var(--theme-color); }', css, flags=re.DOTALL)
css = re.sub(r'\.hero-tagline \{(.*?)\}', r'.hero-tagline {\1 color: var(--gold); }', css, flags=re.DOTALL)
css = re.sub(r'\.section-title \{(.*?)\}', r'.section-title {\1 color: var(--theme-color); }', css, flags=re.DOTALL)

# Border colors
css = re.sub(r'rgba\(255,255,255,0\.\d+\)', 'rgba(0,0,0,0.05)', css)

# Chart section and flow section backgrounds
css = re.sub(r'rgba\(0,0,0,0\.6\)', 'var(--text-muted)', css)

# Save
with open('style.css', 'w') as f:
    f.write(css)

print("Conversion complete.")
