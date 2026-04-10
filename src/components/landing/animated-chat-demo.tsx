"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface ChatMessage {
  id: number;
  type: "user" | "bot";
  text: string;
  subtext?: string;
}

const messages: ChatMessage[] = [
  { id: 1, type: "user", text: "Agenda reunion con Ana manana a las 3pm" },
  {
    id: 2,
    type: "bot",
    text: 'Listo! Agende "Reunion con Ana" para manana a las 3:00 PM en tu Google Calendar.',
    subtext: "Quieres agregar algo mas?",
  },
  { id: 3, type: "user", text: "Recuerdame 30 min antes" },
  {
    id: 4,
    type: "bot",
    text: "Recordatorio configurado para manana a las 2:30 PM. No se te olvida!",
  },
];

function TypingIndicator() {
  return (
    <div className="mr-auto max-w-[80%]">
      <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card px-4 py-3 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/50"
            style={{
              animation: "typing-bounce 1s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const userMsgVariants = {
  hidden: { opacity: 0, x: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 14 },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const botMsgVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 14 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export function AnimatedChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay));
    };

    // Sequence: msg1 -> typing -> reply1 -> msg2 -> typing -> reply2 -> hold -> restart
    schedule(() => setVisibleMessages([messages[0]]), 800);

    schedule(() => setShowTyping(true), 2000);

    schedule(() => {
      setShowTyping(false);
      setVisibleMessages((prev) => [...prev, messages[1]]);
    }, 3500);

    schedule(() => setVisibleMessages((prev) => [...prev, messages[2]]), 5500);

    schedule(() => setShowTyping(true), 7000);

    schedule(() => {
      setShowTyping(false);
      setVisibleMessages((prev) => [...prev, messages[3]]);
    }, 8500);

    // Hold then restart
    schedule(() => {
      setVisibleMessages([]);
      setShowTyping(false);
      setCycle((c) => c + 1);
    }, 15000);

    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  return (
    <div className="relative lg:justify-self-end">
      <motion.div
        className="mx-auto max-w-sm"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 16, delay: 0.4 }}
      >
        {/* Phone frame */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-accent/10">
          {/* Chat header */}
          <div className="flex items-center gap-3 bg-accent px-4 py-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent-foreground/20">
              <Sparkles className="size-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-accent-foreground">
                Luna
              </p>
              <p className="text-xs text-accent-foreground/70">en linea</p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="min-h-[220px] space-y-3 bg-secondary/30 p-4">
            <AnimatePresence mode="sync">
              {visibleMessages.map((msg) =>
                msg.type === "user" ? (
                  <motion.div
                    key={msg.id}
                    className="ml-auto max-w-[75%]"
                    variants={userMsgVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="rounded-2xl rounded-tr-sm bg-accent/10 px-4 py-2.5">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={msg.id}
                    className="mr-auto max-w-[80%]"
                    variants={botMsgVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 shadow-sm">
                      <p className="text-sm">{msg.text}</p>
                      {msg.subtext && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {msg.subtext}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ),
              )}

              {showTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
