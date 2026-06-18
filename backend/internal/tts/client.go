package tts

import (
	"bytes"
	"context"

	"github.com/foresturquhart/edge-tts"
)

const defaultVoice = "es-NI-YolandaNeural"

type Client struct{}

func NewClient() *Client {
	return &Client{}
}

func (c *Client) Synthesize(ctx context.Context, text string) ([]byte, error) {
	cfg := edgetts.DefaultConfig()
	cfg.Voice = defaultVoice
	cfg.Rate = "+10%"

	comm, err := edgetts.NewCommunicate(text, cfg)
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	if err := comm.Stream(ctx, func(chunk edgetts.TTSChunk) error {
		if chunk.Type == edgetts.ChunkTypeAudio {
			buf.Write(chunk.Data)
		}
		return nil
	}); err != nil {
		return nil, err
	}

	if buf.Len() == 0 {
		return nil, nil
	}

	return buf.Bytes(), nil
}
