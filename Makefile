BINARY_NAME=bin/api

.PHONY: build run test vet lint tidy clean dev setup

build:
	cd backend && go build -o $(BINARY_NAME) ./cmd/api/main.go

run:
	cd backend && go run ./cmd/api/main.go

test:
	cd backend && go test ./... -v

vet:
	cd backend && go vet ./...

lint:
	cd backend && golangci-lint run

tidy:
	cd backend && go mod tidy

clean:
	cd backend && rm -rf bin tmp pulso.db api

dev:
	cd backend && air

setup:
	go install github.com/air-verse/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	$(MAKE) tidy
	@echo "Ready. Run 'make dev' to start."
