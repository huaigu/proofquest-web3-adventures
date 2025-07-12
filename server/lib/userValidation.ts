import { z } from 'zod'

// EVM address validation regex
const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

// User validation schema
export const userSchema = z.object({
  address: z.string()
    .regex(EVM_ADDRESS_REGEX, "Invalid EVM address format")
    .toLowerCase(), // Normalize to lowercase
  nickname: z.string()
    .min(1, "Nickname cannot be empty")
    .max(50, "Nickname too long")
    .optional(),
  avatarUrl: z.string()
    .url("Invalid avatar URL")
    .optional(),
  bio: z.string()
    .max(500, "Bio too long")
    .optional()
})

// User update schema (all fields optional except validation)
export const userUpdateSchema = z.object({
  nickname: z.string()
    .min(1, "Nickname cannot be empty")
    .max(50, "Nickname too long")
    .optional(),
  avatarUrl: z.string()
    .url("Invalid avatar URL")
    .optional(),
  bio: z.string()
    .max(500, "Bio too long")
    .optional()
})

// Quest participation schema
export const participationSchema = z.object({
  questId: z.string().uuid("Invalid quest ID"),
  proofUrl: z.string()
    .url("Invalid proof URL")
    .optional(),
  proofData: z.any().optional() // JSON data for proof
})

// Quest participation update schema
export const participationUpdateSchema = z.object({
  status: z.enum(['pending', 'completed', 'verified', 'rewarded']).optional(),
  proofUrl: z.string()
    .url("Invalid proof URL")
    .optional(),
  proofData: z.any().optional()
})

export type UserFormData = z.infer<typeof userSchema>
export type UserUpdateData = z.infer<typeof userUpdateSchema>
export type ParticipationFormData = z.infer<typeof participationSchema>
export type ParticipationUpdateData = z.infer<typeof participationUpdateSchema>

// Validation functions with detailed error handling
export function validateUserData(data: unknown) {
  const result = userSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
    
    return {
      success: false,
      errors,
      data: null
    }
  }
  
  return {
    success: true,
    errors: [],
    data: result.data
  }
}

export function validateUserUpdateData(data: unknown) {
  const result = userUpdateSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
    
    return {
      success: false,
      errors,
      data: null
    }
  }
  
  return {
    success: true,
    errors: [],
    data: result.data
  }
}

export function validateParticipationData(data: unknown) {
  const result = participationSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
    
    return {
      success: false,
      errors,
      data: null
    }
  }
  
  return {
    success: true,
    errors: [],
    data: result.data
  }
}

// Transform database format to API response format for users
export function transformUserToApiFormat(dbUser: any) {
  return {
    address: dbUser.address,
    nickname: dbUser.nickname,
    avatarUrl: dbUser.avatar_url,
    bio: dbUser.bio,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    lastLoginAt: dbUser.last_login_at
  }
}

// Transform API format to database format for users
export function transformUserToDbFormat(userData: UserFormData) {
  return {
    address: userData.address.toLowerCase(), // Ensure lowercase
    nickname: userData.nickname || null,
    avatar_url: userData.avatarUrl || null,
    bio: userData.bio || null,
    last_login_at: new Date().toISOString()
  }
}

// Transform API update format to database format
export function transformUserUpdateToDbFormat(userData: UserUpdateData) {
  const updateData: any = {
    updated_at: new Date().toISOString()
  }
  
  if (userData.nickname !== undefined) {
    updateData.nickname = userData.nickname || null
  }
  if (userData.avatarUrl !== undefined) {
    updateData.avatar_url = userData.avatarUrl || null
  }
  if (userData.bio !== undefined) {
    updateData.bio = userData.bio || null
  }
  
  return updateData
}

// Transform participation data
export function transformParticipationToApiFormat(dbParticipation: any) {
  return {
    id: dbParticipation.id,
    userAddress: dbParticipation.user_address,
    questId: dbParticipation.quest_id,
    status: dbParticipation.status,
    proofData: dbParticipation.proof_data,
    proofUrl: dbParticipation.proof_url,
    joinedAt: dbParticipation.joined_at,
    completedAt: dbParticipation.completed_at,
    verifiedAt: dbParticipation.verified_at,
    rewardedAt: dbParticipation.rewarded_at
  }
}

export function transformParticipationToDbFormat(participationData: ParticipationFormData, userAddress: string) {
  return {
    user_address: userAddress.toLowerCase(),
    quest_id: participationData.questId,
    proof_url: participationData.proofUrl || null,
    proof_data: participationData.proofData || null,
    status: 'pending' as const
  }
}