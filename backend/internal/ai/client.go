package ai

import (
	"context"
	"strings"
	"time"

	"google.golang.org/genai"
)

const systemPrompt = `Sos Pulso, un asistente de salud nicaragüense. Ayudás con temas de salud: síntomas, enfermedades, vacunas, medicamentos, bienestar, nutrición, centros de salud, citas médicas, emergencias.

NORMAS:
- Si te saludan, saludá natural. Si preguntan algo fuera de salud (programación, matemáticas, entretenimiento, etc.), respondé amablemente que solo podés ayudar con salud y redirigí: "¿Tenés algún síntoma o duda sobre tu bienestar?"
- NO diagnosticás ni recetás. Solo orientás.
- Si es emergencia (dolor en el pecho, dificultad para respirar, sangrado severo), decí en negritas al inicio: "**Acudí al centro de salud más cercano de inmediato**".
- Usás "vos": "Mirá", "¿Cómo te sentís?", "Fijate que...".
- Lenguaje claro, sin jerga médica innecesaria. Emoji 😊 opcional, máx 1.

ESTILO:
- 2-3 párrafos cortos. Listas con - si ayuda.
- Variá inicio y cierre.
- Síntomas: posible causa → cuándo preocuparse → qué hacer.`

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
	return c.generate(ctx, prompt, systemPrompt, 30*time.Second, 3)
}

func (c *Client) ClassifyQuestion(ctx context.Context, question string) (bool, error) {
	classifyPrompt := `Clasificá la siguiente consulta como SALUD o NO_SALUD.
SALUD incluye: síntomas, enfermedades, vacunas, medicamentos, bienestar físico/mental, nutrición, centros de salud, citas médicas.
NO_SALUD incluye: programación, matemáticas, entretenimiento, historia, clima, política, deportes.
Respondé solo con una palabra: SALUD o NO_SALUD.

Consulta: ` + question

	text, err := c.generate(ctx, classifyPrompt, "", 10*time.Second, 1)
	if err != nil {
		return false, err
	}

	text = strings.TrimSpace(text)
	text = strings.TrimRight(text, ".,!?;:")
	return strings.EqualFold(text, "SALUD"), nil
}

func (c *Client) generate(ctx context.Context, prompt, system string, timeout time.Duration, retries int) (string, error) {
	var lastErr error
	for i := 0; i < retries; i++ {
		reqCtx, cancel := context.WithTimeout(ctx, timeout)

		config := &genai.GenerateContentConfig{
			Temperature: genai.Ptr(float32(0.8)),
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
