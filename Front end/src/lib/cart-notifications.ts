import { toast } from "sonner";

const CART_TOAST_ID = "cart-item-added";

export function showCartItemAddedToast() {
  toast.success("تم إضافة المنتج إلى السلة بنجاح", {
    id: CART_TOAST_ID,
    duration: 2600,
  });
}
