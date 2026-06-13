import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { getSiteSettings } from "@/lib/db/queries/site-settings";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const settings = await getSiteSettings();

  const siteName = settings?.siteName || "Your Business";
  const title = searchParams.get("title") || siteName;
  const subtitle = searchParams.get("subtitle") || settings?.tagline || "";
  const background = settings?.secondaryColor || "#f5f5f5";
  const foreground = settings?.primaryColor || "#171717";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: background,
          color: foreground,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 600, opacity: 0.7 }}>{siteName}</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ marginTop: 24, fontSize: 32, opacity: 0.8, maxWidth: "85%" }}>
            {subtitle}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
