const fs = require('fs');
const path = require('path');

const replacements = {
  '#1a4d3a': '#0F172A',
  '#0f2e23': '#020617',
  '#133829': '#020617',
  '#c8501e': '#10B981',
  '#fdf2ed': '#D1FAE5',
  '#f8f6f2': '#F8FAFC',
  '#f9f7f4': '#F8FAFC',
  '#111827': '#0F172A',
  '#1c1c1c': '#0F172A',
  '#4b5563': '#475569',
  '#e5e7eb': '#E2E8F0',
  '#e0ddd7': '#E2E8F0',
  '#ede8e0': '#E2E8F0',
  '#e8e4de': '#E2E8F0',
  '#f0ede7': '#F8FAFC',
  'bg-white': 'bg-surface',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [oldColor, newColor] of Object.entries(replacements)) {
    // Replace case-insensitive, but only hex codes.
    if (oldColor.startsWith('#')) {
      const regex = new RegExp(oldColor, 'gi');
      content = content.replace(regex, newColor);
    }
  }

  // Handle specific class name changes safely
  // We want to avoid replacing bg-white if it's already bg-surface in HomePage or globals.css
  // Let's just focus on the hex colors for now.

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
