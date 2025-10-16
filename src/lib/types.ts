export type User = {
  id: string;
  name: string; // This is the portal username
  uuid: string; // This is the client ID (UUID for VLESS/VMESS) from 3x-ui
  password?: string;
  subscription: 'active' | 'inactive' | 'expired';
  usage: number; // in GB
  total: number; // in GB
  registered: string;
  config?: string;
  sublink?: string;
  expiryDate?: string;
  planTitle?: string; // e.g., "Pro - 30 Days"
};

export type ServerStats = {
  totalUsers: number;
  activeSubscriptions: number;
  serverStatus: 'Online' | 'Offline';
  totalDataUsage: number; // in TB
};

export type UsageStat = {
  month: string;
  usage: number; // in TB
};

export type PricingPlan = {
  id: string;
  title: string;
  price: string | number;
  period: string;
  data: string | number;
  devices: string | number;
  duration: string | number;
  features: string[];
  popular: boolean;
  available: boolean;
  showOnLanding: boolean;
  sortOrder: number;
};

export type HeroSectionContent = {
  title: string;
  subtitle: string;
  buttonText: string;
};

// A CartItem now has its own unique ID, which might be different from the product's ID
// especially in the case of gifts, to allow multiple gifts of the same product.
export type CartItem = Omit<PricingPlan, 'id'> & { 
  id: string; // Unique identifier for this cart instance (e.g., 'plan_123_for_testuser')
  productId: string; // The original ID of the plan or pack
  type: 'plan' | 'traffic';
  recipientUsername?: string; // Username of the person this item is for
};


export interface Order {
  id: string;
  user_id: string;
  user_name: string;
  items: CartItem[];
  totalAmount: string | number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  paymentProof?: string;
  paymentType?: 'receipt' | 'text';
}

export type BackupFile = {
  name: string;
  size: number;
  createdAt: string;
};

export type Feature = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
};
