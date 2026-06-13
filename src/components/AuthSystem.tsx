import React, { useState, useEffect } from "react";
import { UserAccount, UserProfile } from "../types";
import { Eye, EyeOff, Key, Sparkles, User, Mail, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

// Pre-seeded demo accounts
export const PRE_SEEDED_USERS: UserAccount[] = [
  {
    id: "user_mariana",
    email: "mariana@vida.com",
    password: "user123",
    role: "user",
    name: "Mariana",
    status: "active",
    createdAt: new Date("2026-05-15").toISOString(),
    profileSetupCompleted: true,
    securityQuestion: "Qual o nome da sua primeira mentora de estilo?",
    securityAnswer: "lay",
    customTipFromLay: "Mariana, amei seu closet! A saia plissada preta midi vai ficar divina combinada com camisa branca e um nó frontal para as missas de domingo ou reuniões. Chique, viu? 🤎"
  },
  {
    id: "admin_lay",
    email: "admin@toquedalay.com",
    password: "senha123",
    role: "admin",
    name: "Laís Reis (Lay)",
    status: "active",
    createdAt: new Date("2026-01-01").toISOString(),
    profileSetupCompleted: true,
    securityQuestion: "Qual o seu prato favorito da vida real?",
    securityAnswer: "bolo de rolo",
    customTipFromLay: ""
  }
];

interface AuthSystemProps {
  onLoginSuccess: (user: UserAccount) => void;
  showToast: (msg: string) => void;
  initialMode?: "login" | "register" | "forgot";
}

export default function AuthSystem({ onLoginSuccess, showToast, initialMode = "login" }: AuthSystemProps) {
  const [dbUsers, setDbUsers] = useState<UserAccount[]>([]);
  const [currentMode, setCurrentMode] = useState<"login" | "register" | "forgot">(initialMode);
  
  useEffect(() => {
    if (initialMode) {
      setCurrentMode(initialMode);
    }
  }, [initialMode]);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States (Step 1: Account)
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSecurityQ, setRegSecurityQ] = useState("Qual o nome do seu pet de estimação?");
  const [regSecurityA, setRegSecurityA] = useState("");
  const [regStep, setRegStep] = useState<1 | 2>(1);

  // Register Form States (Step 2: Style Profile Survey)
  const [mainRoutine, setMainRoutine] = useState("Maternidade/Home Office");
  const [stylePreference, setStylePreference] = useState("Elegante");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(["Passeio", "Dia a dia"]);
  const [selectedStyleGoals, setSelectedStyleGoals] = useState<string[]>(["Ficar mais arrumada no dia a dia"]);
  const [lovedColors, setLovedColors] = useState("Bege, Off-white, Caramelo, Azul-marinho");
  const [avoidedColors, setAvoidedColors] = useState("Verde limão, Neon");

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: Email verify, 2: Security check, 3: Set password
  const [newPassword, setNewPassword] = useState("");
  const [recoveredUser, setRecoveredUser] = useState<UserAccount | null>(null);

  // Load registered users from local state
  useEffect(() => {
    const saved = localStorage.getItem("closet_lay_users_db");
    if (saved) {
      try {
        setDbUsers(JSON.parse(saved));
      } catch (err) {
        setDbUsers(PRE_SEEDED_USERS);
      }
    } else {
      setDbUsers(PRE_SEEDED_USERS);
      localStorage.setItem("closet_lay_users_db", JSON.stringify(PRE_SEEDED_USERS));
    }
  }, []);

  const saveUsersToDb = (users: UserAccount[]) => {
    setDbUsers(users);
    localStorage.setItem("closet_lay_users_db", JSON.stringify(users));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast("Por favor, preencha todos os campos do Toque da Lay.");
      return;
    }

    const matched = dbUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (!matched) {
      showToast("E-mail não cadastrado ainda. Faça sua inscrição!");
      return;
    }

    if (matched.password !== loginPassword) {
      showToast("Senha incorreta, se precisar pode redefinir abaixo.");
      return;
    }

    if (matched.status === "blocked") {
      showToast("Sua conta está suspensa temporariamente. Contate o suporte.");
      return;
    }

    // Success login!
    const updatedUsers = dbUsers.map(u => 
      u.id === matched.id ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    saveUsersToDb(updatedUsers);
    
    // Write session
    sessionStorage.setItem("closet_lay_active_user", JSON.stringify(matched));
    onLoginSuccess(matched);
    showToast(`Bem-vinda de volta, ${matched.name}! ✨`);
  };

  const handleRegisterNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regSecurityA) {
      showToast("Preencha todas as credenciais para criar a sua conta.");
      return;
    }

    const exists = dbUsers.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (exists) {
      showToast("Este e-mail já está sendo usado. Acesse sua conta.");
      return;
    }

    setRegStep(2);
  };

  const handleRegisterComplete = () => {
    const newUserId = "user_" + Date.now();
    const newUserAccount: UserAccount = {
      id: newUserId,
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: "user",
      name: regName,
      status: "active",
      createdAt: new Date().toISOString(),
      profileSetupCompleted: true,
      securityQuestion: regSecurityQ,
      securityAnswer: regSecurityA.trim().toLowerCase(),
      customTipFromLay: "Seja muito bem-vinda ao seu novo closet inteligente! Que alegria te ter aqui. Comece cadastrando as bases das suas roupas. Um beeeeijo da Lay 💋"
    };

    // Prepare personal style profile
    const profile: UserProfile = {
      id: newUserId,
      name: regName,
      mainRoutine,
      occasions: selectedOccasions,
      styleGoals: selectedStyleGoals,
      lovedColors: lovedColors.split(",").map(c => c.trim()),
      avoidedColors: avoidedColors.split(",").map(c => c.trim()),
      stores: ["Renner", "C&A", "Boutiques do Instagram"],
      stylePreference,
      createdAt: new Date().toISOString()
    };

    // Save profile to scoped key
    localStorage.setItem(`closet_lay_${newUserId}_profile`, JSON.stringify(profile));
    localStorage.setItem(`closet_lay_${newUserId}_closet`, JSON.stringify([]));
    localStorage.setItem(`closet_lay_${newUserId}_outfits`, JSON.stringify([]));
    localStorage.setItem(`closet_lay_${newUserId}_shopping_recs`, JSON.stringify([]));
    localStorage.setItem(`closet_lay_${newUserId}_weekly_planner`, JSON.stringify({}));

    const updatedDb = [...dbUsers, newUserAccount];
    saveUsersToDb(updatedDb);

    // Auto login
    sessionStorage.setItem("closet_lay_active_user", JSON.stringify(newUserAccount));
    onLoginSuccess(newUserAccount);
    showToast(`Parabéns pelo cadastro, ${regName}! Começou a sua transformação de estilo. 🤎`);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast("Forneça o seu e-mail cadastrado.");
      return;
    }

    const matched = dbUsers.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
    if (!matched) {
      showToast("Não encontramos nenhuma usuária com esse e-mail.");
      return;
    }

    setRecoveredUser(matched);
    setSecurityQuestion(matched.securityQuestion);
    setRecoveryStep(2);
  };

  const handleVerifySecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveredUser) return;

    if (securityAnswer.trim().toLowerCase() !== recoveredUser.securityAnswer.toLowerCase()) {
      showToast("Resposta incorreta! Tente novamente com carinho.");
      return;
    }

    setRecoveryStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveredUser || !newPassword) return;

    const updatedUsers = dbUsers.map(u => 
      u.id === recoveredUser.id ? { ...u, password: newPassword } : u
    );
    saveUsersToDb(updatedUsers);

    showToast("Senha redefinida com sucesso! Divirta-se.");
    setCurrentMode("login");
    setRecoveryStep(1);
    setForgotEmail("");
    setSecurityAnswer("");
    setNewPassword("");
    setRecoveredUser(null);
  };

  const toggleOccasion = (occ: string) => {
    if (selectedOccasions.includes(occ)) {
      setSelectedOccasions(selectedOccasions.filter(o => o !== occ));
    } else {
      setSelectedOccasions([...selectedOccasions, occ]);
    }
  };

  const toggleStyleGoal = (goal: string) => {
    if (selectedStyleGoals.includes(goal)) {
      setSelectedStyleGoals(selectedStyleGoals.filter(g => g !== goal));
    } else {
      setSelectedStyleGoals([...selectedStyleGoals, goal]);
    }
  };

  return (
    <div id="auth-container" className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 select-none">
      
      {/* BRANDING WRAPPER */}
      <div className="w-full max-w-lg mb-8 text-center space-y-2 animate-fade-in">
        <span className="inline-block bg-[#6E1F2B] text-white font-semibold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
          Vestir Inteligente de Verdade
        </span>
        <h1 className="text-4xl font-serif font-black text-[#5A3E32]">
          Toque da Lay <span className="text-[#6E1F2B] font-light italic">Closet Co.</span>
        </h1>
        <p className="text-xs text-[#8C8178] max-w-sm mx-auto leading-relaxed">
          “Moda possível e durável na vida real de mulheres maduras e modernas.”
        </p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_12px_45px_rgba(90,62,50,0.06)] overflow-hidden">
        
        {/* VIEW 1: LOGIN MODE */}
        {currentMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="p-8 sm:p-10 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-serif font-bold text-[#5A3E32]">Sua Conta Closet</h2>
              <p className="text-xs text-[#8C8178]">Seja muito bem-vinda de volta ao Toque da Lay!</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-[#5A3E32] uppercase tracking-wider block">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-[#8C8178]" />
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC]/50 border border-[#E8D8C3] rounded-2xl text-sm text-[#5A3E32] focus:outline-none focus:ring-1 focus:ring-[#6E1F2B] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase tracking-wider block">Sua Senha</label>
                  <button
                    type="button"
                    onClick={() => setCurrentMode("forgot")}
                    className="text-[11px] text-[#6E1F2B] hover:underline font-semibold"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-3.5 text-[#8C8178]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha secreta"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#F8F3EC]/50 border border-[#E8D8C3] rounded-2xl text-sm text-[#5A3E32] focus:outline-none focus:ring-1 focus:ring-[#6E1F2B] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#8C8178] hover:text-[#5A3E32]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5A3E32] hover:bg-[#422D24] text-white font-semibold py-3.5 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md mt-2 flex items-center justify-center gap-2"
            >
              Entrar no meu Closet 🤎
            </button>

            {/* Hint Box with Seeded Accounts */}
            <div className="bg-[#F8F3EC] p-4 rounded-2xl border border-[#E8D8C3] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#6E1F2B] tracking-wider block">Contas para Testar:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-[#8C8178]">
                <div className="cursor-pointer hover:bg-white p-2 rounded-lg border border-transparent hover:border-[#E8D8C3] transition-all" onClick={() => { setLoginEmail("mariana@vida.com"); setLoginPassword("user123"); }}>
                  <p className="font-semibold text-[#5A3E32]">🔒 Mariana (Cliente)</p>
                  <p>mariana@vida.com / user123</p>
                </div>
                <div className="cursor-pointer hover:bg-white p-2 rounded-lg border border-transparent hover:border-[#E8D8C3] transition-all" onClick={() => { setLoginEmail("admin@toquedalay.com"); setLoginPassword("senha123"); }}>
                  <p className="font-semibold text-[#6E1F2B]">⭐️ Lay (Administradora)</p>
                  <p>admin@toquedalay.com / senha123</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#F8F3EC] pt-4 text-center">
              <p className="text-xs text-[#8C8178]">
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => { setCurrentMode("register"); setRegStep(1); }}
                  className="font-bold text-[#6E1F2B] hover:underline"
                >
                  Cadastre-se na Plataforma
                </button>
              </p>
            </div>
          </form>
        )}

        {/* VIEW 2: REGISTER MODE */}
        {currentMode === "register" && (
          <div className="p-8 sm:p-10 space-y-6 animate-fade-in">
            {/* Steps Indicator Header */}
            <div className="flex items-center justify-between border-b border-[#F8F3EC] pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#5A3E32]">Inscrição de Membro</h2>
                <p className="text-[11px] text-[#8C8178]">
                  {regStep === 1 ? "Dados básicos de acesso" : "Sua consultoria de estilo e rotina"}
                </p>
              </div>
              <span className="text-xs font-bold text-[#6E1F2B] bg-[#F8F3EC] px-3 py-1 rounded-full">
                Etapa {regStep}/2
              </span>
            </div>

            {/* REGISTRATION STEP 1: ACCOUNT DETAILS */}
            {regStep === 1 && (
              <form onSubmit={handleRegisterNext} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">Nome Completo</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-[#8C8178]" />
                    <input
                      type="text"
                      placeholder="Qual o seu nome de batismo ou apelido preferido?"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC]/30 border border-[#E8D8C3] rounded-2xl text-xs sm:text-sm text-[#5A3E32] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">E-mail de Contato</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-[#8C8178]" />
                    <input
                      type="email"
                      placeholder="exemplo@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC]/30 border border-[#E8D8C3] rounded-2xl text-xs sm:text-sm text-[#5A3E32] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">Senha Segura</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3.5 top-3.5 text-[#8C8178]" />
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC]/30 border border-[#E8D8C3] rounded-2xl text-xs sm:text-sm text-[#5A3E32] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#F8F3EC]">
                  <p className="text-[10px] text-[#6E1F2B] font-bold uppercase tracking-wider">🔒 Pergunta para Recuperação de Senha:</p>
                  <select
                    value={regSecurityQ}
                    onChange={(e) => setRegSecurityQ(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8F3EC]/60 border border-[#E8D8C3] rounded-xl text-[#5A3E32] focus:outline-none"
                  >
                    <option>Qual o nome da sua primeira mentora de estilo?</option>
                    <option>Qual o nome do seu pet de estimação?</option>
                    <option>Qual o nome da cidade em que você nasceu?</option>
                    <option>Em que igreja ou local você costuma frequentar aos domingos?</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Sua resposta segura (para recuperação)"
                    value={regSecurityA}
                    onChange={(e) => setRegSecurityA(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F3EC]/30 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#6E1F2B] hover:bg-[#52131C] text-white font-semibold py-3.5 rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-md mt-4 flex items-center justify-center gap-2"
                >
                  Continuar para Diagnóstico de Estilo <ArrowRight size={16} />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentMode("login")}
                    className="text-xs text-[#8C8178] hover:underline"
                  >
                    Voltar para o Login
                  </button>
                </div>
              </form>
            )}

            {/* REGISTRATION STEP 2: CONSULTING QUESTIONNAIRE */}
            {regStep === 2 && (
              <div className="space-y-4 text-left max-h-[60vh] overflow-y-auto pr-2">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">Qual o seu Estilo Predominante?</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {["Elegante", "Clássico", "Confortável", "Casual", "Criativo"].map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setStylePreference(style)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${stylePreference === style ? "bg-[#5A3E32] border-[#5A3E32] text-white shadow-sm" : "bg-white border-[#E8D8C3] text-[#5A3E32] hover:bg-[#F8F3EC]/50"}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">Foco de Rotina Principal</label>
                  <select
                    value={mainRoutine}
                    onChange={(e) => setMainRoutine(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F3EC]/40 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] focus:outline-none"
                  >
                    <option>Maternidade & Home Office</option>
                    <option>Trabalho Corporativo / Comercial</option>
                    <option>Profissional Autônoma / Reuniões</option>
                    <option>Estudante & Assistências</option>
                    <option>Igrejas, Serviços & Comuidade</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">Para quais Ocasiões você se veste?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Trabalho", "Igreja", "Passeio", "Almoço de família", "Dia a dia", "Jantares especiais", "Viagens"].map((occ) => {
                      const active = selectedOccasions.includes(occ);
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => toggleOccasion(occ)}
                          className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all ${active ? "bg-[#6E1F2B] border-[#6E1F2B] text-white" : "bg-[#F8F3EC] border-[#E8D8C3] text-[#5A3E32] hover:bg-white"}`}
                        >
                          {occ} {active && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase block">Suas maiores Dificuldades ou Objetivos</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Ficar mais arrumada no dia a dia",
                      "Aproveitar minhas peças paradas",
                      "Visual elegante com conforto",
                      "Comprar de forma consciente",
                      "Diminuir o acúmulo de cores escuras"
                    ].map((goal) => {
                      const active = selectedStyleGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleStyleGoal(goal)}
                          className={`px-3 py-1.5 rounded-xl text-left text-[11px] border transition-all ${active ? "bg-[#B98A5A] border-[#B98A5A] text-white shadow" : "bg-white border-[#E8D8C3] text-[#5A3E32] hover:bg-[#F8F3EC]"}`}
                        >
                          {goal} {active && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5A3E32] uppercase tracking-wide block">Cores Favoritas</label>
                    <input
                      type="text"
                      value={lovedColors}
                      onChange={(e) => setLovedColors(e.target.value)}
                      placeholder="ex: Bege, Rosas, Off-white"
                      className="w-full px-3 py-2 bg-[#F8F3EC]/20 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#5A3E32] uppercase tracking-wide block">Cores que Evita</label>
                    <input
                      type="text"
                      value={avoidedColors}
                      onChange={(e) => setAvoidedColors(e.target.value)}
                      placeholder="ex: Verde limão, Neon"
                      className="w-full px-3 py-2 bg-[#F8F3EC]/20 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#F8F3EC]">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="w-1/3 bg-transparent hover:bg-[#F8F3EC] border border-[#E8D8C3] text-[#5A3E32] font-semibold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowLeft size={14} /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleRegisterComplete}
                    className="w-2/3 bg-[#5A3E32] hover:bg-[#422D24] text-white font-semibold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} className="text-emerald-300" /> Ativar meu Closet CHIC 🤎
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: FORGOT PASSWORD */}
        {currentMode === "forgot" && (
          <div className="p-8 sm:p-10 space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-[#F8F3EC] pb-4">
              <button
                type="button"
                onClick={() => { setCurrentMode("login"); setRecoveryStep(1); }}
                className="p-1 hover:bg-[#F8F3EC] rounded-lg text-[#5A3E32]"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#5A3E32]">Redefinir Senha</h2>
                <p className="text-[11px] text-[#8C8178]">Recupere seu acesso de forma transparente</p>
              </div>
            </div>

            {/* RECOVERY STEP 1: VERIFY EMAIL */}
            {recoveryStep === 1 && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase">Seu E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-[#8C8178]" />
                    <input
                      type="email"
                      placeholder="exemplo@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#F8F3EC]/30 border border-[#E8D8C3] rounded-2xl text-xs sm:text-sm text-[#5A3E32] focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#5A3E32] hover:bg-[#422D24] text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all"
                >
                  Pesquisar Minha Conta 🕵️‍♀️
                </button>
              </form>
            )}

            {/* RECOVERY STEP 2: CHECK SECURITY QUESTION */}
            {recoveryStep === 2 && recoveredUser && (
              <form onSubmit={handleVerifySecurity} className="space-y-4">
                <div className="bg-[#F8F3EC] p-4 rounded-2xl border border-[#E8D8C3]">
                  <p className="text-[10px] text-[#6E1F2B] uppercase font-bold tracking-wider">Pergunta de Segurança:</p>
                  <p className="text-sm font-serif font-semibold text-[#5A3E32] mt-1">{securityQuestion}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase">Sua Resposta Cadastrada</label>
                  <input
                    type="text"
                    placeholder="Sua resposta secreta"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8D8C3] rounded-2xl text-xs sm:text-sm text-[#5A3E32] focus:outline-none"
                    required
                  />
                  <p className="text-[10px] text-[#8C8178]">A resposta não diferencia maiúsculas de minúsculas.</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#6E1F2B] hover:bg-[#52131C] text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all"
                >
                  Validar Resposta ✓
                </button>
              </form>
            )}

            {/* RECOVERY STEP 3: NEW PASSWORD */}
            {recoveryStep === 3 && recoveredUser && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5A3E32] uppercase">Cadastrar Nova Senha</label>
                  <input
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8D8C3] rounded-2xl text-xs sm:text-sm text-[#5A3E32] focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-2xl text-xs sm:text-sm transition-all"
                >
                  Confirmar Nova Senha e Fazer Login ✨
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
