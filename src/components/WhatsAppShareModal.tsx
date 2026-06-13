import React, { useState } from "react";
import { Outfit, ClosetItem } from "../types";
import { X, Copy, Check, MessageCircle, ExternalLink, RefreshCw } from "lucide-react";
import { ClothesIllustration } from "./ClothesIllustrations";

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: Outfit;
  day: string;
  closet: ClosetItem[];
  showToast: (msg: string) => void;
}

export default function WhatsAppShareModal({
  isOpen,
  onClose,
  outfit,
  day,
  closet,
  showToast
}: WhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Clean day word (capitalize first letter)
  const formattedDay = day ? (day.charAt(0).toUpperCase() + day.slice(1)) : "uma ocasião especial";

  // Find actual items belonging to this outfit
  const matchedItems = outfit.itemIds
    .map(id => closet.find(item => item.id === id))
    .filter((item): item is ClosetItem => !!item);

  // Suggested questions user can ask
  const QUESTION_PRESETS = [
    "Me digam: Aprovado ou Mudo alguma coisa? 💋",
    "Ficou chique de verdade para a ocasião, gurias? 🤔🤎",
    "Gostaram dessa combinação de cores? Da uma nota de 1 a 10! ✨",
    "Vocês acham que devo trocar o calçado ou está ótimo? 👠"
  ];

  const [customQuestion, setCustomQuestion] = useState(QUESTION_PRESETS[0]);

  if (!isOpen) return null;

  // Prepare text list of items for WhatsApp message payload
  const piecesText = matchedItems
    .map(item => `• ${item.name} (${item.mainColor})`)
    .join("\n");

  const buildMessage = () => {
    return `*Ficha de Estilo Real - Closet Inteligente 🤎*\n\n` +
           `Gurias, planejei este look para *${formattedDay}* e queria a opinião de vocês! 👇👗\n\n` +
           `✨ *Look:* _${outfit.name}_\n` +
           `💼 *Ocasião:* _${outfit.occasion}_\n\n` +
           `👚 *Peças Harmonizadas:*\n${piecesText}\n\n` +
           (outfit.explanation ? `💡 *Proposta Estética:* "${outfit.explanation}"\n\n` : "") +
           `💬 *A pergunta da Mariana:* ${customQuestion}\n\n` +
           `O que vocês acham? Me ajuda, viu? Um beeeeijo! 💋`;
  };

  const handleCopy = () => {
    const text = buildMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Ficha em texto copiada! Pronto para colar no WhatsApp! 📋💖");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToWhatsApp = () => {
    const textencoded = encodeURIComponent(buildMessage());
    const whatsappUrl = `https://api.whatsapp.com/send?text=${textencoded}`;
    
    // Open in separate tab without violating iframe sandboxing
    const link = document.createElement("a");
    link.href = whatsappUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Redirecionando para o WhatsApp... 💬✈️");
  };

  return (
    <div className="fixed inset-0 bg-[#1F1A17]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F8F3EC] w-full max-w-md rounded-[32px] overflow-hidden border-2 border-[#E8D8C3] shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header styling */}
        <div className="p-5 bg-white border-b border-[#E8D8C3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#E8F8F0] rounded-full text-[#128C7E]">
              <MessageCircle size={18} />
            </span>
            <div>
              <h3 className="font-serif font-black text-sm text-[#5A3E32]">Ficha de Opinião no WhatsApp</h3>
              <p className="text-[10px] text-[#8C8178]">Peça o palpite de quem você ama com estilo!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F8F3EC] rounded-full text-[#8C8178] hover:text-[#5A3E32] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Aesthetic Review Preview Card (A ficha bonita) */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8D8C3] shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
            
            <div className="flex items-center justify-between">
              <span className="inline-block bg-[#F8F3EC] border border-[#E8D8C3] text-[9px] text-[#6E1F2B] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full font-serif">
                Planejamento: {formattedDay}
              </span>
              <span className="text-[10px] font-mono text-[#8C8178] bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                {outfit.occasion}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-black text-base text-[#5A3E32] tracking-tight">{outfit.name}</h4>
              {outfit.explanation && (
                <p className="text-[11px] text-[#8C8178] italic leading-relaxed">
                  “{outfit.explanation}”
                </p>
              )}
            </div>

            {/* Displaying images nicely in visual grid */}
            <div className="bg-[#FAF8F5] p-3 rounded-xl border border-gray-100 space-y-2">
              <span className="text-[9px] font-extrabold uppercase text-[#8C8178] tracking-widest block">Peças Selecionadas:</span>
              <div className="flex flex-wrap gap-2.5">
                {matchedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-1.5 bg-white py-1 px-1.5 rounded-lg border border-gray-100 shadow-xs">
                    <div className="w-7 h-7 rounded bg-[#F8F3EC] overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <ClothesIllustration category={item.category} color={item.mainColor} />
                      )}
                    </div>
                    <div className="text-left leading-none max-w-[80px]">
                      <span className="text-[9px] font-semibold text-[#5A3E32] block truncate">{item.name}</span>
                      <span className="text-[7px] text-[#8C8178] uppercase font-bold">{item.mainColor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
              <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wide block">Pergunta para as Amigas:</span>
              <p className="text-xs text-emerald-950 font-medium font-serif italic">
                “{customQuestion}”
              </p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-serif font-black text-[#5A3E32] block">Escolha/Altere a Pergunta de Opinião:</label>
            <div className="grid grid-cols-1 gap-1.5">
              {QUESTION_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomQuestion(preset)}
                  className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    customQuestion === preset
                      ? "bg-emerald-50 border-[#128C7E] text-[#128C7E] font-medium"
                      : "bg-white border-gray-200 hover:border-[#E8D8C3] text-[#5A3E32]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action guidance info */}
          <div className="p-3 bg-[#E8D8C3]/30 rounded-2xl border border-[#E8D8C3] flex gap-2.5 text-[11px] text-[#5A3E32] leading-relaxed">
            <span className="text-sm shrink-0">💬</span>
            <span>
              Ao enviar, o assistente encaminha o link bonito do look acompanhado de uma lista legível de peças formatadas. Ideal para compartilhar em grupos ou conversas privadas.
            </span>
          </div>

        </div>

        {/* Modal Buttons Footer */}
        <div className="p-5 bg-white border-t border-[#E8D8C3] flex flex-col gap-2.5">
          <button
            onClick={handleSendToWhatsApp}
            className="w-full bg-[#128C7E] hover:bg-[#0e7065] text-white py-3.5 rounded-xl text-xs font-serif font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle size={15} />
            <span>Enviar no WhatsApp com 1 Toque 💬</span>
            <ExternalLink size={12} className="opacity-80" />
          </button>
          
          <button
            onClick={handleCopy}
            className="w-full bg-[#F8F3EC] hover:bg-[#E8D8C3]/50 text-[#5A3E32] py-2.5 rounded-xl text-xs font-semibold border border-[#E8D8C3] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-600" />
                <span>Texto Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copiar Ficha em Texto Formatado 📋</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
