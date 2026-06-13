import React, { useState } from "react";
import { ClosetItem } from "../types";
import { apiFetch } from "../lib/apiClient";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  CloudSun, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Info, 
  X,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react";

interface SelectedItemResult {
  id: string;
  name: string;
  reason: string;
}

interface SuggestedAdditionResult {
  name: string;
  reason: string;
}

interface DailyLookResult {
  day: string;
  name: string;
  activity: string;
  explanation: string;
  itemIds: string[];
}

interface TravelPackResult {
  suitcaseSummary: string;
  selectedItems: SelectedItemResult[];
  suggestedAdditions: SuggestedAdditionResult[];
  dailylooks: DailyLookResult[];
  layAdvice: string;
}

interface TravelSuitcaseProps {
  closet: ClosetItem[];
  showToast: (msg: string) => void;
}

export default function TravelSuitcase({ closet, showToast }: TravelSuitcaseProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [climate, setClimate] = useState("frio moderado");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelPackResult | null>(null);

  // Quick suggestions for user clicks
  const QUICK_DESTINATIONS = [
    { name: "Paris", icon: "🗼", climate: "frio moderado", days: 5 },
    { name: "Rio de Janeiro", icon: "🏖️", climate: "calor e sol", days: 4 },
    { name: "Gramado", icon: "🍷", climate: "frio intenso", days: 3 },
    { name: "São Paulo (Trabalho)", icon: "💼", climate: "meia-estação e vento", days: 2 }
  ];

  const handleQuickDestination = (dest: typeof QUICK_DESTINATIONS[0]) => {
    setDestination(dest.name);
    setClimate(dest.climate);
    setDays(dest.days);
    showToast(`Destino definido para ${dest.name}! ✈️`);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      showToast("Por favor, preencha o destino da sua viagem! ✈️");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await apiFetch<TravelPackResult>("/api/generate-travel-pack", {
        method: "POST",
        body: JSON.stringify({
          destination,
          days,
          climate,
          closetItems: closet
        })
      });

      setResult(data);
      showToast("Mala de Mão Inteligente montada com muito carinho! 💼💋");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Ocorreu um erro ao montar sua mala. Tente novamente! 🤎");
    } finally {
      setLoading(false);
    }
  };

  // Find actual closet item by ID
  const getClosetItem = (id: string): ClosetItem | undefined => {
    return closet.find(item => item.id === id);
  };

  return (
    <div className="space-y-8 animate-fade-in py-2">
      
      {/* BANNER GERAL DE VIAGEM */}
      <div className="bg-gradient-to-r from-[#6E1F2B] to-[#52131C] p-6 sm:p-10 rounded-[32px] text-white space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none transform translate-x-12 -translate-y-12" />
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-amber-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
            <Briefcase size={12} className="text-amber-400" />
            <span>MALA COMPACTA INTELIGENTE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold">Mala de Mão Curinga</h1>
          <p className="text-xs sm:text-sm text-amber-100/95 leading-relaxed font-serif">
            Diga adeus ao excesso de bagagem e taxas extras! O Toque da Lay vasculha seu guarda-roupa atual para organizar looks coordenados que garanto que vão render por todos os dias da sua viagem.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PARTE ESQUERDA: CONFIGURAÇÃO DA VIAGEM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-5">
            <h2 className="text-lg font-serif font-black text-[#5A3E32] flex items-center gap-2 border-b border-[#F8F3EC] pb-3">
              <MapPin size={18} className="text-[#6E1F2B]" />
              <span>Para onde você vai viajar?</span>
            </h2>

            {/* QUICK SUGGESTIONS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#8C8178] uppercase block">Destinos Queridinhos:</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => handleQuickDestination(dest)}
                    className="bg-[#F8F3EC]/80 hover:bg-[#E8D8C3]/50 border border-[#E8D8C3]/70 text-xs text-[#5A3E32] px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{dest.icon}</span>
                    <span>{dest.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CONFIG FORM */}
            <form onSubmit={handleGenerate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5A3E32] block">Destino Final:</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8178]" size={16} />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: Buenos Aires, Salvador, Curitiba..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC]/50 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] placeholder-[#8C8178] focus:outline-none focus:border-[#6E1F2B] transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] block">Duração (Dias):</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8178]" size={15} />
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-3 bg-[#F8F3EC]/50 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] font-semibold focus:outline-none focus:border-[#6E1F2B]"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,12,14].map(d => (
                        <option key={d} value={d}>{d} {d === 1 ? 'Dia' : 'Dias'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] block">Clima Estimado:</label>
                  <div className="relative">
                    <CloudSun className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8178]" size={15} />
                    <select
                      value={climate}
                      onChange={(e) => setClimate(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-[#F8F3EC]/50 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] font-semibold focus:outline-none focus:border-[#6E1F2B]"
                    >
                      <option value="frio moderado">🍁 Frio moderado</option>
                      <option value="frio intenso">❄️ Frio intenso</option>
                      <option value="calor e sol">☀️ Calor e sol</option>
                      <option value="meia-estação e vento">☁️ Meia-estação</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6E1F2B] hover:bg-[#52131C] disabled:bg-gray-300 text-white font-serif font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Vasculhando seu closet...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-300" />
                    <span>Arrumar Mala de Mão Inteligente 💼</span>
                  </>
                )}
              </button>
            </form>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100/80 flex gap-3 text-xs text-[#5A3E32] leading-relaxed">
              <Info size={16} className="text-amber-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-900 mb-0.5">Estratégia Mala de Mão Inteligente:</span>
                Levamos apenas o peso do bom gosto! Usando regrinhas de multiplicação (Capsule Wardrobe), conseguimos fazer 8 peças renderem looks únicos por semanas.
              </div>
            </div>

          </div>
        </div>

        {/* PARTE DIREITA: VISUALIZAÇÃO DOS RESULTADOS */}
        <div className="lg:col-span-7 space-y-6">
          
          {loading && (
            <div className="bg-white rounded-3xl border border-[#E8D8C3] p-12 text-center text-[#5A3E32] space-y-4">
              <div className="inline-flex p-4 bg-[#F8F3EC] rounded-full animate-pulse border border-[#E8D8C3]/50">
                <Briefcase size={40} className="text-[#6E1F2B]" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="font-serif font-black text-base">Arrumando os cabides virtuais...</h4>
                <p className="text-[11px] text-[#8C8178] leading-relaxed">
                  "O segredo para não amassar as roupas no voo é fazer rolinhos bem apertados e usar o blazer como casaco de bordo!"
                </p>
                <p className="text-[10px] text-[#6E1F2B] font-mono tracking-widest uppercase font-extrabold animate-pulse pt-2">— Toque da Lay está calculando...</p>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-[#F8F3EC]/50 border-2 border-dashed border-[#E8D8C3] rounded-3xl p-12 text-center space-y-3">
              <p className="font-serif font-semibold text-sm text-[#5A3E32]">Sua mala de mão vazia aguarda o destino</p>
              <p className="text-xs text-[#8C8178] max-w-xs mx-auto text-center leading-relaxed">
                Insira o seu destino ao lado e deixe o algoritmo inteligente da Lay calcular exatamente o que vai te vestir com elegância de mala de cabine!
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6">
              
              {/* LAY'S OVERVIEW STATEMENT */}
              <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-4">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#6E1F2B] uppercase tracking-wider">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Veredito de bordo da Lay</span>
                </div>
                <p className="text-xs text-[#5A3E32] leading-relaxed font-serif italic text-justify">
                  “{result.suitcaseSummary}”
                </p>
              </div>

              {/* PIECES SELECTED FROM CLOSET */}
              <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-4">
                <div className="border-b border-[#F8F3EC] pb-3">
                  <h3 className="font-serif font-black text-[#5A3E32] flex items-center gap-1.5 text-base">
                    <span className="text-xl">🧥</span>
                    <span>Peças Selecionadas do Seu Closet ({result.selectedItems.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.selectedItems.map((sel) => {
                    const original = getClosetItem(sel.id);
                    return (
                      <div 
                        key={sel.id}
                        className="bg-[#F8F3EC]/65 border border-[#E8D8C3] hover:border-[#6E1F2B]/40 p-3 rounded-2xl flex items-start gap-3 transition-colors text-xs"
                      >
                        {original?.imageUrl ? (
                          <img 
                            src={original.imageUrl} 
                            alt={sel.name} 
                            className="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-[#E8D8C3]/50" 
                          />
                        ) : (
                          <div className="w-14 h-14 bg-white rounded-xl shrink-0 border border-[#E8D8C3]/60 flex items-center justify-center text-lg shadow-inner">
                            👚
                          </div>
                        )}
                        <div className="space-y-1">
                          <span className="font-serif font-bold text-[#5A3E32] block line-clamp-1">{sel.name}</span>
                          <p className="text-[10px] text-[#8C8178] leading-tight">{sel.reason}</p>
                          {original && (
                            <span className="inline-block text-[9px] font-extrabold uppercase bg-amber-100 text-[#5A3E32] px-1.5 py-0.5 rounded mt-1">
                              {original.category} • {original.mainColor}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SUGGESTED ADDITIONS (COMPLEMENTS) */}
              {result.suggestedAdditions && result.suggestedAdditions.length > 0 && (
                <div className="bg-gradient-to-br from-[#1F1A17] to-[#121110] rounded-3xl p-6 text-white space-y-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-[#E8D8C3] uppercase font-bold tracking-widest block">💡 Toque de Compra Inteligente</span>
                    <h3 className="font-serif font-bold text-base text-[#D4A373]">Sugestões de Complementos Rápidos</h3>
                  </div>
                  <p className="text-[11px] text-[#E8D8C3]/80 leading-relaxed">
                    Sentimos que faltaram algumas pecinhas chaves no seu guarda-roupa atual para aguentar esse clima. A Lay sugere levar ou adquirir itens como estes:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                    {result.suggestedAdditions.map((add, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-1 text-xs">
                        <span className="font-bold text-[#E8D8C3] block flex items-center gap-1.5">
                          <Check size={13} className="text-amber-400" />
                          {add.name}
                        </span>
                        <p className="text-[10px] text-gray-300 leading-tight">{add.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DAILY ITINERARY OF LOOKS */}
              <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-4">
                <div className="border-b border-[#F8F3EC] pb-3">
                  <h3 className="font-serif font-black text-[#5A3E32] flex items-center gap-1.5 text-base">
                    <span className="text-xl">📅</span>
                    <span>Roteiro de Coordenação por Dia</span>
                  </h3>
                </div>

                <div className="space-y-5">
                  {result.dailylooks.map((look) => (
                    <div 
                      key={look.day}
                      className="border-l-2 border-[#6E1F2B] pl-4 space-y-2 relative"
                    >
                      {/* Anchor dot */}
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-[#6E1F2B] -left-[8px] top-1 border-2 border-white shadow-sm" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#6E1F2B]">{look.day}</span>
                        <span className="text-[10px] font-medium text-[#8C8178] flex items-center gap-1">
                          📍 {look.activity}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[#5A3E32]">{look.name}</h4>
                      <p className="text-xs text-[#5A3E32] leading-relaxed bg-[#F8F3EC]/30 p-2.5 rounded-xl border border-[#E8D8C3]/40">
                        {look.explanation}
                      </p>

                      {/* Display outfit combination pieces */}
                      {look.itemIds && look.itemIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[9px] font-bold text-[#8C8178] uppercase">Peças deste look:</span>
                          <div className="flex gap-1.5">
                            {look.itemIds.map(ii => {
                              const match = getClosetItem(ii);
                              if (!match) return null;
                              return (
                                <div 
                                  key={ii}
                                  className="inline-flex items-center gap-1 bg-[#F8F3EC] border border-[#E8D8C3] px-2 py-0.5 rounded text-[10px] font-medium text-[#5A3E32]"
                                  title={match.name}
                                >
                                  {match.imageUrl ? (
                                    <img src={match.imageUrl} className="w-3.5 h-3.5 rounded-sm object-cover bg-white" />
                                  ) : (
                                    <span>👗</span>
                                  )}
                                  <span>{match.name.split(" ")[0]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SPECIAL LAY ADVICE */}
              <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 space-y-3.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#5A3E32] uppercase">
                  <span>🤎</span>
                  <span>O truque de embalagem da Lay</span>
                </div>
                <p className="text-[11px] text-[#5A3E32] leading-relaxed italic text-justify">
                  “{result.layAdvice}”
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
