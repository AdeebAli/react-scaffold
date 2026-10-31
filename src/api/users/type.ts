import { z } from 'zod'

// Request and response types for the users resource. Each type is inferred
// from a zod schema, which also validates the response at runtime.

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
})

export type User = z.infer<typeof UserSchema>

// GET /users

export const GetUsersResponseSchema = z.array(UserSchema)

export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>

// POST /users

/** What the client sends to create a user; the server assigns the id. */
export const createUserInputSchema = UserSchema.omit({ id: true })

export type CreateUserInput = z.infer<typeof createUserInputSchema>

export const CreateUserResponseSchema = UserSchema

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>
