"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Clock, CheckCircle, Play, Square, Loader2, RefreshCcw, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function AbaRegistroPonto() {
  const [now, setNow] = useState(new Date())
  const [status, setStatus] = useState<"aguardando" | "trabalhando" | "encerrado">("aguardando")
  const [timer, setTimer] = useState("00:00:00")
  const [lastPonto, setLastPonto] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Camera State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pontoType, setPontoType] = useState<"entrada" | "saida">("entrada")
  const [photoBlob, setPhotoBlob] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")
  const [uploading, setUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Relógio
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    loadPontoData()
  }, [])

  const loadPontoData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar perfil na equipe para pegar o ID correto
      const { data: equipeMember } = await supabase
        .from("equipe")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle()
      
      if (!equipeMember) return

      // Buscar registros de hoje
      const today = new Date().toISOString().split('T')[0]
      const { data: records } = await supabase
        .from("registros_ponto")
        .select("*")
        .eq("usuario_id", equipeMember.id)
        .gte("created_at", today)
        .order("created_at", { ascending: true })

      setHistory(records || [])

      if (records && records.length > 0) {
        const last = records[records.length - 1]
        setLastPonto(last)
        
        if (last.tipo === "entrada") {
          setStatus("trabalhando")
          startTimer(new Date(last.created_at))
        } else {
          setStatus("encerrado")
          setTimer("00:00:00")
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const startTimer = (startTime: Date) => {
    const updateTimer = () => {
      const diff = new Date().getTime() - startTime.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimer(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }
    const timerInterval = setInterval(updateTimer, 1000)
    return () => clearInterval(timerInterval)
  }

  const handleBaterPonto = () => {
    const nextType = (lastPonto?.tipo === "entrada") ? "saida" : "entrada"
    setPontoType(nextType)
    setIsModalOpen(true)
    startCamera()
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      toast.error("Erro ao acessar câmera: " + (err as Error).message)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        setPhotoBlob(canvasRef.current.toDataURL('image/png'))
        stopCamera()
      }
    }
  }

  const confirmRegistro = async () => {
    if (!photoBlob) return

    try {
      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obter ID da equipe
      const { data: equipeMember } = await supabase
        .from("equipe")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle()
      
      if (!equipeMember) throw new Error("Membro não encontrado na equipe")

      // Upload Foto
      const base64Data = photoBlob.split(',')[1]
      const blob = await fetch(photoBlob).then(res => res.blob())
      const fileName = `${equipeMember.id}/${Date.now()}.png`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('registros-ponto')
        .upload(fileName, blob)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('registros-ponto')
        .getPublicUrl(fileName)

      // Get Geolocation
      let lat = null, lng = null
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch (e) {
        console.warn("GPS negado ou falhou")
      }

      // Insert Record
      const { error: insertError } = await supabase
        .from("registros_ponto")
        .insert({
          usuario_id: equipeMember.id,
          tipo: pontoType,
          foto_url: publicUrl,
          latitude: lat,
          longitude: lng,
          observacao
        })

      if (insertError) throw insertError

      toast.success(`Registro de ${pontoType} realizado com sucesso!`)
      setIsModalOpen(false)
      setPhotoBlob(null)
      setObservacao("")
      loadPontoData()
    } catch (error: any) {
      toast.error("Erro ao registrar ponto: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const totalHours = () => {
    // Cálculo simples de tempo total (apenas para o dia atual)
    let totalMs = 0
    for(let i=0; i < history.length; i+=2) {
      const entrada = new Date(history[i].created_at)
      const saida = history[i+1] ? new Date(history[i+1].created_at) : new Date()
      totalMs += saida.getTime() - entrada.getTime()
    }
    const hours = Math.floor(totalMs / (1000 * 60 * 60))
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <Card className="bg-[#141414] border-[#2A2A2A] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Clock className="w-32 h-32" />
            </div>
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-mono text-neutral-500 uppercase tracking-widest">Horário Atual</p>
                <h2 className="text-5xl font-display font-bold text-white tracking-tighter">
                  {now.toLocaleTimeString('pt-BR')}
                </h2>
                <p className="text-xs text-neutral-400 font-mono uppercase">
                  {now.toLocaleDateString('pt-BR', { dateStyle: 'full' })}
                </p>
              </div>

              <div className="inline-flex items-center gap-4 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded-2xl">
                <div className="text-left space-y-1">
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Status do Dia</p>
                  <div className="flex items-center gap-2">
                    {status === "aguardando" && <Badge className="bg-neutral-800 text-neutral-400">AGUARDANDO ENTRADA</Badge>}
                    {status === "trabalhando" && <Badge className="bg-green-500/10 text-green-500 border-green-500/20 animate-pulse">TRABALHANDO</Badge>}
                    {status === "encerrado" && <Badge className="bg-red-500/10 text-red-500 border-red-500/20">TURNO ENCERRADO</Badge>}
                  </div>
                </div>
                {status === "trabalhando" && (
                  <div className="pl-4 border-l border-[#2A2A2A] text-left">
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Tempo Decorrido</p>
                    <p className="text-xl font-mono text-white font-bold">{timer}</p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleBaterPonto}
                  disabled={status === "encerrado" && lastPonto?.tipo === "saida"}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-mono text-sm tracking-widest uppercase px-12 py-6 h-auto rounded-full shadow-2xl shadow-orange-500/20 group"
                >
                  <Camera className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                  Bater Ponto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card className="bg-[#141414] border-[#2A2A2A]">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Linha do Tempo - Hoje</h3>
                <div className="text-[10px] font-mono text-neutral-500">
                    Total: <span className="text-white font-bold">{totalHours()}</span>
                </div>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-center py-8 text-sm text-neutral-600 italic">Nenhum registro hoje.</p>
                ) : (
                  history.map((record, i) => (
                    <div key={record.id} className="flex items-start gap-4 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl group hover:border-orange-500/30 transition-all">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-[#2A2A2A] flex-shrink-0">
                        <img src={record.foto_url} alt="Ponto" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white uppercase tracking-tight">
                            {record.tipo === 'entrada' ? 'Registro de Entrada' : 'Registro de Saída'}
                          </p>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={record.tipo === 'entrada' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                            {record.tipo.toUpperCase()}
                          </Badge>
                          {record.latitude && (
                            <div className="flex items-center text-[10px] text-neutral-600 font-mono">
                                <MapPin className="w-3 h-3 mr-1" />
                                {record.latitude.toFixed(4)}, {record.longitude.toFixed(4)}
                            </div>
                          )}
                        </div>
                        {record.observacao && (
                            <p className="text-[10px] text-neutral-500 italic mt-2">"{record.observacao}"</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Modal Câmera */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if(!open) stopCamera(); setIsModalOpen(open); }}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-orange-500 font-mono text-sm tracking-widest uppercase">
              {pontoType === 'entrada' ? 'Registro de Entrada' : 'Registro de Saída'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-[#2A2A2A]">
              {!photoBlob ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <img src={photoBlob} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>

            {!photoBlob ? (
                <Button onClick={capturePhoto} className="w-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase py-6 h-auto">
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar Foto
                </Button>
            ) : (
                <div className="space-y-4">
                    <Textarea 
                      placeholder="Observação opcional..."
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      className="bg-[#0A0A0A] border-[#2A2A2A] placeholder:text-neutral-700 h-20 text-xs"
                    />
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => { setPhotoBlob(null); startCamera(); }} className="flex-1 font-mono text-xs uppercase h-auto py-3">
                            <RefreshCcw className="w-3 h-3 mr-2" />
                            Refazer
                        </Button>
                        <Button 
                            onClick={confirmRegistro} 
                            disabled={uploading}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-mono text-xs uppercase h-auto py-3"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3 h-3 mr-2" /> Confirmar</>}
                        </Button>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
