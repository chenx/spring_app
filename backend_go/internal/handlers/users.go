package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend_go/internal/httpapi"
	"backend_go/internal/model"
	"backend_go/internal/service"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	httpapi.Success(w, h.userService.FindAll())
}

func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}

	user, err := h.userService.FindByID(id)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}
	httpapi.Success(w, user)
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	req, err := decodeUserRequest(r)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}

	user := h.userService.Create(req)
	httpapi.SuccessMessage(w, "User created successfully", user)
}

func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}

	req, err := decodeUserRequest(r)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}

	user, err := h.userService.Update(id, req)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}
	httpapi.SuccessMessage(w, "User updated successfully", user)
}

func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		httpapi.HandleError(w, err)
		return
	}

	if err := h.userService.Delete(id); err != nil {
		httpapi.HandleError(w, err)
		return
	}
	httpapi.SuccessMessage[any](w, "User deleted successfully", nil)
}

// parseID's error path mirrors Spring's MethodArgumentTypeMismatchException
// for a non-numeric @PathVariable Long id, which — since it also extends
// RuntimeException — falls through GlobalExceptionHandler to the same 404
// branch as a genuine "not found".
func parseID(r *http.Request) (int64, error) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		return 0, httpapi.NewRuntimeError("Invalid id: " + r.PathValue("id"))
	}
	return id, nil
}

// A malformed JSON body mirrors Spring's HttpMessageNotReadableException,
// which also extends RuntimeException and so resolves to the same 404
// branch in GlobalExceptionHandler as a genuine "not found".
func decodeUserRequest(r *http.Request) (model.UserRequest, error) {
	var req model.UserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return req, httpapi.NewRuntimeError("Malformed JSON request")
	}
	if fieldErrs := req.Validate(); len(fieldErrs) > 0 {
		return req, fieldErrs
	}
	return req, nil
}
