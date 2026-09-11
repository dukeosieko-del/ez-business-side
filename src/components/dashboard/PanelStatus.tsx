interface PanelStatusProps {
  status: string;
}

export default function PanelStatus({ status }: PanelStatusProps) {
  const colors: Record<string, string> = {
    demo: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${colors[status] ?? colors.demo}`}>
      {status}
    </span>
  );
}
