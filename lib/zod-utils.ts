import { ZodError } from 'zod'

export function formatZodErrors(error: ZodError) {
  return error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message
  }))
}

export function getZodErrorMessage(error: ZodError) {
  return error.issues[0]?.message || 'Validation failed'
}
