import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple helpers
function csvToColumnsRows(csv: string[][]) {
  const headers = csv[0];
  const dataRows = csv.slice(1);
  return { headers, rows: dataRows };
}

function guessBarChart(headers: string[], rows: string[][]) {
  if (!headers?.length || !rows?.length) return [];
  const colTypes: ("number" | "string")[] = [];
  for (let j = 0; j < headers.length; ++j) {
    const numValues = rows.map(r => parseFloat(r[j])).filter(x => !isNaN(x));
    colTypes[j] = numValues.length > rows.length/2 ? "number" : "string";
  }
  const catIdx = colTypes.findIndex(t => t === "string");
  const numIdx = colTypes.findIndex(t => t === "number");
  if (catIdx === -1 || numIdx === -1) return [];
  const agg: Record<string, number> = {};
  rows.forEach(r => {
    const key = r[catIdx] || "(blank)";
    const val = parseFloat(r[numIdx]) || 0;
    agg[key] = (agg[key] || 0) + val;
  });
  return Object.entries(agg).map(([x, y]) => ({ x, y }));
}

function guessPieChart(headers: string[], rows: string[][]) {
  if (!headers?.length || !rows?.length) return [];
  const colTypes: ("number" | "string")[] = [];
  for (let j = 0; j < headers.length; ++j) {
    const numValues = rows.map(r => parseFloat(r[j])).filter(x => !isNaN(x));
    colTypes[j] = numValues.length > rows.length/2 ? "number" : "string";
  }
  const catIdx = colTypes.findIndex(t => t === "string");
  if (catIdx === -1) return [];
  const freq: Record<string, number> = {};
  rows.forEach(r => {
    const key = r[catIdx] || "(blank)";
    freq[key] = (freq[key] || 0) + 1;
  });
  return Object.entries(freq).map(([name, value]) => ({ name, value }));
}

function guessTrendChart(headers: string[], rows: string[][]) {
  if (!headers?.length || !rows?.length) return [];
  const colTypes: ("number" | "string")[] = [];
  for (let j = 0; j < headers.length; ++j) {
    const numValues = rows.map(r => parseFloat(r[j])).filter(x => !isNaN(x));
    colTypes[j] = numValues.length > rows.length/2 ? "number" : "string";
  }
  const numIdx = colTypes.findIndex(t => t === "number");
  const xIdx = 0;
  if (numIdx === -1) return [];
  return rows.map(r => ({
    x: r[xIdx] || "",
    y: parseFloat(r[numIdx]) || 0
  })).slice(0, 30);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OpenAI API Key" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { csv } = await req.json();
    if (!csv?.length || !csv[0]?.length) {
      return new Response(JSON.stringify({ error: "No CSV provided" }), { status: 400, headers: corsHeaders });
    }
    const { headers, rows } = csvToColumnsRows(csv);

    const systemPrompt = `You are a senior business data analyst. Look at the provided CSV data and generate a short business summary/insight (max 3 sentences), highlighting any important trend, outlier, or key conclusion for non-technical business users, based only on the data.`;

    const userPrompt = `CSV preview:
    Header: ${headers.join(", ")}
    Rows (up to 20 shown):\n` +
      rows.slice(0, 20).map((r, i) => `Row ${i + 1}: ${r.join(", ")}`).join("\n") +
      "\n\nProvide a short summary insight for a business user. Don't repeat the headers or row values unless needed.";

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    });

    const responseJson = await aiRes.json();
    const summary: string =
      responseJson?.choices?.[0]?.message?.content?.trim() ||
      "No summary available.";

    const barData = guessBarChart(headers, rows);
    const pieData = guessPieChart(headers, rows);
    const trendData = guessTrendChart(headers, rows);

    return new Response(JSON.stringify({ summary, barData, pieData, trendData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
