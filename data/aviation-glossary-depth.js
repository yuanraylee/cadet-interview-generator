/* Optional depth for selected aviation entries. Every record inherits the shared canonical glossary. */
(function(){
  const depth = {
  "load factor": {
    "principleEn": "In a steady coordinated level turn, lift tilts with the aircraft. Its vertical component must still equal weight, so total lift rises as bank angle increases.",
    "principleZh": "穩定、協調且維持高度的轉彎中，升力方向隨飛機傾斜；垂直分量仍須平衡重量，因此坡度角愈大，所需總升力愈高。",
    "factorsEn": "Bank angle, vertical acceleration, maneuvering load and whether the flight path is level; a descending turn does not necessarily follow the level-turn formula.",
    "factorsZh": "坡度角、垂直加速度、機動負載與是否維持高度；下降轉彎不一定符合水平轉彎公式。",
    "formula": "n = L/W = 1/cos(φ) (steady, coordinated, level turn only)",
    "exampleEn": "At a 60° bank in a steady level turn, the theoretical load factor is 2 g. The 1-g stall speed is multiplied by √2, assuming unchanged weight and configuration.",
    "exampleZh": "在穩定的 60° 坡度水平轉彎中，理論負載因數為 2g。若重量及構型不變，失速速度約為 1g 時的 √2 倍。",
    "misconceptionEn": "A banked aircraft is not necessarily experiencing 2 g; the 1/cos(φ) relation assumes coordinated level flight.",
    "misconceptionZh": "飛機傾斜不代表一定承受 2g；1/cos(φ) 只適用於特定穩定水平轉彎條件。",
    "source": "FAA PHAK, Chapter 5 — Aerodynamics"
  },
  "accelerated stall": {
    "principleEn": "When load factor exceeds 1 g, the wing must produce more lift. The same critical angle of attack can then be reached at a higher indicated airspeed than in an otherwise comparable 1-g stall.",
    "principleZh": "負載因數超過 1g 時，機翼需要產生更多升力，因而可能在比相同條件下 1g 失速更高的指示空速達到臨界攻角。",
    "factorsEn": "Load factor, aircraft weight, configuration and wing condition.",
    "factorsZh": "負載因數、飛機重量、構型與機翼狀況。",
    "formula": "Vₛ,n = Vₛ,1g × √n (same aircraft weight/configuration)",
    "exampleEn": "If the 1-g stall speed is 60 KIAS, a 2-g stall speed is approximately 85 KIAS under comparable conditions.",
    "exampleZh": "若 1g 失速速度為 60 KIAS，在其他條件相同時，2g 約為 85 KIAS。",
    "misconceptionEn": "‘Accelerated’ does not mean the aircraft is accelerating. The stall still occurs because critical angle of attack is exceeded.",
    "misconceptionZh": "「加速」不代表飛機正在加速。失速仍然是由超過臨界攻角引起。",
    "source": "FAA PHAK, Chapter 5 — Aerodynamics"
  },
  "angle of attack": {
    "principleEn": "The angle is measured between the airfoil chord line and the relative airflow, not between the fuselage and the horizon.",
    "principleZh": "攻角是翼弦線與相對氣流之間的夾角，不是機身與地平線的夾角。",
    "factorsEn": "Flight path, wing attitude and airflow direction, including local flow changes.",
    "factorsZh": "飛行路徑、機翼姿態與相對氣流方向，包括局部氣流變化。",
    "exampleEn": "An aircraft may have a positive pitch attitude and a small angle of attack during a climb, or a high angle of attack during a nose-low maneuver.",
    "exampleZh": "飛機爬升時即使機頭上仰，攻角仍可能不大；機頭較低的機動中也可能產生較高攻角。",
    "misconceptionEn": "Pitch attitude and angle of attack are not interchangeable.",
    "misconceptionZh": "俯仰姿態與攻角不可直接畫上等號。",
    "source": "FAA PHAK, Chapter 5 — Aerodynamics"
  },
  "stall": {
    "principleEn": "A wing stalls when angle of attack exceeds its critical value and airflow separation reduces its ability to produce the lift required for the flight condition.",
    "principleZh": "機翼攻角超過臨界值後，氣流分離使機翼無法產生當下飛行狀態所需的升力，進入失速。",
    "factorsEn": "Load factor, weight, configuration, ice contamination and maneuvering all change the indicated speed at which the critical angle may be reached.",
    "factorsZh": "負載因數、重量、構型、結冰與機動會影響達到臨界攻角時的指示空速。",
    "misconceptionEn": "Stall does not inherently mean an engine has stopped or that airspeed must be below one fixed number.",
    "misconceptionZh": "失速不等於引擎熄火，也不代表必然低於某個固定空速。",
    "source": "FAA PHAK, Chapter 5 — Aerodynamics"
  },
  "induced drag": {
    "principleEn": "Lift changes the pressure field around a finite wing, resulting in downwash and an aerodynamic force component directed rearward.",
    "principleZh": "有限翼展機翼產生升力時會形成下洗流，使總氣動力產生向後分量，形成誘導阻力。",
    "factorsEn": "Lift coefficient, speed at a given weight, wing aspect ratio and aerodynamic efficiency.",
    "factorsZh": "升力係數、同重量條件下的速度、展弦比與氣動效率。",
    "misconceptionEn": "Induced drag is not simply caused by friction and often becomes more important at lower speed while maintaining lift.",
    "misconceptionZh": "誘導阻力不是單純的表面摩擦阻力；在維持升力而降低速度時，通常更顯著。",
    "source": "FAA PHAK, Chapter 5 — Aerodynamics"
  },
  "pitot-static system": {
    "principleEn": "The airspeed indicator uses total and static pressure, whereas the altimeter and vertical-speed indicator use static pressure.",
    "principleZh": "空速表利用總壓與靜壓的差異；高度表與垂直速度表則依賴靜壓。",
    "factorsEn": "Obstructions, icing, leaks and alternate static-source selection can alter indications.",
    "factorsZh": "阻塞、結冰、洩漏與備用靜壓源選擇都可能影響儀表顯示。",
    "misconceptionEn": "Pitot blockage and static-port blockage do not produce the same instrument behavior.",
    "misconceptionZh": "皮托管阻塞與靜壓孔阻塞，造成的儀表異常並不相同。",
    "source": "FAA PHAK, Chapter 8 — Flight Instruments"
  },
  "center of gravity": {
    "principleEn": "The distribution of masses sets the aircraft CG and changes longitudinal stability and control authority.",
    "principleZh": "各項載重的位置共同決定重心，進而影響縱向穩定性與操縱能力。",
    "factorsEn": "Passengers, baggage, fuel, cargo and applicable loading limits.",
    "factorsZh": "乘客、行李、燃油、貨物與核准載重限制。",
    "misconceptionEn": "Being under maximum gross weight does not ensure that the CG lies within approved limits.",
    "misconceptionZh": "總重量未超限，不代表重心必然在核准範圍內。",
    "source": "FAA PHAK, Chapter 10 — Weight and Balance"
  },
  "wind shear": {
    "principleEn": "A change in wind vector over a short distance can rapidly alter the aircraft's indicated airspeed, flight path and energy state.",
    "principleZh": "風向或風速在短距離內劇烈變化，可能快速影響飛機指示空速、飛行軌跡與能量狀態。",
    "factorsEn": "Thunderstorms, microbursts, terrain, fronts and temperature inversions.",
    "factorsZh": "雷暴、微下擊暴流、地形、鋒面與逆溫。",
    "misconceptionEn": "Wind shear can occur without a visible thunderstorm and is particularly hazardous close to the ground.",
    "misconceptionZh": "沒有明顯雷暴也可能出現風切；接近地面時因反應空間有限尤其危險。",
    "source": "FAA PHAK, Chapter 12 — Weather Theory"
  }
};
  for(const [key,fields] of Object.entries(depth)){
    const base=window.CADET_AVIATION_GLOSSARY?.[key];
    if(base)Object.assign(base,fields);
  }
  window.CADET_GLOSSARY_DETAILED_COUNT=Object.keys(depth).length;
})();
