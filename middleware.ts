import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // En mode démo, pas d'authentification : accès direct au dashboard.
  if (DEMO_MODE) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
