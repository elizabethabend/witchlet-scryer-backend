import OpenAI from "openai";

export default async function handler(req, res) {
  // Allow quick “is this alive” checks
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Scryer endpoint alive" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // This prevents the “crash” scenario and tells you what's missing
    return res.status(500).json({
      error: "Missing OPENAI_API_KEY in Vercel Environment Variables (Production).",
    });
  }

  try {
    const body = req.body || {};
    const query = (body.query || "").trim();
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    // Create client inside handler so missing key can't crash module init
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are The Scryer inside a witchcraft app called Witchlet. " +
            "Return JSON only in this exact shape: " +
            '{"results":[{"title":string,"snippet":string,"url":string|null}]}. ' +
            "Do not include any text outside JSON.",
        },
        { role: "user", content: `User asked: "${query}"` },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "{}";

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        results: [{ title: "The Scryer", snippet: raw, url: null }],
      };
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Scryer function error:", err);
    return res.status(500).json({ error: "Scryer backend error" });
  }
}

