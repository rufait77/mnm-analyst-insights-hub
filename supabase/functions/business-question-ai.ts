
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OpenAI API Key" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { question } = await req.json();

    const systemPrompt =
      "You are a helpful, clear, and precise business data assistant. Answer the following question for a business user in concise, easily understood language. If you don't have data context, answer the general business question helpfully.";

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.4,
        max_tokens: 350,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errText}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    const responseJson = await aiRes.json();
    const answer =
      responseJson?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I was not able to generate an answer right now.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
