import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Login | Focus OS",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.svg" alt="Focus OS" className="mb-4 h-[62px] w-[62px]" />
          <h1 className="font-display text-2xl font-bold tracking-wider text-orange-500">
            FOCUS OS
          </h1>
          <p className="mt-1 font-mono text-xs text-neutral-500">
            Sistema Operacional · Gestão de Projetos
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
