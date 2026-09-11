export enum PartnerStatus {
  Pending = 'pending',
  Active = 'active',
  Suspended = 'suspended',
}

export interface Partner {
  id: string;
  email: string;
  name: string;
  status: PartnerStatus;
  balance: number;
  createdAt: string;
}
