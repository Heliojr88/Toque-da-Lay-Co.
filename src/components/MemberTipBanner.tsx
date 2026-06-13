import React, { useState } from "react";
import { Sparkles, MessageSquare, X, Heart } from "lucide-react";

interface MemberTipBannerProps {
  tipText?: string;
  onDismiss?: () => void;
}

export default function MemberTipBanner({ tipText, onDismiss }: MemberTipBannerProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!tipText || !isOpen) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-[#F8F3EC] border-2 border-amber-200/60 p-5 rounded-3xl relative overflow-hidden shadow-[0_4px_20px_rgba(217,119,6,0.04)] animate-bounce-subtle">
      <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full pointer-events-none transform translate-x-4 -translate-y-4" />
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100/70 rounded-2xl text-amber-700 animate-pulse mt-0.5">
          <Sparkles size={20} />
        </div>
        
        <div className="space-y-1.5 flex-1 pr-6">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold tracking-widest text-[#6E1F2B] uppercase">DICA DA LAY ESPECIAL PARA VOCÊ ✨</span>
          </div>
          <h4 className="font-serif font-black text-sm text-[#5A3E32]">Sua Mentoria de Estilo Individualizada</h4>
          <p className="text-xs font-serif italic text-[#5A3E32] leading-relaxed">
            “{tipText}”
          </p>
        </div>

        <button
          onClick={() => {
            setIsOpen(false);
            if (onDismiss) onDismiss();
          }}
          className="absolute top-4 right-4 p-1 hover:bg-amber-100/50 rounded-full text-amber-800/80 transition-all"
          title="Fechar dica"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
