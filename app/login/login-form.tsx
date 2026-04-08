"use client"

import { useActionState, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useFormStatus } from "react-dom"
import { signIn, signUp, type AuthState } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthState = null

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-500 text-white hover:bg-orange-600"
    >
      {pending ? "Processando..." : label}
    </Button>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"
  const [mode, setMode] = useState<"signin" | "signup">("signin")

  const [signInState, signInAction] = useActionState(signIn, initialState)
  const [signUpState, signUpAction] = useActionState(signUp, initialState)

  const state = mode === "signin" ? signInState : signUpState
  const action = mode === "signin" ? signInAction : signUpAction

  return (
    <div className="rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] p-6 shadow-xl">
      <div className="mb-5 flex border-b border-[#2A2A2A]">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 pb-2 text-xs font-medium tracking-wider transition-colors ${
            mode === "signin"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          ENTRAR
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 pb-2 text-xs font-medium tracking-wider transition-colors ${
            mode === "signup"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          CADASTRAR
        </button>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs text-neutral-400">
              Nome completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Seu nome"
              className="border-[#2A2A2A] bg-[#141414] text-white"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-neutral-400">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="voce@focustecnologias.com.br"
            className="border-[#2A2A2A] bg-[#141414] text-white"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs text-neutral-400">
            Senha
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="border-[#2A2A2A] bg-[#141414] text-white"
          />
        </div>

        {state?.error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="rounded border border-green-500/30 bg-green-500/10 p-2 text-xs text-green-400">
            {state.success}
          </div>
        )}

        <SubmitButton label={mode === "signin" ? "Entrar" : "Criar conta"} />
      </form>

      <p className="mt-4 text-center font-mono text-[10px] text-neutral-600">
        Acesso restrito · Focus Tecnologias
      </p>
    </div>
  )
}
