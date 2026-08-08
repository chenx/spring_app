package service

import (
	"strconv"
	"sync"
	"time"

	"backend_go/internal/httpapi"
	"backend_go/internal/model"
)

// UserService is an in-memory user store guarded by a mutex, mirroring the
// Java app's CopyOnWriteArrayList + AtomicLong-backed UserService.
type UserService struct {
	mu     sync.Mutex
	users  []*model.User
	nextID int64
}

func NewUserService() *UserService {
	s := &UserService{nextID: 1}
	s.users = append(s.users,
		&model.User{ID: s.allocID(), Username: "admin", Email: "admin@example.com", Role: "ADMIN", CreatedAt: time.Now()},
		&model.User{ID: s.allocID(), Username: "user", Email: "user@example.com", Role: "USER", CreatedAt: time.Now()},
	)
	return s
}

func (s *UserService) allocID() int64 {
	id := s.nextID
	s.nextID++
	return id
}

func (s *UserService) FindAll() []*model.User {
	s.mu.Lock()
	defer s.mu.Unlock()

	out := make([]*model.User, len(s.users))
	copy(out, s.users)
	return out
}

func (s *UserService) findByIDLocked(id int64) (*model.User, error) {
	for _, u := range s.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, httpapi.NewRuntimeError("User not found with id: " + strconv.FormatInt(id, 10))
}

func (s *UserService) FindByID(id int64) (*model.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.findByIDLocked(id)
}

func (s *UserService) Create(req model.UserRequest) *model.User {
	s.mu.Lock()
	defer s.mu.Unlock()

	role := req.Role
	if role == "" {
		role = "USER"
	}

	u := &model.User{
		ID:        s.allocID(),
		Username:  req.Username,
		Email:     req.Email,
		Role:      role,
		CreatedAt: time.Now(),
	}
	s.users = append(s.users, u)
	return u
}

func (s *UserService) Update(id int64, req model.UserRequest) (*model.User, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if id == 1 || id == 2 {
		return nil, httpapi.NewRuntimeError("Cannot update default testing accounts")
	}

	u, err := s.findByIDLocked(id)
	if err != nil {
		return nil, err
	}

	u.Username = req.Username
	u.Email = req.Email
	if req.Role != "" {
		u.Role = req.Role
	}
	return u, nil
}

func (s *UserService) Delete(id int64) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if id == 1 || id == 2 {
		return httpapi.NewRuntimeError("Cannot delete default testing accounts")
	}

	u, err := s.findByIDLocked(id)
	if err != nil {
		return err
	}

	for i, existing := range s.users {
		if existing == u {
			s.users = append(s.users[:i], s.users[i+1:]...)
			break
		}
	}
	return nil
}
