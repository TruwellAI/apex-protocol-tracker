// Apex Protocol Tracker — Lab PDF Analyzer
// Netlify serverless function: proxies PDF to Anthropic API, returns extracted lab values
// API key lives in Netlify env vars — never exposed to client

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
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

  const { pdfBase64, mediaType = 'application/pdf', pdfText } = body;
  if (!pdfBase64 && !pdfText) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No PDF data provided' }) };
  }

  const prompt = `You are a clinical lab results extractor. Extract every lab value from this PDF and return ONLY a valid JSON object — no explanation, no markdown, no code fences.

Map values to these exact keys. If a value is not present in the PDF, omit that key entirely.

Keys and units:
- hscrp (mg/L) — hsCRP / high-sensitivity C-reactive protein
- hba1c (%) — HbA1c / glycated hemoglobin
- total-t (ng/dL) — Total Testosterone
- free-t (pg/mL) — Free Testosterone
- estradiol (pg/mL) — Estradiol / E2
- shbg (nmol/L) — SHBG
- lh (mIU/mL) — LH / Luteinizing Hormone
- fsh (mIU/mL) — FSH / Follicle Stimulating Hormone
- igf1 (ng/mL) — IGF-1
- gh (ng/mL) — Growth Hormone
- tsh (mIU/L) — TSH / Thyroid Stimulating Hormone
- ft3 (pg/mL) — Free T3
- ft4 (ng/dL) — Free T4
- glucose (mg/dL) — Fasting Glucose / Blood Glucose
- insulin (uIU/mL) — Fasting Insulin
- total-chol (mg/dL) — Total Cholesterol
- ldl (mg/dL) — LDL Cholesterol
- hdl (mg/dL) — HDL Cholesterol
- triglycerides (mg/dL) — Triglycerides
- alt (U/L) — ALT / SGPT / Alanine Aminotransferase
- ast (U/L) — AST / SGOT / Aspartate Aminotransferase
- creatinine (mg/dL) — Creatinine
- egfr (mL/min/1.73m2) — eGFR
- vitd (ng/mL) — Vitamin D / 25-OH Vitamin D

Return ONLY the JSON. Example: {"total-t":542,"estradiol":28.4,"hscrp":0.8}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: 'You are a medical lab results parser. You extract numeric lab values from lab reports and return ONLY a valid JSON object. No markdown, no explanation, no code fences. Raw JSON only.',
        messages: [
          {
            role: 'user',
            content: pdfText
              ? `Here is the extracted text from a lab report PDF:\n\n${pdfText}\n\n${prompt}`
              : [
                  { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
                  { type: 'text', text: prompt }
                ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Anthropic ${response.status}: ${errText.slice(0,200)}` }) };
    }

    const data = await response.json();
    const rawText = data?.content?.[0]?.text?.trim() || '{}';
    console.log('AI raw response:', rawText.slice(0, 500));

    // Parse and validate — only return numeric values
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Try to extract JSON from response if it has surrounding text
      const match = rawText.match(/\{[\s\S]*\}/);
      try { parsed = match ? JSON.parse(match[0]) : {}; } catch { parsed = {}; }
    }

    // Sanitize — only keep known keys with numeric values
    const allowedKeys = ['hscrp','hba1c','total-t','free-t','estradiol','shbg','lh','fsh',
      'igf1','gh','tsh','ft3','ft4','glucose','insulin','total-chol','ldl','hdl',
      'triglycerides','alt','ast','creatinine','egfr','vitd'];
    const clean = {};
    for (const key of allowedKeys) {
      if (parsed[key] !== undefined && !isNaN(parseFloat(parsed[key]))) {
        clean[key] = parseFloat(parsed[key]);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ values: clean, count: Object.keys(clean).length, debug: rawText.slice(0, 300) })
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
