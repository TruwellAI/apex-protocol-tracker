// Apex Rocky — Food Parser + Meal Suggester
// Netlify serverless function: 3 modes
//   - mode "parse" (default): accepts user text OR photo, returns identified foods + macros
//   - mode "suggest": takes context of what user has eaten + favorites, returns 2-3 specific meals
//                     BY NAME (e.g. "Flying Dutchman at In-N-Out") that fill the remaining macros
//   - mode "rebalance": (reserved for future — regenerates remaining meals given an overage)
//
// Uses Claude API via the existing ANTHROPIC_API_KEY env var.

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { type, input, context = {}, mode = 'parse' } = body;

  if (mode === 'suggest') {
    return handleSuggestMode(context, apiKey, headers);
  }

  // Default: parse mode — type + input required
  if (!type || !input) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'type + input required for parse mode' }) };
  }
  if (type !== 'text' && type !== 'image') {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'type must be "text" or "image"' }) };
  }

  return handleParseMode({ type, input, context }, apiKey, headers);
};

// ───────────────────────────────────────────────────────────
// Build a rich context block used by both modes
// ───────────────────────────────────────────────────────────
function buildContextBlock(context) {
  const calTarget = context.calTarget || 1850;
  const proTarget = context.proTarget || 180;
  const consumedCal = context.consumedCal || 0;
  const consumedP = context.consumedP || 0;
  const remaining = Math.max(0, calTarget - consumedCal);
  const remainingProtein = Math.max(0, proTarget - consumedP);
  const compound = context.compound || 'your protocol';
  const weekOn = context.weekOn;
  const remainingMeals = Array.isArray(context.remainingMeals) ? context.remainingMeals : [];
  const profile = context.profile || {};
  const prefs = context.prefs || {};

  const lines = [];
  lines.push(`PROTOCOL: ${compound}` + (weekOn ? ` (Week ${weekOn})` : ''));
  if (profile.weight) lines.push(`Weight: ${profile.weight} lbs`);
  if (profile.bodyFatPct) lines.push(`Body fat: ${profile.bodyFatPct}%`);
  if (profile.leanMassLb) lines.push(`Lean body mass: ${profile.leanMassLb} lbs`);
  if (profile.tdee) lines.push(`TDEE: ${profile.tdee} cal/day`);
  if (profile.activity) lines.push(`Activity level: ${profile.activity}`);
  lines.push(``);
  lines.push(`TARGETS TODAY`);
  lines.push(`- Calories: ${calTarget}`);
  lines.push(`- Protein: ${proTarget}g`);
  lines.push(``);
  lines.push(`CONSUMED SO FAR`);
  lines.push(`- Calories: ${consumedCal}`);
  lines.push(`- Protein: ${consumedP}g`);
  lines.push(``);
  lines.push(`REMAINING RUNWAY`);
  lines.push(`- Calories: ${remaining}`);
  lines.push(`- Protein: ${remainingProtein}g`);
  if (remainingMeals.length) lines.push(`- Remaining meal slots: ${remainingMeals.join(', ')}`);

  if (prefs && Object.keys(prefs).length > 0) {
    lines.push(``);
    lines.push(`FOOD PREFERENCES (user's actual favorites)`);
    const addPref = (label, key) => {
      const arr = Array.isArray(prefs[key]) ? prefs[key] : [];
      const custom = prefs[key + '_custom'] ? `, ${prefs[key + '_custom']}` : '';
      if (arr.length > 0 || custom) lines.push(`- ${label}: ${arr.join(', ')}${custom}`);
    };
    addPref('Breakfast', 'breakfast');
    addPref('Lunch', 'lunch');
    addPref('Dinner', 'dinner');
    addPref('Snacks', 'snacks');
    addPref('Proteins', 'proteinsLike');
    if (prefs.proteinsHate) lines.push(`- HATES these proteins (never suggest): ${prefs.proteinsHate}`);
    addPref('Carbs', 'carbs');
    addPref('Fats', 'fats');
    if (prefs.favoriteRestaurants) lines.push(`- Favorite restaurants + specific orders: ${prefs.favoriteRestaurants}`);
    if (prefs.favoriteMeals) lines.push(`- Go-to specific meals: ${prefs.favoriteMeals}`);
    if (prefs.cheatMeals) lines.push(`- Cheat-day meals (use if user is UNDER target or treats are warranted): ${prefs.cheatMeals}`);
  }

  return lines.join('\n');
}

// ───────────────────────────────────────────────────────────
// PARSE MODE — user tells us what they ate, we return macros + rebalance hint
// ───────────────────────────────────────────────────────────
async function handleParseMode({ type, input, context }, apiKey, headers) {
  const contextBlock = buildContextBlock(context);

  const systemPrompt = `You are Rocky, a nutrition coach in the Apex app. Your job right now is to:
1. Identify foods from user input (text or photo) and estimate macros (calories, protein, carbs, fat)
2. Respond in Rocky's voice — hype-man-friend-meets-clinical-coach (direct, specific, encouraging but honest)
3. Reason about the user's remaining daily budget and suggest rebalance if needed

Use this context to personalize your response:
${contextBlock}

Respond with ONLY a valid JSON object in this exact shape — no markdown, no code fences, no prose outside the JSON:

{
  "foods": [
    { "name": "human-readable food description", "cal": 700, "p": 58, "c": 72, "f": 22 }
  ],
  "total": { "cal": 700, "p": 58, "c": 72, "f": 22 },
  "rockyMessage": "Conversational Rocky response under 120 words. Reference their remaining runway and/or favorites by name when relevant.",
  "rebalance": {
    "suggestion": "stay" | "downsize" | "over",
    "reasoning": "One sentence on why"
  },
  "confidence": "high" | "medium" | "low"
}

Rules:
- "stay" = they have runway, keep planned meals
- "downsize" = within target but tight (<300 cal runway)
- "over" = they are above their daily target
- Macros: USDA averages for common foods, published nutrition for chains, round to nearest 5 cal / 1g
- If input is unclear, return foods: [] and ask for clarification in rockyMessage`;

  let userContent;
  if (type === 'text') {
    userContent = input;
  } else {
    const match = input.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Image must be data URL' }) };
    }
    userContent = [
      { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } },
      { type: 'text', text: 'Identify the food in this image and return macros in the JSON format specified.' },
    ];
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Anthropic ${response.status}: ${errText.slice(0, 200)}` }) };
    }

    const data = await response.json();
    const rawText = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();

    let parsed;
    try { parsed = JSON.parse(rawText); }
    catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      try { parsed = m ? JSON.parse(m[0]) : null; } catch { parsed = null; }
    }
    if (!parsed) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Claude returned invalid JSON', rawText: rawText.slice(0, 500) }) };
    }

    const foods = Array.isArray(parsed.foods) ? parsed.foods.map((f) => ({
      name: String(f.name || '').slice(0, 200),
      cal: Math.max(0, parseInt(f.cal) || 0),
      p: Math.max(0, parseInt(f.p) || 0),
      c: Math.max(0, parseInt(f.c) || 0),
      f: Math.max(0, parseInt(f.f) || 0),
    })) : [];

    const total = parsed.total && typeof parsed.total === 'object' ? {
      cal: Math.max(0, parseInt(parsed.total.cal) || 0),
      p: Math.max(0, parseInt(parsed.total.p) || 0),
      c: Math.max(0, parseInt(parsed.total.c) || 0),
      f: Math.max(0, parseInt(parsed.total.f) || 0),
    } : { cal: 0, p: 0, c: 0, f: 0 };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        mode: 'parse',
        foods,
        total,
        rockyMessage: String(parsed.rockyMessage || '').slice(0, 800),
        rebalance: {
          suggestion: ['stay', 'downsize', 'over'].includes(parsed.rebalance?.suggestion) ? parsed.rebalance.suggestion : 'stay',
          reasoning: String(parsed.rebalance?.reasoning || '').slice(0, 300),
        },
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
}

// ───────────────────────────────────────────────────────────
// SUGGEST MODE — "What should I eat the rest of the day?"
// Claude proposes 2-3 specific meals BY NAME from user's favorites that hit remaining macros
// ───────────────────────────────────────────────────────────
async function handleSuggestMode(context, apiKey, headers) {
  const contextBlock = buildContextBlock(context);

  const systemPrompt = `You are Rocky, the user's nutrition coach. The user just asked: "What should I eat the rest of the day to stay on target?"

Your job:
1. Look at their remaining calorie + protein budget
2. Propose 2-3 SPECIFIC meals they could eat, BY NAME, pulling from their favorites (favorite restaurants, favorite specific meals, preferred proteins/carbs/fats)
3. Calculate macros for each proposed meal
4. Make sure the proposed meals ROUGHLY fill the remaining budget (don't have to be perfect — ±100 cal is fine)
5. When possible, name specific restaurant orders (e.g. "Chipotle chicken bowl — white rice, black beans, pico, guac") or specific meal ideas ("4-egg omelet with turkey sausage + avocado toast")
6. If they mentioned a cheat meal (like "Flying Dutchman from In-N-Out"), feel free to include it if they have the calorie room

Context:
${contextBlock}

Respond with ONLY a valid JSON object in this exact shape — no markdown, no code fences:

{
  "suggestions": [
    {
      "mealType": "lunch" | "snack" | "dinner" | "breakfast",
      "name": "Specific meal name — e.g. 'Flying Dutchman at In-N-Out with protein-style fries'",
      "description": "One-sentence description of what's in it",
      "cal": 620, "p": 45, "c": 12, "f": 42,
      "why": "One sentence — why this fits their day (references their remaining budget or preferences)"
    }
  ],
  "totalProjected": { "cal": 1850, "p": 180, "c": 140, "f": 65 },
  "rockyMessage": "Opening line in Rocky's voice, under 60 words. Specific to the user — reference their compound, their week, their favorites."
}

Rules:
- 2 suggestions if they have 1-2 meal slots left; 3 if they have 3+ remaining
- Each suggestion MUST be specific by name (never 'a protein source' — say 'grilled chicken thighs with sweet potato and asparagus')
- Use their favorite restaurants by name when it makes sense
- If they're UNDER by a lot and it's reasonable, a cheat meal is fair game
- If they're already OVER, suggest lower-cal options (salad, soup, protein shake only)
- Round macros to nearest 5 cal / 1g`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'What should I eat the rest of the day to stay on target with my macros?' }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Anthropic ${response.status}: ${errText.slice(0, 200)}` }) };
    }

    const data = await response.json();
    const rawText = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();

    let parsed;
    try { parsed = JSON.parse(rawText); }
    catch {
      const m = rawText.match(/\{[\s\S]*\}/);
      try { parsed = m ? JSON.parse(m[0]) : null; } catch { parsed = null; }
    }
    if (!parsed) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Claude returned invalid JSON for suggest mode', rawText: rawText.slice(0, 500) }) };
    }

    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map((s) => ({
      mealType: ['breakfast', 'lunch', 'dinner', 'snack'].includes(s.mealType) ? s.mealType : 'snack',
      name: String(s.name || '').slice(0, 200),
      description: String(s.description || '').slice(0, 300),
      cal: Math.max(0, parseInt(s.cal) || 0),
      p: Math.max(0, parseInt(s.p) || 0),
      c: Math.max(0, parseInt(s.c) || 0),
      f: Math.max(0, parseInt(s.f) || 0),
      why: String(s.why || '').slice(0, 200),
    })) : [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        mode: 'suggest',
        suggestions,
        totalProjected: parsed.totalProjected || { cal: 0, p: 0, c: 0, f: 0 },
        rockyMessage: String(parsed.rockyMessage || '').slice(0, 600),
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
}
