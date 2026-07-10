import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Stash21 — IoT & Hardware Blog";
    const category = searchParams.get("category") || "";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #08080a 0%, #1a0f0a 50%, #08080a 100%)",
            fontFamily: "Inter, sans-serif"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 20% 30%, rgba(184,115,51,0.2), transparent 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 80% 70%, rgba(139,111,232,0.1), transparent 50%)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: category ? 32 : 0
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: "0.05em",
                background: "linear-gradient(135deg, #F3DFA8, #C9A24B, #8A4B25)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: 1.2
              }}
            >
              Stash21
            </span>
          </div>
          {category && (
            <span
              style={{
                fontSize: 20,
                color: "#4DD8E8",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: 16
              }}
            >
              {category}
            </span>
          )}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#E8CE8C",
              textAlign: "center",
              maxWidth: "80%",
              lineHeight: 1.3,
              textShadow: "0 0 40px rgba(201,162,75,0.3)"
            }}
          >
            {title.length > 80 ? title.slice(0, 80) + "..." : title}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 16,
              color: "rgba(232,206,140,0.5)",
              letterSpacing: "0.2em"
            }}
          >
            stash21.com / IoT & Hardware Blog
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Failed to generate image", { status: 500 });
  }
}
