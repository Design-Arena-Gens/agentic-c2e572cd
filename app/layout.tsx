export const metadata = {
  title: "Agentic Meta Responder",
  description: "Auto-responder for Facebook & Instagram"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji",
          background: "#0b1020",
          color: "#e6e9ef"
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px" }}>
          {props.children}
        </div>
      </body>
    </html>
  );
}

