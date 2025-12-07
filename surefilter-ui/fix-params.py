#!/usr/bin/env python3
import re

files = [
    "src/app/api/admin/categories/[id]/route.ts",
    "src/app/api/admin/spec-parameters/[id]/route.ts",
    "src/app/api/admin/products/[id]/route.ts",
]

for filepath in files:
    print(f"Fixing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Fix the malformed function signatures
    # Pattern: function_name(\n  request: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n  const { id } = await params;\n) {
    # Replace with: function_name(\n  request: NextRequest,\n  { params }: { params: Promise<{ id: string }> }\n) {\n  const { id } = await params;
    
    pattern = r'(export async function (?:GET|PUT|DELETE)\(\n  request: NextRequest,\n  \{ params \}: \{ params: Promise<\{ id: string \}> \})\n  const \{ id \} = await params;\n\) \{'
    replacement = r'\1\n) {\n  const { id } = await params;'
    
    content = re.sub(pattern, replacement, content)
    
    # Remove duplicate "const { id } = await params;" lines
    lines = content.split('\n')
    new_lines = []
    prev_line = None
    for line in lines:
        if line.strip() == 'const { id } = await params;' and prev_line and prev_line.strip() == 'const { id } = await params;':
            continue  # Skip duplicate
        new_lines.append(line)
        prev_line = line
    
    content = '\n'.join(new_lines)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"  ✓ Fixed {filepath}")

print("\n✅ All files fixed!")
