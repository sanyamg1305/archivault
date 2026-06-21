"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ContactAttachment = {
  type: "contact" | "vendor";
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  category?: string;
};

export type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  channel: "internal" | "external";
  created_at: string;
  message_type: "text" | "image" | "contact";
  image_url?: string | null;
  attachment?: ContactAttachment | null;
};

export async function getMessages(
  projectId: string,
  channel: "internal" | "external"
): Promise<Message[]> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return [];

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("project_messages")
    .select("id, sender_id, sender_name, content, channel, created_at, message_type, image_url, attachment")
    .eq("project_id", projectId)
    .eq("channel", channel)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw new Error(error.message);

  const messages = (data ?? []) as Message[];

  // Generate signed URLs for image messages
  const withUrls = await Promise.all(
    messages.map(async (msg) => {
      if (msg.message_type === "image" && msg.image_url && !msg.image_url.startsWith("http")) {
        const { data: signed } = await supabase.storage
          .from("chat-images")
          .createSignedUrl(msg.image_url, 60 * 60 * 24);
        return { ...msg, image_url: signed?.signedUrl ?? null };
      }
      return msg;
    })
  );

  return withUrls;
}

export async function sendMessage(
  projectId: string,
  channel: "internal" | "external",
  content: string,
  senderName: string
): Promise<void> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (channel === "internal" && !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    sender_id: userId,
    sender_name: senderName,
    content: content.trim(),
    channel,
    message_type: "text",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}/chat`);
  revalidatePath(`/portal/${projectId}/chat`);
}

export async function sendImageMessage(
  projectId: string,
  channel: "internal" | "external",
  formData: FormData,
  senderName: string
): Promise<void> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (channel === "internal" && !orgId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image must be under 10 MB");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${projectId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const supabase = createServiceRoleClient();
  const { error: uploadError } = await supabase.storage
    .from("chat-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    sender_id: userId,
    sender_name: senderName,
    content: "",
    channel,
    message_type: "image",
    image_url: path,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/chat`);
  revalidatePath(`/portal/${projectId}/chat`);
}

export async function deleteMessage(messageId: string, projectId: string): Promise<void> {
  const { userId, orgRole } = await auth();
  if (!userId || orgRole !== "org:admin") throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();

  // If it's an image message, delete the storage file too
  const { data: msg } = await supabase
    .from("project_messages")
    .select("message_type, image_url")
    .eq("id", messageId)
    .single();

  if (msg?.message_type === "image" && msg.image_url && !msg.image_url.startsWith("http")) {
    await supabase.storage.from("chat-images").remove([msg.image_url]);
  }

  const { error } = await supabase.from("project_messages").delete().eq("id", messageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/chat`);
  revalidatePath(`/portal/${projectId}/chat`);
}

export async function sendContactMessage(
  projectId: string,
  channel: "internal" | "external",
  contact: ContactAttachment,
  senderName: string
): Promise<void> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (channel === "internal" && !orgId) throw new Error("Unauthorized");

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("project_messages").insert({
    project_id: projectId,
    sender_id: userId,
    sender_name: senderName,
    content: contact.name,
    channel,
    message_type: "contact",
    attachment: contact,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}/chat`);
  revalidatePath(`/portal/${projectId}/chat`);
}
