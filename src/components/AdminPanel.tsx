import React, { useState, useEffect } from "react";
import { UserAccount, ClosetItem, Outfit } from "../types";
import {
  Users,
  Search,
  Lock,
  Unlock,
  MessageSquare,
  Shield,
  Activity,
  AlertTriangle,
  UserPlus,
  ArrowLeft,
  X,
  Sparkles,
  Layers,
  Heart,
  ChevronRight
} from "lucide-react";
import { ClothesIllustration } from "./ClothesIllustrations";

interface AdminPanelProps {
  adminUser: UserAccount;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export default function AdminPanel({ adminUser, onLogout, showToast }: AdminPanelProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  
  // Custom tip states
  const [editingTipUserId, setEditingTipUserId] = useState<string | null>(null);
  const [tempTipText, setTempTipText] = useState("");

  // Inspect user states
  const [userCloset, setUserCloset] = useState<ClosetItem[]>([]);
  const [userOutfits, setUserOutfits] = useState<Outfit[]>([]);

  // Create accounts states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccEmail, setNewAccEmail] = useState("");
  const [newAccPassword, setNewAccPassword] = useState("");
  const [newAccRole, setNewAccRole] = useState<"user" | "admin">("user");

  // Load database on start
  useEffect(() => {
    loadDatabase();
  }, []);

  const loadDatabase = () => {
    const saved = localStorage.getItem("closet_lay_users_db");
    if (saved) {
      setUsers(JSON.parse(saved));
    }
  };

  const saveDatabase = (updatedList: UserAccount[]) => {
    setUsers(updatedList);
    localStorage.setItem("closet_lay_users_db", JSON.stringify(updatedList));
  };

  // Safe loading of individual user items for inspection
  const inspectUser = (user: UserAccount) => {
    setSelectedUser(user);
    
    // Load their specific closet
    const savedCloset = localStorage.getItem(`closet_lay_${user.id}_closet`);
    const savedOutfits = localStorage.getItem(`closet_lay_${user.id}_outfits`);
    
    try {
      setUserCloset(savedCloset ? JSON.parse(savedCloset) : []);
      setUserOutfits(savedOutfits ? JSON.parse(savedOutfits) : []);
    } catch (e) {
      setUserCloset([]);
      setUserOutfits([]);
    }

    setTempTipText(user.customTipFromLay || "");
  };

  const handleToggleBlock = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        if (u.role === "admin") {
          showToast("Não é possível suspender um administrador principal.");
          return u;
        }
        const nextStatus = u.status === "active" ? "blocked" : "active";
        showToast(`Status da usuária alterado para: ${nextStatus === "active" ? "Ativa" : "Bloqueada"}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveDatabase(updated);
    
    // Update active inspections
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: prev.status === "active" ? "blocked" : "active" } : null);
    }
  };

  const handleSaveTip = (userId: string) => {
    if (!tempTipText.trim()) {
      showToast("Escreva uma dica carinhosa antes de enviar.");
      return;
    }

    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, customTipFromLay: tempTipText.trim() };
      }
      return u;
    });
    saveDatabase(updated);
    setEditingTipUserId(null);
    showToast("Dica e consultoria enviadas direto para o painel dela! 🤎");
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, customTipFromLay: tempTipText.trim() } : null);
    }
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccEmail || !newAccPassword) {
      showToast("Preencha todos os campos do formulário administrative.");
      return;
    }

    const exists = users.some(u => u.email.toLowerCase() === newAccEmail.trim().toLowerCase());
    if (exists) {
      showToast("Já existe uma conta registrada com este e-mail.");
      return;
    }

    const newAcc: UserAccount = {
      id: "user_" + Date.now(),
      email: newAccEmail.trim().toLowerCase(),
      name: newAccName,
      password: newAccPassword,
      role: newAccRole,
      status: "active",
      createdAt: new Date().toISOString(),
      profileSetupCompleted: true,
      securityQuestion: "Qual o nome da sua primeira mentora de estilo?",
      securityAnswer: "lay",
      customTipFromLay: newAccRole === "user" ? "Parabéns, sua conta foi criada administrativamente! Adicione suas roupas." : ""
    };

    saveDatabase([...users, newAcc]);
    showToast(`Conta de ${newAccName} (${newAccRole}) criada com sucesso! ✨`);
    
    // Reset Form
    setNewAccName("");
    setNewAccEmail("");
    setNewAccPassword("");
    setNewAccRole("user");
    setShowCreateForm(false);
  };

  // Computing summary metrics
  const totalMembers = users.filter(u => u.role === "user").length;
  const activeMembers = users.filter(u => u.role === "user" && u.status === "active").length;
  const blockedMembers = users.filter(u => u.role === "user" && u.status === "blocked").length;
  
  // Heuristic total garments count across all registered users
  let totalGarments = 0;
  users.forEach(u => {
    const jsonCloset = localStorage.getItem(`closet_lay_${u.id}_closet`);
    if (jsonCloset) {
      try {
        const list = JSON.parse(jsonCloset);
        totalGarments += Array.isArray(list) ? list.length : 0;
      } catch (err) {}
    }
  });

  const avgGarments = totalMembers > 0 ? (totalGarments / totalMembers).toFixed(1) : "0";

  // Search filter
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in py-4">
      
      {/* ADMIN HUB HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#5A3E32] to-[#422D24] rounded-[28px] p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/5 rounded-tl-full pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#E8D8C3]" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E8D8C3]">PAINEL DO ADMINISTRADOR (ADMIN)</span>
          </div>
          <h1 className="text-3xl font-serif font-bold">Olá, {adminUser.name}</h1>
          <p className="text-xs text-[#E8D8C3]/80">Plataforma centralizada de consultoria, cadastros e monitoramento das alunas da Lay.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2 relative z-10">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white hover:bg-[#F8F3EC] text-[#5A3E32] px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <UserPlus size={14} /> Registrar Conta
          </button>
          <button
            onClick={onLogout}
            className="bg-[#6E1F2B] hover:bg-[#52131C] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow"
          >
            Sair do Painel
          </button>
        </div>
      </div>

      {/* ADMIN METRICS DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E8D8C3] shadow-[0_5px_15px_rgba(90,62,50,0.02)] flex items-center gap-4">
          <div className="p-3 bg-[#E8D8C3]/40 rounded-2xl text-[#5A3E32]">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C8178] block">Inscrições</span>
            <p className="text-2xl font-serif font-black text-[#5A3E32]">{totalMembers}</p>
            <span className="text-[9px] text-[#8C8178]">{activeMembers} ativas / {blockedMembers} suspensas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8D8C3] shadow-[0_5px_15px_rgba(90,62,50,0.02)] flex items-center gap-4">
          <div className="p-3 bg-[#E8D8C3]/40 rounded-2xl text-[#5A3E32]">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C8178] block">Total de Peças</span>
            <p className="text-2xl font-serif font-black text-[#5A3E32]">{totalGarments}</p>
            <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">Média de {avgGarments} p/ closet</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8D8C3] shadow-[0_5px_15px_rgba(90,62,50,0.02)] flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl text-[#6E1F2B]">
            <Activity size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C8178] block">Interações Realizadas</span>
            <p className="text-2xl font-serif font-black text-[#6E1F2B]">87%</p>
            <span className="text-[9px] text-[#8C8178]">Sucesso de engajamento diário</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8D8C3] shadow-[0_5px_15px_rgba(90,62,50,0.02)] flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-700">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8C8178] block">Conselho da Lay</span>
            <p className="text-2xl font-serif font-black text-amber-800">Ativo</p>
            <span className="text-[9px] text-[#8C8178]">Personalização integral de estilo</span>
          </div>
        </div>
      </div>

      {/* QUICK SYSTEM ACCOUNT POPUP */}
      {showCreateForm && (
        <div className="bg-[#F8F3EC] p-6 rounded-3xl border border-[#E8D8C3] space-y-4 animate-fade-in relative">
          <button
            onClick={() => setShowCreateForm(false)}
            className="absolute top-4 right-4 p-1 hover:bg-[#E8D8C3] rounded-full text-[#5A3E32]"
          >
            <X size={18} />
          </button>
          <h3 className="text-lg font-serif font-extrabold text-[#5A3E32] flex items-center gap-1.5">
            <UserPlus size={18} />
            <span>Adicionar Novo Membro ou Administrador</span>
          </h3>

          <form onSubmit={handleCreateAccountSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#5A3E32]">Nome Completo</label>
              <input
                type="text"
                placeholder="Nome da aluna"
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8D8C3] rounded-xl text-[#5A3E32] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#5A3E32]">E-mail</label>
              <input
                type="email"
                placeholder="exemplo@gmail.com"
                value={newAccEmail}
                onChange={(e) => setNewAccEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8D8C3] rounded-xl text-[#5A3E32] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#5A3E32]">Senha de Acesso</label>
              <input
                type="text"
                placeholder="Senha de entrada"
                value={newAccPassword}
                onChange={(e) => setNewAccPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8D8C3] rounded-xl text-[#5A3E32] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#5A3E32]">Cargo / Permissões</label>
              <select
                value={newAccRole}
                onChange={(e) => setNewAccRole(e.target.value as "user" | "admin")}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8D8C3] rounded-xl text-[#5A3E32] focus:outline-none"
              >
                <option value="user">Cliente Cadastrada (Membro)</option>
                <option value="admin">Consultora Admin de Estilo</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="bg-[#5A3E32] hover:bg-[#422D24] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow"
              >
                Salvar Cadastro Único
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TWO COLUMN INTERACTION: MEMBERS LIST & DETAILED INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE REGISTERED ACCOUNTS */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] overflow-hidden">
          
          <div className="p-6 border-b border-[#F8F3EC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#5A3E32]">Lista das Cadastradas</h2>
              <p className="text-xs text-[#8C8178]">Monitoramento, status e acesso à consultoria.</p>
            </div>
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-3 text-[#8C8178]" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-[#F8F3EC]/50 border border-[#E8D8C3] rounded-xl text-xs text-[#5A3E32] focus:outline-none focus:ring-1 focus:ring-[#5A3E32]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F3EC]/50 text-[#5A3E32] text-[10px] font-bold uppercase tracking-wider border-b border-[#E8D8C3]">
                  <th className="p-4 pl-6">Nome Completo / Perfil</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Ações de Consultoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F3EC]">
                {filteredUsers.map((user) => {
                  const isCurSelected = selectedUser?.id === user.id;
                  const isBlocked = user.status === "blocked";
                  
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#F8F3EC]/20 transition-all ${isCurSelected ? "bg-[#F8F3EC]/40" : ""}`}
                    >
                      <td className="p-4 pl-6">
                        <div className="space-y-0.5 cursor-pointer" onClick={() => inspectUser(user)}>
                          <p className="font-serif font-bold text-[#5A3E32] hover:underline flex items-center gap-1">
                            {user.name}
                            {user.customTipFromLay && (
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" title="Possui dica enviada" />
                            )}
                          </p>
                          <p className="text-[11px] text-[#8C8178]">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${user.role === "admin" ? "bg-red-50 text-[#6E1F2B]" : "bg-emerald-50 text-emerald-800"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${isBlocked ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {isBlocked ? "Suspenso" : "Ativo"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        <button
                          onClick={() => inspectUser(user)}
                          className="px-2.5 py-1.5 bg-[#F8F3EC] hover:bg-[#E8D8C3]/50 text-[#5A3E32] text-[11px] font-bold rounded-lg transition-all"
                          title="Inspecionar Closet"
                        >
                          Closet
                        </button>
                        <button
                          onClick={() => handleToggleBlock(user.id)}
                          className={`p-1.5 rounded-lg border transition-all ${isBlocked ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
                          title={isBlocked ? "Desbloquear" : "Bloquear"}
                          disabled={user.role === "admin"}
                        >
                          {isBlocked ? <Unlock size={12} /> : <Lock size={12} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs text-[#8C8178] italic">
                      Nenhuma aluna ou conta coincide com a pesquisa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTOR DRAWER / CONSULTANCY CONSOLE */}
        <div className="lg:col-span-5 space-y-6">
          {selectedUser ? (
            <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-6 animate-fade-in relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-1 hover:bg-[#F8F3EC] rounded-full text-[#8C8178]"
              >
                <X size={16} />
              </button>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-[#6E1F2B] tracking-wider block">Inspeção Detalhada</span>
                <h3 className="text-xl font-serif font-black text-[#5A3E32]">{selectedUser.name}</h3>
                <p className="text-xs text-[#8C8178]">{selectedUser.email}</p>
              </div>

              {/* CLOSET SUMMARY STATS */}
              <div className="grid grid-cols-2 gap-3 bg-[#F8F3EC]/50 p-4 rounded-2xl border border-[#E8D8C3]/55">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-[#8C8178] block">Peças Cadastradas</span>
                  <span className="text-xl font-serif font-black text-[#5A3E32]">{userCloset.length}</span>
                </div>
                <div className="text-center border-l border-[#E8D8C3]/50">
                  <span className="text-[10px] uppercase font-bold text-[#8C8178] block">Looks Montados</span>
                  <span className="text-xl font-serif font-black text-[#6E1F2B]">{userOutfits.length}</span>
                </div>
              </div>

              {/* CUSTOM TOQUE DA LAY ADVICE TIP */}
              <div className="space-y-3 pt-3 border-t border-[#F8F3EC]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5A3E32] flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Dica e Orientação Customizada da Lay</span>
                  </span>
                  {editingTipUserId !== selectedUser.id && (
                    <button
                      onClick={() => {
                        setEditingTipUserId(selectedUser.id);
                        setTempTipText(selectedUser.customTipFromLay || "");
                      }}
                      className="text-xs text-[#6E1F2B] font-bold hover:underline"
                    >
                      {selectedUser.customTipFromLay ? "Modificar" : "Escrever"}
                    </button>
                  )}
                </div>

                {editingTipUserId === selectedUser.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={tempTipText}
                      onChange={(e) => setTempTipText(e.target.value)}
                      placeholder="Mariana, percebi que você tem muitas calças neutras. Recomendo usar sua saia midi plissada preta com blusa off-white..."
                      className="w-full p-3 text-xs bg-[#F8F3EC]/20 border border-[#E8D8C3] rounded-2xl text-[#5A3E32] focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingTipUserId(null)}
                        className="px-3 py-1.5 border border-[#E8D8C3] text-[#5A3E32] rounded-xl text-[11px] font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveTip(selectedUser.id)}
                        className="px-4 py-1.5 bg-[#6E1F2B] hover:bg-[#52131C] text-white rounded-xl text-[11px] font-bold shadow-sm"
                      >
                        Enviar para Ela 🤎
                      </button>
                    </div>
                  </div>
                ) : selectedUser.customTipFromLay ? (
                  <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100 italic text-xs text-[#5A3E32] leading-relaxed">
                    “{selectedUser.customTipFromLay}”
                  </div>
                ) : (
                  <p className="text-xs text-[#8C8178] italic">Nenhum conselho pessoal cadastrado ainda. Clique em Escrever para guiar Mariana.</p>
                )}
              </div>

              {/* INVENTORIES CAPSULE VIEW */}
              <div className="space-y-3 pt-3 border-t border-[#F8F3EC]">
                <span className="text-xs font-bold text-[#5A3E32] block">Guarda-roupa Virtual dela ({userCloset.length})</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {userCloset.slice(0, 8).map((item) => (
                    <div key={item.id} className="p-1 px-1.5 bg-white border border-[#E8D8C3]/50 rounded-xl space-y-1">
                      <div className="w-8 h-8 mx-auto">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain rounded" />
                        ) : (
                          <ClothesIllustration category={item.category} color={item.mainColor} />
                        )}
                      </div>
                      <p className="text-[9px] text-[#5A3E32] font-semibold truncate" title={item.name}>{item.name}</p>
                    </div>
                  ))}
                  {userCloset.length === 0 && (
                    <p className="col-span-4 text-xs text-[#8C8178] italic text-center py-4">Este closet está vazio.</p>
                  )}
                </div>
              </div>

              {/* OUTFITS CAPSULE VIEW */}
              <div className="space-y-3 pt-3 border-t border-[#F8F3EC]">
                <span className="text-xs font-bold text-[#5A3E32] block">Looks Criados ({userOutfits.length})</span>
                <div className="space-y-2">
                  {userOutfits.slice(0, 3).map((outfit) => (
                    <div key={outfit.id} className="p-3 bg-[#F8F3EC]/30 rounded-xl border border-[#E8D8C3]/40 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-serif font-black text-[#5A3E32]">{outfit.name}</p>
                        <p className="text-[10px] text-[#8C8178]">Ocasião: {outfit.occasion}</p>
                      </div>
                      <ChevronRight size={14} className="text-[#8C8178]" />
                    </div>
                  ))}
                  {userOutfits.length === 0 && (
                    <p className="text-xs text-[#8C8178] italic py-2">Nenhum look customizado ainda.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#F8F3EC]/40 rounded-3xl border border-dashed border-[#E8D8C3] p-12 text-center text-[#8C8178] space-y-3 select-none">
              <Users size={32} className="mx-auto text-[#E8D8C3]" />
              <h3 className="font-serif font-bold text-[#5A3E32]">Nenhuma Aluna Selecionada</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed">Clique no nome de qualquer cadastrada na lista ao lado para ver o seu guarda-roupa virtual, looks montados e dar suas dicas oficiais de estilo da Lay 💋</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
