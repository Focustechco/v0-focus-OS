"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, ChevronDown, ChevronUp, Building2 } from "lucide-react"

interface PerfilEmpresaSectionProps {
  onChange: () => void
}

export function PerfilEmpresaSection({ onChange }: PerfilEmpresaSectionProps) {
  const [expandAddress, setExpandAddress] = useState(false)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase mb-1 flex items-center gap-2 border-l-2 border-orange-500 pl-3">
          Perfil da Empresa
        </h2>
        <p className="text-neutral-600 text-sm pl-5">
          Informacoes basicas da sua empresa
        </p>
      </div>

      <Card className="bg-[#141414] border-[#2a2a2a]">
        <CardContent className="p-6 space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-neutral-400 font-mono text-xs uppercase">Logo da Empresa</Label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded bg-[#1a1a1a] border-2 border-dashed border-orange-500/30 flex items-center justify-center hover:border-orange-500 transition-colors cursor-pointer group">
                <Building2 className="w-8 h-8 text-orange-500/50 group-hover:text-orange-500 transition-colors" />
              </div>
              <div className="flex-1">
                <div className="border-2 border-dashed border-[#2a2a2a] rounded p-6 text-center hover:border-orange-500/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm font-mono">Arraste ou clique para upload</p>
                  <p className="text-neutral-600 text-xs font-mono mt-1">PNG, JPG ou SVG ate 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Nome da Empresa</Label>
              <Input
                defaultValue="Focus Tecnologia Ltda"
                onChange={onChange}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">CNPJ</Label>
              <Input
                defaultValue="12.345.678/0001-90"
                onChange={onChange}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Segmento</Label>
              <Select defaultValue="tecnologia" onValueChange={onChange}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="agencia">Agencia</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Site</Label>
              <Input
                defaultValue="https://focus.com.br"
                onChange={onChange}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Email Comercial</Label>
              <Input
                defaultValue="contato@focus.com.br"
                type="email"
                onChange={onChange}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Telefone</Label>
              <Input
                defaultValue="+55 11 99999-9999"
                onChange={onChange}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Expandable Address */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setExpandAddress(!expandAddress)}
              className="w-full justify-between text-neutral-400 hover:text-white font-mono text-xs uppercase p-0 h-auto"
            >
              <span>Endereco</span>
              {expandAddress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            {expandAddress && (
              <div className="space-y-4 pt-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-neutral-400 font-mono text-xs uppercase">CEP</Label>
                    <Input
                      defaultValue="01310-100"
                      onChange={onChange}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-neutral-400 font-mono text-xs uppercase">Rua</Label>
                    <Input
                      defaultValue="Av. Paulista"
                      onChange={onChange}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-neutral-400 font-mono text-xs uppercase">Numero</Label>
                    <Input
                      defaultValue="1000"
                      onChange={onChange}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-400 font-mono text-xs uppercase">Cidade</Label>
                    <Input
                      defaultValue="Sao Paulo"
                      onChange={onChange}
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-400 font-mono text-xs uppercase">Estado</Label>
                    <Select defaultValue="sp" onValueChange={onChange}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                        <SelectItem value="sp">SP</SelectItem>
                        <SelectItem value="rj">RJ</SelectItem>
                        <SelectItem value="mg">MG</SelectItem>
                        <SelectItem value="pr">PR</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Fuso Horario</Label>
              <Select defaultValue="america-sao_paulo" onValueChange={onChange}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="america-sao_paulo">America/Sao_Paulo (GMT-3)</SelectItem>
                  <SelectItem value="america-recife">America/Recife (GMT-3)</SelectItem>
                  <SelectItem value="america-manaus">America/Manaus (GMT-4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-400 font-mono text-xs uppercase">Idioma</Label>
              <Select defaultValue="pt-br" onValueChange={onChange}>
                <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="pt-br">Portugues (BR)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Espanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
