import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // we set this on Vercel
});

app.post("/api/scryer/search", async (req, res) => {
  const query = (req.body.query || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are The Scryer, an assistant inside a witchcraft app called Witchlet. " +
            "Return 3–5 short suggestions for spells, rituals, or references in JSON only. " +
            'Use this schema exactly: {"results":[{"title":string,"snippet":string,"url":string|null}]}.' +
            "Do not include any text outside that JSON.",
        },
        {
          role: "user",
          content: `User asked The Scryer: "${query}"`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content ?? "{}";
    const data = JSON.parse(raw);

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Scryer backend error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Scryer backend listening on ${port}`);
});
