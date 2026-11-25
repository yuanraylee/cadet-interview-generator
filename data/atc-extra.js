/* Extra simulated ATC situations. Each scenario has a self-contained context and readback.
 * The exercise deliberately does not claim these are operational clearances.
 * Easy normally has 1–3 memory items, Normal 3–5, Hard 4–6.
 * Runways, facilities, frequencies, and fix names are hypothetical within the scene.
 */
const ATC_EXTRA = [
 {id:'ifr-clearance',label:'IFR Departure Clearance',phase:'departure',source:'ICAO Doc 9432 / FAA AIM 4-4, clearance and SSR',build:(c,mode)=>{
  const dest=pick(['Hong Kong','Singapore','Osaka Kansai']);const code=randomSquawkCode();
  const level=pick([5000,6000,7000]);const freq=pick(['119.50','120.10','124.60']);
  const fields=[`Cleared to ${dest} via flight planned route`,`Initial climb ${fmtFeet(level)} ft`,`Squawk ${code}`];
  if(mode!=='easy')fields.push(`Departure frequency ${freq}`);
  if(mode==='hard')fields.push('Read back all clearance details');
  const dep=mode==='easy'?'':`, departure frequency ${freq}`;
  return {spoken:`${c}, cleared to ${dest} via flight planned route, initial climb ${fmtFeet(level)} feet${dep}, squawk ${code}.`,readback:`Cleared to ${dest} via flight planned route, initial climb ${fmtFeet(level)} feet${dep}, squawk ${code}, ${c}.`,fields,note:'Simulated IFR clearance; flight planned route and local departure instructions are assumed, not a published clearance.'};
 }},
 {id:'startup',label:'Start-up Approval',phase:'ground',source:'ICAO Doc 9432, start-up procedures',build:(c,mode)=>{
  const expect=pick([5,8,10]);const fields=['Start-up approved'];
  if(mode!=='easy')fields.push(`Expect pushback in ${expect} minutes`);
  if(mode==='hard')fields.push('Report ready for pushback');
  const addon=mode==='easy'?'':`, expect pushback in ${expect} minutes${mode==='hard'?', report ready for pushback':''}`;
  return {spoken:`${c}, start-up approved${addon}.`,readback:`Start-up approved${mode==='easy'?'':`, expect pushback in ${expect} minutes${mode==='hard'?', will report ready':''}`}, ${c}.`,fields,note:'Start-up approval does not authorize pushback or taxi.'};
 }},
 {id:'pushback-facing',label:'Pushback Direction',phase:'ground',source:'ICAO Doc 9432, pushback',build:(c,mode)=>{
  const face=pick(['north','south','east','west']);const fields=['Pushback approved',`Face ${face}`];
  if(mode==='hard')fields.push('Report when ready to taxi');
  const addon=mode==='hard'?', report when ready to taxi':'';
  return {spoken:`${c}, pushback approved, face ${face}${addon}.`,readback:`Pushback approved, face ${face}${mode==='hard'?', wilco':''}, ${c}.`,fields,note:'Only a hypothetical stand location and safe pushback path are assumed.'};
 }},
 {id:'taxi-route',label:'Taxi via Taxiways',phase:'ground',source:'ICAO Doc 9432 / FAA AIM 4-3, taxi instructions',build:(c,mode)=>{
  const rw=pick(['05R','23L']);const route=mode==='easy'?'Alpha':mode==='normal'?'Alpha and Bravo':'Alpha, Bravo and Charlie';
  const fields=[`Taxi to holding point runway ${rw}`,`Via ${route}`];
  if(mode==='hard')fields.push('Hold short of runway 05L');
  const extra=mode==='hard'?', hold short of runway 05 left':'';
  return {spoken:`${c}, taxi to holding point runway ${rw} via ${route}${extra}.`,readback:`Taxi to holding point runway ${rw} via ${route}${extra}, ${c}.`,fields,note:'Taxiway topology is fictional. A taxi clearance never itself authorizes runway entry or crossing.'};
 }},
 {id:'hold-short',label:'Hold Short of Runway',phase:'ground',source:'FAA AIM 4-3 / ICAO Doc 9432, runway protection',build:(c,mode)=>{
  const rw=pick(['05L','23R']);const reason=pick(['landing traffic','departing traffic']);const fields=[`Hold short of runway ${rw}`];
  if(mode!=='easy')fields.push(`Reason: ${reason}`);
  if(mode==='hard')fields.push('Remain on current frequency');
  return {spoken:`${c}, hold short of runway ${rw}${mode==='easy'?'':`, ${reason}`}${mode==='hard'?', remain on this frequency':''}.`,readback:`Holding short of runway ${rw}${mode==='hard'?', remaining on this frequency':''}, ${c}.`,fields,note:'Runway hold-short instruction requires an accurate readback including the runway identification.'};
 }},
 {id:'runway-crossing',label:'Cross Runway Clearance',phase:'ground',source:'ICAO Doc 9432 / FAA JO 7110.65, runway crossing',build:(c,mode)=>{
  const rw=pick(['05L','23R']);const route=pick(['Alpha','Bravo']);const fields=[`Cross runway ${rw}`];
  if(mode!=='easy')fields.push(`Continue via taxiway ${route}`);
  if(mode==='hard')fields.push('Hold short of next runway 05R');
  const extra=mode==='easy'?'':`, continue via taxiway ${route}${mode==='hard'?', hold short of runway 05 right':''}`;
  return {spoken:`${c}, cross runway ${rw}${extra}.`,readback:`Cross runway ${rw}${extra}, ${c}.`,fields,note:'This is a simulated explicit runway crossing clearance; runway identifiers are arbitrary.'};
 }},
 {id:'frequency',label:'Contact Next Frequency',phase:'enroute',source:'ICAO Doc 9432 / FAA AIM 4-2, frequency change',build:(c,mode)=>{
  const facility=pick(['Departure','Approach','Center']);const freq=pick(['119.50','121.20','125.70']);const level=pick([7000,9000,11000]);
  const fields=[`Contact ${facility}`,`Frequency ${freq}`];
  if(mode==='hard')fields.push(`Report passing ${fmtFeet(level)} feet on initial call`);
  return {spoken:`${c}, contact ${facility} on ${freq}${mode==='hard'?', report passing '+fmtFeet(level)+' feet on initial call':''}.`,readback:`${freq}${mode==='hard'?', wilco':''}, ${c}.`,fields,note:'Frequency is fictional; simple frequency changes are usually acknowledged rather than repeated as a full clearance.'};
 }},
 {id:'direct-fix',label:'Proceed Direct to Fix',phase:'enroute',source:'ICAO Doc 9432, en-route direct routing',build:(c,mode)=>{
  const fix=pick(['DRAKE','MOLKA','KAPLI']);const level=pick([180,200,220,240]);const sp=pick([240,250,270]);
  const fields=[`Proceed direct ${fix}`];
  if(mode!=='easy')fields.push(`Maintain FL${level}`);
  if(mode==='hard')fields.push(`Maintain ${sp} knots`);
  const extra=mode==='easy'?'':`, maintain flight level ${level}${mode==='hard'?', maintain '+sp+' knots':''}`;
  return {spoken:`${c}, proceed direct ${fix}${extra}.`,readback:`Direct ${fix}${extra}, ${c}.`,fields,note:'Names are practice fixes. No charted flight path or airspace clearance is implied.'};
 }},
 {id:'speed-control',label:'Speed Control',phase:'enroute',source:'ICAO Doc 9432, speed control',build:(c,mode)=>{
  const sp=pick([190,200,210,220,240]);const alt=pick([5000,6000,7000]);const hd=pick(['090','140','270']);
  const fields=[`Reduce speed to ${sp} knots`];
  if(mode!=='easy')fields.push(`Maintain ${fmtFeet(alt)} feet`);
  if(mode==='hard')fields.push(`Turn left heading ${hd}`);
  const addon=mode==='easy'?'':`, maintain ${fmtFeet(alt)} feet${mode==='hard'?`, turn left heading ${hd}`:''}`;
  return {spoken:`${c}, reduce speed to ${sp} knots${addon}.`,readback:`Reducing speed to ${sp} knots${addon}, ${c}.`,fields,note:'Aircraft type, minimum speed and sector restrictions are assumed compatible in this fictional scenario.'};
 }},
 {id:'cross-restriction',label:'Crossing Altitude Restriction',phase:'enroute',source:'FAA AIM 4-4 / ICAO Doc 9432, crossing restrictions',build:(c,mode)=>{
  const fix=pick(['MOLKA','DRAKE']);const fl=pick([100,120,140]);const sp=pick([220,230,240]);
  const fields=[`Cross ${fix} at FL${fl}`];
  if(mode!=='easy')fields.push(`At ${sp} knots or less`);
  if(mode==='hard')fields.push('Report established at the restriction');
  const extra=mode==='easy'?'':`, at ${sp} knots or less${mode==='hard'?', report established at the restriction':''}`;
  return {spoken:`${c}, cross ${fix} at flight level ${fl}${extra}.`,readback:`Cross ${fix} at flight level ${fl}${mode==='easy'?'':', '+sp+' knots or less'}${mode==='hard'?', wilco':''}, ${c}.`,fields,note:'Fictional crossing restriction; not a published STAR/SID constraint.'};
 }},
 {id:'hold-fix',label:'Holding Instructions',phase:'enroute',source:'ICAO Doc 9432 / FAA AIM 5-3, holding',build:(c,mode)=>{
  const fix=pick(['DRAKE','MOLKA']);const fl=pick([100,120,140]);const turns=pick(['right','left']);const inbound=pick(['090','180','270']);
  const fields=[`Hold at ${fix}`,`Maintain FL${fl}`];
  if(mode!=='easy')fields.push(`${turns} turns`,`Inbound track ${inbound}`);
  if(mode==='hard')fields.push('One-minute legs','Report entering holding');
  const extra=mode==='easy'?'':`, ${turns} turns, inbound track ${inbound}${mode==='hard'?', one-minute legs, report entering the hold':''}`;
  return {spoken:`${c}, hold at ${fix}, maintain flight level ${fl}${extra}.`,readback:`Hold at ${fix}, flight level ${fl}${extra.replace(', report entering the hold',', wilco')}, ${c}.`,fields,note:'Unpublished hypothetical hold. The exercise is memory practice, not navigation planning.'};
 }},
 {id:'altimeter',label:'QNH / Altimeter Setting',phase:'arrival',source:'ICAO Doc 9432 / FAA AIM 7-2, altimeter',build:(c,mode)=>{
  const qnh=pick([1006,1009,1012,1015,1018]);const alt=pick([3000,4000,5000]);const dir=pick(['left','right']);const hd=pick(['120','180','270']);
  const fields=[`QNH ${qnh}`];
  if(mode!=='easy')fields.push(`Descend to ${fmtFeet(alt)} feet`);
  if(mode==='hard')fields.push(`Turn ${dir} heading ${hd}`);
  const extra=mode==='easy'?'':`, descend to ${fmtFeet(alt)} feet${mode==='hard'?', turn '+dir+' heading '+hd:''}`;
  return {spoken:`${c}, QNH ${qnh}${extra}.`,readback:`QNH ${qnh}${extra}, ${c}.`,fields,note:'Simulated local QNH, not a live weather report.'};
 }},
 {id:'approach-clearance',label:'ILS Approach Clearance',phase:'arrival',source:'ICAO Doc 9432, instrument approach clearance',build:(c,mode)=>{
  const rw=pick(['05R','23L']);const alt=pick([3000,4000,5000]);const hd=pick(['080','170','260']);const sp=pick([170,180,190]);
  const fields=[`Cleared ILS approach runway ${rw}`];
  if(mode!=='easy')fields.push(`Maintain ${fmtFeet(alt)} feet until established`);
  if(mode==='hard')fields.push(`Maintain ${sp} knots until 5 miles final`);
  const extra=mode==='easy'?'':`, maintain ${fmtFeet(alt)} feet until established${mode==='hard'?', maintain '+sp+' knots until 5 miles final':''}`;
  return {spoken:`${c}, cleared ILS approach runway ${rw}${extra}.`,readback:`Cleared ILS approach runway ${rw}${extra}, ${c}.`,fields,note:'Assumes established safe vectoring and a published ILS exist in this fictional scene. Clearance is not permission to land.'};
 }},
 {id:'visual-approach',label:'Visual Approach Clearance',phase:'arrival',source:'ICAO Doc 9432, visual approach clearance',build:(c,mode)=>{
  const rw=pick(['05R','23L']);const freq=pick(['118.30','119.10']);const fields=[`Cleared visual approach runway ${rw}`];
  if(mode!=='easy')fields.push('Report on final');
  if(mode==='hard')fields.push(`Contact Tower ${freq} after reporting final`);
  const extra=mode==='easy'?'':', report on final'+(mode==='hard'?', then contact Tower on '+freq:'');
  return {spoken:`${c}, cleared visual approach runway ${rw}${extra}.`,readback:`Cleared visual approach runway ${rw}${mode==='easy'?'':', wilco'}${mode==='hard'?', Tower '+freq:''}, ${c}.`,fields,note:'Hypothetical visual conditions; crew must be authorized and able to conduct a visual approach.'};
 }},
 {id:'go-around-instructions',label:'Go-around with Instructions',phase:'arrival',source:'ICAO Doc 9432, missed approach',build:(c,mode)=>{
  const hd=pick(['090','180','270']);const alt=pick([3000,4000,5000]);const freq=pick(['119.50','120.10']);
  const fields=['Go around'];
  if(mode!=='easy')fields.push(`Climb to ${fmtFeet(alt)} feet`,`Turn right heading ${hd}`);
  if(mode==='hard')fields.push(`Contact Approach ${freq}`);
  const extra=mode==='easy'?'':`, climb to ${fmtFeet(alt)} feet, turn right heading ${hd}${mode==='hard'?', contact Approach on '+freq:''}`;
  return {spoken:`${c}, go around${extra}.`,readback:`Going around${mode==='easy'?'':', climb to '+fmtFeet(alt)+' feet, right heading '+hd}${mode==='hard'?', Approach '+freq:''}, ${c}.`,fields,note:'Safety-critical go-around instruction; execute first, read back as workload permits under applicable procedures.'};
 }},
 {id:'vacate-runway',label:'Vacate Runway',phase:'arrival',source:'ICAO Doc 9432 / FAA AIM 4-3, runway vacating',build:(c,mode)=>{
  const rw=pick(['05R','23L']);const tx=pick(['Bravo','Charlie']);const freq=pick(['121.70','121.90']);
  const fields=[`Vacate runway ${rw} via ${tx}`];
  if(mode!=='easy')fields.push(`Contact Ground ${freq} when clear`);
  if(mode==='hard')fields.push('Report runway vacated');
  const extra=mode==='easy'?'':`, when clear contact Ground on ${freq}${mode==='hard'?', report runway vacated':''}`;
  return {spoken:`${c}, vacate runway ${rw} via taxiway ${tx}${extra}.`,readback:`Vacate runway ${rw} via ${tx}${mode==='easy'?'':', Ground '+freq}${mode==='hard'?', wilco':''}, ${c}.`,fields,note:'Taxiway exit is an invented scene; runway vacating guidance is not runway-crossing authorization.'};
 }},
 {id:'taxi-to-stand',label:'Taxi to Stand',phase:'arrival',source:'ICAO Doc 9432, ground taxi after landing',build:(c,mode)=>{
  const gate=pick(['A5','B12','C8']);const route=pick(['Alpha','Bravo']);
  const fields=[`Taxi to stand ${gate}`,`Via ${route}`];
  if(mode==='hard')fields.push('Give way to aircraft from the right');
  const extra=mode==='hard'?', give way to aircraft from the right':'';
  return {spoken:`${c}, taxi to stand ${gate} via taxiway ${route}${extra}.`,readback:`Taxi to stand ${gate} via ${route}${mode==='hard'?', giving way to aircraft from the right':''}, ${c}.`,fields,note:'Stand/taxiway layout is fictional; follow actual local ground procedures in real life.'};
 }},
 {id:'say-again',label:'Say Again / Repeat Instruction',phase:'communication',source:'ICAO Doc 9432 / FAA AIM 4-2, standard communications',build:(c,mode)=>{
  const hd=pick(['090','140','270']);const fl=pick([160,180,200]);const fields=['Say again requested detail'];
  if(mode!=='easy')fields.push(`Repeat assigned heading ${hd}`);
  if(mode==='hard')fields.push(`Repeat cleared FL${fl}`);
  const requested=mode==='easy'?'your last transmission':mode==='normal'?'assigned heading':'assigned heading and cleared level';
  const response=mode==='easy'?'Say again, '+c+'.':mode==='normal'?'Heading '+hd+', '+c+'.':'Heading '+hd+', flight level '+fl+', '+c+'.';
  return {spoken:`${c}, say again ${requested}.`,readback:response,fields,note:'Unlike a new clearance, this is a request to repeat an earlier transmission. The answer assumes the stated prior assignment.'};
 }},
 {id:'confirm-level',label:'Confirm Assigned Level',phase:'communication',source:'ICAO Doc 9432, verification and clarification',build:(c,mode)=>{
  const fl=pick([180,200,220]);const hd=pick(['070','140','280']);const fields=[`Confirm assigned FL${fl}`];
  if(mode==='hard')fields.push(`Confirm heading ${hd}`);
  const addon=mode==='hard'?', confirm heading '+hd:'';
  return {spoken:`${c}, confirm maintaining flight level ${fl}${addon}.`,readback:`Affirm, maintaining flight level ${fl}${mode==='hard'?', heading '+hd:''}, ${c}.`,fields,note:'Assumes the aircraft is at the queried level; if not, the pilot should correct ATC instead of affirming.'};
 }},
 {id:'report-position',label:'Position / Level Report',phase:'enroute',source:'ICAO Doc 9432, position reporting',build:(c,mode)=>{
  const fix=pick(['DRAKE','MOLKA']);const fl=pick([160,180,200]);const fields=[`Report passing ${fix}`];
  if(mode!=='easy')fields.push(`Include FL${fl}`);
  if(mode==='hard')fields.push('Report next estimate in minutes');
  return {spoken:`${c}, report passing ${fix}${mode==='easy'?'':', with your flight level'}${mode==='hard'?', and next position estimate':''}.`,readback:`Wilco, ${c}.`,fields,note:'Request is for a future report, so “wilco” is an acknowledgment. No actual position is fabricated in the readback.'};
 }},
 {id:'weather-advisory',label:'Weather / Turbulence Advisory',phase:'enroute',source:'ICAO Doc 9432 / FAA AIM 7-1, weather advisories',build:(c,mode)=>{
  const area=pick(['ahead on track','20 miles ahead','near your destination']);const level=pick([180,220,260]);
  const fields=[`Moderate turbulence ${area}`];
  if(mode!=='easy')fields.push(`Reported near FL${level}`);
  if(mode==='hard')fields.push('Advise if unable to maintain assigned level');
  const extra=mode==='easy'?'':`, reported near flight level ${level}${mode==='hard'?', advise if unable to maintain assigned level':''}`;
  return {spoken:`${c}, moderate turbulence reported ${area}${extra}.`,readback:`Roger${mode==='hard'?', wilco':''}, ${c}.`,fields,note:'Weather advisory is information, not normally a verbatim readback task; exercise checks comprehension.'};
 }},
 {id:'unable-clearance',label:'Unable / Alternative Clearance',phase:'communication',source:'ICAO Doc 9432 / FAA AIM 4-2, unable and amended clearance',build:(c,mode)=>{
  const sp=pick([180,190,200]);const hd=pick(['090','180','270']);const alt=pick([6000,7000]);const fields=[`Maintain ${sp} knots`];
  if(mode!=='easy')fields.push(`Turn right heading ${hd}`);
  if(mode==='hard')fields.push(`Maintain ${fmtFeet(alt)} feet`);
  const extra=mode==='easy'?'':`, turn right heading ${hd}${mode==='hard'?', maintain '+fmtFeet(alt)+' feet':''}`;
  return {spoken:`${c}, unable previous request, maintain ${sp} knots${extra}.`,readback:`Maintaining ${sp} knots${extra}, ${c}.`,fields,note:'This is a revised instruction following an assumed earlier pilot request. If a real clearance cannot be met, the crew must explicitly advise ATC.'};
 }}
];
// Append the expanded practice scenarios without altering the existing exercises.
PROCEDURES.push(...ATC_EXTRA.map(p=>({...p,rich:true})));
