/*
 * V13 ATC exercise generator
 *
 * Every generated exercise is checked against its difficulty profile.
 * Inadequate templates are rejected instead of being padded with extra
 * phraseology.
 */

const ATC_SET_SIZE = 3;
const HARD_SCENARIO_ATTEMPTS = 24;
const PROCEDURE_SCENARIO_ATTEMPTS = 16;

function makeAtcSet(mode) {
  const difficulty = ATC_DIFFICULTY_BOUNDS[mode] ? mode : 'normal';
  const callsigns = mix(CALLSIGNS).slice(0, ATC_SET_SIZE);

  if (difficulty === 'hard') {
    return makeHardAtcSet(callsigns);
  }

  const candidates = PROCEDURES.filter(
    (procedure) => ATC_LOAD_PROFILES[procedure.id]?.[difficulty]
  );
  const plan = selectProcedures(candidates);
  const selected = plan.map((procedure, index) =>
    makeProcedureScenario(procedure, difficulty, callsigns[index])
  );

  if (selected.length !== ATC_SET_SIZE) {
    throw new Error(`Insufficient verified ${difficulty} ATC scenarios`);
  }

  return mix(selected);
}

function makeHardAtcSet(callsigns) {
  const phaseGroups = mix(Object.entries(ATC_HARD_FAMILY_PROFILES));
  const selected = [];

  // Each verified family group represents a distinct flight phase.
  for (const [phase, families] of phaseGroups) {
    const callsign = makeCallsign(callsigns[selected.length]);
    let acceptedScenario = null;

    for (let attempt = 0; attempt < HARD_SCENARIO_ATTEMPTS; attempt += 1) {
      const family = pick(families);
      const catalogId = family * 10000 + range(0, 9999);
      const scenario = atcByCatalogId(catalogId, callsign.value);
      const validation = atcValidateScenario(scenario, 'hard', null);

      if (validation.ok) {
        acceptedScenario = {
          ...scenario,
          airline: callsign.airline,
          callsign: callsign.value,
          difficultyItems: validation.count
        };
        break;
      }
    }

    if (!acceptedScenario) {
      throw new Error(`No verified Hard ATC scenario for ${phase}`);
    }

    selected.push(acceptedScenario);
  }

  return mix(selected);
}

function selectProcedures(candidates) {
  const proceduresByPhase = new Map();

  for (const procedure of mix(candidates)) {
    const phase = atcScenarioPhase(procedure);

    if (!proceduresByPhase.has(phase)) {
      proceduresByPhase.set(phase, []);
    }

    proceduresByPhase.get(phase).push(procedure);
  }

  const plan = [];

  // Prefer different phases, then fill any remaining slots with valid templates.
  for (const phase of mix([...proceduresByPhase.keys()])) {
    if (plan.length === ATC_SET_SIZE) break;
    plan.push(mix(proceduresByPhase.get(phase))[0]);
  }

  for (const procedure of mix(candidates)) {
    if (plan.length === ATC_SET_SIZE) break;
    if (!plan.includes(procedure)) plan.push(procedure);
  }

  return plan;
}

function makeProcedureScenario(procedure, difficulty, callsignData) {
  const callsign = makeCallsign(callsignData);

  for (let attempt = 0; attempt < PROCEDURE_SCENARIO_ATTEMPTS; attempt += 1) {
    const scenario = procedure.build(callsign.value, difficulty);
    const validation = atcValidateScenario(scenario, difficulty, procedure.id);

    if (validation.ok) {
      return {
        ...scenario,
        procedure: procedure.label,
        source: procedure.source,
        airline: callsign.airline,
        callsign: callsign.value,
        difficultyItems: validation.count
      };
    }
  }

  throw new Error(
    `ATC validation failed for ${procedure.id} (${difficulty})`
  );
}

function makeCallsign([airline, call]) {
  return {
    airline,
    value: `${call} ${range(100, 899)}`
  };
}
