export type UserRole = 'company' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  companyName?: string;
  shopName?: string;
  address: string;
  tradeLicense?: string;
  avatar?: string;
  verified: boolean;
  creditLimit?: number;
  createdAt: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  logo: string;
  banner?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  tradeLicense?: string;
  phone: string;
  email: string;
  address: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDues: number;
  createdAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  features: string[];
  unitPrice: number;
  wholesalePrice: number;
  moq: number;
  stock: number;
  unitType: 'piece' | 'box' | 'carton' | 'coil';
  warranty: string;
  discountPercent: number;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
  wholesalePrice: number;
  unitType: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'due';
export type PaymentMethod = 'full' | 'partial' | 'credit' | 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';

export interface Order {
  id: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  sellerShop: string;
  sellerPhone: string;
  companyId: string;
  companyName: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  invoiceNumber: string;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransaction {
  id: string;
  orderId?: string;
  sellerId: string;
  sellerName: string;
  sellerShop: string;
  companyId: string;
  companyName: string;
  type: 'debit' | 'credit';
  amount: number;
  previousBalance: number;
  newBalance: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingDues: number;
  totalProducts: number;
  totalCompanies: number;
  totalSellers: number;
  recentOrders: Order[];
  recentTransactions: LedgerTransaction[];
}

