/* Generate three independent simulated ATC messages with a variety of phases. */
function makeAtcSet(mode){
 if(mode==='hard')return makeAtcSet80k();
 const eligible = mode==='hard' ? ATC_HARD_PLUS : (mode==='easy' ? PROCEDURES : PROCEDURES.filter(p=>p.rich));
 const groups = new Map();
 for(const procedure of mix(eligible)){
  const phase = procedure.phase || (['pushback','taxi','lineup','takeoff'].includes(procedure.id)?'ground':(['landing','goaround','approach','arrival'].includes(procedure.id)?'arrival':'enroute'));
  if(!groups.has(phase))groups.set(phase,[]);
  groups.get(phase).push(procedure);
 }
 const chosen=[];
 for(const phase of mix([...groups.keys()])){
  if(chosen.length>=3)break;
  chosen.push(groups.get(phase)[0]);
 }
 if(chosen.length<3){
  for(const procedure of mix(eligible)){
   if(chosen.length>=3)break;
   if(!chosen.includes(procedure))chosen.push(procedure);
  }
 }
 const callsigns=mix(CALLSIGNS).slice(0,3);
 return mix(chosen).map((procedure,i)=>{
  const [airline,call]=callsigns[i];
  const callsign=`${call} ${range(100,899)}`;
  const scenario=procedure.build(callsign,mode);
  return {...scenario,procedure:procedure.label,source:procedure.source,airline,callsign};
 });
}
