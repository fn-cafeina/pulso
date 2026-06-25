package repository

import "gorm.io/gorm"

type BaseRepository[T any] interface {
	Create(entity *T) error
	FindByID(id uint) (*T, error)
	Update(entity *T) error
	Delete(id uint) error
}

type baseRepo[T any] struct {
	db *gorm.DB
}

func newBaseRepo[T any](db *gorm.DB) baseRepo[T] {
	return baseRepo[T]{db: db}
}

func (r *baseRepo[T]) Create(entity *T) error {
	return r.db.Create(entity).Error
}

func (r *baseRepo[T]) FindByID(id uint) (*T, error) {
	var entity T
	err := r.db.First(&entity, id).Error
	return &entity, err
}

func (r *baseRepo[T]) Update(entity *T) error {
	return r.db.Save(entity).Error
}

func (r *baseRepo[T]) Delete(id uint) error {
	return r.db.Delete(new(T), id).Error
}
