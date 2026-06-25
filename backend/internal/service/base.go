package service

type BaseService[T any] interface {
	Create(entity *T) error
}

type baseSvc[T any] struct {
	repo interface{ Create(*T) error }
}

func (s *baseSvc[T]) Create(entity *T) error {
	return s.repo.Create(entity)
}

func newBaseSvc[T any](repo interface{ Create(*T) error }) baseSvc[T] {
	return baseSvc[T]{repo: repo}
}
