import type { AuthUser } from "@/lib/auth";
import type { DeliveryStage } from "@/lib/delivery-flow";

export type CartItemType = "food" | "grocery";
export type OrderStatus = "pending" | "accepted" | "preparing" | "on_the_way" | "delivered" | "cancelled";

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
}

export interface Order {
  id: string;
  user: AuthUser;
  vendorId: string;
  vendorName: string;
  type: CartItemType;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  status: OrderStatus;
  driverStatus: "pending" | "accepted" | "picked_up" | "delivered";
  driverName?: string;
  driverPhone?: string;
  deliveryStage?: DeliveryStage;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GroceryItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  storeId: string;
  storeName: string;
  rating: number;
  inStock: boolean;
  isPopular: boolean;
  isNew: boolean;
}

const CART_KEY = "watan_go_cart";
const ORDERS_KEY = "watan_go_orders";
const CART_EVENT = "watan-go-cart-updated";
const ORDERS_EVENT = "watan-go-orders-updated";

export const groceryItems: GroceryItem[] = [
  { id: "milk-1l",    category: "بقالة",        name: "حليب طازج 1 لتر",    description: "حليب يومي كامل الدسم",          price: 6,  image: "🥛", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.8, inStock: true,  isPopular: true,  isNew: false },
  { id: "bread",     category: "بقالة",        name: "خبز عربي",           description: "كيس خبز طازج",                  price: 4,  image: "🥖", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.6, inStock: true,  isPopular: true,  isNew: false },
  { id: "rice",      category: "بقالة",        name: "أرز بسمتي 1 كغ",    description: "أرز طويل الحبة",                 price: 12, image: "🍚", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.5, inStock: true,  isPopular: false, isNew: false },
  { id: "apples",    category: "خضار وفواكه",  name: "تفاح أحمر",          description: "كيلو تفاح طازج",                 price: 9,  image: "🍎", storeId: "fresh-grocery", storeName: "بقالة الطازج",  rating: 4.7, inStock: true,  isPopular: true,  isNew: false },
  { id: "tomatoes",  category: "خضار وفواكه",  name: "بندورة",             description: "كيلو بندورة بلدية",              price: 5,  image: "🍅", storeId: "fresh-grocery", storeName: "بقالة الطازج",  rating: 4.4, inStock: true,  isPopular: false, isNew: false },
  { id: "shampoo",   category: "منزلية",       name: "شامبو عائلي",        description: "عبوة 400 مل",                    price: 18, image: "🧴", storeId: "home-plus",     storeName: "هوم بلس",       rating: 4.2, inStock: false, isPopular: false, isNew: false },
  { id: "eggs",      category: "بقالة",        name: "بيض بلدي 12 حبة",   description: "بيض طازج من مزارع محلية",         price: 14, image: "🥚", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.9, inStock: true,  isPopular: true,  isNew: false },
  { id: "olive-oil", category: "بقالة",        name: "زيت زيتون بكر 750مل",description: "زيت زيتون فلسطيني أصيل",          price: 35, image: "🫒", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.9, inStock: true,  isPopular: true,  isNew: true  },
  { id: "bananas",   category: "خضار وفواكه",  name: "موز",                description: "كيلو موز طازج",                  price: 7,  image: "🍌", storeId: "fresh-grocery", storeName: "بقالة الطازج",  rating: 4.3, inStock: true,  isPopular: false, isNew: false },
  { id: "cucumber",  category: "خضار وفواكه",  name: "خيار",               description: "كيلو خيار طازج",                 price: 4,  image: "🥒", storeId: "fresh-grocery", storeName: "بقالة الطازج",  rating: 4.1, inStock: true,  isPopular: false, isNew: false },
  { id: "yogurt",    category: "ألبان",         name: "لبن زبادي 500غ",     description: "زبادي طبيعي كامل الدسم",          price: 8,  image: "🍶", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.6, inStock: true,  isPopular: false, isNew: true  },
  { id: "cheese",    category: "ألبان",         name: "جبنة بيضاء 250غ",    description: "جبنة طازجة قليلة الملح",          price: 16, image: "🧀", storeId: "city-market",   storeName: "ماركت المدينة", rating: 4.7, inStock: true,  isPopular: true,  isNew: false },
  { id: "detergent", category: "منزلية",       name: "مسحوق غسيل 1 كغ",   description: "مسحوق تنظيف قوي للملابس",        price: 22, image: "🧺", storeId: "home-plus",     storeName: "هوم بلس",       rating: 4.0, inStock: true,  isPopular: false, isNew: false },
  { id: "tissues",   category: "منزلية",       name: "مناديل ورقية 200 ورقة",description: "مناديل ناعمة متعددة الاستخدام",  price: 9,  image: "🧻", storeId: "home-plus",     storeName: "هوم بلس",       rating: 4.3, inStock: true,  isPopular: false, isNew: true  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function emitCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_EVENT));
}

function emitOrdersUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ORDERS_EVENT));
}

export function subscribeToCart(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CART_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CART_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function subscribeToOrders(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ORDERS_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(ORDERS_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function getCartItems() {
  return readJson<CartItem[]>(CART_KEY, []);
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function addCartItem(item: Omit<CartItem, "quantity">) {
  const cart = getCartItems();
  const existing = cart.find((cartItem) => cartItem.id === item.id && cartItem.vendorId === item.vendorId);
  const nextCart = existing
    ? cart.map((cartItem) =>
        cartItem.id === item.id && cartItem.vendorId === item.vendorId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      )
    : [...cart, { ...item, quantity: 1 }];

  writeJson(CART_KEY, nextCart);
  emitCartUpdated();
}

export function updateCartQuantity(id: string, vendorId: string, quantity: number) {
  const nextCart = getCartItems()
    .map((item) => (item.id === id && item.vendorId === vendorId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);
  writeJson(CART_KEY, nextCart);
  emitCartUpdated();
}

export function removeCartItem(id: string, vendorId: string) {
  writeJson(
    CART_KEY,
    getCartItems().filter((item) => item.id !== id || item.vendorId !== vendorId),
  );
  emitCartUpdated();
}

export function clearCart() {
  writeJson(CART_KEY, []);
  emitCartUpdated();
}

export function getCartSubtotal(items = getCartItems()) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getDeliveryFee(items = getCartItems()) {
  return items.length === 0 ? 0 : 7;
}

export function getOrders() {
  return readJson<Order[]>(ORDERS_KEY, []);
}

export function saveOrders(orders: Order[]) {
  writeJson(ORDERS_KEY, orders);
  emitOrdersUpdated();
}

export function createOrder(user: AuthUser, deliveryAddress: string) {
  const items = getCartItems();
  if (items.length === 0) return null;

  const subtotal = getCartSubtotal(items);
  const deliveryFee = getDeliveryFee(items);
  const now = new Date().toISOString();
  const firstItem = items[0];
  const order: Order = {
    id: `WG-${Date.now()}`,
    user,
    vendorId: firstItem.vendorId,
    vendorName: firstItem.vendorName,
    type: firstItem.type,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    deliveryAddress,
    status: "pending",
    driverStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  saveOrders([order, ...getOrders()]);
  clearCart();
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const now = new Date().toISOString();
  saveOrders(
    getOrders().map((order) =>
      order.id === orderId
        ? {
            ...order,
            status,
            deliveryStage: status === "delivered" ? "delivered" : order.deliveryStage,
            updatedAt: now,
            completedAt: status === "delivered" ? now : order.completedAt,
          }
        : order,
    ),
  );
}

export function updateDriverStatus(
  orderId: string,
  driverStatus: Order["driverStatus"],
  driver?: Pick<AuthUser, "name" | "phone">,
) {
  const now = new Date().toISOString();
  saveOrders(
    getOrders().map((order) =>
      order.id === orderId
        ? {
            ...order,
            driverStatus,
            deliveryStage:
              driverStatus === "accepted" ? "accepted" :
              driverStatus === "picked_up" ? "picked_up" :
              driverStatus === "delivered" ? "delivered" :
              order.deliveryStage,
            driverName: driver?.name ?? order.driverName,
            driverPhone: driver?.phone ?? order.driverPhone,
            updatedAt: now,
            completedAt: driverStatus === "delivered" ? now : order.completedAt,
          }
        : order,
    ),
  );
}
