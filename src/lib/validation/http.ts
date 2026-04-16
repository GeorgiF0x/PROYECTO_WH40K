import { NextResponse } from 'next/server'
import type { ZodIssue, ZodType } from 'zod'

/**
 * Discriminated result returned by the parse helpers below. Either the input
 * passed validation (and you get the typed data), or it failed and you get a
 * ready-to-return NextResponse — no more boilerplate per-route.
 */
export type ParseResult<T> = { success: true; data: T } | { success: false; response: NextResponse }

interface ValidationErrorBody {
  error: string
  issues: Array<{ path: string; message: string }>
}

function formatIssues(issues: ZodIssue[]): ValidationErrorBody {
  return {
    error: 'Validation failed',
    issues: issues.map((issue) => ({
      path: issue.path.join('.') || '(root)',
      message: issue.message,
    })),
  }
}

function badRequest(body: ValidationErrorBody | { error: string }): NextResponse {
  return NextResponse.json(body, { status: 400 })
}

/**
 * Parses request.json() against a Zod schema. Returns a discriminated result.
 *
 * Usage:
 *   const parsed = await parseJsonBody(request, mySchema)
 *   if (!parsed.success) return parsed.response
 *   const body = parsed.data // fully typed
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<ParseResult<T>> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { success: false, response: badRequest({ error: 'Invalid JSON body' }) }
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return { success: false, response: badRequest(formatIssues(result.error.issues)) }
  }
  return { success: true, data: result.data }
}

/**
 * Parses URLSearchParams (e.g. from new URL(request.url).searchParams) against a
 * Zod schema. Coerce numeric/boolean fields inside the schema with z.coerce.* —
 * everything comes in as a string.
 */
export function parseQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodType<T>
): ParseResult<T> {
  const obj: Record<string, string> = {}
  for (const [key, value] of searchParams) obj[key] = value

  const result = schema.safeParse(obj)
  if (!result.success) {
    return { success: false, response: badRequest(formatIssues(result.error.issues)) }
  }
  return { success: true, data: result.data }
}
