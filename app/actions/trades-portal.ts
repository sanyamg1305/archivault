"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type TradeWorker = {
  id: string;
  name: string;
  trade_type: string;
  phone: string | null;
  organization_id: string;
  clerk_user_id: string | null;
};

export type TradeTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  project_id: string;
  room_id: string | null;
  projects: { name: string } | null;
  rooms: { name: string } | null;
};

// Called on first dashboard visit — links Clerk phone to trades row
export async function linkAndGetTradeWorker(): Promise<{ worker: TradeWorker | null; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { worker: null, error: "Not signed in" };

  const supabase = createServiceRoleClient();
  const clerk = await clerkClient();

  // 1. Check if already linked
  const { data: linked } = await supabase
    .from("trades")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (linked) return { worker: linked as TradeWorker };

  // 2. Get Clerk user's phone number to match
  const clerkUser = await clerk.users.getUser(userId);
  const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber;

  if (!phone) {
    return { worker: null, error: "No phone number on your account. Ask your architect to register your mobile number." };
  }

  // Normalize: strip spaces/dashes for comparison
  const normalize = (p: string) => p.replace(/[\s\-\(\)]/g, "");
  const normalizedPhone = normalize(phone);

  // 3. Look up by phone — fetch all and compare normalized
  const { data: allTrades } = await supabase.from("trades").select("*").is("clerk_user_id", null);
  const match = (allTrades ?? []).find(
    (t: any) => t.phone && normalize(t.phone) === normalizedPhone
  );

  if (!match) {
    return {
      worker: null,
      error: "Your mobile number is not registered. Ask your architect to add you to the Trades directory.",
    };
  }

  // 4. Link the account
  await supabase.from("trades").update({ clerk_user_id: userId }).eq("id", match.id);

  return { worker: { ...match, clerk_user_id: userId } as TradeWorker };
}

export async function getMyTasks(tradeId: string): Promise<TradeTask[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("trade_tasks")
    .select("*, projects(name), rooms(name)")
    .eq("trade_id", tradeId)
    .order("status")
    .order("due_date", { ascending: true, nullsFirst: false });

  return (data ?? []) as TradeTask[];
}

export async function updateMyTaskStatus(taskId: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify this task belongs to this trade worker
  const supabase = createServiceRoleClient();
  const { data: trade } = await supabase
    .from("trades")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!trade) throw new Error("Not a registered trade worker");

  const { error } = await supabase
    .from("trade_tasks")
    .update({
      status,
      ...(status === "Completed" ? { completed_at: new Date().toISOString() } : { completed_at: null }),
    })
    .eq("id", taskId)
    .eq("trade_id", trade.id);

  if (error) throw new Error(error.message);
  revalidatePath("/trades-portal/dashboard");
}
