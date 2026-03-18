// Approximate center coordinates for postal codes in the Bodensee region
// Used as fallback when a PLZ is not in PLZ_STORE_MAP
// Format: PLZ → [lat, lng]
export const PLZ_COORDINATES: Record<string, [number, number]> = {
  // Singen / Hegau
  '78224': [47.7616, 8.8396],
  '78234': [47.8523, 8.7697], // Engen
  '78244': [47.7382, 8.7800], // Gottmadingen
  '78247': [47.7740, 8.8891], // Hilzingen
  '78250': [47.8177, 8.6571], // Tengen
  '78253': [47.8060, 8.8490], // Eigeltingen
  '78256': [47.7793, 8.9389], // Volkertshausen
  '78259': [47.8196, 8.8977], // Mühlhausen-Ehingen
  '78262': [47.8441, 8.9416], // Gailingen
  '78266': [47.7934, 8.8120], // Büsingen

  // Konstanz
  '78462': [47.6649, 9.1749],
  '78464': [47.6849, 9.1549],
  '78465': [47.6966, 9.1614],
  '78467': [47.6779, 9.1732],
  '78476': [47.7010, 9.1890], // Allensbach
  '78479': [47.7012, 9.0656], // Reichenau

  // Radolfzell
  '78315': [47.7353, 8.9704],
  '78333': [47.8504, 9.0107], // Stockach
  '78345': [47.7700, 9.0800], // Moos
  '78351': [47.8090, 9.0215], // Bodman-Ludwigshafen
  '78354': [47.7701, 9.1208], // Sipplingen

  // Überlingen
  '88662': [47.7675, 9.1636],
  '88682': [47.7665, 9.2810], // Salem
  '88690': [47.7800, 9.2100], // Uhldingen-Mühlhofen

  // Meersburg / Bodensee south shore
  '88709': [47.6948, 9.2729], // Meersburg
  '88719': [47.6770, 9.3200], // Stetten
  '88085': [47.5996, 9.5479], // Langenargen

  // Donaueschingen / Schwarzwald
  '78166': [47.9532, 8.4981], // Donaueschingen
  '78176': [47.9200, 8.5500],
  '78183': [47.9766, 8.5213], // Hüfingen
  '78194': [47.9849, 8.6015], // Immendingen

  // Additional Bodensee area
  '78337': [47.9240, 8.9940], // Öhningen
  '78343': [47.7620, 9.0540], // Gaienhofen
  '78361': [47.8690, 9.0795], // Bodman
};
