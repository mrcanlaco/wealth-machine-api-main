import { StoreInput, WalletInput } from '../types/machine';

export const defaultStores: StoreInput[] = [
  {
    name: 'Nguồn thu',
    type: 'income',
    icon: 'Wallet',
    funds: [
      { name: 'Lương', icon: 'Wallet', percent: 0 },
      { name: 'Thưởng', icon: 'Trophy', percent: 0 },
      { name: 'Lãi suất', icon: 'TrendingUp', percent: 0 },
      { name: 'Được cho', icon: 'Gift', percent: 0 },
      { name: 'Bán đồ', icon: 'Package', percent: 0 },
      { name: 'Thu nhập khác', icon: 'DollarSign', percent: 0 }
    ]
  },
  {
    name: 'Chi tiêu',
    type: 'expense',
    icon: 'ShoppingCart',
    funds: [
      { name: 'Ăn uống', icon: 'Utensils', percent: 10 },
      { name: 'Chợ, siêu thị', icon: 'ShoppingCart', percent: 15 },
      { name: 'Di chuyển', icon: 'Car', percent: 5 },
      { name: 'Cafe', icon: 'Coffee', percent: 2 },
      { name: 'Mua sắm', icon: 'ShoppingBag', percent: 5 },
      { name: 'Giải trí', icon: 'Sparkles', percent: 3 },
      { name: 'Làm đẹp', icon: 'Heart', percent: 3 },
      { name: 'Biếu tặng', icon: 'Gift', percent: 2 }
    ]
  },
  {
    name: 'Dự phòng',
    type: 'reserve',
    icon: 'Shield',
    funds: [
      { name: 'Bảo hiểm', icon: 'Shield', percent: 4 },
      { name: 'Vàng', icon: 'Coins', percent: 3 },
      { name: 'Tiết kiệm', icon: 'Gem', percent: 3 }
    ]
  },
  {
    name: 'Mở rộng',
    type: 'expansion',
    icon: 'Brain',
    funds: [
      { name: 'Tu hành', icon: 'Leaf', percent: 5 },
      { name: 'Phát triển bản thân', icon: 'Brain', percent: 10 },
      { name: 'Cho đi', icon: 'Gift', percent: 3 },
      { name: 'Phóng sinh', icon: 'Leaf', percent: 2 }
    ]
  },
  {
    name: 'Kinh doanh',
    type: 'business',
    icon: 'TrendingUp',
    funds: [
      { name: 'Đầu tư', icon: 'TrendingUp', percent: 15 },
      { name: 'Kinh doanh', icon: 'ShoppingBag', percent: 10 }
    ]
  }
];

export const defaultWallets: WalletInput[] = [
  {
    name: 'Tiền mặt',
    type: 'cash',
    icon: 'Wallet',
    balance: 0,
    currency: 'VND'
  },
  {
    name: 'Ngân hàng',
    type: 'bank',
    icon: 'Building2',
    balance: 0,
    currency: 'VND'
  }
];