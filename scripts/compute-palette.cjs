/* Design-time palette generator. Run: node scripts/compute-palette.cjs */
const chroma = require('chroma-js');

const SEED = '#4f46e5'; // existing primary purple (indigo-600)
const base = chroma(SEED);
const [l, c, h] = base.get('lch');

// Triadic companions at +120 and +240, chroma kept elevated
const companion = (deg) => chroma.lch(l, Math.max(c, 55), (h + deg) % 360);
const teal = companion(240); // -> Momentum / progress
const orange = companion(120); // -> Attention / focus

// Full shade scale from a seed hue: vary OKLCH lightness, keep hue, taper chroma
function scale(seedColor) {
  const src = chroma(seedColor);
  const [, , hue] = src.get('oklch');
  const stops = [0.96, 0.93, 0.88, 0.78, 0.68, 0.58, 0.5, 0.42, 0.34, 0.27, 0.2]; // 50..950
  const chromaTaper = [0.35, 0.5, 0.7, 0.85, 0.95, 1, 1, 0.95, 0.85, 0.75, 0.65];
  const baseChroma = Math.max(src.get('oklch')[1], 0.13);
  return stops.map((L, i) =>
    chroma.oklch(L, baseChroma * chromaTaper[i], hue)
  );
}

const names = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Tinted neutrals: slate baseline mixed with 5% primary in OKLCH
const slateL = [0.977, 0.951, 0.919, 0.855, 0.724, 0.584, 0.488, 0.398, 0.309, 0.232, 0.163];
const slateC = [0.006, 0.008, 0.011, 0.016, 0.019, 0.019, 0.018, 0.017, 0.016, 0.015, 0.014];
const tintedSlate = slateL.map((L, i) =>
  chroma.mix(chroma.oklch(L, slateC[i], 255), base, 0.05, 'oklch')
);

const hex = (c) => c.hex();
const out = (title, cols) => {
  console.log(`\n${title}`);
  cols.forEach((c, i) => console.log(`  ${names[i]}: '${hex(c)}',`));
};

out('MOMENTUM (teal, +240)', scale(teal));
out('ATTENTION (orange, +120)', scale(orange));
out('SLATE TINTED (+5% primary)', tintedSlate);

console.log('\nCONTRAST CHECKS (AA >= 4.5)');
const check = (name, fg, bg) => {
  const r = chroma.contrast(fg, bg);
  console.log(`  ${name}: ${r.toFixed(2)} ${r >= 4.5 ? 'PASS' : 'FAIL'}`);
};
const S = (cols) => ({ light: hex(cols[0]), mid: hex(cols[5]), dark: hex(cols[7]), deep: hex(cols[10]) });
const M = S(scale(teal));
const A = S(scale(orange));
check('slate-700 text on slate-50 bg (light body)', '#555f68', hex(tintedSlate[0]));
check('slate-700 text on slate-100 card (light body)', '#555f68', hex(tintedSlate[1]));
check('slate-600 text on slate-50 bg (light secondary)', hex(tintedSlate[6]), hex(tintedSlate[0]));
check('slate-300 text on slate-950 bg (dark body)', hex(tintedSlate[3]), hex(tintedSlate[10]));
check('slate-300 text on slate-900 card (dark body)', hex(tintedSlate[3]), hex(tintedSlate[9]));
check('white on primary', '#ffffff', SEED);
check('white on momentum-700', '#ffffff', hex(scale(teal)[6]));
check('white on attention-600', '#ffffff', hex(scale(orange)[5]));
check('momentum-800 text on momentum-50 badge', M.deep, M.light);
check('attention-800 text on attention-50 badge', A.deep, A.light);
check('momentum-200 text on momentum-950 badge (dark)', hex(scale(teal)[2]), M.dark);
check('attention-200 text on attention-950 badge (dark)', hex(scale(orange)[2]), A.dark);
