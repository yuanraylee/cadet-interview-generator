/* Mental arithmetic, heading, temperature, and interview questions. */
function makeArithmetic() {
  const operation = pick(['+', '−', '×', '÷']);
  let first;
  let second;
  let answer;

  if (operation === '+') {
    first = range(11, 88);
    second = range(12, 75);
    answer = first + second;
  } else if (operation === '−') {
    first = range(40, 99);
    second = range(11, first - 5);
    answer = first - second;
  } else if (operation === '×') {
    first = range(11, 29);
    second = range(2, 12);
    answer = first * second;
  } else {
    second = range(2, 12);
    answer = range(3, 18);
    first = second * answer;
  }

  const firstTens = Math.floor(first / 10) * 10;
  const secondTens = Math.floor(second / 10) * 10;
  const firstOnes = first % 10;
  const secondOnes = second % 10;
  let explanation;

  if (operation === '+') {
    explanation =
      `Step 1: Add the tens and ones separately: ${firstTens} + ${secondTens} = ${firstTens + secondTens}; ` +
      `${firstOnes} + ${secondOnes} = ${firstOnes + secondOnes}.\n` +
      `Step 2: Combine them: ${firstTens + secondTens} + ${firstOnes + secondOnes} = ${answer}.`;
  } else if (operation === '−') {
    const subtractTens = Math.floor(second / 10) * 10;
    explanation =
      `Step 1: Subtract the tens and ones using a convenient split: ${first} − ${subtractTens} = ${first - subtractTens}.\n` +
      `Step 2: Subtract the remaining ${secondOnes}: ${first - subtractTens} − ${secondOnes} = ${answer}.`;
  } else if (operation === '×') {
    explanation =
      `Step 1: Split ${first} into ${firstTens} and ${firstOnes}.\n` +
      `Step 2: ${firstTens} × ${second} = ${firstTens * second}; ${firstOnes} × ${second} = ${firstOnes * second}.\n` +
      `Step 3: Add the partial products: ${firstTens * second} + ${firstOnes * second} = ${answer}.`;
  } else {
    explanation =
      `Step 1: Look for the number that gives ${first} when multiplied by ${second}.\n` +
      `Step 2: ${second} × ${answer} = ${first}.\n` +
      `Step 3: Therefore ${first} ÷ ${second} = ${answer}.`;
  }

  return {
    type: 'Arithmetic',
    question: `What is ${first} ${operation} ${second}?`,
    answer: String(answer),
    explanation
  };
}

function makeHeading() {
  const start = range(0, 35) * 10;
  const amount = pick([30, 45, 60, 90, 110, 120, 135, 150, 180, 210, 270]);
  const direction = pick(['left', 'right']);
  const signedAmount = direction === 'right' ? amount : -amount;
  const rawHeading = start + signedAmount;
  const end = ((rawHeading % 360) + 360) % 360;
  const operation = direction === 'right' ? '+' : '−';
  const wrapExplanation =
    rawHeading < 0
      ? `add 360°: ${rawHeading} + 360 = ${end}`
      : rawHeading >= 360
        ? `subtract 360°: ${rawHeading} − 360 = ${end}`
        : `no wraparound is needed: ${end}`;

  const explanation =
    `Step 1: Start at ${fmt3(start)}°. A ${direction} turn means ${direction === 'right' ? 'add' : 'subtract'} ${amount}°.\n` +
    `Step 2: ${start} ${operation} ${amount} = ${rawHeading}°.\n` +
    `Step 3: Headings are between 000° and 359°; ${wrapExplanation}°.\n` +
    `Final heading: ${fmt3(end)}°.`;

  return {
    type: 'Heading',
    question: `Your current heading is ${fmt3(start)} degrees. You turn ${direction} ${amount} degrees. What is your new heading?`,
    answer: `${fmt3(end)}°`,
    explanation
  };
}

function makeTemp() {
  const seaLevelTemperature = range(20, 35);
  const altitude = pick([1000, 1600, 2000, 2400, 3000, 3500]);
  const altitudeKm = altitude / 1000;
  const temperatureDrop = (altitudeKm * 6.5).toFixed(1);
  const estimatedTemperature = (
    seaLevelTemperature - altitudeKm * 6.5
  ).toFixed(1);

  const explanation =
    `Step 1: Convert altitude: ${fmtFeet(altitude)} m ÷ 1,000 = ${altitudeKm} km.\n` +
    `Step 2: Temperature decrease: ${altitudeKm} × 6.5°C/km = ${temperatureDrop}°C.\n` +
    `Step 3: Estimated temperature: ${seaLevelTemperature} − ${temperatureDrop} = ${estimatedTemperature}°C.\n` +
    'This is a theoretical estimate; actual atmospheric conditions may differ.';

  return {
    type: 'Temperature',
    question: `Sea-level temperature is ${seaLevelTemperature} degrees Celsius. Using a theoretical lapse rate of 6.5 degrees per kilometer, estimate the temperature at ${fmtFeet(altitude)} meters, to one decimal place.`,
    answer: `${estimatedTemperature}°C`,
    explanation
  };
}

function makeQuestions() {
  const extraQuestions = mix(DEFAULT_BANK)
    .slice(0, 2)
    .map(([question, answer, type]) => ({
      type,
      question,
      answer,
      explanation:
        `Key points: ${answer}\n` +
        'For a spoken answer, explain the main concept in your own words, then give a relevant operational or safety example when appropriate.'
    }));

  return [makeArithmetic(), makeHeading(), makeTemp(), ...extraQuestions];
}
