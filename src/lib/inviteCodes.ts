const SUPPORT_INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const SUPPORT_INVITE_LENGTH = 6
export const SUPPORT_INVITE_TTL_HOURS = 24

function getSecureRandomValues(size: number) {
  const values = new Uint8Array(size)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(values)
    return values
  }

  for (let index = 0; index < size; index += 1) {
    values[index] = Math.floor(Math.random() * 256)
  }
  return values
}

export function generateSupportInviteCode(): string {
  const randomBytes = getSecureRandomValues(SUPPORT_INVITE_LENGTH)
  let code = ''

  for (let index = 0; index < SUPPORT_INVITE_LENGTH; index += 1) {
    const charIndex = randomBytes[index] % SUPPORT_INVITE_ALPHABET.length
    code += SUPPORT_INVITE_ALPHABET.charAt(charIndex)
  }

  return code
}

export function normalizeInviteCode(code: string): string {
  return code.trim().replace(/\s+/g, '').toUpperCase()
}

export function formatInviteCodeForDisplay(code: string): string {
  return normalizeInviteCode(code)
    .split('')
    .reduce<string[]>((chunks, character, index) => {
      const chunkIndex = Math.floor(index / 3)
      if (!chunks[chunkIndex]) {
        chunks[chunkIndex] = character
      } else {
        chunks[chunkIndex] += character
      }
      return chunks
    }, [])
    .join(' ')
}

export function computeInviteExpiry(hours = SUPPORT_INVITE_TTL_HOURS): string {
  const expiry = new Date(Date.now() + hours * 60 * 60 * 1000)
  return expiry.toISOString()
}

export function isInviteExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return true
  return Date.now() >= new Date(expiresAt).getTime()
}

