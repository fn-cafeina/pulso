package tts

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"io"
	"os"
	"path/filepath"
)

const (
	defaultCacheDir = "cache/tts"
	cacheFileMode   = 0644
	cacheDirMode    = 0755
)

type Cache struct {
	dir string
}

func NewCache(dir string) *Cache {
	if dir == "" {
		dir = defaultCacheDir
	}
	return &Cache{dir: dir}
}

func (c *Cache) Key(text string) string {
	h := sha256.Sum256([]byte(text))
	return hex.EncodeToString(h[:])
}

func (c *Cache) path(key string) string {
	return filepath.Join(c.dir, key+".mp3")
}

func (c *Cache) Get(text string) ([]byte, error) {
	key := c.Key(text)
	f, err := os.Open(c.path(key))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil
		}
		return nil, err
	}
	defer func() { _ = f.Close() }()

	data, err := io.ReadAll(f)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (c *Cache) Set(text string, data []byte) error {
	key := c.Key(text)

	if err := os.MkdirAll(c.dir, cacheDirMode); err != nil {
		return err
	}

	return os.WriteFile(c.path(key), data, cacheFileMode)
}

func (c *Cache) Delete(text string) error {
	key := c.Key(text)
	return os.Remove(c.path(key))
}
