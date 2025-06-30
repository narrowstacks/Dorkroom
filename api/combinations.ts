import type { VercelRequest, VercelResponse } from "@vercel/node";

// The master API key that has high rate limits
const SUPABASE_MASTER_API_KEY = process.env.SUPABASE_MASTER_API_KEY;
const SUPABASE_ENDPOINT =
  "https://ukpdbjhbudgsjqsxlays.supabase.co/functions/v1/combinations";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate that we have the API key
    if (!SUPABASE_MASTER_API_KEY) {
      console.error("SUPABASE_MASTER_API_KEY environment variable is not set");
      return res.status(500).json({ error: "API configuration error" });
    }

    // Build the target URL with query parameters
    const queryString = new URLSearchParams(
      req.query as Record<string, string>,
    ).toString();
    const targetUrl = queryString
      ? `${SUPABASE_ENDPOINT}?${queryString}`
      : SUPABASE_ENDPOINT;

    // Make the request to Supabase with the master API key
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUPABASE_MASTER_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": req.headers["user-agent"] || "DorkroomReact-API",
      },
    });

    if (!response.ok) {
      console.error(
        `Supabase API error: ${response.status} ${response.statusText}`,
      );
      return res.status(response.status).json({
        error: "External API error",
        status: response.status,
        statusText: response.statusText,
      });
    }

    const data = await response.json();

    // Return the data
    return res.status(200).json(data);
  } catch (error) {
    console.error("API function error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
