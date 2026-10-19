import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    sandboxImage: "edutech-sandbox:latest",
    baseImage: "python:3.11-slim",
    unprivilegedUser: "sandbox (UID 10001, GID 10001)",
    preinstalledPackages: [
      "fastapi==0.115.8",
      "uvicorn==0.34.0",
      "pydantic==2.10.6",
      "httpx==0.28.1",
      "pytest==8.3.4",
      "pytest-asyncio==0.25.3",
      "requests==2.32.3",
    ],
    securityPolicies: {
      memoryLimitDefault: "512MB",
      cpuQuotaDefault: "1.0 CPU",
      pidsLimitDefault: 64,
      networkIsolationDefault: "disabled (--net=none)",
      privilegeEscalation: "blocked (no-new-privileges:true)",
      capabilities: "dropped (cap-drop=ALL)",
      timeoutDefaultMs: 10000,
    },
    dockerBuildCommand: "docker compose build sandbox",
  });
}
