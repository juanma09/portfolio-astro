import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Initialize variables at the top level of the function
  let languages: any[] = [];
  let totalText = "";

  try {
    const apiKey = import.meta.env.WAKATIME_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
    }

    const response = await fetch(
      "https://wakatime.com/api/v1/users/current/stats/last_7_days",
      {
        headers: {
          Authorization: `Basic ${btoa(apiKey + ":")}`,
        },
      }
    );

    const { data } = await response.json();

    // --- LOGIC START ---
    const allItems = data.languages || [];
    const realLanguages = allItems
      .filter((l: any) => l.name !== "Other")
      .sort((a: any, b: any) => b.total_seconds - a.total_seconds);

    const existingOther = allItems.find((l: any) => l.name === "Other");
    const top4 = realLanguages.slice(0, 4);
    const rest = realLanguages.slice(4);

    // Map the top 4 into our languages array
    languages = top4.map((l: any) => ({
      name: l.name,
      percent: l.percent,
      text: l.text,
    }));

    const othersToMerge = [...rest];
    if (existingOther) othersToMerge.push(existingOther);

    if (othersToMerge.length > 0) {
      const otherPercent = othersToMerge.reduce((acc: number, curr: any) => acc + curr.percent, 0);
      const otherSeconds = othersToMerge.reduce((acc: number, curr: any) => acc + curr.total_seconds, 0);

      const h = Math.floor(otherSeconds / 3600);
      const m = Math.floor((otherSeconds % 3600) / 60);
      const timeText = h > 0 ? `${h} hrs ${m} mins` : `${m} mins`;

      languages.push({
        name: "Other",
        percent: Number(otherPercent.toFixed(2)),
        text: timeText,
      });
    }

    totalText = data.human_readable_total_including_other_language || data.human_readable_total || "";
    // --- LOGIC END ---

    // Now 'languages' and 'totalText' are guaranteed to exist
    return new Response(
      JSON.stringify({ languages, totalText }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
};