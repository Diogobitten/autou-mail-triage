export async function classifyEmail({ subject, body, language = "pt-BR" }) {
  const url = `${import.meta.env.VITE_API_URL}/classify`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, body, language }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Falha na classificação (${res.status}): ${errText}`);
  }
  return res.json();
}
