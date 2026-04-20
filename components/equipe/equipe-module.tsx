import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, BookOpen, Link } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AbaMinhaEquipe } from "./tabs/aba-minha-equipe"
import { AbaRegistroPonto } from "./tabs/aba-ponto"
import { AbaConteudos } from "./tabs/aba-conteudos"
import { AbaAcessos } from "./tabs/aba-acessos"

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
        <TabsList className="
          w-full bg-[#141414] border border-[#2A2A2A] p-1 h-auto
          flex overflow-x-auto scrollbar-hide flex-nowrap gap-1
          justify-start md:justify-center
        ">
          <TabsTrigger value="minha-equipe" className="flex-shrink-0 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase py-2 px-3 sm:px-4">
            <Users className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
            Minha Equipe
          </TabsTrigger>
          <TabsTrigger value="ponto" className="flex-shrink-0 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase py-2 px-3 sm:px-4">
            <Clock className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
            Ponto
          </TabsTrigger>
          <TabsTrigger value="conteudos" className="flex-shrink-0 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase py-2 px-3 sm:px-4">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
            Conteúdos
          </TabsTrigger>
          <TabsTrigger value="acessos" className="flex-shrink-0 data-[state=active]:bg-orange-500 data-[state=active]:text-white font-mono text-[9px] sm:text-[10px] tracking-widest uppercase py-2 px-3 sm:px-4">
            <Link className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
            Acessos
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

        </div>
      </Tabs>
    </div>
  )
}
