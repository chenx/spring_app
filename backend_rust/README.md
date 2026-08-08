# demo-fullstack-backend (Rust)

Rust port of `backend_java`, built with `axum` (see `backend_go` for a stdlib
Go port of the same API).

## Run

```sh
export JWT_SECRET_KEY="a-long-random-secret-at-least-32-chars"
cargo run
```

Server listens on `PORT` (default `8080`).

## Config (environment variables)

| Variable                | Default                                        |
|--------------------------|------------------------------------------------|
| `PORT`                   | `8080`                                          |
| `CORS_ALLOWED_ORIGINS`  | `http://localhost:5173,http://localhost:3000`   |
| `CORS_ALLOWED_METHODS`  | `GET,POST,PUT,DELETE,OPTIONS`                   |
| `CORS_ALLOWED_HEADERS`  | `*`                                             |
| `CORS_MAX_AGE`           | `3600`                                          |
| `JWT_SECRET_KEY`         | *(required, no default)*                        |

See `.env.prod.example` for production values (mirrors `application-prod.yml`).

## Routes

| Method | Path              | Auth                              |
|--------|-------------------|------------------------------------|
| POST   | `/api/auth/login` | public                             |
| GET    | `/api/hello`      | bearer JWT (any valid token)       |
| GET    | `/api/health`     | bearer JWT with `scope=USER`       |
| GET    | `/api/users`      | bearer JWT with `scope=USER`       |
| GET    | `/api/users/{id}` | bearer JWT with `scope=USER`       |
| POST   | `/api/users`      | bearer JWT with `scope=USER`       |
| PUT    | `/api/users/{id}` | bearer JWT with `scope=USER`       |
| DELETE | `/api/users/{id}` | bearer JWT with `scope=USER`       |

Login with the single seeded credential: `user` / `pAssword26`. Every issued
token carries `scope=USER`, so in practice all protected routes behave the
same; the two-tier check exists only because the Java source distinguishes
`anyRequest().authenticated()` (`/api/hello`) from
`hasAuthority("SCOPE_USER")` (`/api/health`, `/api/users*`).

## Known-quirky behavior preserved from the Java source

`GlobalExceptionHandler` in the Java app only special-cased
`MethodArgumentNotValidException` (400) and a catch-all `Exception` (500) --
every other `RuntimeException`, including `IllegalArgumentException` (used
for "can't modify default account") and Spring's own
`BadCredentialsException` on bad login, falls through to the
`RuntimeException` handler and returns **404**, not 401/400/409. This port
reproduces that instead of "fixing" it, so behavior matches the original API
exactly:

- Bad login credentials -> `404`
- Updating/deleting the seeded accounts (ids `1`, `2`) -> `404`
- Unknown user id -> `404`
- Failed validation (`username` 2-50 chars, valid `email`) -> `400`

Auth *failures* at the middleware layer (missing/invalid/expired JWT) return
a bare `401` with no body, matching Spring's `HttpStatusEntryPoint` -- this is
distinct from the `ApiResponse` JSON envelope used for handler-level errors
above.

## Not ported

`backend_java`'s `/login` and `/dashboard` Thymeleaf views were left out, for
the same reason `backend_go` left them out: Spring Security's `formLogin`
config that would back the login form is commented out in the source, so
those pages are non-functional there too.

## Verify

```sh
cargo build && cargo clippy --all-targets
JWT_SECRET_KEY="a-long-random-secret-at-least-32-chars" cargo run
```

Then exercise the golden paths with curl: login, `/api/hello` and
`/api/health` with/without a bearer token, full `/api/users` CRUD (including
the id-1/2 protected-account 404 and the not-found 404), a validation
failure, and an `OPTIONS` preflight request.
