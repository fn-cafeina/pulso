BINARY_NAME=bin/api

build:
	mkdir -p backend/bin
	cd backend && go build -o bin/api ./cmd/api/main.go

run:
	cd backend && go run ./cmd/api/main.go

clean:
	rm -rf backend/bin/
	rm -f backend/pulso.db
