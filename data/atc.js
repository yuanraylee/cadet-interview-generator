/* Simulation-only ATC phraseology templates and callsign list. */
const CALLSIGNS = [
 ['China Airlines','Dynasty'],['EVA Air','EVA'],['STARLUX Airlines','Starwalker'],
 ['Cathay Pacific','Cathay'],['Singapore Airlines','Singapore'],['Qantas','Qantas'],
 ['Emirates','Emirates'],['Lufthansa','Lufthansa'],['United Airlines','United']
];

// Valid four-digit octal transponder codes (0–7), for simulated ATC only.
function randomSquawkCode(){
  const digit = () => range(0, 7);
  let code;
  do {
    code = Array.from({length:4}, digit).join('');
  } while (['7500','7600','7700','7000','2000','1200'].includes(code));
  return code;
}

const PROCEDURES = [
 {id:'climb',label:'Departure / Climb',rich:true,source:'ICAO Doc 9432, altitude and heading instructions',build:(c,mode)=>{
  const hd=pick(['060','090','120','150','180','240','300']);const dir=pick(['left','right']);const fl=pick([150,160,170,190,210]);const sp=pick([240,250,260]);const passing=fl-40;
  const fields=[`Turn ${dir}, heading ${hd}`,`Climb to FL${fl}`,`Maintain ${sp} kt`,`Report passing FL${passing}`];
  if(mode==='easy')fields.splice(2,2);
  if(mode==='hard')fields.push('When able');
  return {spoken:`${c}, ${mode==='hard'?'when able, ':''}turn ${dir} heading ${hd}, climb to flight level ${fl}${mode==='easy'?'':`, maintain ${sp} knots, report passing flight level ${passing}`}.`,readback:`${dir} heading ${hd}, climb to flight level ${fl}${mode==='easy'?'':`, maintaining ${sp} knots, wilco`}, ${c}.`,fields,note:'Generic departure exercise, assuming the aircraft is already airborne and below the cleared level.'};
 }},
 {id:'descent',label:'En-route / Descent',rich:true,source:'ICAO Doc 9432, level changes and reporting',build:(c,mode)=>{
  const hd=pick(['080','110','140','210','250','290']);const dir=pick(['left','right']);const fl=pick([140,160,180,200,220]);const sp=pick([250,260,270,280]);const passing=fl+40;
  const fields=[`Turn ${dir}, heading ${hd}`,`Descend to FL${fl}`,`Reduce speed to ${sp} kt`,`Report passing FL${passing}`];
  if(mode==='easy')fields.splice(2,2);
  return {spoken:`${c}, turn ${dir} heading ${hd}, descend to flight level ${fl}${mode==='easy'?'':`, reduce speed to ${sp} knots, report passing flight level ${passing}`}.`,readback:`${dir} heading ${hd}, descend to flight level ${fl}${mode==='easy'?'':`, reduce speed to ${sp} knots, wilco`}, ${c}.`,fields,note:'Generic en-route exercise. The scenario assumes the aircraft is above the reporting and cleared levels.'};
 }},
 {id:'vectors',label:'Radar Vectoring',rich:true,source:'ICAO Doc 9432, radar vectoring phraseology',build:(c,mode)=>{
  const hd=pick(['090','130','180','220','270','310']);const dir=pick(['left','right']);const alt=pick([6000,7000,8000,9000]);const sp=pick([190,200,210,220]);const qnh=pick([1008,1010,1013,1016]);const passing=alt+2000;
  const fields=[`Turn ${dir}, heading ${hd}`,`Descend to ${fmtFeet(alt)} ft`,`Reduce speed to ${sp} kt`,`QNH ${qnh}`];
  if(mode==='easy')fields.splice(2,2);
  if(mode==='hard')fields.push(`Report passing ${fmtFeet(passing)} ft`);
  const extra=mode==='hard'?`, report passing ${fmtFeet(passing)} feet`:'';
  return {spoken:`${c}, turn ${dir} heading ${hd}, descend to ${fmtFeet(alt)} feet${mode==='easy'?'':`, reduce speed to ${sp} knots, QNH ${qnh}${extra}`}.`,readback:`${dir} heading ${hd}, descend to ${fmtFeet(alt)} feet${mode==='easy'?'':`, speed ${sp} knots, QNH ${qnh}${mode==='hard'?', wilco':''}`}, ${c}.`,fields,note:'Illustrative vector without a geographical route. Minimum safe altitude has not been validated for a specific location.'};
 }},
 {id:'traffic',label:'Traffic Information',rich:true,source:'ICAO Doc 9432, traffic information',build:(c,mode)=>{
  const clock=pick([2,3,9,10,11]);const miles=pick([4,5,6,8]);const h=pick([6000,7000,8000,9000]);const type=pick(['Airbus A320','Boeing 737','Boeing 787']);const direction=pick(['opposite direction','crossing left to right','crossing right to left']);
  const fields=[`${clock} o’clock`,`${miles} miles`,`${direction}`,`${type} at ${fmtFeet(h)} ft`,'Report traffic in sight'];
  if(mode==='easy')fields.splice(3,2);
  const phrase=mode==='easy'?`${c}, traffic ${clock} o'clock, ${miles} miles, ${direction}.`:`${c}, traffic ${clock} o'clock, ${miles} miles, ${direction}, ${type} at ${fmtFeet(h)} feet, report traffic in sight.`;
  return {spoken:phrase,readback:mode==='easy'?`Looking out, ${c}.`:`Looking out, ${c}. (If actually seen, report “Traffic in sight.”)`,fields,note:'Simulated traffic information; unlike an ATC clearance, the traffic details are not necessarily read back verbatim.'};
 }},
 {id:'approach',label:'Approach Preparation',rich:true,source:'ICAO Doc 9432, radar vectoring / approach expectations',build:(c,mode)=>{
  const hd=pick(['220','250','280','300']);const dir=pick(['left','right']);const alt=pick([6000,7000,8000]);const sp=pick([190,200,210]);const qnh=pick([1010,1013,1015]);
  const fields=[`Turn ${dir}, heading ${hd}`,`Descend to ${fmtFeet(alt)} ft`,`Reduce speed to ${sp} kt`,`QNH ${qnh}`];
  if(mode==='easy')fields.splice(2,2);
  if(mode==='hard')fields.push('Expect further vectors');
  return {spoken:`${c}, turn ${dir} heading ${hd}, descend to ${fmtFeet(alt)} feet${mode==='easy'?'':`, reduce speed to ${sp} knots, QNH ${qnh}`}${mode==='hard'?', expect further vectors':''}.`,readback:`${dir} heading ${hd}, descend to ${fmtFeet(alt)} feet${mode==='easy'?'':`, reduce speed to ${sp} knots, QNH ${qnh}`}, ${c}.`,fields,note:'Generic terminal vectoring, without inventing an actual approach authorization, fix or runway assignment.'};
 }},
 {id:'arrival',label:'RNAV Arrival / CDO',rich:true,source:'Taiwan CAA RCTP eAIP AD 2.22.4, example CDO phraseology (AIRAC 05/26)',build:(c,mode)=>{
  const fields=['CDO approved','Cleared DRAKE 1B RNAV Arrival','When ready','Descend and maintain FL140'];
  if(mode==='easy')fields.splice(1,1);
  return {spoken:`${c}, C-D-O approved and cleared DRAKE 1B RNAV Arrival, when ready descend and maintain flight level 140.`,readback:`C-D-O approved, cleared DRAKE 1B RNAV Arrival, when ready descend and maintain flight level 140, ${c}.`,fields,note:'Based on a previously checked published RCTP eAIP phraseology example. Simulator callsign and flight context are hypothetical; check the active AIP before any operational use.'};
 }},
 {id:'squawk',label:'Transponder Code / Squawk',rich:true,source:'ICAO Doc 9432, SSR transponder instructions',build:(c,mode)=>{
  const code=randomSquawkCode();
  const hd=pick(['060','090','120','180','240','300']);
  const alt=pick([4000,5000,6000,7000]);
  const fields=[`Squawk ${code}`];
  if(mode==='normal')fields.push(`Turn right heading ${hd}`,`Climb to ${fmtFeet(alt)} ft`);
  if(mode==='hard')fields.push(`Turn left heading ${hd}`,`Climb to ${fmtFeet(alt)} ft`,'Report reaching assigned altitude');
  const extra=mode==='easy'?'':mode==='normal'
    ?`, turn right heading ${hd}, climb to ${fmtFeet(alt)} feet`
    :`, turn left heading ${hd}, climb to ${fmtFeet(alt)} feet, report reaching assigned altitude`;
  const reply=mode==='easy'?'':mode==='normal'
    ?`, right heading ${hd}, climb to ${fmtFeet(alt)} feet`
    :`, left heading ${hd}, climb to ${fmtFeet(alt)} feet, wilco`;
  return {spoken:`${c}, squawk ${code}${extra}.`,
    readback:`Squawk ${code}${reply}, ${c}.`,fields,
    note:'Set the four-digit transponder code (each digit 0–7). All codes and additional clearances are simulated.'};
 }},
 {id:'ident',label:'Radar Identification / Squawk Ident',rich:true,source:'ICAO Doc 9432, SSR IDENT instructions',build:(c,mode)=>{
  const hd=pick(['090','130','180','240','270']);
  const alt=pick([5000,6000,7000,8000]);
  const speed=pick([190,200,210,220]);
  const fields=['Squawk IDENT'];
  if(mode!=='easy')fields.push(`Turn right heading ${hd}`,`Maintain ${fmtFeet(alt)} ft`);
  if(mode==='hard')fields.push(`Maintain ${speed} kt`);
  const extra=mode==='easy'?'':`, turn right heading ${hd}, maintain ${fmtFeet(alt)} feet${mode==='hard'?`, maintain ${speed} knots`:''}`;
  const reply=mode==='easy'?'':`, right heading ${hd}, maintain ${fmtFeet(alt)} feet${mode==='hard'?`, maintain ${speed} knots`:''}`;
  return {spoken:`${c}, squawk ident${extra}.`,
    readback:`Ident${reply}, ${c}.`,fields,
    note:'Press IDENT when instructed. IDENT is not a four-digit code; this is a simulated radar identification exercise.'};
 }},
 {id:'pushback',label:'Pushback',rich:false,source:'ICAO Doc 9432, ground movement',build:(c,mode)=>({spoken:`${c}, push-back approved.`,readback:`Push-back approved, ${c}.`,fields:['Pushback approved'],note:'Intentionally short; no fictitious taxiway or facing direction.'})},
 {id:'taxi',label:'Taxi / Holding',rich:false,source:'ICAO Doc 9432, aerodrome control',build:(c,mode)=>({spoken:`${c}, hold position. Traffic crossing ahead. Stand by for further taxi instructions.`,readback:`Holding position, ${c}.`,fields:['Hold position','Traffic crossing ahead','Stand by'],note:'No unverified taxiway or holding-point route inserted.'})},
 {id:'lineup',label:'Line-up',rich:false,source:'ICAO Doc 9432, runway operations',build:(c,mode)=>({spoken:`${c}, runway 23 left, line up and wait.`,readback:`Runway 23 left, lining up and waiting, ${c}.`,fields:['Runway 23L','Line up','Wait'],note:'Runway 23L exists at RCTP, but this is not an actual entry authorization or taxi route.'})},
 {id:'takeoff',label:'Takeoff',rich:false,source:'ICAO Doc 9432, takeoff clearance',build:(c,mode)=>({spoken:`${c}, runway 23 left, wind 230 degrees 10 knots, cleared for take-off.`,readback:`Runway 23 left, cleared for take-off, ${c}.`,fields:['Runway 23L','Wind 230° at 10 kt','Cleared for takeoff'],note:'Runway exists at RCTP. Wind and permission are simulated and not real-world clearances.'})},
 {id:'landing',label:'Landing',rich:false,source:'ICAO Doc 9432, landing clearance',build:(c,mode)=>({spoken:`${c}, runway 23 left, wind 240 degrees 8 knots, cleared to land.`,readback:`Runway 23 left, cleared to land, ${c}.`,fields:['Runway 23L','Wind 240° at 8 kt','Cleared to land'],note:'Simulated runway and wind; actual approach position and clearance validity not verified.'})},
 {id:'goaround',label:'Go-around',rich:false,source:'ICAO Doc 9432, missed approach/go-around',build:(c,mode)=>({spoken:`${c}, go around, aircraft on runway.`,readback:`Going around, ${c}.`,fields:['Go around','Aircraft on runway'],note:'A safety-critical call is not lengthened artificially for difficulty.'})}
];
