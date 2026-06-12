"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { hashPassword, verifyPassword, setTradesSession, clearTradesSession, getTradesSession } from "@/utils/trades-auth";
import { revalidatePath } from "next/cache";

export type TradeWorker = {
  id: string;
  name: string;
  trade_type: string;
  phone: string | null;
  username: string | null;
  organization_id: string;
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

// ── Admin: set credentials for a trade worker ────────────────────────────────

export async function setTradeCredentials(
  tradeId: string,
  username: string,
  password: string
): Promise<{ error?: string }> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return { error: "Unauthorized" };

  if (!username.trim()) return { error: "Username is required" };
  if (password.length < 6) return { error: "Password must be at least 6 characters" };

  const supabase = createServiceRoleClient();

  // Check username not taken by another worker
  const { data: existing } = await supabase
    .from("trades")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .neq("id", tradeId)
    .maybeSingle();

  if (existing) return { error: "Username already taken" };

  const { error } = await supabase
    .from("trades")
    .update({
      username: username.trim().toLowerCase(),
      password_hash: hashPassword(password),
    })
    .eq("id", tradeId)
    .eq("organization_id", orgId);

  if (error) return { error: error.message };
  revalidatePath("/trades");
  return {};
}

// ── Trade worker: sign in ────────────────────────────────────────────────────

export async function tradesSignIn(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const username = (formData.get("username") as string ?? "").trim().toLowerCase();
  const password = formData.get("password") as string ?? "";

  if (!username || !password) return "Enter your username and password.";

  const supabase = createServiceRoleClient();
  const { data: trade } = await supabase
    .from("trades")
    .select("id, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (!trade || !trade.password_hash) return "Invalid username or password.";
  if (!verifyPassword(password, trade.password_hash)) return "Invalid username or password.";

  await setTradesSession(trade.id);
  redirect("/trades-portal/dashboard");
}

// ── Trade worker: sign out ───────────────────────────────────────────────────

export async function tradesSignOut(): Promise<void> {
  await clearTradesSession();
  redirect("/trades-portal/sign-in");
}

// ── Trade worker: get own worker record ─────────────────────────────────────

export async function getMyTradeWorker(): Promise<TradeWorker | null> {
  const session = await getTradesSession();
  if (!session) return null;

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("trades")
    .select("id, name, trade_type, phone, username, organization_id")
    .eq("id", session.tradeId)
    .single();

  return data as TradeWorker | null;
}

// ── Trade worker: get assigned tasks ────────────────────────────────────────

export async function getMyTasks(tradeId: string): Promise<TradeTask[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("trade_tasks")
    .select("*, projects(name), rooms(name)")
    .eq("trade_id", tradeId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (data ?? []) as TradeTask[];
}

// ── Trade worker: update own task status ────────────────────────────────────

export async function updateMyTaskStatus(taskId: string, status: string): Promise<void> {
  const session = await getTradesSession();
  if (!session) throw new Error("Not signed in");

  const supabase = createServiceRoleClient();

  // Verify this task belongs to this worker
  const { data: task } = await supabase
    .from("trade_tasks")
    .select("trade_id")
    .eq("id", taskId)
    .single();

  if (!task || task.trade_id !== session.tradeId) throw new Error("Task not found");

  await supabase
    .from("trade_tasks")
    .update({
      status,
      ...(status === "Completed"
        ? { completed_at: new Date().toISOString() }
        : { completed_at: null }),
    })
    .eq("id", taskId);

  revalidatePath("/trades-portal/dashboard");
}
