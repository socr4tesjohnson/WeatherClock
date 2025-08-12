exports.handler = async function(event) {
  try {
    const params = event.queryStringParameters || {};
    const q = params.q;
    const days = params.days || "2";
    if (!q) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing q" }) };
    }
    const apiKey = process.env.WEATHERAPI_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing WEATHERAPI_KEY" }) };
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
    return {
      statusCode: r.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: text,
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Proxy error" }) };
  }
};