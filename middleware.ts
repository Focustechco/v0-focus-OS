function isPublicRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.json" ||
    pathname === "/logo.svg"
  )
}

function hasSupabaseSessionCookie(request: MiddlewareRequest) {
  const cookies = request.cookies.getAll()
  // Procura por qualquer cookie que comece com sb- e termine com auth-token
  // O formato padrão é sb-[project-ref]-auth-token
  return cookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") &&
      cookie.name.endsWith("auth-token")
  )
}

type MiddlewareRequest = {
  nextUrl: URL & { clone(): URL }
  cookies: {
    getAll(): Array<{ name: string; value: string }>
  }
}

export function middleware(request: MiddlewareRequest) {
  const { pathname } = request.nextUrl
  const routeIsPublic = isPublicRoute(pathname)
  const hasSession = hasSupabaseSessionCookie(request)

  if (!hasSession && !routeIsPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", pathname)
    return Response.redirect(url)
  }

  if (hasSession && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return Response.redirect(url)
  }
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
