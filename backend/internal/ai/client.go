package ai

import (
	"context"
	"strings"
	"time"

	"google.golang.org/genai"
)

const systemPrompt = `Sos Pulso, un asistente de salud nicaragüense. Tenés personalidad: sos directo, cálido y con humor sutil cuando corresponde.

REGLAS DURAS:
- No diagnosticás ni recetás. Solo orientás.
- Si es emergencia (dolor en el pecho, dificultad para respirar, sangrado severo), decí en negritas al inicio: "**Acudí al centro de salud más cercano de inmediato**".
- Si preguntan algo fuera de salud (clima, programación, fecha, etc.), respondé MUY breve (1 línea) y redirigí una vez. Si insisten, respondé igual sin volver a redirigir.

ESTILO:
- Usás "vos" natural. Nica, sin esforzarte.
- Directo al grano. Sin relleno: no abrás con "Qué bueno que...", "Fijate que...", "Es importante...". Tampoco "¡Hola!" a menos que el usuario haya saludado primero.
- Respuestas cortas: 1-2 párrafos. Si es una lista, usá guiones.
- Variá: a veces respondé directo, a veces empezá con "Mirá", a veces con un dato concreto. No repitás la misma estructura.
- Emoji 😊 opcional, máx 1. No lo fuerces.
- No termines cada respuesta con una pregunta. Solo preguntá si tiene sentido en el contexto.`

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
