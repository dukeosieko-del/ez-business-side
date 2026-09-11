export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing'],
  processing: ['completed', 'failed'],
  completed: [],
  failed: ['pending'],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}