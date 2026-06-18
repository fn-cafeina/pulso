package ai

import (
	"context"
	"fmt"
	"strings"
	"time"

	openai "github.com/sashabaranov/go-openai"
)

const (
	maxTokens        = 4096
	temperature      = 0.9
	presencePenalty  = 0.5
	reasoningEffort  = "high"
)

type NVIDIAProvider struct {
	client *openai.Client
	model  string
}

func NewProvider(apiKey, model string) *NVIDIAProvider {
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://integrate.api.nvidia.com/v1"
	return &NVIDIAProvider{
		client: openai.NewClientWithConfig(cfg),
		model:  model,
	}
}

func (p *NVIDIAProvider) GenerateContent(ctx context.Context, prompt string) (string, error) {
	var lastErr error
	for i := 0; i < 3; i++ {
		reqCtx, cancel := context.WithTimeout(ctx, 30*time.Second)

		resp, err := p.client.CreateChatCompletion(reqCtx, openai.ChatCompletionRequest{
			Model: p.model,
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: SystemPrompt},
				{Role: openai.ChatMessageRoleUser, Content: prompt},
			},
			MaxTokens:        maxTokens,
			Temperature:      temperature,
			PresencePenalty:  presencePenalty,
			ReasoningEffort:  reasoningEffort,
		})
		cancel()

		if err == nil {
			if len(resp.Choices) == 0 {
				return "", fmt.Errorf("NVIDIA NIM returned no choices")
			}
			return resp.Choices[0].Message.Content, nil
		}

		lastErr = err
		if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "503") {
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
