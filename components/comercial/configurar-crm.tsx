"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useClickUpConfig } from "@/hooks/use-clickup"
import { Check, X, Link2, Info, ExternalLink } from "lucide-react"

export function ConfigurarCRM() {
  const { config, isConfigured, isLoaded } = useClickUpConfig()

  return (
    <div className="space-y-6">
      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <Link2 className="w-4 h-4 text-orange-500" />
            CONEXAO COM CLICKUP
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {!isLoaded ? (
            <p className="text-xs text-neutral-500">Carregando status...</p>
          ) : isConfigured ? (
            <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <Check className="mt-0.5 h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400">
                  CONECTADO · integração ativa
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  A integração está configurada via variáveis de ambiente no
                  servidor.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-1 font-mono text-[11px] text-neutral-500 sm:grid-cols-3">
                  <div>
                    Team ID:{" "}
                    <span className="text-neutral-300">
                      {config.teamId || "—"}
                    </span>
                  </div>
                  <div>
                    Space ID:{" "}
                    <span className="text-neutral-300">
                      {config.spaceId || "—"}
                    </span>
                  </div>
                  <div>
                    List ID:{" "}
                    <span className="text-neutral-300">
                      {config.listId || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <X className="mt-0.5 h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-400">
                  NÃO CONFIGURADO
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Defina as variáveis de ambiente do ClickUp para ativar a
                  integração.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#141414] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-500" />
            COMO CONFIGURAR
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-sm text-neutral-300">
          <p className="text-xs text-neutral-400">
            Por segurança, o token do ClickUp agora é mantido somente no
            servidor. Para configurar:
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-xs text-neutral-300">
            <li>
              Obtenha seu token em{" "}
              <a
                href="https://app.clickup.com/settings/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-orange-500 hover:underline"
              >
                clickup.com/settings/apps <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              No arquivo <code className="rounded bg-[#0A0A0A] px-1 font-mono">.env.local</code> (ou nas variáveis do Vercel), defina:
              <pre className="mt-2 overflow-x-auto rounded bg-[#0A0A0A] p-3 font-mono text-[11px] text-neutral-400">{`CLICKUP_API_TOKEN=pk_xxxxx
CLICKUP_TEAM_ID=xxxxx
CLICKUP_SPACE_ID=xxxxx
CLICKUP_LIST_ID=xxxxx`}</pre>
            </li>
            <li>Reinicie o servidor (dev) ou faça redeploy (prod).</li>
          </ol>
          <p className="rounded border border-orange-500/30 bg-orange-500/5 p-3 text-[11px] text-orange-300">
            A UI antiga de configuração (token + selects de workspace) foi
            substituída porque expor o token ao navegador era um risco de
            segurança. Esta tela agora apenas reflete o estado definido no
            servidor.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
