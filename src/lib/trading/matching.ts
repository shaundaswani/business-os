import { z } from 'zod'

// Zod schema for incoming webhook payload
export const WebhookPayloadSchema = z.object({
  asset: z.string().min(1).max(20).toUpperCase(),
  direction: z.enum(['long', 'short']).default('long'),
  signal_type: z.enum(['entry', 'warning', 'exit']).default('entry'),
  price: z.number().positive(),
  timestamp: z.string().datetime(),
})

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>

/**
 * Validates and parses a raw webhook body.
 * Throws ZodError if invalid.
 */
export function parseWebhookPayload(body: unknown): WebhookPayload {
  return WebhookPayloadSchema.parse(body)
}
