/* ICAO Doc 9432-informed educational annotations; synthetic exercise, not operational authority.
 * Both the source transmission and readback get written ICAO-style numeral pronunciation cues.
 * Context determines whether an element is an instruction, restriction, advisory or report.
 */
(function(){
'use strict';
const digits={'0':'zero','1':'wun','2':'too','3':'tree','4':'fower','5':'fife','6':'six','7':'seven','8':'ait','9':'niner'};
const spell = value => String(value).split('').map(ch=>digits[ch]||ch).join(' ');
const numberWords = n => {
  const num=Number(n);
  if(num<1000)return spell(n);
  const thousands=Math.floor(num/1000), rem=num%1000;
  if(rem===0)return `${spell(thousands)} thousand`;
  if(rem%100===0)return `${spell(thousands)} thousand ${spell(rem/100)} hundred`;
  if(rem<100)return `${spell(thousands)} thousand ${spell(String(rem).padStart(2,'0'))}`;
  const hundreds=Math.floor(rem/100), tail=rem%100;
  return `${spell(thousands)} thousand ${spell(hundreds)} hundred${tail?` ${spell(String(tail).padStart(2,'0'))}`:''}`;
};
function radioReading(text){
  let v=String(text);
  // Replace long/short forms in order; unlike English number names, ICAO headings/speeds/SSR are digit by digit.
  v=v.replace(/\bflight level\s+(\d{2,3})\b/gi,(_,n)=>'flight level '+spell(n));
  v=v.replace(/\bFL\s*(\d{2,3})\b/g,(_,n)=>'flight level '+spell(n));
  v=v.replace(/\b(QNH)\s+(\d{4})\b/gi,(_,name,n)=>name+' '+spell(n));
  v=v.replace(/\b(squawk)\s+(\d{4})\b/gi,(_,name,n)=>name+' '+spell(n));
  v=v.replace(/\b(\d{2,3})\.(\d{2,3})\b/g,(_,a,b)=>spell(a)+' decimal '+spell(b));
  v=v.replace(/\b(\d{1,3}(?:,\d{3})?|\d{4,5})\s+feet\b/gi,(_,n)=>numberWords(n.replace(/,/g,''))+' feet');
  v=v.replace(/\b(runway\s+)(\d{2})([LRC])?\b/gi,(_,name,n,suffix)=>name+spell(n)+(suffix?(' '+({L:'left',R:'right',C:'center'}[suffix.toUpperCase()])):''));
  v=v.replace(/\b(heading\s+)(\d{3})\b/gi,(_,name,n)=>name+spell(n));
  v=v.replace(/\b(\d{2,3})\s+knots\b/gi,(_,n)=>spell(n)+' knots');
  // Last numeric tokens are chiefly callsign numbers, levels and route constraints.
  v=v.replace(/\b\d+\b/g,m=>spell(m));
  return v;
}
const phaseDescriptions={
 departure:'Departure — after obtaining departure instructions, the crew manages initial heading, cleared climb, speed, route and transfer to departure control.',
 enroute:'En-route — the aircraft is receiving route, level, speed or radar vector changes during controlled flight.',
 arrival:'Arrival / Approach — instructions manage descent, arrival sequencing, approach preparation and handoff to tower.',
 ground:'Ground — the aircraft is at an airport, coordinating clearance, movement, runway crossings and takeoff or after-landing operations.'
};
function inferPhase(q){
 if(q.phase)return q.phase;
 const s=(q.procedure+' '+q.spoken).toLowerCase();
 if(/taxi|pushback|line up|start.up|runway cross|hold short/.test(s))return 'ground';
 if(/arrival|landing|approach|localizer|ils|holding|descent/.test(s))return 'arrival';
 if(/departure|airborne|takeoff|initial climb/.test(s))return 'departure';
 return 'enroute';
}
function explainField(field){
 const f=String(field),s=f.toLowerCase();
 if(/amended|re.clearance/.test(s))return 'ATC is revising an earlier clearance. The revised elements replace affected earlier instructions; verify the actual new clearance.';
 if(/hold short/.test(s))return 'Stop before the specified runway or holding point. Do not enter the runway without a separate clearance.';
 if(/cross.*runway/.test(s))return 'Permission to cross the identified runway only under the stated clearance; a taxi clearance alone does not authorize crossing.';
 if(/squawk|transponder/i.test(s))return 'Set the assigned four-digit SSR transponder code (each digit must be 0–7); IDENT means briefly activate the identification feature, not choose a code.';
 if(/heading|turn|vector/.test(s))return 'Fly the assigned magnetic heading and direction. A heading is where the nose points, not necessarily your ground track.';
 if(/climb|descend|flight level|\bfl\d|altitude|maintain.*feet/.test(s))return 'Observe the cleared altitude or flight level; a crossing/reporting level is not automatically a new clearance. Flight levels use standard pressure reference.';
 if(/speed|knots|\bkt\b/.test(s))return 'Comply with the assigned airspeed or restriction. “Or less” states a maximum; “until advised” keeps the restriction in force until changed.';
 if(/qnh/.test(s))return 'Set the given altimeter pressure (QNH) as applicable. This is an altimeter setting, not an assigned altitude.';
 if(/direct|route|fix|thereafter|when able|when instructed/.test(s))return 'This controls navigation to a fix or sequence of fixes. “When able” and “when instructed” have different conditions; do not treat a forecast route as immediate clearance.';
 if(/hold at|inbound|turns|legs|holding/.test(s))return 'This describes a holding instruction: fix, inbound course, turn direction, leg length and the assigned level or speed limit.';
 if(/report|passing|leaving|established|weather/.test(s))return 'A reporting requirement: tell ATC when this condition occurs. It is not itself permission to change altitude or route.';
 if(/frequency|contact|tower|center|departure/.test(s))return 'Radio communications detail. “Contact” instructs a frequency change; “for information” is advisory and does not itself direct a transfer.';
 if(/expect/.test(s))return 'Expect is advance information about a possible later clearance, NOT authorization to begin that approach, route or maneuver.';
 if(/runway|ils|approach/.test(s))return 'Runway or approach identification for planning/clearance. “Expect” does not mean “cleared.”';
 return 'Check this item against the original transmission: identify the value, its units, and any timing or condition before reading back.';
}
function breakdownItems(q){
 const fields=Array.isArray(q.fields)?q.fields:[];
 return fields.map(field=>({text:String(field),meaning:explainField(field),pronunciation:radioReading(field)}));
}
function atcTeachingHTML(q,escape){
 const e=escape;
 const phase=inferPhase(q),items=breakdownItems(q);
 const itemsHtml=items.map((entry,i)=>`<li><div class="atc-explain-item"><strong>${i+1}. ${e(entry.text)}</strong><p>${e(entry.meaning)}</p><p class="atc-reading-mini">Spoken numbers: ${e(entry.pronunciation)}</p></div></li>`).join('');
 return `<div class="atc-teaching">
  <h4>Flight Phase & Context</h4><p>${e(phaseDescriptions[phase]||phaseDescriptions.enroute)}</p>
  <h4>ICAO-style Spoken Transmission</h4><p class="radio-spoken">${e(radioReading(q.spoken))}</p>
  <p class="atc-caution">Numerals are shown with ICAO-style sound cues (e.g. tree, fower, fife, niner). Names of fixes and airline callsigns are written as supplied; local/company pronunciations must be checked separately.</p>
  <h4>Reference Readback / Acknowledgment</h4><p>${e(q.readback)}</p>
  <h4>How to Say the Readback</h4><p class="radio-spoken">${e(radioReading(q.readback))}</p>
  <h4>Instruction Breakdown</h4><ol class="atc-detail-list">${itemsHtml}</ol>
  <h4>Key Learning Point</h4><p>Separate actual clearances from expectations and information. Read back mandatory clearance elements and restrictions; retain the order, timing and conditions. ${e(q.note||'This is a simulated training exercise.')}</p>
  <p class="smallNote">Phraseology reference: ICAO Doc 9432 (2007); scenario and explanations are educational simulations, not verified operational clearances. Exact readback requirements depend on current procedures and local rules.</p>
 </div>`;
}
window.CadetAtcTeaching={radioReading,breakdownItems,inferPhase,atcTeachingHTML};
})();
