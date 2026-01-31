export async function handler(event) {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const username = params.get("username") || "";

    const IG_USER_ID = process.env.IG_USER_ID;
    const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    const DEFAULT_POST_URL = process.env.DEFAULT_POST_URL;

    // Mode 2: no API configured -> return a fixed post URL if provided
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      if (DEFAULT_POST_URL) {
        return json(200, { permalink: DEFAULT_POST_URL, mode: "fallback", username });
      }
      return json(400, {
        error:
          "Instagram API not configured. Set IG_USER_ID and IG_ACCESS_TOKEN (recommended) or set DEFAULT_POST_URL for a fixed embed.",
        username
      });
    }

    // Mode 1: Graph API call for latest media
    const apiVersion = process.env.IG_GRAPH_VERSION || "v19.0";
    const endpoint = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(
      IG_USER_ID
    )}/media?fields=permalink,timestamp&limit=1&access_token=${encodeURIComponent(IG_ACCESS_TOKEN)}`;

    const res = await fetch(endpoint, { headers: { Accept: "application/json" } });
    const data = await res.json();

    if (!res.ok) {
      return json(res.status, {
        error: data?.error?.message || "Instagram Graph API request failed",
        details: data,
        username
      });
    }

    const permalink = data?.data?.[0]?.permalink;
    if (!permalink) {
      return json(404, { error: "No media found for IG_USER_ID", details: data, username });
    }

    return json(200, { permalink, mode: "graph_api", username });
  } catch (err) {
    return json(500, { error: err?.message || "Server error" });
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}
