interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  onOrder: () => void;
}

export function ServiceCard({ name, description, price, cost, onOrder }: ServiceCardProps) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
      <h3>{name}</h3>
      <p>{description}</p>
      <p>Price: KES {price.toLocaleString()} | Cost: KES {cost.toLocaleString()}</p>
      <button onClick={onOrder}>Order</button>
    </div>
  );
}