/* Validate final palette: node scripts/validate-palette.cjs */
const chroma = require('chroma-js');

// Slate recolor: keep Tailwind slate lightness per stop, shift hue to purple
// (~OKLCH hue 277) with a subtle chroma lift ~= "5% primary" perceptually.
const slateL = [0.977, 0.951, 0.919, 0.855, 0.724, 0.584, 0.488, 0.398, 0.309, 0.232, 0.163];
const slateC = [0.006, 0.008, 0.011, 0.016, 0.019, 0.019, 0.018, 0.017, 0.016, 0.015, 0.014];
const tintLift = [0.008, 0.01, 0.012, 0.014, 0.014, 0.013, 0.012, 0.011, 0.01, 0.009, 0.008];
const names = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const tinted = slateL.map((L, i) => chroma.oklch(L, slateC[i] + tintLift[i], 277));
tinted.forEach((c, i) => console.log(`slate-${names[i]}: ${c.hex()}`));

console.log('\nCONTRAST (AA body >= 4.5)');
const check = (n, fg, bg) => {
  const r = chroma.contrast(fg, bg);
  console.log(`  ${n}: ${r.toFixed(2)} ${r >= 4.5 ? 'PASS' : 'FAIL'}`);
};
const hx = (i) => tinted[i].hex();
check('body slate-700 on page slate-50', hx(7), hx(0));
check('body slate-700 on card slate-100', hx(7), hx(1));
check('secondary slate-600 on page slate-50', hx(6), hx(0));
check('secondary slate-600 on card slate-100', hx(6), hx(1));
check('muted slate-500 on page slate-50 (small text only)', hx(5), hx(0));
check('dark body slate-300 on page slate-950', hx(3), hx(10));
check('dark body slate-300 on card slate-900', hx(3), hx(9));
check('dark secondary slate-400 on card slate-900', hx(4), hx(9));
check('white on primary #4f46e5', '#ffffff', '#4f46e5');

// Momentum fills use 700+; attention fills use 600+
check('white on momentum-700 #006148', '#ffffff', '#006148');
check('white on attention-600 #a93800', '#ffffff', '#a93800');
check('momentum-800 text on momentum-50 badge', '#004934', '#d3fcf0');
check('attention-800 text on attention-50 badge', '#6c0d00', '#ffe6d6');
check('dark: momentum-200 text on momentum-950', '#95ecd3', '#002113');
check('dark: attention-200 text on attention-950', '#ffbf9f', '#370000');
check('dark: momentum-300 text on card slate-900', '#5fceb2', hx(9));
check('dark: attention-300 text on card slate-900', '#ff9873', hx(9));
