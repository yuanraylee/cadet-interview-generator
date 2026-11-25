/* Advanced simulated ATC memory drills: 6–8 distinct information units.
   These hypothetical instructions are for interview practice, not real operations.
   In all cases pilots should clarify any clearance that is unsafe or ambiguous. */
const ATC_HARD_PLUS = [
 {id:'advanced-ifr',phase:'departure',label:'Complex IFR Clearance',source:'ICAO Doc 9432 / FAA AIM 4-4 (simulated clearance)',rich:true,build:c=>{
  const dest=pick(['NOMAN','BOLKA','DRAKE']); const sid=pick(['NOMAN TWO','BOLKA ONE','DRAKE THREE']);
  const fl=pick([70,90,110]); const hd=pick(['080','120','160']);const freq=pick(['119.30','120.80','125.10']);const squawk=randomSquawkCode();
  const fields=[`Cleared to ${dest}`,`Via ${sid} departure`,`Climb initially to FL${fl}`,`After departure fly heading ${hd}`,`Contact Departure ${freq}`,`Squawk ${squawk}`];
  return {spoken:`${c}, cleared to ${dest} via ${sid} departure, climb initially to flight level ${fl}, after departure fly heading ${hd}, departure frequency ${freq}, squawk ${squawk}.`,readback:`Cleared to ${dest} via ${sid} departure, initial climb flight level ${fl}, after departure heading ${hd}, departure ${freq}, squawk ${squawk}, ${c}.`,fields,note:'Hypothetical clearance. SID, heading and airspace compatibility are assumed for the exercise; not for real flight use.'};
 }},
 {id:'advanced-ground',phase:'ground',label:'Complex Taxi / Hold Short',source:'ICAO Doc 9432 / FAA AIM 4-3 (simulated ground clearance)',rich:true,build:c=>{
  const rw=pick(['05R','23L']);const hold=pick(['05L','23R']); const gate=pick(['B4','C7','D2']);const freq=pick(['121.70','121.90','122.10']);
  const fields=[`Taxi from stand ${gate}`,`Holding point runway ${rw}`,'Via Alpha','Via Bravo','Via Charlie',`Hold short of runway ${hold}`,`Monitor Ground ${freq} when instructed`];
  return {spoken:`${c}, from stand ${gate}, taxi to holding point runway ${rw} via Alpha, Bravo and Charlie, hold short of runway ${hold}, monitor Ground on ${freq} when instructed.`,readback:`From ${gate}, taxi to holding point runway ${rw} via Alpha, Bravo, Charlie, holding short of runway ${hold}, monitor Ground ${freq} when instructed, ${c}.`,fields,note:'Fictional airport layout; no crossing of any runway is authorized by this clearance.'};
 }},
 {id:'advanced-departure',phase:'departure',label:'Departure Level / Heading / Speed',source:'ICAO Doc 9432 (simulated departure control)',rich:true,build:c=>{
  const hd=pick(['070','110','160','240']);const fl=pick([140,160,180]);const sp=pick([220,230,240]);const fix=pick(['DRAKE','MOLKA','KAPLI']);const freq=pick(['119.20','124.65','125.70']);const squawk=randomSquawkCode();
  const fields=[`Turn right heading ${hd}`,`Climb to FL${fl}`,`Maintain ${sp} knots`,`Proceed direct ${fix} when able`,`Squawk ${squawk}`,`Contact Departure ${freq} after passing FL100`];
  return {spoken:`${c}, turn right heading ${hd}, climb to flight level ${fl}, maintain ${sp} knots, when able proceed direct ${fix}, squawk ${squawk}, contact Departure ${freq} after passing flight level one zero zero.`,readback:`Right heading ${hd}, climb flight level ${fl}, maintain ${sp} knots, when able direct ${fix}, squawk ${squawk}, Departure ${freq} after flight level one zero zero, ${c}.`,fields,note:'For memory practice only; the change from vector to direct routing is conditional. All levels and sectors are hypothetical.'};
 }},
 {id:'advanced-crossing',phase:'enroute',label:'Conditional Crossing Restriction',source:'ICAO Doc 9432 / FAA AIM 4-4 (simulated en-route clearance)',rich:true,build:c=>{
  const fix=pick(['DRAKE','MOLKA','KAPLI']);const after=pick(['NOMAN','BOLKA','TAMRA']);const fl=pick([130,150,170]);const sp=pick([220,230,240]);const next=fl-20;const freq=pick(['125.45','127.30','128.60']);
  const fields=[`Proceed direct ${fix}`,`Cross ${fix} at FL${fl}`,`Speed ${sp} knots or less at ${fix}`,`After ${fix} proceed direct ${after}`,`Descend to FL${next} after ${fix}`,`Contact Center ${freq} after ${fix}`];
  return {spoken:`${c}, proceed direct ${fix}, cross ${fix} at flight level ${fl}, speed ${sp} knots or less, after ${fix} proceed direct ${after}, descend to flight level ${next}, then contact Center on ${freq}.`,readback:`Direct ${fix}, cross ${fix} flight level ${fl} at ${sp} knots or less, after ${fix} direct ${after}, descend flight level ${next}, Center ${freq}, ${c}.`,fields,note:'Sequence matters: the later descent and routing apply after the named fix. Clearance is fictional.'};
 }},
 {id:'advanced-holding',phase:'enroute',label:'Detailed Holding Clearance',source:'ICAO Doc 9432 / FAA AIM 5-3 (simulated holding)',rich:true,build:c=>{
  const fix=pick(['MOLKA','DRAKE','KAPLI']);const inbound=pick(['090','180','270']);const turns=pick(['left','right']);const fl=pick([120,140,160]);const speed=pick([210,220,230]);const time=pick(['20','35','50']);
  const fields=[`Hold at ${fix}`,`Inbound track ${inbound}`,`${turns} turns`,'One-minute legs',`Maintain FL${fl}`,`Maintain ${speed} knots or less`,`Expect further clearance at ${time} past the hour`];
  return {spoken:`${c}, hold at ${fix}, inbound track ${inbound}, ${turns} turns, one-minute legs, maintain flight level ${fl}, speed ${speed} knots or less, expect further clearance at ${time} past the hour.`,readback:`Hold at ${fix}, inbound ${inbound}, ${turns} turns, one-minute legs, flight level ${fl}, ${speed} knots or less, further clearance at ${time} past the hour, ${c}.`,fields,note:'Hypothetical unpublished hold. The stated expect-further-clearance time is relative to the hour and is not an operational authorization.'};
 }},
 {id:'advanced-approach',phase:'arrival',label:'Approach Vector / QNH / Speed',source:'ICAO Doc 9432 (simulated terminal approach)',rich:true,build:c=>{
  const rw=pick(['05R','23L']);const hd=pick(['080','130','250']);const alt=pick([3000,4000,5000]);const sp=pick([170,180,190]);const qnh=pick([1007,1012,1016]);const freq=pick(['118.30','119.10','120.15']);
  const fields=[`Turn left heading ${hd}`,`Descend to ${fmtFeet(alt)} feet`,`QNH ${qnh}`,`Reduce speed to ${sp} knots`,`Expect ILS runway ${rw}`,`Report localizer established`,`Tower frequency ${freq} (information only)`];
  return {spoken:`${c}, turn left heading ${hd}, descend to ${fmtFeet(alt)} feet, QNH ${qnh}, reduce speed to ${sp} knots, expect ILS runway ${rw}, report localizer established, Tower frequency ${freq} for later contact.`,readback:`Left heading ${hd}, descend ${fmtFeet(alt)} feet, QNH ${qnh}, speed ${sp} knots, expect ILS runway ${rw}, wilco, ${c}.`,fields,note:'Expect ILS is NOT an approach clearance. Tower frequency is information for later contact, not a handoff instruction.'};
 }},
 {id:'advanced-missed',phase:'arrival',label:'Missed Approach / Reclearance',source:'ICAO Doc 9432 (simulated go-around instruction)',rich:true,build:c=>{
  const rw=pick(['05R','23L']);const hd=pick(['080','140','260']);const alt=pick([4000,5000,6000]);const qnh=pick([1008,1013,1016]);const freq=pick(['119.50','120.10','121.20']);
  const fields=['Go around',`Runway ${rw} context`,`Climb to ${fmtFeet(alt)} feet`,`Turn right heading ${hd}`,`QNH ${qnh}`,`Contact Approach ${freq} when workload permits`];
  return {spoken:`${c}, go around, runway ${rw}, climb to ${fmtFeet(alt)} feet, turn right heading ${hd}, QNH ${qnh}, contact Approach on ${freq} when able.`,readback:`Going around, climb ${fmtFeet(alt)} feet, right heading ${hd}, QNH ${qnh}, Approach ${freq} when able, ${c}.`,fields,note:'Safety-critical instruction: fly the go-around first, read back as workload allows. Synthetic clearance, not for flight operations.'};
 }},
 {id:'advanced-weather',phase:'communication',label:'Weather / Route Amendment',source:'ICAO Doc 9432 (simulated clearance amendment)',rich:true,build:c=>{
  const fix=pick(['DRAKE','MOLKA','KAPLI']);const next=pick(['NOMAN','BOLKA','TAMRA']);const hd=pick(['070','130','240']);const fl=pick([170,190,210]);const speed=pick([230,240,250]);const freq=pick(['126.30','127.55','128.20']);
  const fields=['Amended clearance',`Turn left heading ${hd}`,`Maintain FL${fl}`,`Maintain ${speed} knots`,`When able direct ${fix}`,`Then direct ${next}`,`Contact Center ${freq} after ${fix}`];
  return {spoken:`${c}, amended clearance due weather, turn left heading ${hd}, maintain flight level ${fl}, maintain ${speed} knots, when able proceed direct ${fix}, then direct ${next}, contact Center on ${freq} after ${fix}.`,readback:`Amended clearance, left heading ${hd}, maintain flight level ${fl}, ${speed} knots, when able direct ${fix}, then ${next}, Center ${freq} after ${fix}, ${c}.`,fields,note:'A hypothetical route change; maintain current clearance until amended instructions are understood and accepted.'};
 }},
 {id:'advanced-ground-arrival',phase:'ground',label:'After Landing / Complex Taxi',source:'ICAO Doc 9432 / FAA AIM 4-3 (simulated taxi)',rich:true,build:c=>{
  const stand=pick(['A12','B7','C14']);const exit=pick(['Bravo','Delta']);const freq=pick(['121.70','121.90','122.20']);const hold=pick(['05R','23L']);
  const fields=[`Taxi to stand ${stand}`,`Via taxiway ${exit}`,'Then Echo','Then Foxtrot',`Hold short of runway ${hold}`,`Monitor Ground ${freq} after reaching Echo`];
  return {spoken:`${c}, taxi to stand ${stand} via ${exit}, Echo and Foxtrot, hold short of runway ${hold}, monitor Ground on ${freq} after reaching Echo.`,readback:`Taxi to stand ${stand} via ${exit}, Echo, Foxtrot, hold short of runway ${hold}, monitor Ground ${freq} after reaching Echo, ${c}.`,fields,note:'Hypothetical taxiway layout; no permission to enter or cross the runway is given.'};
 }}
];
