import { z } from 'zod'

export function createNoteSchema (canManageOwners: boolean) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(150, 'Title must be 150 characters or less'),
    content: z.string(),
    owner: canManageOwners ?
      z.number({
        required_error: 'Owner is required'
      }) :
      z.number().optional()
  })
}
