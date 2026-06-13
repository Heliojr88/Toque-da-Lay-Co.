import React, { useState } from "react";
import { 
  Sparkles, 
  Layers, 
  Compass, 
  Heart, 
  CheckCircle2, 
  Smartphone, 
  ArrowRight, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Eye,
  Check,
  Star
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: (preferredTab?: "login" | "register") => void;
}

export default function LandingPage({ onOpenAuth }: LandingPageProps) {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const steps = [
    {
      num: "01",
      title: "Cadastre suas Peças",
      desc: "Fotografe ou selecione ilustrações que representem suas camisetas, vestidos, calças e calçados. Divirta-se catalogando em poucos minutos!"
    },
    {
      num: "02",
      title: "Monte Combinações Chic",
      desc: "Nosso sistema organiza suas peças em conjuntos perfeitos para o trabalho, passeios ou cultos de domingo, de forma visual e intuitiva."
    },
    {
      num: "03",
      title: "Receba Dicas da Lay",
      desc: "Acesse orientações personalizadas deixadas diretamente pela especialista Lay para reatar seu amor-próprio com o seu próprio closet."
    }
  ];

  const highlights = [
    {
      icon: <Layers className="text-[#6E1F2B]" size={24} />,
      title: "Monte looks com o que você já tem",
      desc: "Libere o potencial oculto do seu próprio armário combinando suas peças de forma fácil e divertida."
    },
    {
      icon: <Sparkles className="text-amber-600" size={24} />,
      title: "Teste compras antes de levar para casa",
      desc: "Veja se a peça nova realmente casa com no mínimo 3 looks usando as roupas que você já possui cadastradas."
    },
    {
      icon: <Calendar className="text-[#5A3E32]" size={24} />,
      title: "Descubra quais peças realmente fazem seu closet render",
      desc: "Diga adeus ao guarda-roupa lotado, mas ineficiente. Entenda o valor de versatilidade de cada item."
    },
    {
      icon: <Award className="text-[#6E1F2B]" size={24} />,
      title: "Use o Método CHIC para comprar com mais clareza",
      desc: "Aprenda a analisar suas decisões sob a luz de utilidade, harmonia, rotina real e se compensa comprar."
    }
  ];

  const faqs = [
    {
      q: "Preciso ter muitas roupas para começar?",
      a: "De forma alguma! A metodologia da Lay prega exatamente o oposto: vestir-se incrivelmente bem com um guarda-roupa compacto, funcional e inteligente. O aplicativo serve exatamente para liberar o potencial das peças que você já tem."
    },
    {
      q: "Como a Lay consegue deixar dicas para mim?",
      a: "O aplicativo possui uma área administrativa integrada que permite que a consultora de estilo acesse os closets virtuais das alunas cadastradas para deixar feedbacks reais de combinações e curadorias personalizadas de estilo."
    },
    {
      q: "Posso criar meu cadastro gratuitamente para testar?",
      a: "Sim! Você pode criar sua conta na hora ou clicar em 'Login' para testar usando as credenciais de demonstração (como a cliente 'Mariana' ou a própria 'Lay' administradora)."
    }
  ];

  return (
    <div id="landing-root" className="min-h-screen bg-[#F8F3EC] text-[#1F1A17] font-sans antialiased selection:bg-[#E8D8C3] selection:text-[#5A3E32] select-none">
      
      {/* 1. TOP MARKETING NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#F8F3EC]/95 backdrop-blur-md border-b border-[#E8D8C3]/80 px-4 py-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="closet brand">🤎</span>
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-black text-[#5A3E32] tracking-tight">
                Toque da Lay <span className="font-light text-xs italic text-[#6E1F2B]">Closet Co.</span>
              </h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#5A3E32]/90 uppercase tracking-wider">
            <a href="#about" className="hover:text-[#6E1F2B] transition-colors">O Aplicativo</a>
            <a href="#how-it-works" className="hover:text-[#6E1F2B] transition-colors">Como Funciona</a>
            <a href="#benefits" className="hover:text-[#6E1F2B] transition-colors">Vantagens</a>
            <a href="#demo-accounts" className="hover:text-[#6E1F2B] transition-colors">Contas de Teste</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth("login")}
              className="text-xs font-bold text-[#5A3E32] hover:text-[#6E1F2B] px-3 py-2 transition-colors cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="bg-[#6E1F2B] hover:bg-[#52131C] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm cursor-pointer"
            >
              CADASTRAR-SE
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION / ABOUT */}
      <section id="about" className="relative overflow-hidden py-16 sm:py-24 px-4 border-b border-[#E8D8C3]">
        <div className="absolute inset-0 bg-[radial-gradient(#E8D8C3_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-amber-200">
            <Sparkles size={12} className="animate-spin-slow" /> Metodologia CHIC Prática
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-serif font-black text-[#5A3E32] tracking-tight leading-none">
            Você tem roupa, mas sente que <span className="text-[#6E1F2B] font-light italic">não tem look?</span>
          </h1>
          
          <p className="text-sm sm:text-lg text-[#8C8178] max-w-2xl mx-auto leading-relaxed font-serif">
            Cadastre seu guarda-roupa, descubra combinações reais e veja se uma peça nova merece entrar no seu closet. Use o Método CHIC para comprar com mais clareza.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
            <button
              onClick={() => onOpenAuth("register")}
              className="w-full sm:w-auto bg-[#5A3E32] hover:bg-[#422D24] text-white font-serif font-bold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md hover:scale-[1.01] cursor-pointer"
              id="btn-comecar-closet"
            >
              Começar meu closet 🤎
            </button>
            <button
              onClick={() => onOpenAuth("login")}
              className="w-full sm:w-auto bg-[#F8F3EC] hover:bg-[#E8D8C3]/40 text-[#5A3E32] border border-[#E8D8C3] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all cursor-pointer"
              id="btn-testar-peca"
            >
              Testar uma peça nova 💋
            </button>
          </div>

          <div className="flex justify-center items-center gap-6 pt-6 text-[#8C8178] text-xs">
            <span className="flex items-center gap-1.5 font-medium">✓ 100% Mobile Friendly</span>
            <span className="flex items-center gap-1.5 font-medium">✓ Sem Cartão de Crédito</span>
            <span className="flex items-center gap-1.5 font-medium">✓ Dicas Reais de Consultora</span>
          </div>
        </div>

        {/* Dynamic Float Cards mockups */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] space-y-3 transform hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-center bg-amber-50 p-3 rounded-2xl">
              <span className="text-xs font-serif font-bold text-amber-800">✨ Toque Especial da Lay</span>
              <span className="text-[10px] bg-[#6E1F2B] text-white px-2 py-0.5 rounded-full font-bold">HOJE</span>
            </div>
            <p className="text-xs font-serif italic text-[#5A3E32] leading-relaxed">
              “Sua saia plissada midi preta fica maravilhosa com tênis branco e um nó frontal na blusa para manter o visual maduro e confortável!”
            </p>
            <div className="text-[10px] text-[#8C8178] text-right font-medium">— Lay Reis, Mentora</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] space-y-4 transform md:scale-105 shadow-md relative">
            <div className="absolute -top-3 left-6 bg-[#6E1F2B] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
              COMPUTADOR CHIC
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#5A3E32]">
                <span>Seu Closet Atual</span>
                <span className="text-emerald-700">92% de Harmonia</span>
              </div>
              <div className="w-full bg-[#F8F3EC] h-2 rounded-full overflow-hidden">
                <div className="bg-[#6E1F2B] h-full rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <p className="text-[11px] text-[#8C8178]">
              Você possui ótimas peças neutras. Dedique-se agora a sapatos de qualidade e acessórios que trazem o verdadeiro ponto de toque.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] space-y-3 transform hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-center text-xs font-bold text-[#5A3E32]">
              <span>📊 Validador Inteligente</span>
              <span className="text-[#6E1F2B] bg-[#6E1F2B]/10 px-2 py-0.5 rounded-full text-[10px]">9.4 / 10</span>
            </div>
            <p className="text-[11px] font-serif text-[#5A3E32] leading-relaxed">
              <strong>Blazer Linho Areia:</strong> Alta compatibilidade! Combina diretamente com 8 looks diferentes do seu guarda-roupa virtual cadastrado.
            </p>
            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded uppercase block w-max">
              Compra Aprovada ✓
            </span>
          </div>
        </div>
      </section>

      {/* 3. CORE BENEFITS */}
      <section id="benefits" className="py-20 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#6E1F2B]">O segredo da satisfação</span>
          <h2 className="text-3xl font-serif font-black text-[#5A3E32]">Vantagens do Guarda-Roupa Inteligente</h2>
          <p className="text-xs text-[#8C8178]">Por que integrar tecnologia no modo como você se veste diariamente?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-[0_4px_20px_rgba(90,62,50,0.01)] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-[#F8F3EC] w-max rounded-2xl">
                  {h.icon}
                </div>
                <h3 className="font-serif font-bold text-[#5A3E32]">{h.title}</h3>
                <p className="text-xs text-[#8C8178] leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. METHODOLOGY HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#5A3E32] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8D8C3]">Passo a Passo</span>
            <h2 className="text-3xl font-serif font-black text-white">Como Funciona a Plataforma?</h2>
            <p className="text-xs text-[#E8D8C3]/80">Fácil, rápido e feito sob medida para seu dia a dia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl relative space-y-4 overflow-hidden">
                <span className="absolute right-4 top-4 text-4xl sm:text-5xl font-serif font-black text-white/5 select-none">{s.num}</span>
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block bg-white/10 w-max px-2.5 py-0.5 rounded-full">Fase {s.num}</span>
                <h3 className="text-xl font-serif font-bold text-white">{s.title}</h3>
                <p className="text-xs text-[#E8D8C3]/80 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => onOpenAuth("register")}
              className="bg-white hover:bg-[#F8F3EC] text-[#5A3E32] font-serif font-extrabold px-8 py-3.5 rounded-2xl transition-all shadow flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <span>Quero Começar Agora</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. SEEDED DEMO CREDENTIAL HOVER */}
      <section id="demo-accounts" className="py-20 px-4 bg-white border-b border-[#E8D8C3]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#6E1F2B]">EXPERIMENTE IMEDIATAMENTE</span>
            <h2 className="text-3xl font-serif font-black text-[#5A3E32]">Navegue como Aluna ou Admin</h2>
            <p className="text-xs text-[#8C8178] max-w-md mx-auto">Nós preparamos duas contas totalmente integradas para você interagir e entender o potencial sistêmico do Closet.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
            {/* Mariana Block */}
            <div 
              onClick={() => onOpenAuth("login")}
              className="bg-[#F8F3EC]/50 hover:bg-[#F8F3EC] p-6 rounded-3xl border border-[#E8D8C3] space-y-4 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg" role="img" aria-label="user shadow">👩🏼‍💼</span>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Área do Membro</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-[#5A3E32]">Mariana (Aluna de Estilo)</h3>
                <p className="text-xs text-[#8C8178]">Veja como ela gerencia seu closet, monta looks no calendário e acompanha as notas de mentoria dadas pela Lay.</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#E8D8C3]/50 text-[11px] text-[#5A3E32] font-mono space-y-0.5">
                <p><strong>E-mail:</strong> mariana@vida.com</p>
                <p><strong>Senha:</strong> user123</p>
              </div>
            </div>

            {/* Admin Block */}
            <div 
              onClick={() => onOpenAuth("login")}
              className="bg-[#6E1F2B]/5 hover:bg-[#6E1F2B]/10 p-6 rounded-3xl border border-[#6E1F2B]/20 space-y-4 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg" role="img" aria-label="admin star">👑</span>
                <span className="bg-red-50 text-[#6E1F2B] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Painel de Consultora</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-[#5A3E32]">Laís Reis — Lay (Admin)</h3>
                <p className="text-xs text-[#8C8178]">Acesse a mesa de controle. Veja todas as cadastradas do sistema, mude o status e digite conselhos diretos.</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#E8D8C3]/50 text-[11px] text-[#5A3E32] font-mono space-y-0.5">
                <p><strong>E-mail:</strong> admin@toquedalay.com</p>
                <p><strong>Senha:</strong> senha123</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 px-4 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#6E1F2B]">DÚVIDAS FREQUENTES</span>
          <h2 className="text-3xl font-serif font-black text-[#5A3E32]">Perguntas Respondidas por Nós</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isCur = activeFAQ === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-[#E8D8C3] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left p-5 font-serif font-bold text-sm sm:text-base text-[#5A3E32] flex items-center justify-between focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#6E1F2B] font-bold text-lg">{isCur ? "−" : "+"}</span>
                </button>
                {isCur && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#8C8178] leading-relaxed border-t border-[#F8F3EC]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PRE FOOTER CTA */}
      <section className="py-16 bg-gradient-to-br from-[#5A3E32] to-[#422D24] text-white text-center px-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none transform translate-x-5 -translate-y-5" />
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">Restaure o orgulho ao abrir as portas do seu guarda-roupa</h2>
          <p className="text-xs sm:text-sm text-[#E8D8C3]/90 leading-relaxed font-serif max-w-md mx-auto">
            Faça parte da nossa comunidade exclusiva e receba o acompanhamento pessoal da Lay Reis.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenAuth("register")}
              className="bg-[#6E1F2B] hover:bg-[#52131C] text-white font-serif font-black text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>INICIAR MINHA JORNADA CHIC</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#1F1A17] text-[#8C8178] py-12 px-4 sm:px-8 text-xs border-t border-[#342D29]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-serif font-bold text-[#F8F3EC] text-sm">Toque da Lay Closet Co.</p>
            <p className="text-[11px] text-[#8C8178]">Direitos de cópia reservados © 2026. Feito com amor por Laís Reis.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[11px]">
            <a href="#about" className="hover:text-white transition-colors">O Aplicativo</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#benefits" className="hover:text-white transition-colors">Vantagens</a>
            <a href="#demo-accounts" className="hover:text-white transition-colors">Contas de Teste</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
