"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const VENDOR_CATEGORIES = [
  "Tiles", "Paint", "Electrical", "Plumbing", "Furniture",
  "Hardware", "Glass", "Flooring", "Lighting", "HVAC", "Other",
];

export async function createVendor(data: {
  name: string; phone?: string; city?: string; category: string; notes?: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("vendors").insert({
    organization_id: orgId, name: data.name,
    phone: data.phone || null, city: data.city || null,
    category: data.category, notes: data.notes || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
}

export async function updateVendor(id: string, data: {
  name: string; phone?: string; city?: string; category: string; notes?: string;
}) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("vendors")
    .update({ name: data.name, phone: data.phone || null, city: data.city || null, category: data.category, notes: data.notes || null })
    .eq("id", id).eq("organization_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/vendors");
}

export async function deleteVendor(id: string) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");
  const supabase = createServiceRoleClient();
  await supabase.from("vendors").delete().eq("id", id).eq("organization_id", orgId);
  revalidatePath("/vendors");
}
