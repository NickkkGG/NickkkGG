// Contribution data for the "signal" panel: the last 52 weeks from GitHub's contribution
// calendar, with the public event feed as a fallback and as the source of the last push.

const WEEKS = 52;
const DAY_MS = 864e5;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } }
    }
  }
}`;

/** Weekly totals (oldest first, exactly 52) and the year's total from a GraphQL calendar response. */
export function parseCalendar(json) {
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) throw new Error("no contribution calendar in response");
  const sums = cal.weeks.map((w) => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0));
  const last = sums.slice(-WEEKS);
  return { weeks: [...Array(WEEKS - last.length).fill(0), ...last], total: cal.totalContributions };
}

/** Name (without owner) of the repo in the newest push event, or null. */
export function lastPushRepo(events) {
  const push = events.find((e) => e.type === "PushEvent");
  return push ? push.repo.name.split("/").pop() : null;
}

/** Weekly commit counts from push events, oldest first; only recent weeks can be filled. */
export function weeksFromEvents(events, now) {
  const weeks = Array(WEEKS).fill(0);
  for (const e of events) {
    if (e.type !== "PushEvent") continue;
    const age = (now.getTime() - new Date(e.created_at).getTime()) / DAY_MS;
    const idx = WEEKS - 1 - Math.floor(age / 7);
    if (age >= 0 && idx >= 0) weeks[idx] += e.payload?.size ?? 1;
  }
  return weeks;
}

/** Everything the signal panel shows. Throws only when neither GitHub source answers. */
export async function fetchSignalData(login, token, fetchImpl = fetch, now = new Date()) {
  const api = process.env.SIGNAL_API || "https://api.github.com";
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "profile-signal", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  let events = null;
  try {
    const r = await fetchImpl(`${api}/users/${login}/events/public?per_page=100`, { headers });
    if (r.ok) events = await r.json();
  } catch {
    events = null;
  }

  let calendar = null;
  if (token) {
    try {
      const r = await fetchImpl(`${api}/graphql`, { method: "POST", headers, body: JSON.stringify({ query: QUERY, variables: { login } }) });
      const json = r.ok ? await r.json() : null;
      if (json && !json.errors) calendar = parseCalendar(json);
    } catch {
      calendar = null;
    }
  }

  if (!calendar && !Array.isArray(events)) throw new Error("GitHub did not answer: no calendar and no events");
  const weeks = calendar ? calendar.weeks : weeksFromEvents(events, now);
  const total = calendar ? calendar.total : weeks.reduce((a, b) => a + b, 0);
  return {
    weeks,
    total,
    bestWeek: Math.max(0, ...weeks),
    lastPush: Array.isArray(events) ? lastPushRepo(events) : null,
    updated: now.toISOString().slice(0, 10),
  };
}
