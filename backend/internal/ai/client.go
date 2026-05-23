package ai

import (
	"context"
	"time"

	"google.golang.org/genai"
)

const systemPrompt = `Eres Pulso, un asistente virtual de salud para familias nicaragüenses. Tu función es orientar sobre signos y síntomas, recomendar cuándo acudir a un centro de salud, y proporcionar información útil y contextualizada para Nicaragua. Responde siempre en español, con lenguaje claro y simple. NO diagnosticas enfermedades ni recetas medicamentos — solo orientas. Si los síntomas parecen graves, recomiendas ir a un centro de salud urgente.`

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
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	result, err := c.client.Models.GenerateContent(ctx,
		c.model,
		genai.Text(prompt),
		&genai.GenerateContentConfig{
			SystemInstruction: genai.NewContentFromText(systemPrompt, genai.RoleUser),
			Temperature:       genai.Ptr(float32(0.2)),
		},
	)
	if err != nil {
		return "", err
	}
	return result.Text(), nil
}
