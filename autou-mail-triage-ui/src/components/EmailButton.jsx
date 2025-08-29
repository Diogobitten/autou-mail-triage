// EmailButton.jsx
export default function EmailButton({ to, subject, body, className = "" }) {
  // Outlook/Windows prefere CRLF. Vamos normalizar \n -> \r\n
  const CRLF = "\r\n";
  const normalizedBody = (body || "").replace(/\r?\n/g, CRLF);

    const href = `mailto:${to || ""}` +
        `?subject=${encodeURIComponent(subject || "")}` +
        `&body=${encodeURIComponent(normalizedBody)}`;

  return (
    <a
      href={href}
      className={`btn-primary inline-flex items-center gap-2 ${className}`}
    >
      Enviar resposta
    </a>
  );
}
