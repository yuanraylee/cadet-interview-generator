// node tests/pronunciation.test.cjs  (no dependencies needed)
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('js/ui/atc-explanation.js','utf8');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('data/atc-navaids.js','utf8'),context,{filename:'atc-navaids.js'});
vm.runInNewContext(source,context,{filename:'atc-explanation.js'});
const speak=context.window.CadetAtcTeaching.radioReading;
const cases=[
 ['C-D-O approved and cleared DRAKE 1B RNAV Arrival','See-Dee-Oh approved and cleared DRAKE wun Bravo R-nav Arrival'],
 ['CDO approved and cleared DRAKE 1B RNAV Arrival','See-Dee-Oh approved and cleared DRAKE wun Bravo R-nav Arrival'],
 ['C-D-O approved','Charlie Delta Oscar approved'],
 ['DRAKE 1B RNAV Arrival','DRAKE wun Bravo R-nav Arrival'],
 ['QNH 1013','Q-N-H wun zero wun tree'],
 ['squawk 0424','squawk zero fower too fower'],
 ['runway 05R','runway zero fife right'],
 ['runway 23L','runway too tree left'],
 ['runway 09','runway zero niner'],
 ['heading 090','heading zero niner zero'],
 ['FL140','flight level wun fower zero'],
 ['flight level 80','flight level ait zero'],
 ['6,000 feet','six thousand feet'],
 ['2,500 feet','too thousand fife hundred feet'],
 ['12,300 feet','wun too thousand tree hundred feet'],
 ['1,450 feet','wun fower fife zero feet'],
 ['119.50','wun wun niner decimal fife zero'],
 ['118.005','wun wun ait decimal zero zero fife'],
 ['maintain 185 knots','maintain wun ait fife knots'],
 ['United 121','United wun too wun'],
 ['ILS runway 23R','I-L-S runway too tree right'],
 ['taxiway A','taxiway Alfa'],
 ['RNP approach','R-N-P approach'],
 ['SID departure','sid departure'],
 ['STAR arrival','STAR arrival'],
 ['ATIS information','A-TIS information'],
 ['RVR 600','R-V-R six hundred'],
 ['visibility 1200','visibility wun thousand too hundred'],
 ['G-ABCD','Golf Alfa Bravo Charlie Delta'],
 ['29.92','too niner decimal niner too'],
 ['wind 230 degrees 10 knots','wind too tree zero degrees wun zero knots'],
];
const navaidCases=[
 ['TNN VOR/DME','SIGANG V-O-R / D-M-E'],
 ['APU VOR','ANBU V-O-R'],
 ['HLG VOR','HOULONG V-O-R'],
 ['HLN VOR/DME','HUALIEN V-O-R / D-M-E'],
 ['MKG VOR','MAGONG V-O-R'],
 ['GID VOR','LUDAO V-O-R'],
 ['HCN VOR','HENGCHUN V-O-R'],
 ['NKN DME','MATSU/NANGAN D-M-E'],
 ['NK NDB','MATSU/NANGAN N-D-B'],
 ['BS NDB','KINMEN N-D-B'],
 ['identifier TNN','identifier Tango November November'],
 ['navaid code APU','navaid code Alfa Papa Uniform'],
 ['TNN','TNN'],
 ['direct TNN','direct TNN'],
 ['TPE','TPE'],
 ['VOR/DME','V-O-R/D-M-E'],
 ['NDB','N-D-B'],
 ['ADF','A-D-F'],
 ['VORTAC','VOR-TAC'],
 ['DRAKE','DRAKE'],
 ['ILS runway 23R','I-L-S runway too tree right'],
];
const navaidDetails=context.window.CadetAtcTeaching.navaidDetails;
assert.equal(navaidDetails('TNN').spokenName,'SIGANG');
assert.equal(navaidDetails('TNN').spelledIdentifier,'Tango November November');
assert.equal(navaidDetails('APU').spelledIdentifier,'Alfa Papa Uniform');
assert.equal(navaidDetails('BAD'),null);
for(const [input,expected] of cases){assert.equal(speak(input),expected,`Input: ${input}`);}
for(const [input,expected] of navaidCases){assert.equal(speak(input),expected,`Navaid input: ${input}`);}
console.log(`PASS ${cases.length + navaidCases.length} aviation pronunciation regression cases (+ 10 navaids)`);
