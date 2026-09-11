export function orderCompletedEmail(name: string, email: string, orderId: string) {
  return {
    to: email,
    subject: 'Order Completed',
    html: `<h1>Order ${orderId} Completed</h1><p>Your order has been completed.</p>`,
  };
}