BINARY_NAME=bin/api

.PHONY: build run test vet lint tidy clean dev setup

build:
	go build -o $(BINARY_NAME) ./cmd/api/main.go

run:
	go run ./cmd/api/main.go

test:
	go test ./... -v

vet:
	go vet ./...

lint:
	golangci-lint run

tidy:
	go mod tidy

clean:
	rm -rf bin tmp pulso.db api

dev:
	air
