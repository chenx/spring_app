# demo-fullstack-backend (Go)

Go port of `backend_java`. Stdlib `net/http` router, no web framework.

## Run

```sh
export JWT_SECRET_KEY="a-long-random-secret-at-least-32-chars"
go run ./cmd/server
```

Server listens on `PORT` (default `8080`).

## Config (environment variables)

| Variable              | Default                                          |
|------------------------|--------------------------------------------------|
| `PORT`                 | `8080`                                            |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:5173,http://localhost:3000`     |
| `CORS_ALLOWED_METHODS`| `GET,POST,PUT,DELETE,OPTIONS`                     |
| `CORS_ALLOWED_HEADERS`| `*`                                               |
| `CORS_MAX_AGE`         | `3600`                                            |
| `JWT_SECRET_KEY`       | *(required, no default)*                          |

See `.env.prod.example` for production values (mirrors `application-prod.yml`).

## Routes

| Method | Path              | Auth       |
|--------|-------------------|------------|
| POST   | `/api/auth/login` | public     |
| GET    | `/api/hello`      | public (deliberate deviation from the Java app — see below) |
| GET    | `/api/health`     | bearer JWT |
| GET    | `/api/users`      | bearer JWT |
| GET    | `/api/users/{id}` | bearer JWT |
| POST   | `/api/users`      | bearer JWT |
| PUT    | `/api/users/{id}` | bearer JWT |
| DELETE | `/api/users/{id}` | bearer JWT |

Login with the single seeded credential: `user` / `pAssword26`.

## Known-quirky behavior preserved from the Java source

`GlobalExceptionHandler` in the Java app only special-cased
`MethodArgumentNotValidException` (400) and a catch-all `Exception` (500) —
every other `RuntimeException`, including `IllegalArgumentException` (used
for "can't modify default account") and Spring's own
`AuthenticationException` on bad login, falls through to the
`RuntimeException` handler and returns **404**, not 401/400/409. This port
reproduces that instead of "fixing" it, so behavior matches the original API
exactly:

- Bad login credentials → `404`
- Updating/deleting the seeded accounts (ids `1`, `2`) → `404`
- Unknown user id → `404`
- Failed `@Valid` validation → `400` (this one *was* handled explicitly)

## Deviations from the Java source

- `/api/hello` is public in this port so it's easy to load in a plain
  browser tab. In `backend_java` it requires a bearer JWT (it falls under
  `anyRequest().authenticated()` in `SecurityConfig`).

## Not ported

`backend_java`'s `/login` and `/dashboard` Thymeleaf views were left out —
Spring Security's `formLogin` config that would back the login form is
commented out in the source, so those pages are non-functional there too.
