import OpenAI from "openai";

export default async function handler(req, res) {
  // Make browser checks safe
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "Scryer endpoint alive" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "Missing OPENAI_API_KEY in Vercel Environment Variables (Production).",
    });
  }

  try {
    const query = (req.body?.query || "").trim();
    if (!query) return res.status(400).json({ error: "Missing query" });

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are The Scryer inside a witchcraft app called Witchlet. Return JSON only: " +
            '{"results":[{"title":string,"snippet":string,"url":string|null}]}',
        },
        { role: "user", content: query },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "{}";
    const data = JSON.parse(raw);

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Scryer backend error" });
  }
}


