'use server'

export async function generateTextAction(textoOriginal: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('No se encontró la API Key de Gemini en las variables de entorno.');
  }

  const prompt = `Eres un asistente especializado en redacción de Historias Clínicas Psicológicas. 
Tu ÚNICA tarea es transformar el borrador o texto informal proporcionado en un texto técnico, formal, conciso y objetivo en español.

REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE el texto redactado formalmente.
2. NO incluyas introducciones como "Aquí tienes una propuesta" o "Para la redacción técnica...".
3. NO incluyas títulos, encabezados (como ### Motivo de Consulta), viñetas ni observaciones al final.
4. Omite caracteres o cadenas sin sentido (como códigos o pruebas irrelevantes) de manera silenciosa.
5. Escribe en tercera persona y en formato de párrafo limpio.

Texto original a transformar: "${textoOriginal}"`;

  // Modelos confirmados directamente desde AI Studio
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3-flash-preview'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI Actions] Conectando a modelo: ${modelName}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[AI Actions] ¡Éxito con ${modelName}!`);
          return text;
        }
      } else {
        const errJson = await response.json();
        console.warn(`[AI Actions] Error en ${modelName}:`, errJson?.error?.message);
        lastError = errJson?.error?.message || response.statusText;
      }
    } catch (err: any) {
      console.warn(`[AI Actions] Error de red con ${modelName}:`, err?.message);
      lastError = err?.message;
    }
  }

  throw new Error(`Error en la API de IA: ${lastError}`);
}
