#!/usr/bin/env python3
"""Generate a self-contained inline-SVG icon module from the installed lucide-react
package, covering exactly the icons this codebase uses. Removes the runtime
dependency on the lucide-react barrel (867KB chunk) and its per-icon chunks."""
import re, json, os, sys

PKG = 'node_modules/lucide-react/dist/esm'
BARREL = f'{PKG}/lucide-react.js'

# Icons imported statically across the codebase
STATIC = """AlertTriangle AppWindow ArrowLeft ChevronDown ChevronLeft ChevronRight ChevronUp
CircuitBoard Clock Columns2 Copy Cpu Database Disc Edit2 Expand Eye EyeOff Fan Hammer
HardDrive ImageIcon KeyRound LayoutGrid Lightbulb ListChecks Loader2 Mail MemoryStick
Minus Monitor MonitorPlay MoreVertical Package Pencil PencilLine Plus RectangleHorizontal
Redo2 Save Search Server Settings Share2 Shield ShieldCheck Smartphone Space Star Tag
Ticket Trash2 Type Undo2 Upload User Wrench X Zap""".split()

# Icons resolved dynamically at runtime by name (DB values + admin picker options)
DYNAMIC = """ShieldCheck Rocket Sparkles Server Smartphone LayoutDashboard Megaphone Bell
Tag Zap Star Gift Percent Clock Info AlertTriangle Heart Monitor Palette Code""".split()

WANTED = sorted(set(STATIC) | set(DYNAMIC))

# Build exported-name -> icon module file map from the barrel
name2file = {}
for line in open(BARREL):
    m = re.match(r"export \{(.*)\} from '\./icons/(.+?)\.js';", line.strip())
    if not m:
        continue
    fname = m.group(2)
    for part in m.group(1).split(','):
        am = re.search(r'default as (\w+)', part.strip())
        if am:
            name2file.setdefault(am.group(1), fname)

def parse_node(fname):
    """Extract the __iconNode array from an icon module as Python data."""
    src = open(f'{PKG}/icons/{fname}.js').read()
    m = re.search(r'const __iconNode = (\[.*?\]);\nconst ', src, re.S)
    if not m:
        sys.exit(f'could not parse {fname}')
    body = m.group(1)
    body = re.sub(r'\bkey:\s*"[^"]*"', '', body)          # drop react keys, we add our own
    body = re.sub(r'(\w+):', r'"\1":', body)               # quote object keys
    body = re.sub(r'""(\w+)"":', r'"\1":', body)           # undo double-quoting
    body = re.sub(r',\s*\}', '}', body)                    # trailing commas
    body = re.sub(r',\s*\]', ']', body)
    return json.loads(body)

missing = [n for n in WANTED if n not in name2file]
if missing:
    sys.exit(f'unknown icon names: {missing}')

icons = {n: parse_node(name2file[n]) for n in WANTED}

out = []
out.append("""/**
 * Inline SVG icons — generated from lucide-react v0.563.0 (ISC licensed).
 *
 * Icons are defined locally instead of imported from `lucide-react` so they get
 * bundled directly into whichever chunk consumes them. Importing from the
 * lucide-react barrel produced an 867KB async chunk plus a serial waterfall of
 * per-icon chunks; this module costs ~1KB per icon and loads with its consumer.
 *
 * Regenerate with scripts/gen-icons.py if new icons are needed.
 */
import React from 'react';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  size?: string | number;
  strokeWidth?: string | number;
}

type IconNode = [string, Record<string, string | number>][];

/** Drop-in replacements for lucide-react's exported types. */
export type LucideProps = IconProps;
export type LucideIcon = React.FC<IconProps>;

const createIcon = (name: string, node: IconNode): React.FC<IconProps> => {
  const Icon: React.FC<IconProps> = ({ size = 24, strokeWidth = 2, color = 'currentColor', ...rest }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {node.map(([tag, attrs], i) => React.createElement(tag, { ...attrs, key: i }))}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
};
""")

for n in WANTED:
    node = json.dumps(icons[n], separators=(',', ':'))
    out.append(f"export const {n} = createIcon('{n}', {node} as IconNode);")

out.append("")
out.append("/** Registry for icons resolved by name at runtime (admin-configured). */")
out.append("export const iconRegistry: Record<string, React.FC<IconProps>> = {")
for n in WANTED:
    out.append(f"  {n},")
out.append("};")
out.append("")
out.append("/**")
out.append(" * Names admins may choose from. Anything outside this list renders nothing,")
out.append(" * so icon pickers must constrain input to these values.")
out.append(" */")
out.append("export const availableIconNames: string[] = Object.keys(iconRegistry).sort();")
out.append("")

os.makedirs('src/components/common', exist_ok=True)
with open('src/components/common/icons.tsx', 'w') as f:
    f.write('\n'.join(out))

print(f'generated {len(WANTED)} icons -> src/components/common/icons.tsx')
