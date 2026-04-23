import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  first_name: z.string().trim(),
  last_name: z.string().trim(),
  username: z.string().trim().min(1, 'Username is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
})
