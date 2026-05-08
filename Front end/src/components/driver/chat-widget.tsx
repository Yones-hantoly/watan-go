import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, MessageCircle, Send, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ChatMessage } from "@/lib/driver-mock-data";

interface ChatWidgetProps {
  initialMessages: ChatMessage[];
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const supportReplies = [
  "تم استلام رسالتك، سنراجع الطلب الآن.",
  "يرجى مشاركة رقم الطلب وسنساعدك مباشرة.",
  "العنوان مؤكد، يمكنك المتابعة حسب المسار الحالي.",
  "شكرا لتواصلك، فريق الدعم معك خطوة بخطوة.",
];

export function ChatWidget({ initialMessages, forceOpen, onOpenChange }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const open = forceOpen ?? isOpen;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, open]);

  useEffect(() => {
    if (forceOpen !== undefined) setIsOpen(forceOpen);
  }, [forceOpen]);

  const setOpen = (next: boolean) => {
    setIsOpen(next);
    onOpenChange?.(next);
  };

  const sendMessage = () => {
    const value = input.trim();
    if (!value) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "driver",
      message: value,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((current) => [...current, newMessage]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) =>
        current.map((message) => (message.id === newMessage.id ? { ...message, status: "read" } : message)),
      );
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: "support",
          message: supportReplies[Math.floor(Math.random() * supportReplies.length)],
          timestamp: new Date(),
          status: "delivered",
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-2xl transition sm:bottom-6 sm:left-6",
          open ? "bg-destructive hover:bg-destructive/90" : "bg-primary shadow-primary/30 hover:bg-primary/90",
        )}
        aria-label="فتح محادثة الدعم"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <motion.aside
          dir="rtl"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed inset-x-3 bottom-24 z-40 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/50 sm:left-6 sm:right-auto sm:w-[390px]"
        >
          <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-4">
            <div>
              <h3 className="font-display font-bold">محادثة الدعم</h3>
              <p className="text-xs text-cyan">الفريق يكتب عادة خلال دقيقة</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="إغلاق المحادثة">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-[360px] flex-col gap-3 overflow-y-auto p-4 sm:h-[420px]">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-br-sm bg-secondary px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border bg-background/50 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="اكتب رسالتك..."
                className="min-w-0 flex-1 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="إرسال"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const mine = message.sender === "driver";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[82%] rounded-2xl px-4 py-2 text-sm", mine ? "rounded-bl-sm bg-primary text-primary-foreground" : "rounded-br-sm bg-secondary text-foreground")}>
        <p>{message.message}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] opacity-75">
          <span>{message.timestamp.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>
          {mine && (message.status === "read" ? <CheckCheck className="h-3.5 w-3.5 text-cyan" /> : message.status === "delivered" ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />)}
        </div>
      </div>
    </div>
  );
}
