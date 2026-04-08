"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type AuthState = {
  error?: string
  success?: string
} | null

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const redirectTo = String(formData.get("redirectTo") || "/")

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message === "Invalid login credentials" ? "Credenciais inválidas" : error.message }
  }

  revalidatePath("/", "layout")
  redirect(redirectTo)
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const fullName = String(formData.get("fullName") || "").trim()

  if (!email || !password || !fullName) {
    return { error: "Nome, email e senha são obrigatórios" }
  }

  if (password.length < 6) {
    return { error: "Senha deve ter no mínimo 6 caracteres" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success:
      "Cadastro realizado. Verifique seu email para confirmar a conta e então faça login.",
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
