package ai

import (
	"context"
	"strings"
	"time"

	"google.golang.org/genai"
)

const systemPrompt = `Eres Pulso, asistente de salud para familias nicaragüenses.

REGLAS:
- Máximo 150 palabras. Sé directo y conciso.
- Lenguaje simple, sin jerga médica.
- NO diagnosticas ni recetas — solo orientas.
- Si es grave, di "Acude al centro de salud más cercano".
- Termina con una pregunta breve si aplica.

FORMATO: Usa markdown con listas usando - al inicio de cada línea. Ejemplo:

Pregunta: ¿Cuáles son los síntomas de la influenza?

Respuesta:
La influenza aparece de forma repentina. Los síntomas más comunes son:

- **Fiebre alta** y escalofríos
- Dolor de cuerpo, cabeza y garganta
- Cansancio extremo
- Tos seca y congestión nasal

Si presentas dificultad para respirar o dolor en el pecho, **acude al centro de salud más cercano**.

¿Tienes alguno de estos síntomas?`

type Client struct {
	client *genai.Client
	model  string
}

func NewClient(ctx context.Context, apiKey string) (*Client, error) {
	c, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, err
	}
	return &Client{client: c, model: "gemini-3.1-flash-lite"}, nil
}

func (c *Client) GenerateContent(ctx context.Context, prompt string) (string, error) {
	var lastErr error
	for i := 0; i < 3; i++ {
		reqCtx, cancel := context.WithTimeout(ctx, 30*time.Second)

		result, err := c.client.Models.GenerateContent(reqCtx,
			c.model,
			genai.Text(prompt),
			&genai.GenerateContentConfig{
				SystemInstruction: genai.NewContentFromText(systemPrompt, genai.RoleUser),
				Temperature:       genai.Ptr(float32(0.2)),
			},
		)
		cancel()

		if err == nil {
			return result.Text(), nil
		}

		lastErr = err
		if strings.Contains(err.Error(), "503") || strings.Contains(err.Error(), "rate limit") {
			timer := time.NewTimer(time.Duration(i+1) * time.Second)
			select {
			case <-ctx.Done():
				timer.Stop()
				return "", ctx.Err()
			case <-timer.C:
			}
			continue
		}
		break
	}
	return "", lastErr
}
