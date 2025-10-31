export default async function handler(req, res) {
  try {
    const { q, days = "2" } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Missing required parameter 'q' (location query)" });
    }
    const apiKey = process.env.WEATHERAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing WEATHERAPI_KEY" });
    }

    const upstream = new URL("https://weatherapi-com.p.rapidapi.com/forecast.json");
    upstream.searchParams.set("q", q);
    upstream.searchParams.set("days", days);

    const r = await fetch(upstream.toString(), {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
      },
    });

    const text = await r.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (!r.ok) {
      return res.status(r.status).send(text);
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(text);
  } catch (e) {
    console.error("Error in /api/forecast handler:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}