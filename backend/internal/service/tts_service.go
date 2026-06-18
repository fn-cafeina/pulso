package service

import (
	"context"
	"fmt"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/tts"
)

type TTSService interface {
	Synthesize(ctx context.Context, text string) ([]byte, error)
}

type ttsService struct {
	client  *tts.Client
	cache   *tts.Cache
	timeout time.Duration
}

func NewTTSService(client *tts.Client, cache *tts.Cache, timeout time.Duration) TTSService {
	return &ttsService{
		client:  client,
		cache:   cache,
		timeout: timeout,
	}
}

func (s *ttsService) Synthesize(ctx context.Context, text string) ([]byte, error) {
	if cached, err := s.cache.Get(text); err != nil {
		return nil, fmt.Errorf("tts cache read: %w", err)
	} else if cached != nil {
		return cached, nil
	}

	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	audio, err := s.client.Synthesize(ctx, text)
	if err != nil {
		return nil, fmt.Errorf("tts synthesize: %w", err)
	}

	if err := s.cache.Set(text, audio); err != nil {
		return nil, fmt.Errorf("tts cache write: %w", err)
	}

	return audio, nil
}
