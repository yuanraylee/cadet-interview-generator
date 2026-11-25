/* 80,000 uniquely addressable synthetic ATC training prompts.
 * Eight situational families × 25 primary values × 20 levels/routes × 20 speeds/details.
 * Generates on demand: no large static file, no copy/pasted ICAO examples.
 * ICAO Doc 9432 (4th ed., 2007) is a phraseology reference, not a source of 80k real clearances.
 * Hypothetical airport, waypoints, frequencies and operating constraints. Not for flight use.
 */
const ATC_CATALOG_SIZE = 80000;
const ATC_FAMILIES = [
 {name:'Departure Vector / Frequency',phase:'departure',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'), fl=100+y*10, speed=200+z*5;
  const fix=['KAPLI','NOMAN','DRAKE','MOLKA','TAMRA'][x%5], freq=['119.20','120.75','124.60','125.35'][y%4];
  return {spoken:`${c}, after departure turn right heading ${hd}, climb to flight level ${fl}, maintain ${speed} knots, when able proceed direct ${fix}, report passing flight level ${fl-20}, then contact Departure on ${freq}.`,readback:`After departure right heading ${hd}, climb flight level ${fl}, ${speed} knots, when able direct ${fix}, report passing flight level ${fl-20}, Departure ${freq}, ${c}.`,fields:[`Right heading ${hd}`,`Climb FL${fl}`,`${speed} knots`,`When able direct ${fix}`,`Report passing FL${fl-20}`,`Then Departure ${freq}`]};
 }},
 {name:'Departure / Amended Clearance',phase:'departure',make:(x,y,z,c)=>{
  const hd=String(40+x*10).padStart(3,'0'),fl=90+y*10,speed=190+z*5;
  const fix=['BOLKA','DRAKE','NOMAN','TAMRA','KAPLI'][y%5];
  return {spoken:`${c}, amended departure clearance, fly heading ${hd} after airborne, climb to flight level ${fl}, maintain ${speed} knots or less, proceed direct ${fix} when instructed, report passing flight level ${fl-20}, expect further routing.`,readback:`Amended clearance, heading ${hd} after airborne, climb FL${fl}, ${speed} knots or less, direct ${fix} when instructed, report passing FL${fl-20}, ${c}.`,fields:[`Amended departure clearance`,`Heading ${hd} after airborne`,`Climb FL${fl}`,`Speed ${speed} knots or less`,`Direct ${fix} when instructed`,`Report passing FL${fl-20}`]};
 }},
 {name:'En-route Descent / Radar Vector',phase:'enroute',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'),fl=110+y*10,speed=200+z*5;
  const fix=['DRAKE','MOLKA','KAPLI','NOMAN','TAMRA'][z%5],freq=['125.45','127.30','128.60'][y%3];
  return {spoken:`${c}, turn left heading ${hd}, descend to flight level ${fl}, reduce speed to ${speed} knots, when able proceed direct ${fix}, report leaving flight level ${fl+40}, contact Center ${freq} after reporting.`,readback:`Left heading ${hd}, descend FL${fl}, ${speed} knots, when able direct ${fix}, report leaving FL${fl+40}, Center ${freq} after reporting, ${c}.`,fields:[`Left heading ${hd}`,`Descend FL${fl}`,`Reduce to ${speed} knots`,`When able direct ${fix}`,`Report leaving FL${fl+40}`,`Center ${freq} after report`]};
 }},
 {name:'En-route Crossing Restriction',phase:'enroute',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'),fl=110+y*10,speed=200+z*5;
  const fix=['KAPLI','MOLKA','DRAKE','TAMRA','BOLKA'][x%5],next=['TAMRA','NOMAN','BOLKA'][z%3];
  return {spoken:`${c}, fly heading ${hd} until established on the revised route, then proceed direct ${fix}, cross ${fix} at flight level ${fl} and ${speed} knots or less, thereafter direct ${next}, report passing ${fix}.`,readback:`Heading ${hd} until established, then direct ${fix}, cross ${fix} at FL${fl}, ${speed} knots or less, thereafter direct ${next}, report passing ${fix}, ${c}.`,fields:[`Heading ${hd} until established`,`Direct ${fix}`,`Cross ${fix} at FL${fl}`,`${speed} knots or less at ${fix}`,`Then direct ${next}`,`Report passing ${fix}`]};
 }},
 {name:'Weather Avoidance / Re-clearance',phase:'enroute',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'),fl=110+y*10,speed=200+z*5;
  const fix=['KAPLI','TAMRA','NOMAN','DRAKE'][y%4],next=['MOLKA','BOLKA','KAPLI'][z%3];
  return {spoken:`${c}, amended clearance due weather, turn right heading ${hd}, maintain flight level ${fl} and ${speed} knots, when able proceed direct ${fix}, then direct ${next}, report clear of weather.`,readback:`Amended clearance, right heading ${hd}, maintain FL${fl}, ${speed} knots, when able direct ${fix}, then ${next}, report clear of weather, ${c}.`,fields:['Amended clearance',`Right heading ${hd}`,`Maintain FL${fl}`,`Maintain ${speed} knots`,`When able direct ${fix}`,`Then direct ${next}`,'Report clear of weather']};
 }},
 {name:'Terminal Approach / Sequencing',phase:'arrival',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'),alt=2500+y*500,speed=150+z*5;
  const rw=['05R','23L','05L','23R'][y%4],qnh=1000+(x%22),freq=['118.30','119.10','120.15'][z%3];
  return {spoken:`${c}, turn left heading ${hd}, descend to ${alt} feet, QNH ${qnh}, reduce speed to ${speed} knots, expect ILS approach runway ${rw}, report localizer established, Tower frequency ${freq} for information.`,readback:`Left heading ${hd}, descend ${alt} feet, QNH ${qnh}, ${speed} knots, expect ILS runway ${rw}, will report established, ${c}.`,fields:[`Left heading ${hd}`,`Descend ${alt} feet`,`QNH ${qnh}`,`Reduce to ${speed} knots`,`Expect ILS ${rw}`,`Report localizer established`,`Tower ${freq}: information only`]};
 }},
 {name:'Arrival / Holding Clearance',phase:'arrival',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'),fl=70+y*5,speed=160+z*5;
  const fix=['MOLKA','DRAKE','NOMAN','KAPLI','TAMRA'][x%5],turn=x%2?'left':'right';
  return {spoken:`${c}, fly heading ${hd} for sequencing, then hold at ${fix}, inbound track ${hd}, ${turn} turns, one-minute legs, maintain flight level ${fl}, maximum speed ${speed} knots.`,readback:`Heading ${hd} for sequencing, then hold ${fix}, inbound ${hd}, ${turn} turns, one-minute legs, maintain FL${fl}, maximum ${speed} knots, ${c}.`,fields:[`Heading ${hd} for sequencing`,`Hold at ${fix}`,`Inbound track ${hd}`,`${turn} turns`,'One-minute legs',`Maintain FL${fl}`,`Maximum ${speed} knots`]};
 }},
 {name:'Arrival / Radar Vector and Descent',phase:'arrival',make:(x,y,z,c)=>{
  const hd=String(30+x*10).padStart(3,'0'),alt=2500+y*500,speed=150+z*5;
  const rw=['05R','23L','05L','23R'][z%4],qnh=1000+(y%22),fix=['KAPLI','NOMAN','MOLKA'][x%3];
  return {spoken:`${c}, turn right heading ${hd}, descend to ${alt} feet, QNH ${qnh}, maintain ${speed} knots until advised, expect vectors for ILS runway ${rw}, report passing ${alt+2000} feet, then standby for further instructions.`,readback:`Right heading ${hd}, descend ${alt} feet, QNH ${qnh}, ${speed} knots until advised, expect vectors ILS ${rw}, report passing ${alt+2000} feet, ${c}.`,fields:[`Right heading ${hd}`,`Descend ${alt} feet`,`QNH ${qnh}`,`Maintain ${speed} knots`,`Expect vectors ILS ${rw}`,`Report passing ${alt+2000} feet`]};
 }}
];
function atcByCatalogId(id,callsign){
 if(!Number.isInteger(id)||id<0||id>=ATC_CATALOG_SIZE) throw new RangeError('ATC catalog ID must be 0–79999');
 const family=Math.floor(id/10000),local=id%10000;
 const x=Math.floor(local/400),y=Math.floor(local%400/20),z=local%20;
 const template=ATC_FAMILIES[family];
 const scenario=template.make(x,y,z,callsign);
 return {...scenario,procedure:template.name,source:'ICAO Doc 9432 (phraseology reference); synthetic scenario, not a published clearance',catalogId:id+1,phase:template.phase,note:'Imaginary route/airspace and clearances. Training only; not for actual flight operations.'};
}
window.CadetAtcCatalog={size:ATC_CATALOG_SIZE,byId:atcByCatalogId};
