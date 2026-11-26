/*
 * Written pronunciation cues and educational ATC annotations.
 * This module does not certify live phraseology or operational clearances.
 */
(function () {
  'use strict';

  const digits = {
    0: 'zero',
    1: 'wun',
    2: 'too',
    3: 'tree',
    4: 'fower',
    5: 'fife',
    6: 'six',
    7: 'seven',
    8: 'ait',
    9: 'niner'
  };

  const phoneticLetters = {
    A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
    F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett',
    K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
    P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
    U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee',
    Z: 'Zulu'
  };

  // “Letters” uses ordinary English letter names rather than the ICAO alphabet.
  const shortForms = {
    CDO: 'See-Dee-Oh',
    RNAV: 'R-nav',
    RNP: 'R-N-P',
    ILS: 'I-L-S',
    QNH: 'Q-N-H',
    QFE: 'Q-F-E',
    RVR: 'R-V-R',
    DME: 'D-M-E',
    VOR: 'V-O-R',
    ATIS: 'A-TIS',
    SID: 'sid',
    STAR: 'STAR',
    SSR: 'S-S-R',
    IFR: 'I-F-R',
    VFR: 'V-F-R',
    IMC: 'I-M-C',
    VMC: 'V-M-C',
    TCAS: 'T-CAS',
    CPDLC: 'C-P-D-L-C',
    'ADS-B': 'A-D-S-B',
    GPS: 'G-P-S',
    NDB: 'N-D-B',
    ADF: 'A-D-F',
    TACAN: 'TACAN',
    VORTAC: 'VOR-TAC',
    FL: 'flight level'
  };

  function spellDigits(value) {
    return String(value)
      .replace(/[^0-9]/g, '')
      .split('')
      .map((digit) => digits[digit])
      .join(' ');
  }

  // Whole hundreds/thousands apply to altitude, visibility, RVR, and cloud height.
  function pronounceHundredsAndThousands(rawValue) {
    const valueText = String(rawValue).replace(/,/g, '');
    if (!/^\d+$/.test(valueText)) return rawValue;

    const value = Number(valueText);
    if (value === 0) return digits[0];
    if (value % 100 !== 0) return spellDigits(valueText);

    const thousands = Math.floor(value / 1000);
    const hundreds = (value % 1000) / 100;

    if (thousands && hundreds) {
      return `${spellDigits(thousands)} thousand ${spellDigits(hundreds)} hundred`;
    }
    if (thousands) return `${spellDigits(thousands)} thousand`;
    return `${spellDigits(hundreds)} hundred`;
  }

  function pronounceFrequency(rawValue) {
    const [integer, fractional] = rawValue.split('.');
    return `${spellDigits(integer)} decimal ${spellDigits(fractional)}`;
  }

  function radioReading(text) {
    let value = String(text);
    const protectedTokens = [];

    // Protect a converted span so later rules cannot interpret its digits again.
    function protect(replacement) {
      const marker = String.fromCharCode(0xe000 + protectedTokens.length);
      protectedTokens.push(replacement);
      return marker;
    }

    function replace(pattern, convert) {
      value = value.replace(pattern, (...args) => protect(convert(...args)));
    }

    // Taiwan CAA publishes this pronunciation for the RCTP CDO procedure.
    // Do not assume the local pronunciation applies in an unrelated context.
    const isTaiwanCdoContext = /\b(?:Taipei(?:\s+control)?|RCTP|DRAKE\s+1B)\b/i.test(value);
    if (isTaiwanCdoContext) {
      replace(/\bC-D-O\b|\bCDO\b/gi, () => shortForms.CDO);
    }

    // Keep every digit in a frequency, including digits after the decimal point.
    replace(/\b(\d{1,3})\.(\d{1,3})\b/g, (_, whole, fraction) =>
      pronounceFrequency(`${whole}.${fraction}`)
    );

    replace(/\b(QNH|QFE)\s+(\d{3,4})\b/gi, (_, label, number) =>
      `${shortForms[label.toUpperCase()]} ${spellDigits(number)}`
    );

    replace(/\b(squawk(?:\s+code)?|SSR\s+code)\s+(\d{4})\b/gi,
      (_, label, number) => `${label} ${spellDigits(number)}`
    );

    // Flight levels and headings are read digit by digit, not like altitudes.
    replace(/\bflight\s+level\s+(\d{2,3})\b/gi,
      (_, number) => `flight level ${spellDigits(number)}`
    );
    replace(/\bFL\s*([0-9]{2,3})\b/gi,
      (_, number) => `flight level ${spellDigits(number)}`
    );
    replace(/\bheading\s+(\d{3})\b/gi,
      (_, number) => `heading ${spellDigits(number)}`
    );

    // Runways, including side designators.
    replace(/\brunway\s+(\d{2})\s*([LRC])\b/gi, (_, number, side) => {
      const sideName = { L: 'left', R: 'right', C: 'center' }[side.toUpperCase()];
      return `runway ${spellDigits(number)} ${sideName}`;
    });
    replace(/\brunway\s+(\d{2})\b/gi,
      (_, number) => `runway ${spellDigits(number)}`
    );

    replace(/\b(\d{1,3}(?:,\d{3})*|\d{1,5})\s*(feet|ft)\b/gi,
      (_, number) => `${pronounceHundredsAndThousands(number)} feet`
    );
    replace(/\b(\d{1,3}(?:,\d{3})*|\d{1,5})\s*(metres|meters)\b/gi,
      (_, number, unit) => `${pronounceHundredsAndThousands(number)} ${unit}`
    );
    replace(/\b(RVR|runway visual range|visibility|cloud height)\s+(\d{1,3}(?:,\d{3})*|\d{1,5})\b/gi,
      (_, label, number) => {
        const spokenLabel = label.toUpperCase() === 'RVR' ? 'R-V-R' : label;
        return `${spokenLabel} ${pronounceHundredsAndThousands(number)}`;
      }
    );

    // Spell registration letters; do not spell pronounceable fixes as letters.
    replace(/\b([A-Z])-([A-Z]{2,5})\b/g, (_, prefix, suffix) =>
      [prefix, ...suffix].map((letter) => phoneticLetters[letter]).join(' ')
    );

    replace(/\b(\d{1,3})([A-Z])\b/g, (_, number, letter) =>
      `${spellDigits(number)} ${phoneticLetters[letter]}`
    );
    replace(/\b(taxiway|taxiways)\s+([A-Z])\b/g, (_, word, letter) =>
      `${word} ${phoneticLetters[letter]}`
    );
    replace(/\b([A-Z](?:-[A-Z]){1,})\b/g, (match) =>
      match.split('-').map((letter) => phoneticLetters[letter]).join(' ')
    );

    // Only a type-qualified navaid reference gets a facility-name cue.
    replace(/\b([A-Z]{2,3})\s+(VOR\/DME|VOR|DME|NDB)\b/gi,
      (match, identifier, type) => {
        const navaid = navaidDetails(identifier);
        if (!navaid) return match;

        const spokenType = type
          .toUpperCase()
          .split('/')
          .map((part) => shortForms[part] || part)
          .join(' / ');
        return `${navaid.spokenName} ${spokenType}`;
      }
    );

    replace(/\b(identifier|identification code|navaid code)\s+([A-Z]{2,3})\b/gi,
      (match, label, identifier) => {
        const navaid = navaidDetails(identifier);
        return navaid ? `${label} ${navaid.spelledIdentifier}` : match;
      }
    );

    // Convert only known abbreviations. Unknown abbreviations remain visible.
    replace(/\b(RNAV|RNP|ILS|QNH|QFE|RVR|DME|VOR|NDB|ADF|TACAN|VORTAC|ATIS|SID|STAR|SSR|IFR|VFR|IMC|VMC|TCAS|CPDLC|GPS)\b/gi,
      (match) => shortForms[match.toUpperCase()]
    );
    replace(/\bADS-B\b/gi, () => shortForms['ADS-B']);

    value = value.replace(/\b\d+\b/g, (number) => protect(spellDigits(number)));
    return value.replace(/[\uE000-\uF8FF]/g, (marker) =>
      protectedTokens[marker.charCodeAt(0) - 0xe000] || marker
    );
  }

  // A facility name and its identifier spelling are different spoken forms.
  function navaidDetails(identifier) {
    const record = (window.CadetNavaids || {})[
      String(identifier).trim().toUpperCase()
    ];
    if (!record) return null;

    return {
      id: record.id,
      name: record.name,
      zh: record.zh,
      kind: record.kind,
      spokenName: record.name,
      spelledIdentifier: [...record.id]
        .map((letter) => phoneticLetters[letter])
        .join(' '),
      source: record.source
    };
  }

  const phaseDescriptions = {
    departure: 'Departure — after obtaining departure instructions, the crew manages initial heading, cleared climb, speed, route and transfer to departure control.',
    enroute: 'En-route — the aircraft is receiving route, level, speed or radar vector changes during controlled flight.',
    arrival: 'Arrival / Approach — instructions manage descent, arrival sequencing, approach preparation and handoff to tower.',
    ground: 'Ground — the aircraft is at an airport, coordinating clearance, movement, runway crossings and takeoff or after-landing operations.'
  };

  function inferPhase(scenario) {
    if (scenario.phase) return scenario.phase;

    const text = `${scenario.procedure} ${scenario.spoken}`.toLowerCase();
    if (/taxi|pushback|line up|start.up|runway cross|hold short/.test(text)) {
      return 'ground';
    }
    if (/arrival|landing|approach|localizer|ils|holding|descent/.test(text)) {
      return 'arrival';
    }
    if (/departure|airborne|takeoff|initial climb/.test(text)) {
      return 'departure';
    }
    return 'enroute';
  }

  function explainField(field) {
    const text = String(field);
    const normalized = text.toLowerCase();

    if (/amended|re.clearance/.test(normalized)) {
      return 'ATC is revising an earlier clearance. The revised elements replace affected earlier instructions; verify the actual new clearance.';
    }
    if (/hold short/.test(normalized)) {
      return 'Stop before the specified runway or holding point. Do not enter the runway without a separate clearance.';
    }
    if (/cross.*runway/.test(normalized)) {
      return 'Permission to cross the identified runway only under the stated clearance; a taxi clearance alone does not authorize crossing.';
    }
    if (/squawk|transponder/i.test(normalized)) {
      return 'Set the assigned four-digit SSR transponder code (each digit must be 0–7); IDENT means briefly activate the identification feature, not choose a code.';
    }
    if (/heading|turn|vector/.test(normalized)) {
      return 'Fly the assigned magnetic heading and direction. A heading is where the nose points, not necessarily your ground track.';
    }
    if (/climb|descend|flight level|\bfl\d|altitude|maintain.*feet/.test(normalized)) {
      return 'Observe the cleared altitude or flight level; a crossing/reporting level is not automatically a new clearance. Flight levels use standard pressure reference.';
    }
    if (/speed|knots|\bkt\b/.test(normalized)) {
      return 'Comply with the assigned airspeed or restriction. “Or less” states a maximum; “until advised” keeps the restriction in force until changed.';
    }
    if (/qnh/.test(normalized)) {
      return 'Set the given altimeter pressure (QNH) as applicable. This is an altimeter setting, not an assigned altitude.';
    }
    if (/direct|route|fix|thereafter|when able|when instructed/.test(normalized)) {
      return 'This controls navigation to a fix or sequence of fixes. “When able” and “when instructed” have different conditions; do not treat a forecast route as immediate clearance.';
    }
    if (/hold at|inbound|turns|legs|holding/.test(normalized)) {
      return 'This describes a holding instruction: fix, inbound course, turn direction, leg length and the assigned level or speed limit.';
    }
    if (/report|passing|leaving|established|weather/.test(normalized)) {
      return 'A reporting requirement: tell ATC when this condition occurs. It is not itself permission to change altitude or route.';
    }
    if (/frequency|contact|tower|center|departure/.test(normalized)) {
      return 'Radio communications detail. “Contact” instructs a frequency change; “for information” is advisory and does not itself direct a transfer.';
    }
    if (/expect/.test(normalized)) {
      return 'Expect is advance information about a possible later clearance, NOT authorization to begin that approach, route or maneuver.';
    }
    if (/runway|ils|approach/.test(normalized)) {
      return 'Runway or approach identification for planning/clearance. “Expect” does not mean “cleared.”';
    }

    return 'Check this item against the original transmission: identify the value, its units, and any timing or condition before reading back.';
  }

  function breakdownItems(scenario) {
    const fields = Array.isArray(scenario.fields) ? scenario.fields : [];
    return fields.map((field) => ({
      text: String(field),
      meaning: explainField(field),
      pronunciation: radioReading(field)
    }));
  }

  const phaseChinese = {
    departure: '離場／初始爬升：確認起飛後的航向、爬升高度、速度、航路及轉頻指令。',
    enroute: '航路階段：注意航向、高度、速度、航點與限制條件是否需要立即執行。',
    arrival: '到場／進場：辨識下降、進場許可、速度、跑道與塔臺交接的先後順序。',
    ground: '地面階段：確認滑行許可、等待位置及跑道穿越授權，不能把滑行許可視為穿越跑道的許可。'
  };

  function fieldChinese(field) {
    const text = String(field).toLowerCase();

    if (/squawk|transponder/.test(text)) {
      return '應答機：設定指派的四位數代碼（每位 0–7）；IDENT 是啟動辨識功能，並不是一組代碼。';
    }
    if (/heading|turn|vector/.test(text)) {
      return '航向／轉向：依指令方向轉至指定磁航向，注意它與地面航跡不同。';
    }
    if (/climb|descend|flight level|altitude|maintain.*feet/.test(text)) {
      return '高度／飛航空層：確認許可高度與壓力基準；回報通過高度不等於獲得新的爬升或下降許可。';
    }
    if (/speed|knots|kt/.test(text)) {
      return '空速限制：確認單位與限制條件，例如最大空速、最低空速或何時解除。';
    }
    if (/direct|route|fix|when able/.test(text)) {
      return '航路：辨識直飛航點、航點順序與「when able」等執行條件。';
    }
    if (/hold short|cross.*runway/.test(text)) {
      return '跑道安全：停止等待與穿越跑道需要分別確認，不可自行推定有穿越許可。';
    }
    if (/runway|taxi|pushback/.test(text)) {
      return '地面／跑道：留意跑道編號、滑行路線及是否獲得特定授權。';
    }
    if (/report|passing|established/.test(text)) {
      return '回報要求：記住何時向航管報告，這不是更改高度或航向的許可。';
    }
    if (/contact|frequency|tower|center/.test(text)) {
      return '通訊：確認頻率、接管單位與實際轉頻時機。';
    }
    if (/expect/.test(text)) {
      return '預告資訊：EXPECT 不是正式許可，不能只因為聽到預告就開始執行。';
    }
    if (/qnh/.test(text)) {
      return '氣壓設定：QNH 是高度表氣壓設定值，不是獲准飛行的高度。';
    }

    return '辨識此項資訊的數值、單位、執行順序與條件，並與航管原話核對。';
  }

  function atcTeachingHTML(scenario, escapeText, index = 0) {
    const phase = inferPhase(scenario);
    const items = breakdownItems(scenario);
    const isChinese = window.CadetI18n?.get() === 'zh-TW';
    const chevron =
      '<svg class="atc-chevron-glyph" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="m6 9 6 6 6-6"/></svg>';

    const itemsHtml = items
      .map(item => `
        <li>
          <div class="atc-explain-item">
            <strong>${escapeText(item.text)}</strong>
            <p>${escapeText(item.meaning)}</p>
            <p class="atc-reading-mini">Spoken numbers: ${escapeText(item.pronunciation)}</p>
            ${isChinese ? `<p class="atc-zh-note">${escapeText(fieldChinese(item.text))}</p>` : ''}
          </div>
        </li>`)
      .join('');

    return `<div class="atc-teaching atc-teaching-refined">
      <div class="readback-main">${escapeText(scenario.readback)}</div>
      <div class="atc-subdetail">
        <div class="atc-subdetail-heading">
          <span>Pronunciation &amp; Context</span>
          <button type="button" class="atc-chevron-control atc-extra-toggle"
            aria-label="Show Pronunciation & Context"
            title="Show Pronunciation & Context"
            aria-expanded="false" aria-controls="atc-pron-${index}">${chevron}</button>
        </div>
        <div class="atc-subdetail-body" id="atc-pron-${index}" hidden>
          <div class="mini-heading">How to say the readback</div>
          <p>${escapeText(radioReading(scenario.readback))}</p>
          <div class="mini-heading">Flight context</div>
          <p>${escapeText(phaseDescriptions[phase] || phaseDescriptions.enroute)}</p>
          ${isChinese ? `<p class="atc-zh-note">${escapeText(phaseChinese[phase] || phaseChinese.enroute)}</p>` : ''}
          <div class="mini-heading">Original transmission pronunciation</div>
          <p>${escapeText(radioReading(scenario.spoken))}</p>
        </div>
      </div>
      <div class="atc-subdetail">
        <div class="atc-subdetail-heading">
          <span>Understand the Instructions</span>
          <button type="button" class="atc-chevron-control atc-extra-toggle"
            aria-label="Show Understand the Instructions"
            title="Show Understand the Instructions"
            aria-expanded="false" aria-controls="atc-instructions-${index}">${chevron}</button>
        </div>
        <div class="atc-subdetail-body" id="atc-instructions-${index}" hidden>
          <ol class="atc-detail-list">${itemsHtml}</ol>
          <p class="atc-caution">${escapeText(scenario.note || 'Synthetic training example. Verify local procedures and current phraseology.')}</p>
        </div>
      </div>
      <p class="atc-source-mini">Educational simulation · ICAO Doc 9432 (2007) reference; not a verified operational clearance.</p>
    </div>`;
  }

  window.CadetAtcTeaching = {
    radioReading,
    navaidDetails,
    breakdownItems,
    inferPhase,
    atcTeachingHTML
  };
})();
