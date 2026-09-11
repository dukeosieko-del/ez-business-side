export function orderReceivedEmail(name: string, email: string, orderId: string) {
  return {
    to: email,
    subject: 'Order Received',
    html: `<h1>Order ${orderId}</h1><p>Your order has been received.</p>`,
  };
}