import os, re

basedir = '/Users/patiencelee38/Documents/Thesis II/VScode'
count = 0
for root, dirs, files in os.walk(basedir):
    # Skip hidden / node_modules
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
    for fn in files:
        if not fn.endswith('.html'):
            continue
        fp = os.path.join(root, fn)
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'themes/base.css' not in content:
            continue
        if 'theme-field-primary.css' in content:
            print(f'SKIP {fp}')
            continue
        if '../css/themes/base.css' in content:
            prefix = '../css/themes'
        else:
            prefix = 'css/themes'
        line1 = f'    <link rel="stylesheet" href="{prefix}/theme-field-primary.css" />'
        line2 = f'    <link rel="stylesheet" href="{prefix}/theme-rule-independent.css" />'
        insert_text = '\n' + line1 + '\n' + line2
        pattern = r'(<link rel="stylesheet" href="[^"]*themes/base\.css" />)'
        new_content = re.sub(pattern, r'\g<1>' + insert_text, content, count=1)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f'OK {fp}')

print(f'\nDone: {count} files updated')
