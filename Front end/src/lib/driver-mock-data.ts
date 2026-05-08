export type DriverStatus = "online" | "offline" | "busy";
export type OrderStatus = "new" | "active" | "completed" | "cancelled";
export type PaymentMethod = "cash" | "card" | "wallet";
export type MessageStatus = "sent" | "delivered" | "read";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  deliveryLocation: string;
  distance: number;
  duration: number;
  price: number;
  orderTime: string;
  estimatedDeliveryTime: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  timeline: { label: string; time: string; done: boolean }[];
}

export interface Trip {
  id: string;
  pickupLocation: string;
  deliveryLocation: string;
  distance: number;
  duration: number;
  amount: number;
  status: "completed" | "cancelled" | "active";
  time: string;
}

export interface Earning {
  id: string;
  orderId: string;
  deliveryEarnings: number;
  bonus: number;
  commission: number;
  netProfit: number;
}

export interface DriverRating {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: "driver" | "support";
  message: string;
  timestamp: Date;
  status: MessageStatus;
}

export interface ActivityEvent {
  id: string;
  label: string;
  time: string;
  tone: "cyan" | "amber" | "primary";
}

export const mockOrders: Order[] = [
  {
    id: "WG-2408",
    customerName: "أحمد الكرد",
    customerPhone: "0599 120 331",
    pickupLocation: "مطعم القدس، رام الله",
    deliveryLocation: "حي الإرسال، عمارة النور",
    distance: 3.2,
    duration: 18,
    price: 22,
    orderTime: "10:25 ص",
    estimatedDeliveryTime: "10:48 ص",
    status: "new",
    paymentMethod: "cash",
    notes: "يرجى الاتصال عند الوصول للمدخل الرئيسي.",
    timeline: [
      { label: "تم إنشاء الطلب", time: "10:25 ص", done: true },
      { label: "بانتظار موافقة السائق", time: "الآن", done: false },
    ],
  },
  {
    id: "WG-2409",
    customerName: "ليان منصور",
    customerPhone: "0568 780 211",
    pickupLocation: "كافيه البلد، شارع ركب",
    deliveryLocation: "المصيون، قرب الدوار",
    distance: 4.6,
    duration: 24,
    price: 28,
    orderTime: "10:36 ص",
    estimatedDeliveryTime: "11:05 ص",
    status: "active",
    paymentMethod: "wallet",
    notes: "الطلب مدفوع من المحفظة.",
    timeline: [
      { label: "تم قبول الطلب", time: "10:38 ص", done: true },
      { label: "وصل السائق إلى نقطة الاستلام", time: "10:47 ص", done: true },
      { label: "في الطريق إلى العميل", time: "10:55 ص", done: false },
    ],
  },
  {
    id: "WG-2398",
    customerName: "سارة عابد",
    customerPhone: "0597 332 100",
    pickupLocation: "صيدلية الشفاء",
    deliveryLocation: "حي الطيرة",
    distance: 2.7,
    duration: 15,
    price: 18,
    orderTime: "09:12 ص",
    estimatedDeliveryTime: "09:30 ص",
    status: "completed",
    paymentMethod: "card",
    timeline: [
      { label: "تم قبول الطلب", time: "09:13 ص", done: true },
      { label: "تم التسليم بنجاح", time: "09:29 ص", done: true },
    ],
  },
  {
    id: "WG-2394",
    customerName: "رامي خليل",
    customerPhone: "0569 450 921",
    pickupLocation: "سوبرماركت المدينة",
    deliveryLocation: "عين مصباح",
    distance: 5.1,
    duration: 29,
    price: 31,
    orderTime: "08:30 ص",
    estimatedDeliveryTime: "09:05 ص",
    status: "cancelled",
    paymentMethod: "cash",
    notes: "تم الإلغاء بناء على طلب العميل.",
    timeline: [
      { label: "تم إنشاء الطلب", time: "08:30 ص", done: true },
      { label: "تم إلغاء الطلب", time: "08:36 ص", done: true },
    ],
  },
];

export const mockTrips: Trip[] = [
  { id: "T-118", pickupLocation: "مطعم الأندلس", deliveryLocation: "الماصيون", distance: 3.9, duration: 21, amount: 24, status: "completed", time: "09:05 ص" },
  { id: "T-119", pickupLocation: "صيدلية الشفاء", deliveryLocation: "حي الطيرة", distance: 2.7, duration: 15, amount: 18, status: "completed", time: "09:29 ص" },
  { id: "T-120", pickupLocation: "سوبرماركت المدينة", deliveryLocation: "عين مصباح", distance: 5.1, duration: 29, amount: 0, status: "cancelled", time: "08:36 ص" },
  { id: "T-121", pickupLocation: "كافيه البلد", deliveryLocation: "المصيون", distance: 4.6, duration: 24, amount: 28, status: "active", time: "10:55 ص" },
];

export const mockEarnings: Earning[] = [
  { id: "E-1", orderId: "WG-2396", deliveryEarnings: 22, bonus: 4, commission: 2.5, netProfit: 23.5 },
  { id: "E-2", orderId: "WG-2398", deliveryEarnings: 18, bonus: 0, commission: 2, netProfit: 16 },
  { id: "E-3", orderId: "WG-2401", deliveryEarnings: 30, bonus: 6, commission: 3.5, netProfit: 32.5 },
  { id: "E-4", orderId: "WG-2404", deliveryEarnings: 26, bonus: 3, commission: 3, netProfit: 26 },
];

export const mockRatings: DriverRating[] = [
  { id: "R-1", customerName: "ليان منصور", rating: 5, comment: "سائق محترم ووصل الطلب بسرعة.", timestamp: "2026-04-29T09:45:00" },
  { id: "R-2", customerName: "سارة عابد", rating: 5, comment: "تواصل ممتاز والتسليم كان مرتب.", timestamp: "2026-04-29T08:55:00" },
  { id: "R-3", customerName: "أحمد الكرد", rating: 4, comment: "التجربة جيدة، تأخر بسيط بسبب الازدحام.", timestamp: "2026-04-28T18:20:00" },
  { id: "R-4", customerName: "رامي خليل", rating: 3, comment: "أحتاج دقة أكثر في وقت الوصول.", timestamp: "2026-04-28T16:10:00" },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "C-1",
    sender: "support",
    message: "أهلا بك في دعم Watan Go. كيف يمكننا مساعدتك اليوم؟",
    timestamp: new Date("2026-04-29T10:10:00"),
    status: "read",
  },
  {
    id: "C-2",
    sender: "driver",
    message: "أحتاج تأكيد عنوان الطلب النشط.",
    timestamp: new Date("2026-04-29T10:12:00"),
    status: "read",
  },
];

export const mockActivity: ActivityEvent[] = [
  { id: "A-1", label: "بداية المناوبة", time: "08:00 ص", tone: "cyan" },
  { id: "A-2", label: "استراحة قصيرة", time: "10:00 ص", tone: "amber" },
  { id: "A-3", label: "طلب نشط", time: "10:38 ص", tone: "primary" },
];

export const mockNotifications = [
  "طلب جديد قريب منك في رام الله",
  "تم إضافة حافز 4 شيكل لرحلتك الأخيرة",
  "الدعم متاح الآن للرد على استفسارك",
];
