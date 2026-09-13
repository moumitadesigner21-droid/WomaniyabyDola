export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  landmark: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerAddressInput = Omit<
  CustomerAddress,
  "id" | "customerId" | "createdAt" | "updatedAt"
>;

/** Single-line form of an address for order records and WhatsApp messages. */
export function formatAddress(address: CustomerAddressInput | CustomerAddress): string {
  return [
    address.fullName,
    address.line1,
    address.line2,
    address.landmark ? `Landmark: ${address.landmark}` : null,
    `${address.city}, ${address.state} ${address.postalCode}`,
    `Phone: ${address.phone}`,
  ]
    .filter(Boolean)
    .join("\n");
}
