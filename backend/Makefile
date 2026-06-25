BINARY_NAME=bin/api

.PHONY: build run test lint tidy clean dev

build:
	go build -o $(BINARY_NAME) ./cmd/api/main.go

run:
	go run ./cmd/api/main.go

test:
	go test ./... -v

lint:
	golangci-lint run

tidy:
	go mod tidy

clean:
	rm -rf bin tmp pulso.db

dev:
	air
