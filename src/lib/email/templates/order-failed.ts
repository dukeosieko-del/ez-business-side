export function orderFailedEmail(name: string, email: string, orderId: string) {
  return {
    to: email,
    subject: 'Order Failed',
    html: `<h1>Order ${orderId} Failed</h1><p>Your order could not be completed.</p>`,
  };
}