import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, BookOpen, Link, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AbaMinhaEquipe } from "./tabs/aba-minha-equipe"
import { AbaRegistroPonto } from "./tabs/aba-ponto"
import { AbaConteudos } from "./tabs/aba-conteudos"
import { AbaAcessos } from "./tabs/aba-acessos"
import { AbaTarefas } from "./tabs/aba-tarefas"

export function EquipeModule() {
  const [userType, setUserType] = useState<string>("colaborador")

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("equipe")
          .select("tipo")
          .eq("usuario_id", user.id)
          .maybeSingle()
        
        if (data) setUserType(data.tipo)
      }
    }
    fetchUserRole()
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="minha-equipe" className="w-full">
        <TabsList className="bg-[#141414] border border-[#2A2A2A] p-1 h-auto tabs-scrollable flex-nowrap gap-1">
          <TabsTrigger value="minha-equipe" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[10px] tracking-widest uppercase py-2 px-4">
            <Users className="w-3.5 h-3.5 mr-2" />
            Minha Equipe
          </TabsTrigger>
          <TabsTrigger value="ponto" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[10px] tracking-widest uppercase py-2 px-4">
            <Clock className="w-3.5 h-3.5 mr-2" />
            Registro de Ponto
          </TabsTrigger>
          <TabsTrigger value="conteudos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[10px] tracking-widest uppercase py-2 px-4">
            <BookOpen className="w-3.5 h-3.5 mr-2" />
            Conteúdos
          </TabsTrigger>
          <TabsTrigger value="acessos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[10px] tracking-widest uppercase py-2 px-4">
            <Link className="w-3.5 h-3.5 mr-2" />
            Acessos & Plataformas
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[10px] tracking-widest uppercase py-2 px-4">
            <CheckCircle className="w-3.5 h-3.5 mr-2" />
            Minhas Tarefas do Dia
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="minha-equipe">
            <AbaMinhaEquipe userType={userType} />
          </TabsContent>
          <TabsContent value="ponto">
            <AbaRegistroPonto />
          </TabsContent>
          <TabsContent value="conteudos">
              <AbaConteudos userType={userType} />
          </TabsContent>
          <TabsContent value="acessos">
              <AbaAcessos userType={userType} />
          </TabsContent>
          <TabsContent value="tarefas">
              <AbaTarefas userType={userType} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
