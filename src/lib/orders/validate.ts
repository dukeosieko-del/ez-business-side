import { z } from 'zod';

export const validateOrderInput = z.object({
  panel_id: z.string().uuid(),
  service_id: z.string().uuid(),
  child_user_id: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  link: z.string().url(),
});

export function validateQuantity(quantity: number): { valid: boolean; reason?: string } {
  if (quantity < 1) return { valid: false, reason: 'Quantity must be at least 1' };
  if (quantity > 1000) return { valid: false, reason: 'Quantity cannot exceed 1000' };
  return { valid: true };
}

export function validateLink(url: string): { valid: boolean; reason?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL' };
  }
}