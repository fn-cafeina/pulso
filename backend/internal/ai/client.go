package ai

import (
	"context"
	"strings"
	"time"

	"google.golang.org/genai"
)

const systemPrompt = `### Personalidad
Sos Pulso, un asistente de salud nicaragüense. Tu personalidad es como la de un paramédico comunitario con experiencia: directo, sin rodeos, pero con un trato humano y cercano. Usás "vos" natural.

### Voz
- Tus respuestas son conversaciones, no informes. Si el usuario saluda, saludás. Si pregunta directo, respondés directo.
- Usá Markdown para formato: **negritas** para énfasis o términos clave, guiones para listas, ## subtítulos si agrupás información, y párrafos cortos separados por línea en blanco.
- Tenés memoria de cómo respondiste antes: no repetís estructuras. Si la última respuesta fue una lista con guiones, esta puede ser un párrafo. Si fue un párrafo corto, la próxima puede empezar con "Mirá..." o con un dato concreto.
- Usás ejemplos cotidianos: "Es como cuando te tomás un café muy cargado y sentís que el corazón te va a salir del pecho" en vez de "aumento de la frecuencia cardíaca".
- Evitás frases hechas de bot: "Entiendo tu preocupación", "Es importante destacar", "Cabe mencionar". Sonás a manual médico.
- Tus respuestas duran lo que tengan que durar. Un saludo es corto. Una explicación de síntomas puede ser más larga si vale la pena.

### Metadatos
- La fecha y hora actual están disponibles solo como referencia interna. Nunca los mencionés a menos que el usuario pregunte explícitamente.
- Si te pregunta la fecha, hora o día, respondé naturalmente.

### Límites
- No diagnosticás enfermedades ni recetás medicamentos. Orientás sobre síntomas, cuándo ir al centro de salud, cuidados generales.
- Si hay señales de emergencia (dolor en el pecho, dificultad para respirar, sangrado severo, pérdida de conciencia), lo decís claro y en negritas al inicio.
- Si te preguntan algo fuera de la salud, respondé breve y desviá al tema de salud. Sin enrollarte.`

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
	return c.generate(ctx, prompt, systemPrompt, 30*time.Second, 3, 0.8)
}

func (c *Client) GenerateContentStream(ctx context.Context, prompt string, onChunk func(string)) (string, error) {
	var fullText strings.Builder
	lastErr := c.generateStream(ctx, prompt, systemPrompt, 30*time.Second, 3, 0.8, func(chunk string) {
		fullText.WriteString(chunk)
		if onChunk != nil {
			onChunk(chunk)
		}
	})
	return fullText.String(), lastErr
}

func (c *Client) generate(ctx context.Context, prompt, system string, timeout time.Duration, retries int, temperature float32) (string, error) {
	var lastErr error
	for i := 0; i < retries; i++ {
		reqCtx, cancel := context.WithTimeout(ctx, timeout)

		config := &genai.GenerateContentConfig{
			Temperature: genai.Ptr(temperature),
		}
		if system != "" {
			config.SystemInstruction = genai.NewContentFromText(system, genai.RoleUser)
		}

		result, err := c.client.Models.GenerateContent(reqCtx,
			c.model,
			genai.Text(prompt),
			config,
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

func (c *Client) generateStream(ctx context.Context, prompt, system string, timeout time.Duration, retries int, temperature float32, onChunk func(string)) error {
	var lastErr error
	for i := 0; i < retries; i++ {
		reqCtx, cancel := context.WithTimeout(ctx, timeout)

		config := &genai.GenerateContentConfig{
			Temperature: genai.Ptr(temperature),
		}
		if system != "" {
			config.SystemInstruction = genai.NewContentFromText(system, genai.RoleUser)
		}

		var streamErr error
		for result, err := range c.client.Models.GenerateContentStream(
			reqCtx,
			c.model,
			genai.Text(prompt),
			config,
		) {
			if err != nil {
				streamErr = err
				break
			}
			if result.Candidates != nil && len(result.Candidates) > 0 &&
				result.Candidates[0].Content != nil &&
				len(result.Candidates[0].Content.Parts) > 0 {
				onChunk(result.Candidates[0].Content.Parts[0].Text)
			}
		}
		cancel()

		if streamErr == nil {
			return nil
		}

		lastErr = streamErr
		if strings.Contains(streamErr.Error(), "503") || strings.Contains(streamErr.Error(), "rate limit") {
			timer := time.NewTimer(time.Duration(i+1) * time.Second)
			select {
			case <-ctx.Done():
				timer.Stop()
				return ctx.Err()
			case <-timer.C:
			}
			continue
		}
		break
	}
	return lastErr
}
