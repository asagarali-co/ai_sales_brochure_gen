async function errorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ");
    }
  } catch {}
  return `Request failed (${res.status})`;
}

export function apiPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}

export async function postJSON(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(apiPath(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res;
}

/** Read a streamed response and call onText with the full text so far. */
export async function readStream(res: Response, onText: (full: string) => void) {
  if (!res.body) throw new Error("The server did not return a readable stream.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      onText(full);
    }
    full += decoder.decode();
    onText(full);
  } finally {
    reader.releaseLock();
  }
}
