import { NextResponse } from "next/server";
import { addLog } from "@/lib/logger";
import {
  extractTextSafe,
  replyFacebookComment,
  replyInstagramComment,
  sendFacebookMessage,
  sendInstagramMessage
} from "@/lib/meta";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode && token && challenge && mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    addLog("info", "Webhook verified");
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  addLog("error", "Webhook verify failed", { mode, tokenPresent: !!token });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  addLog("info", "Webhook event received", body);

  // Page events: Messenger + feed comments
  if (body?.object === "page" && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      // Messenger events
      if (Array.isArray(entry.messaging)) {
        for (const event of entry.messaging) {
          const senderId = event?.sender?.id;
          const text = extractTextSafe(event?.message);
          if (senderId && (text || event?.message)) {
            try {
              const res = await sendFacebookMessage(senderId, text);
              addLog(res.success ? "info" : "error", "FB message reply", res);
            } catch (err: any) {
              addLog("error", "FB message reply error", { error: err?.message });
            }
          }
        }
      }
      // Feed changes -> comments
      if (Array.isArray(entry.changes)) {
        for (const ch of entry.changes) {
          if (ch?.field === "feed" && ch?.value?.item === "comment") {
            const commentId = ch?.value?.comment_id || ch?.value?.commentId || ch?.value?.id;
            const messageText = extractTextSafe(ch?.value?.message) || extractTextSafe(ch?.value);
            if (commentId) {
              try {
                const res = await replyFacebookComment(commentId, messageText);
                addLog(res.success ? "info" : "error", "FB comment reply", res);
              } catch (err: any) {
                addLog("error", "FB comment reply error", { error: err?.message });
              }
            }
          }
        }
      }
    }
  }

  // Instagram events: messages + comments
  if (body?.object === "instagram" && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (Array.isArray(entry.changes)) {
        for (const ch of entry.changes) {
          // IG Messaging webhook
          if (ch?.field === "messages") {
            const fromId = ch?.value?.from?.id || ch?.value?.sender?.id;
            const text = extractTextSafe(ch?.value?.message) || extractTextSafe(ch?.value?.text);
            if (fromId) {
              try {
                const res = await sendInstagramMessage(fromId, text);
                addLog(res.success ? "info" : "error", "IG DM reply", res);
              } catch (err: any) {
                addLog("error", "IG DM reply error", { error: err?.message });
              }
            }
          }
          // IG comments webhook
          if (ch?.field === "comments") {
            const commentId = ch?.value?.id || ch?.value?.comment_id;
            const text = extractTextSafe(ch?.value?.text) || extractTextSafe(ch?.value);
            if (commentId) {
              try {
                const res = await replyInstagramComment(commentId, text);
                addLog(res.success ? "info" : "error", "IG comment reply", res);
              } catch (err: any) {
                addLog("error", "IG comment reply error", { error: err?.message });
              }
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ status: "EVENT_RECEIVED" }, { status: 200 });
}

