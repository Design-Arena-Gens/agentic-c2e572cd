import Link from "next/link";
import { Suspense } from "react";

function EnvStatusRow({
  label,
  ok
}: {
  label: string;
  ok: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: ok ? "#3ddc97" : "#ff6b6b"
        }}
      />
      <div>
        <span style={{ color: "#9aa4b2" }}>{label}:</span>{" "}
        <strong>{ok ? "Configured" : "Missing"}</strong>
      </div>
    </div>
  );
}

function LogsClient() {
  return (
    <Suspense fallback={<div>Loading logs?</div>}>
      {/* Client component via dynamic import would be nicer; inline simple fetcher */}
      {/* @ts-expect-error Server Component using fetch in client-like block */}
      <LogsView />
    </Suspense>
  );
}

async function LogsView() {
  const res = await fetch(`${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/logs`, {
    cache: "no-store"
  });
  const data = (await res.json()) as { logs: Array<{ ts: string; level: string; message: string; meta?: unknown }> };
  return (
    <div
      style={{
        background: "#121a2a",
        border: "1px solid #1f2a44",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        maxHeight: 360,
        overflow: "auto"
      }}
    >
      {data.logs.length === 0 ? (
        <div style={{ color: "#9aa4b2" }}>No events yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {data.logs.map((l, i) => (
            <li key={i} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace", fontSize: 13 }}>
              <span style={{ color: "#6fa8ff" }}>[{new Date(l.ts).toLocaleString()}]</span>{" "}
              <span style={{ color: l.level === "error" ? "#ff6b6b" : "#3ddc97" }}>{l.level.toUpperCase()}</span>{" "}
              <span>{l.message}</span>{" "}
              {l.meta ? <pre style={{ whiteSpace: "pre-wrap", margin: "4px 0 0 0", color: "#cbd5e1" }}>{JSON.stringify(l.meta, null, 2)}</pre> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function HomePage() {
  const hasVerify = !!process.env.META_VERIFY_TOKEN;
  const hasPageToken = !!process.env.META_PAGE_ACCESS_TOKEN;
  const hasIgToken = !!process.env.META_IG_ACCESS_TOKEN || hasPageToken;
  const webhookUrl = "https://agentic-c2e572cd.vercel.app/api/webhook/meta";

  return (
    <main>
      <h1 style={{ fontSize: 28, margin: 0 }}>Agentic Meta Responder</h1>
      <p style={{ marginTop: 8, color: "#b6c2d9" }}>
        Auto-replies for Facebook Messenger and Instagram comments/messages. Deploy-ready on Vercel.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 24
        }}
      >
        <section
          style={{
            background: "#121a2a",
            border: "1px solid #1f2a44",
            borderRadius: 12,
            padding: 16
          }}
        >
          <h3 style={{ marginTop: 0 }}>Setup</h3>
          <EnvStatusRow label="META_VERIFY_TOKEN" ok={hasVerify} />
          <EnvStatusRow label="META_PAGE_ACCESS_TOKEN" ok={hasPageToken} />
          <EnvStatusRow label="META_IG_ACCESS_TOKEN (or Page token)" ok={hasIgToken} />
          <div style={{ marginTop: 12, color: "#9aa4b2" }}>
            Webhook URL:{" "}
            <code style={{ background: "#0b1020", padding: "2px 6px", borderRadius: 6 }}>{webhookUrl}</code>
          </div>
          <ul style={{ color: "#b6c2d9" }}>
            <li>Subscribe Page fields: messages, feed</li>
            <li>Subscribe Instagram fields: messages, comments</li>
            <li>Use your verify token for handshake</li>
          </ul>
          <div style={{ marginTop: 12 }}>
            <Link href="https://developers.facebook.com/docs" target="_blank">
              Meta Docs
            </Link>
          </div>
        </section>
        <section
          style={{
            background: "#121a2a",
            border: "1px solid #1f2a44",
            borderRadius: 12,
            padding: 16
          }}
        >
          <h3 style={{ marginTop: 0 }}>Live Logs</h3>
          <LogsClient />
        </section>
      </div>
    </main>
  );
}

