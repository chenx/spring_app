import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'session_token'

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value
}

export async function setSessionToken(token: string) {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export async function clearSessionToken() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
