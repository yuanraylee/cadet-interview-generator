/* Mental arithmetic, heading, temperature and interview questions. */
function makeArithmetic(){
 const op=pick(['+','−','×','÷']);let a,b,answer;
 if(op==='+'){a=range(11,88);b=range(12,75);answer=a+b;}
 else if(op==='−'){a=range(40,99);b=range(11,a-5);answer=a-b;}
 else if(op==='×'){a=range(11,29);b=range(2,12);answer=a*b;}
 else {b=range(2,12);answer=range(3,18);a=b*answer;}
 let explanation;
 if(op==='+')explanation=`Step 1: Add the tens and ones separately: ${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} = ${Math.floor(a/10)*10+Math.floor(b/10)*10}; ${a%10} + ${b%10} = ${a%10+b%10}.\nStep 2: Combine them: ${Math.floor(a/10)*10+Math.floor(b/10)*10} + ${a%10+b%10} = ${answer}.`;
 else if(op==='−')explanation=`Step 1: Subtract the tens and ones using a convenient split: ${a} − ${Math.floor(b/10)*10} = ${a-Math.floor(b/10)*10}.\nStep 2: Subtract the remaining ${b%10}: ${a-Math.floor(b/10)*10} − ${b%10} = ${answer}.`;
 else if(op==='×')explanation=`Step 1: Split ${a} into ${Math.floor(a/10)*10} and ${a%10}.\nStep 2: ${Math.floor(a/10)*10} × ${b} = ${Math.floor(a/10)*10*b}; ${a%10} × ${b} = ${(a%10)*b}.\nStep 3: Add the partial products: ${Math.floor(a/10)*10*b} + ${(a%10)*b} = ${answer}.`;
 else explanation=`Step 1: Look for the number that gives ${a} when multiplied by ${b}.\nStep 2: ${b} × ${answer} = ${a}.\nStep 3: Therefore ${a} ÷ ${b} = ${answer}.`;
 return {type:'Arithmetic',question:`What is ${a} ${op} ${b}?`,answer:String(answer),explanation};
}
function makeHeading(){
 const start=range(0,35)*10,amount=pick([30,45,60,90,110,120,135,150,180,210,270]);const dir=pick(['left','right']);
 const end=((start+(dir==='right'?amount:-amount))%360+360)%360;
 const signed=dir==='right'?amount:-amount;
 const raw=start+signed;
 const operation=dir==='right'?'+':'−';
 const explanation=`Step 1: Start at ${fmt3(start)}°. A ${dir} turn means ${dir==='right'?'add':'subtract'} ${amount}°.\nStep 2: ${start} ${operation} ${amount} = ${raw}°.\nStep 3: Headings are between 000° and 359°; ${raw<0?`add 360°: ${raw} + 360 = ${end}`:raw>=360?`subtract 360°: ${raw} − 360 = ${end}`:`no wraparound is needed: ${end}`}°.\nFinal heading: ${fmt3(end)}°.`;
 return {type:'Heading',question:`Your current heading is ${fmt3(start)} degrees. You turn ${dir} ${amount} degrees. What is your new heading?`,answer:`${fmt3(end)}°`,explanation};
}
function makeTemp(){
 const t=range(20,35),h=pick([1000,1600,2000,2400,3000,3500]);const ans=(t-h/1000*6.5).toFixed(1);
 const km=h/1000,drop=(km*6.5).toFixed(1);
 const explanation=`Step 1: Convert altitude: ${fmtFeet(h)} m ÷ 1,000 = ${km} km.\nStep 2: Temperature decrease: ${km} × 6.5°C/km = ${drop}°C.\nStep 3: Estimated temperature: ${t} − ${drop} = ${ans}°C.\nThis is a theoretical estimate; actual atmospheric conditions may differ.`;
 return {type:'Temperature',question:`Sea-level temperature is ${t} degrees Celsius. Using a theoretical lapse rate of 6.5 degrees per kilometer, estimate the temperature at ${fmtFeet(h)} meters, to one decimal place.`,answer:`${ans}°C`,explanation};
}
function makeQuestions(){
 const extra=mix(DEFAULT_BANK).slice(0,2).map(([q,a,t])=>({type:t,question:q,answer:a,explanation:'Key points: '+a+'\nFor a spoken answer, explain the main concept in your own words, then give a relevant operational or safety example when appropriate.'}));
 return [makeArithmetic(),makeHeading(),makeTemp(),...extra];
}
