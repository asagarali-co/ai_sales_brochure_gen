async function errorMessage(res: Response): Promise<string> {
    try {
      const data = await res.json();
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((d: { msg: string }) => d.msg).join("; ");
      }
    } catch {}
    return `Request failed (${res.status})`;
  }
  
  export async function postJSON(path: string, body: unknown): Promise<Response> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await errorMessage(res));
    return res;
  }
  
  /** Read a streamed response and call onText with the full text so far. */
  export async function readStream(res: Response, onText: (full: string) => void) {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      full += decoder.decode(value, { stream: true });
      onText(full);
    }
  }