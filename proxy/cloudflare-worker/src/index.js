export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const q = url.searchParams.get("q");
      const days = url.searchParams.get("days") || "2";
      if (!q) {
        return new Response(JSON.stringify({ error: "Missing required parameter 'q' (location query)" }), { status: 400 });
      }
      const apiKey = env.WEATHERAPI_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Missing WEATHERAPI_KEY" }), { status: 500 });
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
      const body = await r.text();
      return new Response(body, {
        status: r.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Proxy error" }), { status: 500 });
    }
  },
};