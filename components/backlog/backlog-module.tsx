"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VisaoGeral } from "./visao-geral"
import { Juridico } from "./juridico"
import { Adm } from "./adm"
import { Clientes } from "./clientes"
import { Produtividade } from "./produtividade"
import { DriveDocumentos } from "./drive-documentos"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function BacklogModule() {
  const [activeTab, setActiveTab] = useState("visao-geral")
  const [commandOpen, setCommandOpen] = useState(false)

  const quickActions = [
    { label: "Novo Contrato", action: "contrato" },
    { label: "Adicionar Cliente", action: "cliente" },
    { label: "Nova Tarefa ADM", action: "tarefa" },
    { label: "Upload Documento", action: "documento" },
    { label: "Novo Link Rapido", action: "link" },
  ]

  const tabs = [
    { value: "visao-geral", label: "VISAO GERAL" },
    { value: "drive", label: "DRIVE & DOCUMENTOS" },
    { value: "juridico", label: "JURIDICO" },
    { value: "adm", label: "ADM" },
    { value: "clientes", label: "CLIENTES" },
    { value: "produtividade", label: "PRODUTIVIDADE" },
  ]

  return (
    <div className="h-full flex flex-col bg-[#0d0d0d]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        {/* Tabs Navigation - Horizontally scrollable on mobile */}
        <div className="flex-shrink-0 border-b border-[#2a2a2a]">
          <ScrollArea className="w-full">
            <TabsList className="bg-transparent rounded-none w-max min-w-full justify-start gap-0 h-auto p-0 px-3 lg:px-6">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative px-3 sm:px-6 py-3 rounded-none bg-transparent text-neutral-500 font-mono text-[10px] sm:text-xs tracking-widest whitespace-nowrap data-[state=active]:text-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-neutral-300 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-orange-500 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>

        {/* Tab Content - Scrollable area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="visao-geral" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <VisaoGeral />
            </div>
          </TabsContent>
          <TabsContent value="drive" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <DriveDocumentos />
            </div>
          </TabsContent>
          <TabsContent value="juridico" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <Juridico />
            </div>
          </TabsContent>
          <TabsContent value="adm" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <Adm />
            </div>
          </TabsContent>
          <TabsContent value="clientes" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <Clientes />
            </div>
          </TabsContent>
          <TabsContent value="produtividade" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-6">
              <Produtividade />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* FAB Button */}
      <Button
        onClick={() => setCommandOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 z-50"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Adicionar rapidamente..." className="font-mono" />
        <CommandList>
          <CommandEmpty>Nenhuma acao encontrada.</CommandEmpty>
          <CommandGroup heading="Acoes Rapidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.action}
                onSelect={() => {
                  setCommandOpen(false)
                }}
                className="font-mono text-sm"
              >
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
