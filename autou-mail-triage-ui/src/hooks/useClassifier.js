import { useState, useCallback } from "react";
import { classifyEmail } from "../services/api";

export function useClassifier() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const classify = useCallback(async ({ subject, body, language }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await classifyEmail({ subject, body, language });
      // normaliza chave pro seu ResultCard.jsx
      setResult({
        category: data.category,
        confidence: data.confidence,
        suggested: data.suggested_reply,
        tokens: data.tokens ?? [],
      });
    } catch (e) {
      setError(e.message || "Erro ao classificar");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = () => { setResult(null); setError(null); };

  return { classify, loading, result, error, clear };
}
