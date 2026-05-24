package service_test

import (
	"testing"

	"github.com/fn-cafeina/pulso/backend/internal/service"
)

func TestHaversine_SamePoint(t *testing.T) {
	lat, lon := 12.11499, -86.23617
	d := service.Haversine(lat, lon, lat, lon)
	if d != 0 {
		t.Fatalf("expected 0 for same point, got %f", d)
	}
}

func TestHaversine_Symmetric(t *testing.T) {
	lat1, lon1 := 12.11499, -86.23617
	lat2, lon2 := 12.4342, -86.8783
	d1 := service.Haversine(lat1, lon1, lat2, lon2)
	d2 := service.Haversine(lat2, lon2, lat1, lon1)
	if d1 != d2 {
		t.Fatalf("expected symmetric distances, got %f and %f", d1, d2)
	}
}

func TestHaversine_ManaguaToLeon(t *testing.T) {
	d := service.Haversine(12.11499, -86.23617, 12.4342, -86.8783)
	if d < 73 || d > 83 {
		t.Fatalf("expected Managua-Leon ~78km, got %f", d)
	}
}
