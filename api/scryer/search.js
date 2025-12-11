import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const query = (body.query || "").trim();

    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are The Scryer, an assistant inside a witchcraft app called Witchlet. " +
            "Return JSON only, matching: {\"results\":[{\"title\":string,\"snippet\":string,\"url\":string|null}]}."
        },
        {
          role: "user",
          content: `User asked: "${query}"`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? "{}";

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {
        results: [
          {
            title: "Response from The Scryer",
            snippet: raw,
            url: null
          }
        ]
      };
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Scryer backend error" });
  }
}
