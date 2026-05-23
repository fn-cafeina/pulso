BINARY_NAME=bin/api

build:
	cd backend && go build -o $(BINARY_NAME) ./cmd/api/main.go

run:
	cd backend && go run ./cmd/api/main.go

clean:
	cd backend && rm -rf $(dir $(BINARY_NAME)) pulso.db
