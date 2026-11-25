/*
 * ATC memory-load profiles and output checks.
 * These checks cover exercise structure, not operational clearance validity.
 */

const ATC_DIFFICULTY_BOUNDS = Object.freeze({
  easy: [2, 3],
  normal: [4, 5],
  hard: [5, 6]
});

// A procedure is eligible only when its generated speech has a reviewed profile.
const ATC_LOAD_PROFILES = Object.freeze({
  climb: { easy: 2, normal: 4 },
  descent: { easy: 2, normal: 4 },
  vectors: { easy: 2, normal: 4 },
  traffic: { easy: 3, normal: 5 },
  approach: { easy: 2, normal: 4 },
  arrival: { normal: 4 },
  'hold-fix': { easy: 2, normal: 4 },
  'ifr-clearance': { easy: 3, normal: 4 },
  taxi: { easy: 3 }
});

const ATC_NORMAL_FIELD_RULES = Object.freeze({
  climb: [
    /turn (?:left|right) heading \d{3}/i,
    /climb to flight level \d+/i,
    /maintain \d+ knots/i,
    /report passing flight level \d+/i
  ],
  descent: [
    /turn (?:left|right) heading \d{3}/i,
    /descend to flight level \d+/i,
    /reduce speed to \d+ knots/i,
    /report passing flight level \d+/i
  ],
  vectors: [
    /turn (?:left|right) heading \d{3}/i,
    /descend to [\d,]+ feet/i,
    /reduce speed to \d+ knots/i,
    /QNH \d{4}/i
  ],
  traffic: [
    /traffic \d+ o'clock/i,
    /\d+ miles/i,
    /opposite direction|crossing left to right|crossing right to left/i,
    /(?:Airbus A320|Boeing 737|Boeing 787) at [\d,]+ feet/i,
    /report traffic in sight/i
  ],
  approach: [
    /turn (?:left|right) heading \d{3}/i,
    /descend to [\d,]+ feet/i,
    /reduce speed to \d+ knots/i,
    /QNH \d{4}/i
  ],
  arrival: [
    /C-D-O approved/i,
    /cleared DRAKE 1B RNAV Arrival/i,
    /when ready/i,
    /descend and maintain flight level 140/i
  ],
  'hold-fix': [
    /hold at [A-Z]+/i,
    /maintain flight level \d+/i,
    /(?:left|right) turns/i,
    /inbound track \d{3}/i
  ],
  'ifr-clearance': [
    /cleared to (?:Hong Kong|Singapore|Osaka Kansai) via flight planned route/i,
    /initial climb [\d,]+ feet/i,
    /departure frequency \d+\.\d+/i,
    /squawk [0-7]{4}/i
  ]
});

const ATC_EASY_FIELD_RULES = Object.freeze({
  climb: ATC_NORMAL_FIELD_RULES.climb.slice(0, 2),
  descent: ATC_NORMAL_FIELD_RULES.descent.slice(0, 2),
  vectors: ATC_NORMAL_FIELD_RULES.vectors.slice(0, 2),
  traffic: ATC_NORMAL_FIELD_RULES.traffic.slice(0, 3),
  approach: ATC_NORMAL_FIELD_RULES.approach.slice(0, 2),
  'hold-fix': ATC_NORMAL_FIELD_RULES['hold-fix'].slice(0, 2),
  'ifr-clearance': [
    ATC_NORMAL_FIELD_RULES['ifr-clearance'][0],
    ATC_NORMAL_FIELD_RULES['ifr-clearance'][1],
    ATC_NORMAL_FIELD_RULES['ifr-clearance'][3]
  ],
  taxi: [/hold position/i, /traffic crossing ahead/i, /stand by/i]
});

// Only these synthetic catalog families have six checked memory items.
const ATC_HARD_FIELD_RULES = Object.freeze({
  0: [
    /after departure turn right heading \d{3}/i,
    /climb to flight level \d+/i,
    /maintain \d+ knots/i,
    /when able proceed direct [A-Z]+/i,
    /report passing flight level \d+/i,
    /contact Departure on \d+\.\d+/i
  ],
  1: [
    /amended departure clearance/i,
    /fly heading \d{3} after airborne/i,
    /climb to flight level \d+/i,
    /maintain \d+ knots or less/i,
    /proceed direct [A-Z]+ when instructed/i,
    /report passing flight level \d+/i
  ],
  2: [
    /turn left heading \d{3}/i,
    /descend to flight level \d+/i,
    /reduce speed to \d+ knots/i,
    /when able proceed direct [A-Z]+/i,
    /report leaving flight level \d+/i,
    /contact Center \d+\.\d+ after reporting/i
  ],
  3: [
    /fly heading \d{3} until established/i,
    /then proceed direct [A-Z]+/i,
    /cross [A-Z]+ at flight level \d+/i,
    /\d+ knots or less/i,
    /thereafter direct [A-Z]+/i,
    /report passing [A-Z]+/i
  ],
  7: [
    /turn right heading \d{3}/i,
    /descend to \d+ feet/i,
    /QNH \d{4}/i,
    /maintain \d+ knots/i,
    /expect vectors for ILS runway \d{2}[LR]/i,
    /report passing \d+ feet/i
  ]
});

const ATC_HARD_FAMILY_PROFILES = Object.freeze({
  departure: [0, 1],
  enroute: [2, 3],
  arrival: [7]
});

function atcScenarioPhase(procedure) {
  if (procedure.phase) return procedure.phase;

  if (['pushback', 'taxi', 'lineup', 'takeoff'].includes(procedure.id)) {
    return 'ground';
  }

  if (['climb', 'ifr-clearance'].includes(procedure.id)) {
    return 'departure';
  }

  if (['landing', 'goaround', 'approach', 'arrival'].includes(procedure.id)) {
    return 'arrival';
  }

  return 'enroute';
}

function atcValidateScenario(scenario, mode, procedureId) {
  const bounds = ATC_DIFFICULTY_BOUNDS[mode];
  if (!bounds) return { ok: false, reason: 'unknown difficulty' };

  if (
    !scenario ||
    typeof scenario.spoken !== 'string' ||
    typeof scenario.readback !== 'string' ||
    !Array.isArray(scenario.fields)
  ) {
    return { ok: false, reason: 'invalid scenario structure' };
  }

  const { spoken, fields } = scenario;
  const itemCount = fields.length;

  if (itemCount < bounds[0] || itemCount > bounds[1]) {
    return {
      ok: false,
      reason: `${itemCount} items outside ${bounds[0]}–${bounds[1]}`
    };
  }

  if (fields.some((field) => typeof field !== 'string' || !field.trim())) {
    return { ok: false, reason: 'empty field' };
  }

  const normalizedFields = fields.map((field) => field.toLowerCase().trim());
  if (new Set(normalizedFields).size !== itemCount) {
    return { ok: false, reason: 'duplicate fields' };
  }

  // Any numeric value listed as a memory item must appear in the spoken text.
  for (const field of fields) {
    const numbers = field.match(/\d[\d,]*/g) || [];

    for (const number of numbers) {
      const numberPattern = new RegExp(`(?<!\\d)${number}(?!\\d)`);
      if (!numberPattern.test(spoken)) {
        return { ok: false, reason: `field value not transmitted: ${field}` };
      }
    }
  }

  if (mode === 'hard') {
    return validateHardScenario(scenario, itemCount);
  }

  return validateProcedureScenario(scenario, mode, procedureId, itemCount);
}

function validateHardScenario(scenario, itemCount) {
  if (!Number.isInteger(scenario.catalogId)) {
    return { ok: false, reason: 'hard catalog id missing' };
  }

  const family = Math.floor((scenario.catalogId - 1) / 10000);
  const allowedFamilies = Object.values(ATC_HARD_FAMILY_PROFILES).flat();

  if (!allowedFamilies.includes(family)) {
    return { ok: false, reason: 'unverified hard family' };
  }

  const requiredPhrases = ATC_HARD_FIELD_RULES[family];
  if (
    !requiredPhrases ||
    requiredPhrases.length !== itemCount ||
    requiredPhrases.some((pattern) => !pattern.test(scenario.spoken))
  ) {
    return {
      ok: false,
      reason: 'hard spoken instructions do not match checked load profile'
    };
  }

  return { ok: true, count: itemCount };
}

function validateProcedureScenario(scenario, mode, procedureId, itemCount) {
  const profile = ATC_LOAD_PROFILES[procedureId];
  if (!profile || profile[mode] !== itemCount) {
    return {
      ok: false,
      reason: `template ${procedureId} not certified for ${mode}`
    };
  }

  const profilesByDifficulty = {
    easy: ATC_EASY_FIELD_RULES,
    normal: ATC_NORMAL_FIELD_RULES
  };
  const requiredPhrases = profilesByDifficulty[mode]?.[procedureId];

  if (
    !requiredPhrases ||
    requiredPhrases.length !== itemCount ||
    requiredPhrases.some((pattern) => !pattern.test(scenario.spoken))
  ) {
    return {
      ok: false,
      reason: `spoken text not consistent with ${procedureId} ${mode} profile`
    };
  }

  return { ok: true, count: itemCount };
}

window.CadetAtcValidation = {
  bounds: ATC_DIFFICULTY_BOUNDS,
  profiles: ATC_LOAD_PROFILES,
  hardFamilies: ATC_HARD_FAMILY_PROFILES,
  validate: atcValidateScenario
};
