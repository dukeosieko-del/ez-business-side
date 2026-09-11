'use client';

export function OrdersTable({ orders }: { orders: any[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Child User</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Service</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Charge</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Cost</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Margin</th>
          <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{order.child_user_email}</td>
            <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{order.service_name}</td>
            <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>{order.charge}</td>
            <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>{order.cost}</td>
            <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'right' }}>{order.markup}</td>
            <td style={{ borderBottom: '1px solid #eee', padding: '8px', textAlign: 'center' }}>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}