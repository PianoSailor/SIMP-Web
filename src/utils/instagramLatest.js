export async function fetchLatestPermalink({ username }) {
  const qs = new URLSearchParams();
  if (username) qs.set("username", username);

  const res = await fetch(`/api/latest?${qs.toString()}`, {
    headers: { "Accept": "application/json" }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (!data?.permalink) throw new Error("No permalink returned by /api/latest");
  return data.permalink;
}
