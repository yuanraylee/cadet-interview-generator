// Run: node tests/atc-difficulty.test.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const root=process.cwd();
const context={window:{},console};
for(const path of [
 'js/utils/helpers.js','data/atc.js','data/atc-extra.js',
 'data/atc-80k.js',
 'js/generators/atc-validation.js','js/generators/atc.js'
]) vm.runInNewContext(fs.readFileSync(`${root}/${path}`,'utf8'),context,{filename:path});
const generate=vm.runInNewContext('makeAtcSet',context);
const validate=context.window.CadetAtcValidation.validate;
const counts={};
for(const mode of ['easy','normal','hard']){
 const lower={easy:2,normal:4,hard:5}[mode], upper={easy:3,normal:5,hard:6}[mode];
 counts[mode]={cases:0,min:99,max:0,phases:new Set(),procedures:new Set()};
 for(let i=0;i<2000;i++){
  const items=generate(mode);
  assert.equal(items.length,3);
  const phases=new Set();
  for(const item of items){
   const n=item.fields.length;
   assert.ok(n>=lower&&n<=upper,`${mode} got ${n}: ${item.spoken}`);
   assert.equal(n,item.difficultyItems);
   assert.ok(item.spoken.includes(item.callsign));
   assert.ok(item.readback.includes(item.callsign));
   const result=validate(item,mode,mode==='hard'?null:vm.runInNewContext(`PROCEDURES.find(p => p.label === ${JSON.stringify(item.procedure)})?.id`,context));
   assert.ok(result.ok,`${mode} failed validation: ${result.reason}`);
   counts[mode].cases++;
   counts[mode].min=Math.min(counts[mode].min,n);
   counts[mode].max=Math.max(counts[mode].max,n);
   counts[mode].procedures.add(item.procedure);
   if(item.phase) phases.add(item.phase);
   counts[mode].phases.add(item.phase||'inferred');
  }
  if(mode==='hard')assert.equal(phases.size,3,'Hard must cover departure/enroute/arrival');
 }
}
// Reject phantom fields, underloaded Normal, and undocumented Hard families.
const normal=generate('normal')[0];
const pid=vm.runInNewContext(`PROCEDURES.find(p=>p.label===${JSON.stringify(normal.procedure)})?.id`,context);
assert.equal(validate({...normal,fields:normal.fields.slice(0,2)},'normal',pid).ok,false);
assert.equal(validate({...normal,spoken:'Turn left heading 270'},'normal',pid).ok,false);
const hard=generate('hard')[0];
assert.equal(validate({...hard,fields:[...hard.fields,'fake extra']},'hard').ok,false);
for(const [mode,r] of Object.entries(counts))
 console.log(`${mode.toUpperCase()}: ${r.cases} cases, ${r.min}-${r.max} items, ${r.procedures.size} procedures`);
console.log('PASS: 18,000 generated transmissions + negative validation tests');
