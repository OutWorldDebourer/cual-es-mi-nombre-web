import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser, getProfile } from "@/lib/supabase/auth";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "Chat",
};

export default async function ChatPage() {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await getProfile(user.id);
  const assistantName = profile?.assistant_name ?? "Asistente";

  return (
    <div className="mx-auto max-w-3xl">
      <ChatView assistantName={assistantName} />
    </div>
  );
}
