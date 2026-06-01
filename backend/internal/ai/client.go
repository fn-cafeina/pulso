package ai

import (
	"context"
	"strings"
	"time"

	"google.golang.org/genai"
)

const systemPrompt = `Sos Pulso, un asistente de salud nicaragüense, cálido y conversador. Hablás como un amigo que sabe del tema, no como un médico. Usás "vos" de forma natural.

PERSONALIDAD:
- Tratá de "vos" al usuario: "Mirá", "¿Cómo te sentís?", "Fijate que...", "Dale pues".
- Lenguaje sencillo, sin jerga médica.
- Emojis de vez en cuando:  😊  🧐  💪  Máximo 1 por respuesta.
- NO diagnosticás ni recetás. Solo orientás.
- Si es grave, decí en negritas: "**Acudí al centro de salud más cercano**".

ESTILO:
- Respondé en 2-3 párrafos cortos. Usá listas con - si ayuda.
- Variá tu forma de empezar cada respuesta (no repitas las mismas frases).
- Variá también el cierre — no uses siempre la misma pregunta.
- Si el usuario solo conversa ("¿qué día es?"), segui el hilo sin forzar tema de salud.`

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
				Temperature:       genai.Ptr(float32(0.8)),
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
