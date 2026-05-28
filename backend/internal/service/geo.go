package service

import "math"

const earthRadiusKm = 6371.0

func Haversine(lat1, lon1, lat2, lon2 float64) float64 {
	if math.IsNaN(lat1) || math.IsNaN(lon1) || math.IsNaN(lat2) || math.IsNaN(lon2) {
		return math.NaN()
	}
	if lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 ||
		lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180 {
		return math.NaN()
	}

	dLat := (lat2 - lat1) * math.Pi / 180
	dLon := (lon2 - lon1) * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	if a > 1 {
		a = 1
	}
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return earthRadiusKm * c
}
