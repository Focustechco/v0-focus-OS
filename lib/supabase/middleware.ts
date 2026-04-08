import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function isPublicRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.json" ||
    pathname === "/logo.svg"
  )
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = "/login"
  url.searchParams.set("redirectTo", pathname)
  return NextResponse.redirect(url)
}

/**
 * Atualiza a sessão Supabase e protege rotas autenticadas.
 * Redireciona para /login se não houver sessão válida.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const routeIsPublic = isPublicRoute(pathname)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env vars are missing in middleware")
    return routeIsPublic ? NextResponse.next({ request }) : redirectToLogin(request, pathname)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    // Importante: não rodar código entre createServerClient e getUser().
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && !routeIsPublic) {
      return redirectToLogin(request, pathname)
    }

    if (user && pathname === "/login") {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error("Failed to update Supabase session in middleware", error)
    return routeIsPublic ? supabaseResponse : redirectToLogin(request, pathname)
  }
}
