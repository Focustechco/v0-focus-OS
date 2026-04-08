import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match em todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico
     * - arquivos estáticos (imagens, splash, ícones, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|splash|icon-|apple-touch-|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
