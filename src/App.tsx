import React, { useState, useEffect } from "react";
import {
  Camera,
  Upload,
  Plus,
  Heart,
  Calendar,
  Compass,
  ShoppingBag,
  User,
  Info,
  Check,
  Trash2,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Star,
  Tag,
  AlertTriangle,
  Sparkles,
  Share2,
  Download,
  Eye,
  Edit2,
  CheckCircle2,
  ChevronRight,
  X,
  Clock,
  Printer,
  Briefcase,
  Palette
} from "lucide-react";
import { ClosetItem, Outfit, UserProfile, ShoppingRecommendation, WeeklyPlanner, PurchaseCandidate, UserAccount } from "./types";
import { ClothesIllustration } from "./components/ClothesIllustrations";
import AuthSystem from "./components/AuthSystem";
import AdminPanel from "./components/AdminPanel";
import MemberTipBanner from "./components/MemberTipBanner";
import LandingPage from "./components/LandingPage";
import ColorAnalysis from "./components/ColorAnalysis";
import TravelSuitcase from "./components/TravelSuitcase";
import WhatsAppShareModal from "./components/WhatsAppShareModal";
import {
  validateImageFile,
  resizeAndCompressImage,
  formatFileSize
} from "./lib/imageUtils";
import { apiFetch } from "./lib/apiClient";
import {
  INITIAL_PROFILE,
  INITIAL_CLOSET,
  INITIAL_OUTFITS,
  INITIAL_SHOPPING_RECOMMENDATIONS,
  INITIAL_WEEKLY_PLANNER,
  loadData,
  saveData
} from "./lib/closetData";

export default function App() {
  // --- Auth Session State ---
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = sessionStorage.getItem("closet_lay_active_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error reading currentUser from sessionStorage:", e);
      return null;
    }
  });
  const [showAuthOverlay, setShowAuthOverlay] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");

  // --- Dynamic Multi-User Scoped States ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const active = sessionStorage.getItem("closet_lay_active_user");
      if (active) {
        const u = JSON.parse(active);
        return loadData(`${u.id}_profile`, { ...INITIAL_PROFILE, id: u.id, name: u.name });
      }
    } catch (e) {
      console.error("Error reading profile:", e);
    }
    return INITIAL_PROFILE;
  });

  const [closet, setCloset] = useState<ClosetItem[]>(() => {
    try {
      const active = sessionStorage.getItem("closet_lay_active_user");
      if (active) {
        const u = JSON.parse(active);
        return loadData(`${u.id}_closet`, u.id === "user_mariana" ? INITIAL_CLOSET : []);
      }
    } catch (e) {
      console.error("Error reading closet:", e);
    }
    return INITIAL_CLOSET;
  });

  const [outfits, setOutfits] = useState<Outfit[]>(() => {
    try {
      const active = sessionStorage.getItem("closet_lay_active_user");
      if (active) {
        const u = JSON.parse(active);
        return loadData(`${u.id}_outfits`, u.id === "user_mariana" ? INITIAL_OUTFITS : []);
      }
    } catch (e) {
      console.error("Error reading outfits:", e);
    }
    return INITIAL_OUTFITS;
  });

  const [shoppingRecs, setShoppingRecs] = useState<ShoppingRecommendation[]>(() => {
    try {
      const active = sessionStorage.getItem("closet_lay_active_user");
      if (active) {
        const u = JSON.parse(active);
        return loadData(`${u.id}_shopping_recs`, u.id === "user_mariana" ? INITIAL_SHOPPING_RECOMMENDATIONS : []);
      }
    } catch (e) {
      console.error("Error reading shoppingRecs:", e);
    }
    return INITIAL_SHOPPING_RECOMMENDATIONS;
  });

  const [weeklyPlanner, setWeeklyPlanner] = useState<WeeklyPlanner>(() => {
    try {
      const active = sessionStorage.getItem("closet_lay_active_user");
      if (active) {
        const u = JSON.parse(active);
        return loadData(`${u.id}_weekly_planner`, u.id === "user_mariana" ? INITIAL_WEEKLY_PLANNER : {});
      }
    } catch (e) {
      console.error("Error reading weeklyPlanner:", e);
    }
    return INITIAL_WEEKLY_PLANNER;
  });

  // --- Sync Multi-User Session Data on Login/Logout ---
  useEffect(() => {
    if (currentUser) {
      const isMariana = currentUser.id === "user_mariana";
      setProfile(loadData(`${currentUser.id}_profile`, { ...INITIAL_PROFILE, id: currentUser.id, name: currentUser.name }));
      setCloset(loadData(`${currentUser.id}_closet`, isMariana ? INITIAL_CLOSET : []));
      setOutfits(loadData(`${currentUser.id}_outfits`, isMariana ? INITIAL_OUTFITS : []));
      setShoppingRecs(loadData(`${currentUser.id}_shopping_recs`, isMariana ? INITIAL_SHOPPING_RECOMMENDATIONS : []));
      setWeeklyPlanner(loadData(`${currentUser.id}_weekly_planner`, isMariana ? INITIAL_WEEKLY_PLANNER : {}));
      setCurrentTab("home");
    } else {
      setProfile(INITIAL_PROFILE);
      setCloset([]);
      setOutfits([]);
      setShoppingRecs([]);
      setWeeklyPlanner({});
    }
  }, [currentUser]);

  // --- UI Layout and Tab Control ---
  const [currentTab, setCurrentTab] = useState<string>("home"); // home, dashboard, closet, add-piece, combina, looks, planner, shopping, profile
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null);
  const [viewingSharedOutfit, setViewingSharedOutfit] = useState<Outfit | null>(null);
  const [whatsAppShareOutfit, setWhatsAppShareOutfit] = useState<Outfit | null>(null);
  const [whatsAppShareDay, setWhatsAppShareDay] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Find last worn date for the selectedItem ---
  const getSelectedItemWornDetails = () => {
    if (!selectedItem) return { latestWornDateStr: null, formattedLastWorn: "", timeAgoText: "" };
    
    const itemOutfits = outfits.filter(out => out.itemIds.includes(selectedItem.id));
    const allWornDates = itemOutfits.flatMap(out => out.wornDates || []);
    const sortedWornDatesStr = [...allWornDates].sort((a, b) => b.localeCompare(a));
    const latestWornDateStr = sortedWornDatesStr[0];
    
    if (!latestWornDateStr) {
      return { latestWornDateStr: null, formattedLastWorn: "", timeAgoText: "Ainda não usado" };
    }
    
    const parts = latestWornDateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const lastWornDate = new Date(year, month, day);
    const formattedLastWorn = lastWornDate.toLocaleDateString("pt-BR");
    
    // Today's date with time stripped for accurate day difference count
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = todayZero.getTime() - lastWornDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let timeAgoText = "";
    if (diffDays === 0) {
      timeAgoText = "Hoje mesmo! ✨";
    } else if (diffDays === 1) {
      timeAgoText = "Ontem 👕";
    } else {
      timeAgoText = `há ${diffDays} dias 🗓️`;
    }
    
    return { latestWornDateStr, formattedLastWorn, timeAgoText };
  };

  const getItemWornStatus = (itemId: string) => {
    const itemOutfits = outfits.filter(out => out.itemIds.includes(itemId));
    const allWornDates = itemOutfits.flatMap(out => out.wornDates || []);
    if (allWornDates.length === 0) {
      return { showAlert: true, isNeverWorn: true, description: "Nunca usada" };
    }
    const sortedWornDatesStr = [...allWornDates].sort((a, b) => b.localeCompare(a));
    const latestWornDateStr = sortedWornDatesStr[0];
    
    const parts = latestWornDateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const lastWornDate = new Date(year, month, day);
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = todayZero.getTime() - lastWornDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const sixMonthsDays = 182;
    if (diffDays >= sixMonthsDays) {
      const months = Math.floor(diffDays / 30);
      return { showAlert: true, isNeverWorn: false, description: `Sem uso há +${months}m` };
    }
    return { showAlert: false, isNeverWorn: false, description: "" };
  };

  const { latestWornDateStr, formattedLastWorn, timeAgoText } = getSelectedItemWornDetails();

  // --- Filtering & Searching in Closet ---
  const [filterCategory, setFilterCategory] = useState<string>("todas");
  const [filterColor, setFilterColor] = useState<string>("todas");
  const [filterOccasion, setFilterOccasion] = useState<string>("todas");
  const [filterLookFavorites, setFilterLookFavorites] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // --- Add Piece State ---
  const [isAnalyzingNew, setIsAnalyzingNew] = useState<boolean>(false);
  const [newPieceForm, setNewPieceForm] = useState<Partial<ClosetItem>>({
    name: "",
    category: "blusa",
    subcategory: "",
    mainColor: "Bege",
    pattern: "Liso",
    fabric: "Algodão",
    fit: "Reta",
    season: "Todas as estações",
    occasions: ["Passeio"],
    styleTags: ["Casual"],
    loveLevel: 4,
    frequencyOfUse: "Uso médio",
    difficultyToStyle: "Fácil",
    versatilityScore: 70,
    notes: ""
  });
  const [newPieceImage, setNewPieceImage] = useState<string>(""); // base64 representation of item
  const [newPieceThumbnail, setNewPieceThumbnail] = useState<string>("");
  const [newPieceImageMeta, setNewPieceImageMeta] = useState<any | null>(null);
  const [newPieceCompressionStatus, setNewPieceCompressionStatus] = useState<string>("");
  const [analyzeFeedback, setAnalyzeFeedback] = useState<string>("");
  const [customOccasions, setCustomOccasions] = useState<string[]>([]);
  const [typedOccasion, setTypedOccasion] = useState<string>("");

  // --- Combina Comigo (Purchase Evaluator) State ---
  const [candImage, setCandImage] = useState<string>("");
  const [candThumbnail, setCandThumbnail] = useState<string>("");
  const [candImageMeta, setCandImageMeta] = useState<any | null>(null);
  const [candCompressionStatus, setCandCompressionStatus] = useState<string>("");
  const [candForm, setCandForm] = useState<any>({
    name: "Novo Blazer Bege",
    category: "blazer",
    subcategory: "blazer alongado",
    mainColor: "Bege",
    secondaryColors: [],
    pattern: "Liso",
    fabric: "Crepe",
    fit: "Estruturado",
    season: ["Meia-estação"],
    occasions: ["Trabalho", "Igreja", "Passeio"],
    styleTags: ["Elegante", "Clássico"],
    formalityLevel: 7,
    versatilityScore: 8,
    visualWarnings: [],
    confidence: 1.0
  });
  const [isAnalyzingCandidate, setIsAnalyzingCandidate] = useState<boolean>(false);
  const [candAnalysisFeedback, setCandAnalysisFeedback] = useState<string>("");
  const [isEvaluatingCHIC, setIsEvaluatingCHIC] = useState<boolean>(false);
  const [chicResult, setChicResult] = useState<any | null>(null);

  // --- Auto Save State Churns (Multi-User Scoped) ---
  useEffect(() => {
    if (currentUser && currentUser.role === "user") {
      saveData(`${currentUser.id}_profile`, profile);
    }
  }, [profile, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === "user") {
      saveData(`${currentUser.id}_closet`, closet);
    }
  }, [closet, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === "user") {
      saveData(`${currentUser.id}_outfits`, outfits);
    }
  }, [outfits, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === "user") {
      saveData(`${currentUser.id}_shopping_recs`, shoppingRecs);
    }
  }, [shoppingRecs, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === "user") {
      saveData(`${currentUser.id}_weekly_planner`, weeklyPlanner);
    }
  }, [weeklyPlanner, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const clearNewPieceImage = () => {
    setNewPieceImage("");
    setNewPieceThumbnail("");
    setNewPieceImageMeta(null);
    setNewPieceCompressionStatus("");
  };

  const clearCandImage = () => {
    setCandImage("");
    setCandThumbnail("");
    setCandImageMeta(null);
    setCandCompressionStatus("");
    setChicResult(null);
  };

  // --- Helpers for File Reading (Optimized and Compressed) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "newPiece" | "candidate") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showToast(validation.error || "Arquivo inválido.");
      return;
    }

    if (target === "newPiece") {
      setNewPieceCompressionStatus("Preparando sua foto…");
      try {
        const compressed = await resizeAndCompressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.78,
          generateThumbnail: true,
          thumbnailMaxWidth: 400,
          thumbnailMaxHeight: 400
        });

        setNewPieceImage(compressed.dataUrl);
        setNewPieceThumbnail(compressed.thumbnailDataUrl || "");
        setNewPieceImageMeta({
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          compressionRatio: compressed.compressionRatio,
          width: compressed.width,
          height: compressed.height,
          mimeType: compressed.mimeType
        });

        // Inform user about optimization success
        const origSizeStr = formatFileSize(compressed.originalSize);
        const compSizeStr = formatFileSize(compressed.compressedSize);
        const reductionPct = Math.round(compressed.compressionRatio * 100);
        setNewPieceCompressionStatus("Foto adicionada com sucesso.");

        // Trigger Server-side AI analyze immediately with optimized/compressed file
        triggerGeminiAnalyze(compressed.dataUrl, file.name, compressed.mimeType);

      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Não consegui preparar essa imagem.");
        clearNewPieceImage();
      }
    } else {
      setCandCompressionStatus("Preparando sua foto…");
      try {
        const compressed = await resizeAndCompressImage(file, {
          maxWidth: 1400,
          maxHeight: 1400,
          quality: 0.82,
          generateThumbnail: true,
          thumbnailMaxWidth: 400,
          thumbnailMaxHeight: 400
        });

        setCandImage(compressed.dataUrl);
        setCandThumbnail(compressed.thumbnailDataUrl || "");
        setCandImageMeta({
          originalSize: compressed.originalSize,
          compressedSize: compressed.compressedSize,
          compressionRatio: compressed.compressionRatio,
          width: compressed.width,
          height: compressed.height,
          mimeType: compressed.mimeType
        });

        // Clean previous results
        setChicResult(null);

        // Inform user about optimization success
        const origSizeStr = formatFileSize(compressed.originalSize);
        const compSizeStr = formatFileSize(compressed.compressedSize);
        const reductionPct = Math.round(compressed.compressionRatio * 100);
        setCandCompressionStatus("Foto adicionada com sucesso.");

        // Trigger Server-side Candidate Image analysis with optimized/compressed file
        triggerCandidateImageAnalyze(compressed.dataUrl, file.name, compressed.mimeType);

      } catch (err: any) {
        console.error(err);
        showToast(err.message || "Não consegui preparar essa imagem.");
        clearCandImage();
      }
    }
  };

  // --- Server-side API Trigger: Gemini Analyze (Add Item) ---
  const triggerGeminiAnalyze = async (base64Data: string, name: string, mimeType: string) => {
    setIsAnalyzingNew(true);
    setAnalyzeFeedback("Lay está analisando sua peça com muito amor... 🤎");
    try {
      const data = await apiFetch<any>("/api/analyze-image", {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64Data, fileName: name, mimeType })
      });

      setNewPieceForm({
        name: data.name || "Peça Analisada",
        category: data.category || "blusa",
        subcategory: data.subcategory || "",
        mainColor: data.mainColor || "Bege",
        pattern: data.pattern || "Liso",
        fabric: data.fabric || "Algodão",
        fit: data.fit || "Reta",
        season: data.season || "Todas as estações",
        occasions: data.occasions || ["Passeio"],
        styleTags: data.styleTags || ["Casual"],
        loveLevel: 4,
        frequencyOfUse: "Uso médio",
        difficultyToStyle: "Fácil",
        versatilityScore: data.versatilityScore || 75,
        notes: data.layVerdict || ""
      });
      setAnalyzeFeedback("Prontinho! Lay já preencheu os detalhes de estilo para você ✨");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Não consegui analisar com a IA.");
      setAnalyzeFeedback("Preencha os detalhes da sua peça abaixo... 🤎");
    } finally {
      setIsAnalyzingNew(false);
    }
  };

  // --- Server-side API Trigger: Gemini Analyze Candidate ---
  const triggerCandidateImageAnalyze = async (base64Data: string, name: string, mimeType: string) => {
    setIsAnalyzingCandidate(true);
    setCandAnalysisFeedback("Analisando a peça...");
    try {
      const data = await apiFetch<any>("/api/analyze-candidate-image", {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64Data, fileName: name, mimeType })
      });

      setCandForm({
        name: data.name || "Peça de Roupa",
        category: data.category || "blusa",
        subcategory: data.subcategory || "",
        mainColor: data.mainColor || "Bege",
        secondaryColors: data.secondaryColors || [],
        pattern: data.pattern || "Liso",
        fabric: data.fabric || "Algodão",
        fit: data.fit || "Reta",
        season: data.season || ["Todas as estações"],
        occasions: data.occasions || ["Passeio"],
        styleTags: data.styleTags || ["Casual"],
        formalityLevel: data.formalityLevel || 5,
        versatilityScore: data.versatilityScore || 7,
        visualWarnings: data.visualWarnings || [],
        confidence: data.confidence || 0.8
      });
      setCandAnalysisFeedback("Confira se a IA entendeu certinho. Caso queira melhorar algo, mude as informações abaixo! ✨");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Não foi possível analisar com a IA.");
      setCandAnalysisFeedback("Sentiu alguma dúvida? Sinta-se livre para preencher os dados abaixo!");
    } finally {
      setIsAnalyzingCandidate(false);
    }
  };

  // --- Server-side API Trigger: CHIC Method Evaluator ---
  const triggerCHICEvaluation = async () => {
    if (!candImage) {
      showToast("Tire ou envie uma foto da peça que deseja avaliar primeiro.");
      return;
    }
    setIsEvaluatingCHIC(true);
    try {
      const data = await apiFetch<any>("/api/evaluate-purchase", {
        method: "POST",
        body: JSON.stringify({
          candidateItem: candForm,
          closetItems: closet,
          userProfile: profile
        })
      });
      setChicResult(data);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Erro de conexão com o servidor. Usando o método CHIC local.");
    } finally {
      setIsEvaluatingCHIC(false);
    }
  };

  const handleAddCustomOccasion = () => {
    const trimmed = typedOccasion.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!customOccasions.includes(formatted)) {
      setCustomOccasions(prev => [...prev, formatted]);
    }
    const currentOccasions = newPieceForm.occasions || [];
    if (!currentOccasions.includes(formatted)) {
      setNewPieceForm(prev => ({
        ...prev,
        occasions: [...currentOccasions, formatted]
      }));
    }
    setTypedOccasion("");
    showToast(`Ocasião "${formatted}" criada e selecionada! 📍`);
  };

  // --- Add New Piece permanently to list ---
  const saveNewPieceToCloset = () => {
    if (!newPieceForm.name) {
      showToast("Por favor, dê um nome elegante para a peça.");
      return;
    }
    const item: ClosetItem = {
      id: "item_" + Date.now(),
      name: newPieceForm.name,
      category: newPieceForm.category || "blusa",
      subcategory: newPieceForm.subcategory,
      mainColor: newPieceForm.mainColor || "Bege",
      pattern: newPieceForm.pattern,
      fabric: newPieceForm.fabric,
      fit: newPieceForm.fit,
      season: newPieceForm.season,
      occasions: newPieceForm.occasions || ["Passeio"],
      styleTags: newPieceForm.styleTags || ["Casual"],
      loveLevel: newPieceForm.loveLevel || 4,
      frequencyOfUse: newPieceForm.frequencyOfUse || "Uso médio",
      difficultyToStyle: newPieceForm.difficultyToStyle || "Fácil",
      versatilityScore: newPieceForm.versatilityScore || 70,
      notes: newPieceForm.notes,
      /* 
       * NOTA DE PRODUÇÃO: Atualmente as imagens comprimidas em WebP/JPEG são salvas em Base64 no closet
       * para persistência offline leve no localStorage sem estourar o limite de 5MB.
       * 
       * Para produção em escala real:
       * 1. Faça o upload do arquivo Blob comprimido (`newPieceImageMeta`) para o bucket (ex: Supabase Storage ou Firebase Storage):
       *    `const { data, error } = await supabase.storage.from('closet-images').upload('path/to/file.webp', compressedBlob);`
       * 2. Obtenha a URL pública:
       *    `const imageUrl = supabase.storage.from('closet-images').getPublicUrl('path/to/file.webp').data.publicUrl;`
       * 3. Salve apenas as URLs públicas geradas (`imageUrl`, `thumbnailUrl`, `analysisImageUrl`) no banco de dados relacional.
       */
      imageUrl: newPieceImage, // Versão principal e otimizada (WebP compacta)
      thumbnailUrl: newPieceThumbnail || undefined, // Miniatura super leve para o feed/grid de closet
      analysisImageUrl: newPieceImage, // Imagem ideal para processamento de IA/Gemini
      imageMeta: newPieceImageMeta ? {
        originalSize: newPieceImageMeta.originalSize,
        compressedSize: newPieceImageMeta.compressedSize,
        compressionRatio: newPieceImageMeta.compressionRatio,
        width: newPieceImageMeta.width,
        height: newPieceImageMeta.height,
        mimeType: newPieceImageMeta.mimeType
      } : undefined,
      createdAt: new Date().toISOString()
    };

    const updatedCloset = [item, ...closet];
    setCloset(updatedCloset);

    // Auto-generate some looks with this piece in the background to surprise user
    generateMockLooksForPiece(item);

    // Reset Form
    clearNewPieceImage();
    setNewPieceForm({
      name: "",
      category: "blusa",
      subcategory: "",
      mainColor: "Bege",
      pattern: "Liso",
      fabric: "Algodão",
      fit: "Reta",
      season: "Todas as estações",
      occasions: ["Passeio"],
      styleTags: ["Casual"],
      loveLevel: 4,
      frequencyOfUse: "Uso médio",
      difficultyToStyle: "Fácil",
      versatilityScore: 70,
      notes: ""
    });

    showToast(`"${item.name}" foi adicionada com sucesso ao seu armário! 🤎`);
    setCurrentTab("closet");
  };

  // --- Surprise Looks generator when a piece is added ---
  const generateMockLooksForPiece = (item: ClosetItem) => {
    // Find compatible items from existing closet
    const matches = closet.filter(c => c.category !== item.category).slice(0, 3);
    if (matches.length > 0) {
      const newOutfit: Outfit = {
        id: "look_generated_" + Date.now(),
        name: `Inovação com ${item.name}`,
        itemIds: [item.id, ...matches.map(m => m.id)],
        occasion: item.occasions[0] || "Passeio",
        styleTags: [...new Set([...item.styleTags, ...matches[0].styleTags])],
        formalityLevel: 6,
        weather: "Meia-estação",
        explanation: `Mistura cheia de personalidade unindo o recém-chegado ${item.name} com itens curingas do seu acervo. Estilo fácil, descomplicado e do jeito que a gente ama! Chique, viu? 🤎`,
        favorite: false,
        createdAt: new Date().toISOString()
      };
      setOutfits(prev => [newOutfit, ...prev]);
    }
  };

  // --- Add a purchase candidate looks into closet and wish list ---
  const handleCarryToCloset = (classificationChoice: "buy" | "pass") => {
    if (!chicResult) return;

    if (classificationChoice === "buy") {
      // Add candidate as a closet item
      const scoreNum = typeof chicResult.chicScore === 'number' ? chicResult.chicScore : (chicResult.chicScore?.final ?? 8.5);
      const item: ClosetItem = {
        id: "item_cand_" + Date.now(),
        name: candForm.name,
        category: candForm.category,
        mainColor: candForm.mainColor,
        styleTags: candForm.styleTags,
        occasions: candForm.occasions,
        loveLevel: 5,
        frequencyOfUse: "Uso médio",
        difficultyToStyle: "Fácil",
        versatilityScore: Math.round(scoreNum * 10) || 80,
        imageUrl: candImage, // Stored compressed version
        thumbnailUrl: candThumbnail || undefined,
        analysisImageUrl: candImage, // Compact version for AI
        imageMeta: candImageMeta ? {
          originalSize: candImageMeta.originalSize,
          compressedSize: candImageMeta.compressedSize,
          compressionRatio: candImageMeta.compressionRatio,
          width: candImageMeta.width,
          height: candImageMeta.height,
          mimeType: candImageMeta.mimeType
        } : undefined,
        notes: chicResult.verdictText || chicResult.verdict || chicResult.summary,
        createdAt: new Date().toISOString()
      };

      setCloset(prev => [item, ...prev]);

      // Add the outfits too!
      if (chicResult.generatedOutfits) {
        chicResult.generatedOutfits.forEach((out: any, index: number) => {
          const matchedIds = out.items || out.matchingItemIds || [];
          const newOut: Outfit = {
            id: `look_cand_out_${index}_` + Date.now(),
            name: out.name,
            itemIds: [item.id, ...matchedIds],
            occasion: out.occasion,
            styleTags: item.styleTags,
            formalityLevel: out.formalityLevel || 6,
            weather: out.weather || "Todas as estações",
            explanation: out.explanation,
            favorite: true,
            createdAt: new Date().toISOString()
          };
          setOutfits(prev => [newOut, ...prev]);
        });
      }

      showToast("Peça comprada e integrada com sucesso ao seu closet real! 🎉🤎");
    } else {
      // Deixou passar
      showToast("Pé no chão! Você economizou e evitou uma compra órfã. Lay orgulhosa de você! 💋");
    }

    // Reset
    clearCandImage();
    setCurrentTab("dashboard");
  };

  // --- Dynamic calculations for Closet Map ---
  const totalItems = closet.length;
  const categoriesCount = closet.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colorsCount = closet.reduce((acc, c) => {
    acc[c.mainColor] = (acc[c.mainColor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // find most versatile piece based on score
  const mostVersatilePiece = [...closet].sort((a,b) => b.versatilityScore - a.versatilityScore)[0];
  // find least used piece
  const leastUsedPiece = [...closet].find(c => c.frequencyOfUse === "Nunca usei" || c.frequencyOfUse === "Uso pouco") || closet[closet.length - 1];
  // hard styled pieces (high style and high difficulty)
  const stylingChallengeItems = closet.filter(c => c.difficultyToStyle === "Difícil" || c.difficultyToStyle === "Médio");

  // Filter closet elements
  const filteredClosetItems = closet.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.subcategory && item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = filterCategory === "todas" ? true : item.category === filterCategory;
    const matchColor = filterColor === "todas" ? true : item.mainColor === filterColor;
    const matchOcc = filterOccasion === "todas" ? true : item.occasions.includes(filterOccasion);

    return matchSearch && matchCat && matchColor && matchOcc;
  });

  // Color options helper
  const uniqueColors = Array.from(new Set(closet.map(c => c.mainColor)));
  // Unique categories
  const uniqueCategories = Array.from(new Set(closet.map(c => c.category)));
  // Unique occasions
  const uniqueOccasions = Array.from(
    new Set([
      "Trabalho",
      "Igreja",
      "Passeio",
      "Almoço de família",
      "Dia a dia",
      "Jantar",
      ...closet.flatMap(c => c.occasions || []),
      ...customOccasions
    ])
  );

  // Register look wear event helper
  const recordLookWear = (outfitId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setOutfits(prev => prev.map(out => {
      if (out.id === outfitId) {
        const currentDates = out.wornDates || [];
        if (currentDates.includes(todayStr)) {
          showToast("Você já marcou esse look como usado hoje! Que chique ✨");
          return out;
        }
        showToast("Look registrado! Repetir com elegância é super inteligente 💋");
        return { ...out, wornDates: [...currentDates, todayStr] };
      }
      return out;
    }));
  };

  const toggleFavoriteLook = (outfitId: string) => {
    setOutfits(prev => prev.map(out => {
      if (out.id === outfitId) {
        return { ...out, favorite: !out.favorite };
      }
      return out;
    }));
    showToast("Preferência de look atualizada com carinho!");
  };

  // Remove elements safely
  const deletePiece = (id: string) => {
    if (confirm("Deseja realmente remover esta peça preciosa do seu guarda-roupa virtual? 🤎")) {
      setCloset(prev => prev.filter(c => c.id !== id));
      // Remove references in weekly schedule
      const updateSched = { ...weeklyPlanner };
      Object.keys(updateSched).forEach((key) => {
        const day = key as keyof WeeklyPlanner;
        const lookId = updateSched[day];
        const outfitOfLook = outfits.find(o => o.id === lookId);
        if (outfitOfLook && outfitOfLook.itemIds.includes(id)) {
          updateSched[day] = undefined;
        }
      });
      setWeeklyPlanner(updateSched);
      setSelectedItem(null);
      showToast("Peça removida com cuidado.");
    }
  };

  const deleteOutfit = (id: string) => {
    if (confirm("Deseja excluir essa combinação de look?")) {
      setOutfits(prev => prev.filter(o => o.id !== id));
      showToast("Look removido dos seus registros.");
    }
  };

  // --- Auth & Admin Guards ---
  if (!currentUser) {
    if (!showAuthOverlay) {
      return (
        <div id="app-root" className="min-h-screen bg-[#F8F3EC] text-[#1F1A17] font-sans antialiased flex flex-col selection:bg-[#E8D8C3] selection:text-[#5A3E32]">
          <LandingPage onOpenAuth={(mode) => {
            if (mode) setAuthInitialMode(mode);
            setShowAuthOverlay(true);
          }} />
          {toastMessage && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1F1A17] text-[#F8F3EC] px-4 py-2.5 rounded-xl text-sm shadow-xl flex items-center gap-2 border border-[#E8D8C3]/20 max-w-sm text-center">
              <span className="text-amber-500">💋</span>
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div id="app-root" className="min-h-screen bg-[#F8F3EC] text-[#1F1A17] font-sans antialiased flex flex-col selection:bg-[#E8D8C3] selection:text-[#5A3E32] justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#E8D8C3_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-xl mx-auto px-4 pt-8">
          <button
            onClick={() => setShowAuthOverlay(false)}
            className="flex items-center gap-1.5 text-xs text-[#5A3E32] hover:text-[#6E1F2B] font-bold uppercase tracking-wider bg-white px-4 py-2 rounded-xl border border-[#E8D8C3] shadow-[0_2px_8px_rgba(90,62,50,0.03)] transition-all cursor-pointer"
          >
            ← Voltar para o Site
          </button>
        </div>

        <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col justify-center relative z-10 animate-fade-in">
          <AuthSystem
            initialMode={authInitialMode}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setShowAuthOverlay(false);
            }}
            showToast={showToast}
          />
        </main>
        
        {toastMessage && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1F1A17] text-[#F8F3EC] px-4 py-2.5 rounded-xl text-sm shadow-xl flex items-center gap-2 border border-[#E8D8C3]/20 max-w-sm text-center">
            <span className="text-amber-500">💋</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <div id="app-root" className="min-h-screen bg-[#F8F3EC] text-[#1F1A17] font-sans antialiased flex flex-col selection:bg-[#E8D8C3] selection:text-[#5A3E32]">
        <header className="sticky top-0 z-40 bg-[#F8F3EC]/95 backdrop-blur border-b border-[#E8D8C3] px-4 py-3 sm:px-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="closet accent">👑</span>
              <div>
                <h1 className="text-lg sm:text-xl font-serif font-bold text-[#5A3E32] tracking-tight">
                  Toque da Lay <span className="font-light text-xs italic opacity-85">Admin Hub</span>
                </h1>
              </div>
            </div>
            <div className="text-xs text-[#8C8178]">
              Administrador Conectado
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <AdminPanel
            adminUser={currentUser}
            onLogout={() => {
              sessionStorage.removeItem("closet_lay_active_user");
              setCurrentUser(null);
              showToast("Até breve, Lay! Adm hub desconectado. 💋");
            }}
            showToast={showToast}
          />
        </main>
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1A17] text-[#F8F3EC] px-4 py-2.5 rounded-xl text-sm shadow-xl flex items-center gap-2 border border-[#E8D8C3]/20 max-w-sm text-center">
            <span className="text-amber-500">💋</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="app-root" className="min-h-screen bg-[#F8F3EC] text-[#1F1A17] font-sans antialiased flex flex-col selection:bg-[#E8D8C3] selection:text-[#5A3E32]">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#F8F3EC]/95 backdrop-blur border-b border-[#E8D8C3] px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab("home")}>
            <span className="text-2xl" role="img" aria-label="closet accent">🤎</span>
            <div>
              <h1 className="text-lg sm:text-xl font-serif font-bold text-[#5A3E32] tracking-tight">
                Closet Inteligente da Lay
              </h1>
              <p className="text-xs text-[#8C8178] italic hidden sm:block">
                Moda possível na vida real, com o toque da Lay.
              </p>
            </div>
          </div>

          {/* Tab buttons for desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => { setCurrentTab("dashboard"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "dashboard" ? "bg-[#5A3E32] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Principal
            </button>
            <button
              onClick={() => { setCurrentTab("closet"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "closet" ? "bg-[#5A3E32] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Meu Closet
            </button>
            <button
              onClick={() => { setCurrentTab("combina"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "combina" ? "bg-[#6E1F2B] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Combina Comigo? 🔍
            </button>
            <button
              onClick={() => { setCurrentTab("looks"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "looks" ? "bg-[#5A3E32] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Meus Looks
            </button>
            <button
              onClick={() => { setCurrentTab("planner"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "planner" ? "bg-[#5A3E32] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Semana
            </button>
            <button
              onClick={() => { setCurrentTab("shopping"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "shopping" ? "bg-[#5A3E32] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Compras Inteligentes
            </button>
            <button
              onClick={() => { setCurrentTab("colorimetria"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "colorimetria" ? "bg-[#6E1F2B] text-white font-bold" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Cores 🎨
            </button>
            <button
              onClick={() => { setCurrentTab("mala"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "mala" ? "bg-[#6E1F2B] text-white font-bold" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Mala 💼
            </button>
            <button
              onClick={() => { setCurrentTab("profile"); setSelectedItem(null); }}
              className={`px-3 py-1.5 rounded-full transition-all ${currentTab === "profile" ? "bg-[#5A3E32] text-white" : "text-[#5A3E32] hover:bg-[#E8D8C3]/30"}`}
            >
              Minhas Definições
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Quick Add floating action */}
            <button
              onClick={() => setCurrentTab("add-piece")}
              className="bg-[#5A3E32] hover:bg-[#422D24] text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Peça</span>
            </button>
            
            {/* Desktop user welcome display */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col items-end text-xs text-[#8C8178]">
                <span className="font-semibold text-[#5A3E32]">Olá, {profile.name}!</span>
                <span>{profile.stylePreference} Chic</span>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem("closet_lay_active_user");
                  setCurrentUser(null);
                  showToast("Você saiu com segurança do seu Closet. Volte logo! 🤎");
                }}
                className="text-xs text-[#6E1F2B] hover:bg-[#6E1F2B]/10 font-bold px-3 py-1.5 bg-[#6E1F2B]/5 rounded-full transition-all cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* TOAST SYSTEM */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1A17] text-[#F8F3EC] px-4 py-2.5 rounded-xl text-sm shadow-xl flex items-center gap-2 animate-bounce border border-[#E8D8C3]/20 max-w-sm text-center">
          <span className="text-amber-500">💋</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CORE FRAMEWORK WORKSPACE */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">

        {/* 1. TELA INICIAL (WELCOME HOME HERO) */}
        {currentTab === "home" && (
          <div id="home-view" className="space-y-12 animate-fade-in max-w-4xl mx-auto text-center py-6 sm:py-12">
            <div className="space-y-4">
              <span className="bg-[#6E1F2B] text-[#F8F3EC] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                MÉTODO CHIC DA LAY 🤎
              </span>
              <h2 className="text-4xl sm:text-6xl font-serif font-black text-[#5A3E32] leading-tight">
                “Eu tenho roupa, <br />
                <span className="text-[#6E1F2B] italic font-normal">mas não tenho look.”</span>
              </h2>
              <p className="text-lg sm:text-xl text-[#8C8178] max-w-2xl mx-auto leading-relaxed">
                Abra espaço para o estilo que já existe aí dentro! Cadastre suas peças queridas, descubra dezenas de combinações possíveis prontas para a vida real e faça compras conscientes testando novas roupas antes de levar para casa.
              </p>
            </div>

            {/* Quick onboarding highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-2xl border border-[#E8D8C3] shadow-sm space-y-2">
                <div className="w-10 h-10 bg-[#E8D8C3]/45 rounded-lg flex items-center justify-center text-[#5A3E32] font-bold">1</div>
                <h3 className="font-serif font-bold text-[#5A3E32]">Fotografe seu Closet</h3>
                <p className="text-xs text-[#8C8178]">{`Suba as roupas básicas que você mais ama usar. O app organiza por cores e categorias em segundos.`}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#E8D8C3] shadow-sm space-y-2">
                <div className="w-10 h-10 bg-[#E8D8C3]/45 rounded-lg flex items-center justify-center text-[#5A3E32] font-bold">2</div>
                <h3 className="font-serif font-bold text-[#5A3E32]">Combina Comigo?</h3>
                <p className="text-xs text-[#8C8178]">{`Viu um blazer ou blusa linda na Renner? Fotografe ela e teste com seu closet atual antes de comprar.`}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#E8D8C3] shadow-sm space-y-2">
                <div className="w-10 h-10 bg-[#E8D8C3]/45 rounded-lg flex items-center justify-center text-[#5A3E32] font-bold">3</div>
                <h3 className="font-serif font-bold text-[#5A3E32]">Método CHIC 📊</h3>
                <p className="text-xs text-[#8C8178]">{`Descubra se a peça nova combina, harmoniza, se integra na sua rotina de missas/trabalho e se compensa!`}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => setCurrentTab("dashboard")}
                className="w-full sm:w-auto bg-[#5A3E32] hover:bg-[#422D24] text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all shadow-md transform hover:-translate-y-0.5"
              >
                Começar meu Closet CHIC 🤎
              </button>
              <button
                onClick={() => setCurrentTab("combina")}
                className="w-full sm:w-auto bg-white hover:bg-neutral-50 text-[#6E1F2B] border-2 border-[#6E1F2B] px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all"
              >
                Testar uma peça de loja 🛍️
              </button>
            </div>

            <div className="border-t border-[#E8D8C3] pt-6 max-w-sm mx-auto text-center text-xs text-[#8C8178]">
              <p>“Moda possível na vida real, com o toque da Lay.”</p>
              <p className="mt-1 font-serif text-[#5A3E32]">Um beeeeijo da Lay 💋</p>
            </div>
          </div>
        )}

        {/* 2. DASHBOARD: RESUMO DA ESTRATÉGIA NO CLOSET */}
        {currentTab === "dashboard" && (
          <div id="dashboard-view" className="space-y-8 animate-fade-in">
            {/* Custom Tip from admin */}
            {currentUser?.customTipFromLay && (
              <MemberTipBanner tipText={currentUser.customTipFromLay} />
            )}
            
            {/* Lay's friendly greeting widget */}
            <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8D8C3]/30 rounded-bl-full pointer-events-none" />
              <div className="max-w-xl space-y-5">
                <span className="text-[#6E1F2B] text-xs font-semibold tracking-wider uppercase">MODA REAL COM INTELIGÊNCIA</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#5A3E32]">
                  {`Seu guarda-roupa está pronto pra trabalhar por você, ${profile.name}?`}
                </h2>
                <p className="text-sm text-[#8C8178] leading-relaxed">
                  “Ter estilo não é ter o armário lotado com etiqueta. É ter peças que se conversam e te fazem sentir segura e bonita para ir pro trabalho, levar os pequenos na escola ou ir para a igreja.”
                </p>
                <div className="flex flex-wrap gap-3 pt-3">
                  <span className="bg-[#F8F3EC] text-[#5A3E32] text-xs px-3 py-1.5 rounded-full border border-[#E8D8C3]">
                    {`Estilo Declarado: ${profile.stylePreference}`}
                  </span>
                  <span className="bg-[#F8F3EC] text-[#5A3E32] text-xs px-3 py-1.5 rounded-full border border-[#E8D8C3]">
                    {`Foco de Rotina: ${profile.mainRoutine}`}
                  </span>
                </div>
              </div>
            </div>

            {/* ATALHOS RÁPIDOS MOBILE */}
            <div className="grid grid-cols-2 gap-3.5 lg:hidden animate-fade-in">
              <button
                onClick={() => { setCurrentTab("planner"); setSelectedItem(null); }}
                className="bg-white p-4 rounded-2xl border border-[#E8D8C3] flex items-center gap-2.5 shadow-xs text-left active:scale-[0.98] transition-all cursor-pointer min-h-[54px]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F8F3EC] flex items-center justify-center text-[#5A3E32] shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#5A3E32]">Semana</h4>
                  <p className="text-[10px] text-[#8C8178] leading-none mt-0.5">Planejar</p>
                </div>
              </button>
              <button
                onClick={() => { setCurrentTab("shopping"); setSelectedItem(null); }}
                className="bg-white p-4 rounded-2xl border border-[#E8D8C3] flex items-center gap-2.5 shadow-xs text-left active:scale-[0.98] transition-all cursor-pointer min-h-[54px]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F8F3EC] flex items-center justify-center text-[#6E1F2B] shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#5A3E32]">Compras</h4>
                  <p className="text-[10px] text-[#8C8178] leading-none mt-0.5">Lista CHIC</p>
                </div>
              </button>
              <button
                onClick={() => { setCurrentTab("colorimetria"); setSelectedItem(null); }}
                className="bg-white p-4 rounded-2xl border border-[#E8D8C3] flex items-center gap-2.5 shadow-xs text-left active:scale-[0.98] transition-all cursor-pointer min-h-[54px]"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <Palette size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#5A3E32]">Espelho</h4>
                  <p className="text-[10px] text-[#8C8178] leading-none mt-0.5">Cores</p>
                </div>
              </button>
              <button
                onClick={() => { setCurrentTab("mala"); setSelectedItem(null); }}
                className="bg-white p-4 rounded-2xl border border-[#E8D8C3] flex items-center gap-2.5 shadow-xs text-left active:scale-[0.98] transition-all cursor-pointer min-h-[54px]"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#5A3E32]">Mala</h4>
                  <p className="text-[10px] text-[#8C8178] leading-none mt-0.5">Mala Inteligente</p>
                </div>
              </button>
            </div>

            {/* QUICK OVERALL METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] text-center space-y-3">
                <span className="text-xs text-[#8C8178] uppercase font-bold tracking-wider block">Peças</span>
                <p className="text-4xl font-serif font-black text-[#5A3E32]">{totalItems}</p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium inline-block">
                  Perfeito para o dia a dia
                </span>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] text-center space-y-3">
                <span className="text-xs text-[#8C8178] uppercase font-bold tracking-wider block">Looks Criados</span>
                <p className="text-4xl font-serif font-black text-[#6E1F2B]">{outfits.length}</p>
                <span className="text-[10px] text-[#5A3E32] bg-[#F8F3EC] px-2 py-0.5 rounded-full font-medium inline-block">
                  {`${Math.round(outfits.length / (totalItems || 1) * 10) / 10} combinações por peça`}
                </span>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] text-center space-y-3">
                <span className="text-xs text-[#8C8178] uppercase font-bold tracking-wider block">Mais Versátil</span>
                <p className="text-sm font-serif font-bold text-[#5A3E32] line-clamp-1">
                  {mostVersatilePiece ? mostVersatilePiece.name : "Nenhuma peça"}
                </p>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold inline-block">
                  {mostVersatilePiece ? `Score ${mostVersatilePiece.versatilityScore}/100` : "Cadastre peças"}
                </span>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] text-center space-y-3">
                <span className="text-xs text-[#8C8178] uppercase font-bold tracking-wider block">Alerta de Repetição</span>
                <p className="text-sm font-serif font-semibold text-[#6E1F2B] line-clamp-1">
                  {colorsCount["Preto"] && colorsCount["Preto"] > 3 ? "Muitas pretas!" : "Equilibrado"}
                </p>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                  {colorsCount["Preto"] ? `${colorsCount["Preto"]} peças escuras` : "Tons neutros harmoniosos"}
                </span>
              </div>
            </div>

            {/* ACTION CENTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* PRIMARY CTA COLUMN: EVALUATOR FOR SHOP CANDIDATE */}
              <div className="bg-[#6E1F2B]/5 border-2 border-dashed border-[#6E1F2B]/35 p-8 sm:p-10 rounded-[32px] flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <span className="text-xs text-[#6E1F2B] font-bold uppercase tracking-wider block">TESTAR ANTES DE COMPRAR 🕵️‍♀️</span>
                  <h3 className="text-2xl font-serif font-bold text-[#6E1F2B]">Combina Comigo?</h3>
                  <p className="text-xs text-[#8C8178] leading-relaxed">
                    Vai comprar um blazer, vestido ou sapato novo? Suba uma foto do item de loja e calcularemos a Nota CHIC para saber se ele realmente funciona com o seu guarda-roupa atual.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab("combina")}
                  className="w-full bg-[#6E1F2B] hover:bg-[#52131C] text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition-all shadow"
                >
                  Fazer Teste "Combina Comigo?" 🔍
                </button>
              </div>

              {/* CLOSET MAP DIAGNOSIS */}
              <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-[#5A3E32] flex items-center gap-1.5 text-lg">
                    <span>Estrutura do Armário</span>
                  </h3>
                  
                  <div className="space-y-3.5">
                    {/* Category bars */}
                    {(Object.entries(categoriesCount) as [string, number][]).slice(0, 3).map(([cat, count]) => {
                      const percentage = Math.round((count / totalItems) * 100);
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="capitalize font-medium text-[#5A3E32]">{cat}s</span>
                            <span className="text-[#8C8178]">{count} peças ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#F8F3EC] h-2 rounded-full overflow-hidden">
                            <div className="bg-[#B98A5A] h-full rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {totalItems === 0 && (
                      <p className="text-xs text-[#8C8178] italic">Comece adicionando peças do seu guarda-roupa real clicando no botão acima.</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F8F3EC]">
                  <button
                    onClick={() => setCurrentTab("closet")}
                    className="text-xs text-[#5A3E32] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Ver raio-x completo do closet</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* STEWARD OF THE COLD CORNER (PEÇA PARADA) */}
              <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.04)] space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-[#5A3E32] text-lg flex items-center gap-1.5">
                    <Clock size={16} className="text-[#B98A5A]" />
                    <span>Desafio da Peça Parada</span>
                  </h3>
                  <p className="text-xs text-[#8C8178] leading-relaxed">
                    Temos que fazer seu armário render! Esta peça tem sido pouco usada ou tem alguma dificuldade de combinação declarada. Que tal dar uma chance pra ela hoje?
                  </p>
                  {leastUsedPiece ? (
                    <div className="flex items-center gap-3.5 p-3.5 bg-[#F8F3EC] rounded-2xl border border-[#E8D8C3]/60">
                      <div className="w-12 h-12 bg-white rounded-xl p-1 flex-shrink-0">
                        {leastUsedPiece.imageUrl ? (
                           <img src={leastUsedPiece.imageUrl} alt={leastUsedPiece.name} className="w-full h-full object-contain rounded" />
                        ) : (
                          <ClothesIllustration category={leastUsedPiece.category} color={leastUsedPiece.mainColor} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#5A3E32] truncate">{leastUsedPiece.name}</p>
                        <p className="text-[10px] text-[#8C8178] capitalize">{leastUsedPiece.category} • {leastUsedPiece.mainColor}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C8178] italic">Parabéns! Todas as peças estão rodando super bem.</p>
                  )}
                </div>

                {leastUsedPiece && (
                  <button
                    onClick={() => {
                      setSelectedItem(leastUsedPiece);
                      setCurrentTab("closet");
                    }}
                    className="w-full bg-[#F8F3EC] hover:bg-[#E8D8C3]/30 text-[#5A3E32] py-3 rounded-xl text-xs font-semibold border border-[#E8D8C3] transition-all"
                  >
                    Ver looks recomendados pra ela
                  </button>
                )}
              </div>

            </div>

            {/* BANNER DE COLORIMETRIA PESSOAL */}
            <div className="bg-gradient-to-r from-amber-50 to-[#F8F3EC] p-6 sm:p-8 rounded-[32px] border border-amber-200/60 shadow-[0_4px_20px_rgba(212,163,115,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Exclusivo • Colorimetria Facial
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#5A3E32]">Diagnóstico de Cores Facial</h3>
                <p className="text-xs text-[#8C8178] max-w-xl leading-relaxed">
                  Faça o mapeamento de subtom e contraste com a Drapeagem Virtual de tecidos sob seu rosto. Descubra se sua paleta ideal é Outono, Inverno, Primavera ou Verão!
                </p>
                {(profile as any).personalPaletteName && (
                  <p className="text-xs text-amber-900 font-bold flex items-center justify-center md:justify-start gap-1">
                    <span>👑 Sua Paleta Ativa: {(profile as any).personalPaletteName}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setCurrentTab("colorimetria")}
                className="whitespace-nowrap bg-[#6E1F2B] hover:bg-[#52131C] text-white font-serif font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
              >
                <span>Usar Espelho Digital 🎨</span>
              </button>
            </div>

            {/* THREE BEST LOOK BOARDS OF THE CURRENT SEASON FOR QUICK SELECTION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-[#5A3E32]">Ideias Úteis do Toque da Lay</h3>
                <button
                  onClick={() => setCurrentTab("looks")}
                  className="text-xs text-[#5A3E32] hover:underline font-bold"
                >
                  Todos os Looks ({outfits.length})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {outfits.slice(0, 3).map((outfit, index) => {
                  return (
                    <div key={outfit.id} className="bg-white rounded-[24px] border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all">
                      <div className="p-6 sm:p-8 space-y-4">
                        <div className="flex items-center justify-between text-[11px] text-[#8C8178]">
                          <span className="bg-[#F8F3EC] px-3 py-1 rounded-full text-[#5A3E32] font-medium">
                            {outfit.occasion}
                          </span>
                          <span>Nota do Look: {outfit.formalityLevel || "7"}/10</span>
                        </div>
                        
                        <h4 className="font-serif font-bold text-[#5A3E32] line-clamp-1 text-base">{outfit.name}</h4>
                        <p className="text-xs text-[#8C8178] line-clamp-2 italic">{outfit.explanation}</p>
                        
                        {/* Interactive outfit display */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {outfit.itemIds.slice(0, 4).map(itemId => {
                            const foundItem = closet.find(c => c.id === itemId);
                            if (!foundItem) return null;
                            return (
                              <div key={itemId} title={foundItem.name} className="w-10 h-10 rounded-full bg-[#F8F3EC] border border-[#E8D8C3] p-1 relative flex items-center justify-center">
                                {foundItem.imageUrl ? (
                                  <img src={foundItem.imageUrl} alt={foundItem.name} className="w-full h-full object-contain rounded-full" />
                                ) : (
                                  <ClothesIllustration category={foundItem.category} color={foundItem.mainColor} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-[#F8F3EC] px-6 sm:px-8 py-4 bg-[#F8F3EC]/40 flex items-center justify-between">
                        <button
                          onClick={() => recordLookWear(outfit.id)}
                          className="text-[11px] text-[#5A3E32] hover:text-[#6E1F2B] font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} className="text-emerald-700" />
                          <span>Marcar como Usado hoje ✔</span>
                        </button>

                        <button
                          onClick={() => setViewingSharedOutfit(outfit)}
                          className="text-[11px] text-[#8C8178] hover:text-[#5A3E32] flex items-center gap-1"
                        >
                          <Share2 size={12} />
                          <span>Mídias</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUOTE AND PERSONALITY BRUSH */}
            <div className="rounded-[32px] bg-gradient-to-tr from-[#5A3E32] to-[#422D24] text-white p-8 sm:p-10 relative shadow-[0_12px_40px_rgba(90,62,50,0.08)]">
              <div className="text-3xl opacity-20 absolute bottom-2 right-4">💋</div>
              <p className="text-sm italic font-serif leading-relaxed max-w-2xl">
                “Seu guarda-roupa precisa trabalhar a seu favor, não contra você. Repetir look não é falta de estilo, viu Mariana? É inteligência de estilo. Se compreende melhor o que possui, consome melhor e gasta com o que realmente compensa.”
              </p>
              <p className="text-xs font-bold mt-2 text-[#E8D8C3] tracking-wide">— Um beeeeijo da Lay 💋</p>
            </div>
          </div>
        )}

        {/* 3. MEU CLOSET: GRADE COMPLETA COM FILTROS */}
        {currentTab === "closet" && (
          <div id="closet-view" className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5A3E32]">Meu Closet Real</h2>
                <p className="text-xs text-[#8C8178]">
                  {`Atualmente você tem ${totalItems} peças cadastradas e organizadas com carinho.`}
                </p>
              </div>

              <button
                onClick={() => {
                  setNewPieceImage("");
                  setCurrentTab("add-piece");
                }}
                className="bg-[#5A3E32] hover:bg-[#422D24] text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Adicionar Nova Peça ✨</span>
              </button>
            </div>

            {/* ADVANCED MULTI-FILTER PANEL */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8D8C3] shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8C8178] uppercase font-bold tracking-wider">Buscar Peça</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: camisa, jeans, blazer..."
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3 py-1.5 rounded-lg text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                {/* Filter Category */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8C8178] uppercase font-bold tracking-wider">Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3 py-1.5 rounded-lg text-xs outline-none focus:border-[#5A3E32] capitalize"
                  >
                    <option value="todas">Todas as categorias</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Color */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8C8178] uppercase font-bold tracking-wider">Cor Principal</label>
                  <select
                    value={filterColor}
                    onChange={(e) => setFilterColor(e.target.value)}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3 py-1.5 rounded-lg text-xs outline-none focus:border-[#5A3E32]"
                  >
                    <option value="todas">Todas as cores</option>
                    {uniqueColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Occasion */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8C8178] uppercase font-bold tracking-wider">Ocasião</label>
                  <select
                    value={filterOccasion}
                    onChange={(e) => setFilterOccasion(e.target.value)}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3 py-1.5 rounded-lg text-xs outline-none focus:border-[#5A3E32]"
                  >
                    <option value="todas">Todas as ocasiões</option>
                    {uniqueOccasions.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset filter buttons */}
              {(filterCategory !== "todas" || filterColor !== "todas" || filterOccasion !== "todas" || searchTerm !== "") && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setFilterCategory("todas");
                      setFilterColor("todas");
                      setFilterOccasion("todas");
                      setSearchTerm("");
                    }}
                    className="text-xs text-[#6E1F2B] font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    <span>Limpar Filtros</span>
                  </button>
                </div>
              )}
            </div>

            {/* RESULTS GRID */}
            {closet.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-[#E8D8C3] space-y-4 max-w-md mx-auto my-6 shadow-xs">
                <span className="text-5xl block">👗</span>
                <h3 className="font-serif font-black text-lg text-[#5A3E32]">Seu closet ainda está vazio.</h3>
                <p className="text-xs text-[#8C8178] leading-relaxed">
                  Cadastre suas primeiras peças para começar a montar combinações reais.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNewPieceImage("");
                    setCurrentTab("add-piece");
                  }}
                  className="bg-[#5A3E32] hover:bg-[#422D24] text-white px-6 py-3 rounded-full text-xs font-semibold shadow transition-all inline-flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Adicionar minha primeira peça</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredClosetItems.map(item => {
                  const wornStatus = getItemWornStatus(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`bg-white rounded-2xl border ${selectedItem?.id === item.id ? "border-2 border-[#5A3E32]" : "border-[#E8D8C3] hover:border-[#5A3E32]/50"} p-3.5 flex flex-col justify-between cursor-pointer group transition-all relative overflow-hidden`}
                    >
                      {/* Alert / Warning Badge for unused or old items */}
                      {wornStatus.showAlert && (
                        <div 
                          className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs border transition-transform duration-300 group-hover:scale-105 z-10 ${
                            wornStatus.isNeverWorn 
                              ? "bg-[#FCF8F2] text-[#9E7345] border-[#EADAC5]" 
                              : "bg-[#FDF2F2] text-[#9B1C1C] border-[#FDE8E8] animate-pulse"
                          }`}
                          title={wornStatus.isNeverWorn ? "Essa peça incrível ainda nunca foi usada! ✨" : `Esta peça está há muito tempo sem uso: ${wornStatus.description}`}
                        >
                          <AlertTriangle size={9} className={wornStatus.isNeverWorn ? "text-[#9E7345]" : "text-[#C81E1E]"} />
                          <span>{wornStatus.description}</span>
                        </div>
                      )}

                      {/* Versatility Badge */}
                      <span className="absolute top-2 right-2 text-[10px] bg-[#F8F3EC] text-[#5A3E32] px-1.5 py-0.5 rounded-full font-bold">
                        {item.versatilityScore}%
                      </span>

                      <div className="space-y-2">
                        <div className="aspect-square bg-[#F8F3EC] rounded-xl p-2.5 flex items-center justify-center">
                          {(item.thumbnailUrl || item.imageUrl) ? (
                            <img src={item.thumbnailUrl || item.imageUrl} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <ClothesIllustration category={item.category} color={item.mainColor} />
                          )}
                        </div>
                        
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-[#8C8178] uppercase tracking-wider font-bold capitalize">
                            {item.category}
                          </p>
                          <h4 className="text-xs font-serif font-black text-[#5A3E32] line-clamp-1 group-hover:text-[#6E1F2B] transition-colors">
                            {item.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F8F3EC] mt-3">
                        <span className="text-[10px] text-[#8C8178]">
                          {item.mainColor}
                        </span>
                        <span className="text-[10px] text-[#5A3E32] font-semibold">
                          {item.frequencyOfUse}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredClosetItems.length === 0 && (
                  <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-[#E8D8C3] space-y-3">
                    <span className="text-3xl">👗</span>
                    <p className="text-sm font-serif font-bold text-[#5A3E32]">Nenhuma peça corresponde aos filtros.</p>
                    <p className="text-xs text-[#8C8178] max-w-sm mx-auto">Tente limpar os filtros, buscar por outro termo ou cadastre novas fofuras clicando em "Adicionar Peça".</p>
                  </div>
                )}
              </div>
            )}

            {/* DETAIL DRAWER / SUB-VIEW (SELECTED ITEM DETAILS) */}
            {selectedItem && (
              <div className="bg-white p-6 rounded-3xl border-2 border-[#5A3E32] shadow-xl space-y-6 animate-slide-up">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#5A3E32] text-white px-3 py-1 rounded-full text-xs font-bold leading-none capitalize">
                      {selectedItem.category}
                    </span>
                    <span className="text-xs text-[#8C8178]">Cadastrado em {new Date(selectedItem.createdAt).toLocaleDateString("pt-BR")}</span>
                    <span className="text-xs text-[#8C8178]">•</span>
                    {latestWornDateStr ? (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold leading-none flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Último uso: {formattedLastWorn} ({timeAgoText})</span>
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-1 rounded-full text-[11px] font-bold leading-none flex items-center gap-1 shadow-xs">
                        <span>Ainda não usado 🕊</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 hover:bg-[#F8F3EC] rounded-full text-[#8C8178] hover:text-[#5A3E32]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Visual Left */}
                  <div className="md:col-span-4 bg-[#F8F3EC] p-6 rounded-2xl flex items-center justify-center max-h-[300px]">
                    {selectedItem.imageUrl ? (
                      <img src={selectedItem.imageUrl} alt={selectedItem.name} className="max-h-full object-contain rounded-xl" />
                    ) : (
                      <ClothesIllustration category={selectedItem.category} color={selectedItem.mainColor} className="w-48 h-48" />
                    )}
                  </div>

                  {/* Details Right */}
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <h3 className="text-2xl font-serif font-black text-[#5A3E32]">{selectedItem.name}</h3>
                      {selectedItem.subcategory && (
                        <p className="text-xs text-[#5A3E32] italic">{selectedItem.subcategory}</p>
                      )}
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#F8F3EC]/50 p-4 rounded-xl">
                      <div>
                        <span className="text-[10px] text-[#8C8178] block">Cor Predominante</span>
                        <span className="font-bold text-[#5A3E32]">{selectedItem.mainColor}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8C8188] block">Estampa / Padrão</span>
                        <span className="font-bold text-[#5A3E32]">{selectedItem.pattern || "Não cadastrado"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8C8178] block">Tecido</span>
                        <span className="font-bold text-[#5A3E32]">{selectedItem.fabric || "Não cadastrado"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8C8178] block">Modelagem</span>
                        <span className="font-bold text-[#5A3E32]">{selectedItem.fit || "Reta"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8C8178] block">Dificuldade Combinar</span>
                        <span className="font-bold text-[#5A3E32]">{selectedItem.difficultyToStyle}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8C8178] block">Frequência de Uso</span>
                        <span className="font-bold text-[#5A3E32]">{selectedItem.frequencyOfUse}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8C8178] block">Último Uso Real</span>
                        <span className="font-bold text-[#5A3E32] block truncate" title={latestWornDateStr ? `${formattedLastWorn} (${timeAgoText})` : "Sem registros no armário"}>
                          {latestWornDateStr ? formattedLastWorn : "Nunca usada"}
                        </span>
                        {latestWornDateStr && (
                          <span className="text-[9px] text-[#128C7E] font-bold block leading-none mt-0.5">{timeAgoText}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8C8178] font-bold uppercase block">Melhores Ocasiões</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.occasions.map(occ => (
                          <span key={occ} className="bg-[#E8D8C3] text-[#5A3E32] text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                            {occ}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedItem.notes && (
                      <div className="bg-[#E8D8C3]/30 p-3.5 rounded-xl border border-[#E8D8C3] space-y-1">
                        <span className="text-xs font-serif font-bold text-[#5A3E32] flex items-center gap-1">
                          <span>Opinião Sincera da Lay 🤎</span>
                        </span>
                        <p className="text-xs text-[#5A3E32] italic leading-relaxed">
                          {selectedItem.notes}
                        </p>
                      </div>
                    )}

                    {/* LOOKS CONTAINING THIS ELEMENT */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-[#5A3E32] uppercase">Looks possíveis com essa peça ({
                        outfits.filter(out => out.itemIds.includes(selectedItem.id)).length
                      })</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {outfits.filter(out => out.itemIds.includes(selectedItem.id)).map(out => (
                          <div key={out.id} className="p-3 bg-[#F8F3EC] rounded-xl text-xs space-y-1 flex flex-col justify-between">
                            <div>
                              <p className="font-serif font-bold text-[#5A3E32] truncate">{out.name}</p>
                              <p className="text-[10px] text-[#8C8178] line-clamp-1">{out.explanation}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-[#E8D8C3]/40">
                              <span className="text-[10px] text-[#6E1F2B] font-semibold">{out.occasion}</span>
                              <button
                                onClick={() => setViewingSharedOutfit(out)}
                                className="text-[10px] text-[#5A3E32] hover:underline flex items-center gap-0.5"
                              >
                                <Eye size={10} />
                                <span>Ver quadro</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-between items-center pt-3 border-t border-[#F8F3EC]">
                      <button
                        onClick={() => deletePiece(selectedItem.id)}
                        className="text-xs text-[#6E1F2B] font-semibold hover:underline flex items-center gap-1 py-2 px-3 rounded hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        <span>Excluir Peça</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Quick feature to generate look
                            generateMockLooksForPiece(selectedItem);
                            showToast(`Mais 1 look gerado automaticamente com ${selectedItem.name}! 🤎`);
                          }}
                          className="bg-[#F8F3EC] hover:bg-[#E8D8C3]/50 text-[#5A3E32] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs font-semibold"
                        >
                          Mais looks do toque da Lay ✨
                        </button>
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="bg-[#5A3E32] hover:bg-[#422D24] text-white px-4 py-2 rounded-xl text-xs font-semibold"
                        >
                          Fechar Detalhes
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. ADICIONAR PEÇA */}
        {currentTab === "add-piece" && (
          <div id="add-piece-view" className="space-y-6 max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab("closet")}
                className="p-1 hover:bg-[#E8D8C3]/40 rounded-full text-[#5A3E32]"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-serif font-bold text-[#5A3E32]">Adicionar Nova Peça ao Closet</h2>
            </div>

            {/* DRAG AND DROP / FILE UPLOAD CONTAINER */}
            <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-[#E8D8C3] shadow-sm text-center space-y-4">
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#F8F3EC] rounded-full flex items-center justify-center text-[#5A3E32]">
                    <Camera size={32} />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-serif font-black text-[#5A3E32]">Tire uma foto ou suba a imagem</h3>
                  <p className="text-xs text-[#8C8178] mt-1">
                    Formatos JPEG, PNG suportados. O app pode preencher automaticamente a categoria, cor e sugestões de looks do Toque da Lay usando IA!
                  </p>
                </div>

                {/* Input control */}
                <div className="flex items-center justify-center pt-2">
                  <label className="cursor-pointer bg-[#5A3E32] hover:bg-[#422D24] text-[#F8F3EC] text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-md">
                    <span>Selecionar Foto da Peça 📸</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "newPiece")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {newPieceCompressionStatus && (
                <p className="text-[10px] text-[#8C8178] font-semibold mt-2 animate-pulse leading-relaxed max-w-xs mx-auto">
                  ✨ {newPieceCompressionStatus}
                </p>
              )}

              {newPieceImage && (
                <div className="space-y-4 pt-4 border-t border-[#F8F3EC]">
                  <div className="space-y-1">
                    <p className="text-xs text-[#128C7E] font-black flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} />
                      <span>Foto Otimizada com Sucesso!</span>
                    </p>
                    {newPieceImageMeta && (
                      <p className="text-[10px] text-[#8C8178] font-medium">
                        Original: {formatFileSize(newPieceImageMeta.originalSize)} ➔ Comprimida: {formatFileSize(newPieceImageMeta.compressedSize)} (-{Math.round(newPieceImageMeta.compressionRatio * 100)}% de peso salvo)
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <div className="relative w-40 h-40 bg-[#F8F3EC] rounded-2xl overflow-hidden p-2 border border-[#E8D8C3]">
                      <img src={newPieceImage} alt="Uploaded item preview" className="w-full h-full object-contain" />
                      <button
                        onClick={clearNewPieceImage}
                        className="absolute top-1.5 right-1.5 bg-[#6E1F2B] text-[#F8F3EC] hover:bg-black rounded-full p-1.5 transition-all shadow-md z-15"
                        title="Remover foto"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status information of Server AI Analysis */}
              {isAnalyzingNew && (
                <div className="p-4 bg-[#F8F3EC] rounded-2xl flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                  <RefreshCw size={24} className="text-[#6E1F2B] animate-spin" />
                  <p className="text-xs text-[#5A3E32] font-semibold">{analyzeFeedback}</p>
                </div>
              )}

              {!isAnalyzingNew && analyzeFeedback && (
                <div className="p-2 px-4 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium inline-block mx-auto">
                  {analyzeFeedback}
                </div>
              )}
            </div>

            {/* MANUAL MANIFEST EDIT (SUGGESTIONS POPULATED BY AI) */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] space-y-4">
              <h3 className="font-serif font-bold text-[#5A3E32] border-b border-[#F8F3EC] pb-2">
                Ficha de Estilo & Descrição
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Nome da Peça *</label>
                  <input
                    type="text"
                    value={newPieceForm.name}
                    onChange={(e) => setNewPieceForm({ ...newPieceForm, name: e.target.value })}
                    placeholder="Ex: Blazer bege cortado, Camisa branca linho"
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Categoria</label>
                  <select
                    value={newPieceForm.category}
                    onChange={(e) => setNewPieceForm({ ...newPieceForm, category: e.target.value })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32] capitalize"
                  >
                    <option value="blusa">Blusa</option>
                    <option value="camiseta">Camiseta</option>
                    <option value="camisa">Camisa</option>
                    <option value="regata">Regata</option>
                    <option value="calça">Calça</option>
                    <option value="jeans">Jeans</option>
                    <option value="saia">Saia</option>
                    <option value="short">Short</option>
                    <option value="vestido">Vestido</option>
                    <option value="macacão">Macacão</option>
                    <option value="blazer">Blazer</option>
                    <option value="jaqueta">Jaqueta</option>
                    <option value="cardigan">Cardigan</option>
                    <option value="colete">Colete</option>
                    <option value="tricô">Tricô</option>
                    <option value="sapato">Sapato</option>
                    <option value="sandália">Sandália</option>
                    <option value="tênis">Tênis</option>
                    <option value="bota">Bota</option>
                    <option value="bolsa">Bolsa</option>
                    <option value="cinto">Cinto</option>
                    <option value="acessório">Acessório</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Cor Principal</label>
                  <input
                    type="text"
                    value={newPieceForm.mainColor}
                    onChange={(e) => setNewPieceForm({ ...newPieceForm, mainColor: e.target.value })}
                    placeholder="Ex: Bege, Off-white, Preto"
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Tecido</label>
                  <input
                    type="text"
                    value={newPieceForm.fabric}
                    onChange={(e) => setNewPieceForm({ ...newPieceForm, fabric: e.target.value })}
                    placeholder="Ex: Viscose, Jeans, Crepe, Linho"
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold font-serif">Versatilidade Inicial (0-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newPieceForm.versatilityScore}
                    onChange={(e) => setNewPieceForm({ ...newPieceForm, versatilityScore: Number(e.target.value) })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold font-serif">Nível de Carinho pela Peça (1-5)</label>
                  <select
                    value={newPieceForm.loveLevel}
                    onChange={(e) => setNewPieceForm({ ...newPieceForm, loveLevel: Number(e.target.value) })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  >
                    <option value={1}>★☆☆☆☆ — Guarda por obrigação</option>
                    <option value={2}>★★☆☆☆ — Uso raramente</option>
                    <option value={3}>★★★☆☆ — Gosto bastante</option>
                    <option value={4}>★★★★☆ — Me sinto elegante</option>
                    <option value={5}>★★★★★ — Meu cavalo de batalha! 🤎</option>
                  </select>
                </div>
              </div>

              {/* Custom Occasion Selector / Manager */}
              <div className="space-y-3 border-t border-[#F8F3EC] pt-5">
                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-serif font-black flex items-center gap-1.5 animate-fade-in">
                    <span>📍 Ocasiões para Uso desta Peça</span>
                    <span className="text-[10px] text-[#8C8178] font-normal font-sans">(Selecione uma ou mais)</span>
                  </label>
                  <p className="text-[10px] text-[#8C8178]">
                    Atribua esta peça às ocasiões corretas para que o planejador semanal de estilo e o recomendador de looks boards funcionem com perfeita sintonia!
                  </p>
                </div>
                
                {/* Scrollable / wrap list of active occasion badges */}
                <div className="flex flex-wrap gap-2 p-4 bg-[#FAF8F5] border border-[#E8D8C3]/50 rounded-[22px]">
                  {uniqueOccasions.map((occ) => {
                    const isSelected = (newPieceForm.occasions || []).includes(occ);
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => {
                          const currentOccasions = newPieceForm.occasions || [];
                          let updated: string[];
                          if (currentOccasions.includes(occ)) {
                            updated = currentOccasions.filter(o => o !== occ);
                          } else {
                            updated = [...currentOccasions, occ];
                          }
                          setNewPieceForm(prev => ({
                            ...prev,
                            occasions: updated
                          }));
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                          isSelected
                            ? "bg-[#5A3E32] text-white border-[#5A3E32] shadow-xs"
                            : "bg-white text-[#5A3E32] border-[#E8D8C3] hover:bg-[#F8F3EC] hover:border-[#5A3E32]/30"
                        }`}
                      >
                        <span>{occ}</span>
                        {isSelected && <span className="text-[9px]">✔</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-form to add a custom new occasion in real-time */}
                <div className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={typedOccasion}
                    onChange={(e) => setTypedOccasion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomOccasion();
                      }
                    }}
                    placeholder="Adicionar ocasião personalizada (ex: Casamento, Balada, Congresso)..."
                    className="flex-1 bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-[#5A3E32] placeholder-[#8C8178]/60"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomOccasion}
                    className="bg-[#6E1F2B] hover:bg-[#52131C] text-white text-xs font-serif font-black px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer shrink-0"
                  >
                    + Criar
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#5A3E32] font-bold font-serif">Opinião Real / Observações (O Toque da Lay)</label>
                <textarea
                  value={newPieceForm.notes}
                  onChange={(e) => setNewPieceForm({ ...newPieceForm, notes: e.target.value })}
                  placeholder="Lay acha que combina...? Escreva observações pessoais ou o veredito recebido."
                  rows={3}
                  className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewPieceImage("");
                    setCurrentTab("closet");
                  }}
                  className="bg-[#F8F3EC] hover:bg-[#E8D8C3]/50 text-[#5A3E32] border border-[#E8D8C3] px-5 py-2.5 rounded-full text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveNewPieceToCloset}
                  className="bg-[#5A3E32] hover:bg-[#422D24] text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow"
                >
                  Salvar no Closet CHIC ✔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. TELA DE COMPRA: COMBINA COMIGO (TESTADOR PRINCIPAL) */}
        {currentTab === "combina" && (
          <div id="combina-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="space-y-1 text-center pb-2">
              <span className="bg-[#6E1F2B]/10 text-[#6E1F2B] text-[10px] uppercase tracking-widest font-black px-3.5 py-1 rounded-full border border-[#6E1F2B]/25">
                COMPRA CONSCIENTE NA VIDA REAL 🛍️
              </span>
              <h2 className="text-3xl font-serif font-black text-[#5A3E32]">Combina Comigo?</h2>
              <p className="text-xs text-[#8C8178] max-w-lg mx-auto leading-relaxed">
                “Antes de levar pra casa, Mariana, vamos ver se essa peça de vitrine já tem lugar real e prático na sua vida.”
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Candidate Info Input Form Left */}
              <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-center sm:text-left text-[#5A3E32]">A Peça que você Gostou:</h3>
                
                {/* File uploader button */}
                <div className="bg-[#F8F3EC] p-4 rounded-2xl border-2 border-dashed border-[#E8D8C3] text-center space-y-3">
                  {candCompressionStatus && (
                    <p className="text-[10px] text-[#6E1F2B] font-bold animate-pulse leading-relaxed">
                      ✨ {candCompressionStatus}
                    </p>
                  )}

                  {candImage ? (
                    <div className="space-y-2">
                      <div className="relative w-full aspect-square bg-white rounded-lg p-2 max-h-[220px] flex items-center justify-center">
                        <img src={candImage} alt="Candidate preview" className="max-w-full max-h-full object-contain rounded" />
                        <button
                          onClick={clearCandImage}
                          className="absolute top-1.5 right-1.5 bg-[#6E1F2B] hover:bg-black text-[#F8F3EC] rounded-full p-2 shadow-md cursor-pointer"
                          title="Remover foto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {candImageMeta && (
                        <p className="text-[9px] text-[#8C8178] font-bold mt-1 scale-95">
                          Original: {formatFileSize(candImageMeta.originalSize)} ➔ Comprimida: {formatFileSize(candImageMeta.compressedSize)} (-{Math.round(candImageMeta.compressionRatio * 100)}% salva)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 py-2">
                      <p className="text-xs text-[#8C8178] font-bold">Suba a Foto da Peça (no provador ou print) 👜</p>
                      
                      <div className="flex flex-col gap-2">
                        {/* Option 1: Mobile Camera */}
                        <label className="min-h-11 flex items-center justify-center gap-1.5 cursor-pointer bg-[#5A3E32] hover:bg-[#422D24] text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-95">
                          <Camera size={14} />
                          <span>Tirar Foto da Peça</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleImageUpload(e, "candidate")}
                            className="hidden"
                          />
                        </label>
                        
                        {/* Option 2: Upload from gallery */}
                        <label className="min-h-11 flex items-center justify-center gap-1.5 cursor-pointer bg-white hover:bg-gray-50 text-[#5A3E32] border border-[#E8D8C3] px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-xs active:scale-95">
                          <Upload size={14} />
                          <span>Escolher da Galeria</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "candidate")}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {isAnalyzingCandidate && (
                  <div className="flex flex-col items-center justify-center p-6 bg-[#F8F3EC]/50 rounded-2xl border border-dashed border-[#E8D8C3] space-y-3 min-h-[200px]">
                    <RefreshCw size={24} className="text-[#6E1F2B] animate-spin" />
                    <p className="text-xs font-bold text-[#5A3E32] animate-pulse">Analisando a peça...</p>
                    <p className="text-[10px] text-[#8C8178] text-center leading-relaxed">
                      Lay está lendo os atributos visuais de modelagem, tecido e textura... 🤎
                    </p>
                  </div>
                )}

                {candImage && !isAnalyzingCandidate && (
                  <div className="space-y-4 pt-2 border-t border-[#F8F3EC] text-[#5A3E32]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#6E1F2B] uppercase tracking-wider">Dados Identificados pela IA fofa</span>
                      <button
                        type="button"
                        onClick={clearCandImage}
                        className="text-[10px] font-bold text-[#8C8178] hover:text-[#6E1F2B] underline"
                      >
                        Trocar foto
                      </button>
                    </div>

                    {/* 1. Nome */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Nome do Item / Loja</label>
                      <input
                        type="text"
                        value={candForm.name || ""}
                        onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
                        className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                      />
                    </div>

                    {/* 2 & 3. Categoria e Subcategoria */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Categoria</label>
                        <select
                          value={candForm.category || "blusa"}
                          onChange={(e) => setCandForm({ ...candForm, category: e.target.value })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-2 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32] capitalize"
                        >
                          {["blusa", "camiseta", "camisa", "regata", "calça", "jeans", "saia", "short", "vestido", "macacão", "blazer", "jaqueta", "cardigan", "colete", "tricô", "sapato", "sandália", "tênis", "bota", "bolsa", "cinto", "acessório"].map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Subcategoria</label>
                        <input
                          type="text"
                          value={candForm.subcategory || ""}
                          onChange={(e) => setCandForm({ ...candForm, subcategory: e.target.value })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                          placeholder="Ex: Alfaiataria"
                        />
                      </div>
                    </div>

                    {/* 4 & 5. Cor Principal e Cores Secundárias */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Cor Principal</label>
                        <input
                          type="text"
                          value={candForm.mainColor || ""}
                          onChange={(e) => setCandForm({ ...candForm, mainColor: e.target.value })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Cores Secundárias</label>
                        <input
                          type="text"
                          value={Array.isArray(candForm.secondaryColors) ? candForm.secondaryColors.join(", ") : candForm.secondaryColors || ""}
                          onChange={(e) => setCandForm({ ...candForm, secondaryColors: e.target.value.split(",").map(c => c.trim()) })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                          placeholder="Ex: Branco"
                        />
                      </div>
                    </div>

                    {/* 6 & 7. Estampa e Tecido */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Estampa</label>
                        <input
                          type="text"
                          value={candForm.pattern || ""}
                          onChange={(e) => setCandForm({ ...candForm, pattern: e.target.value })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Tecido</label>
                        <input
                          type="text"
                          value={candForm.fabric || ""}
                          onChange={(e) => setCandForm({ ...candForm, fabric: e.target.value })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>
                    </div>

                    {/* 8 & 9. Modelagem e Estações */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Modelagem/Corte</label>
                        <input
                          type="text"
                          value={candForm.fit || ""}
                          onChange={(e) => setCandForm({ ...candForm, fit: e.target.value })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Estações</label>
                        <input
                          type="text"
                          value={Array.isArray(candForm.season) ? candForm.season.join(", ") : candForm.season || ""}
                          onChange={(e) => setCandForm({ ...candForm, season: e.target.value.split(",").map(s => s.trim()) })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>
                    </div>

                    {/* 10 & 11. Ocasiões e Estilos */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Ocasiões</label>
                        <input
                          type="text"
                          value={Array.isArray(candForm.occasions) ? candForm.occasions.join(", ") : candForm.occasions || ""}
                          onChange={(e) => setCandForm({ ...candForm, occasions: e.target.value.split(",").map(o => o.trim()) })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Tags de Estilo</label>
                        <input
                          type="text"
                          value={Array.isArray(candForm.styleTags) ? candForm.styleTags.join(", ") : candForm.styleTags || ""}
                          onChange={(e) => setCandForm({ ...candForm, styleTags: e.target.value.split(",").map(s => s.trim()) })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>
                    </div>

                    {/* 12 & 13. Nível Formalidade e Versatilidade */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Formalidade (1-10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={candForm.formalityLevel || 5}
                          onChange={(e) => setCandForm({ ...candForm, formalityLevel: parseInt(e.target.value, 10) || 5 })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Versatilidade (1-10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={candForm.versatilityScore || 7}
                          onChange={(e) => setCandForm({ ...candForm, versatilityScore: parseInt(e.target.value, 10) || 7 })}
                          className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                        />
                      </div>
                    </div>

                    {/* 14. Alertas Visuais */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8C8178] font-bold uppercase block">Alertas Visuais</label>
                      <input
                        type="text"
                        value={Array.isArray(candForm.visualWarnings) ? candForm.visualWarnings.join(", ") : candForm.visualWarnings || ""}
                        onChange={(e) => setCandForm({ ...candForm, visualWarnings: e.target.value.split(",").map(w => w.trim()).filter(Boolean) })}
                        placeholder="Nenhum alerta visual identificado"
                        className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-1.5 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                      />
                    </div>

                    {candForm.visualWarnings && candForm.visualWarnings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {candForm.visualWarnings.map((warn: string, i: number) => (
                          <span key={i} className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            ⚠️ {warn}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={triggerCHICEvaluation}
                      disabled={isEvaluatingCHIC}
                      className="w-full mt-2 bg-[#6E1F2B] hover:bg-[#52131C] text-white disabled:bg-gray-300 disabled:cursor-not-allowed py-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isEvaluatingCHIC ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Calculando Nota CHIC...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Está certo, testar no meu closet! ✨</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* EVALUATION CHIC RESULTS AND VERDICT RIGHT */}
              <div className="md:col-span-7 space-y-6">
                {!chicResult && !isEvaluatingCHIC && (
                  <div className="bg-white p-8 rounded-3xl border border-[#E8D8C3] text-center space-y-4">
                    <p className="text-6xl text-[#B98A5A]" role="img" aria-label="closet box">🛍️</p>
                    <h3 className="font-serif font-black text-lg text-[#5A3E32]">Aguardando Peça para Simulação</h3>
                    <p className="text-xs text-[#8C8178] leading-relaxed max-w-sm mx-auto">
                      “Coloque a foto do seu blazer bege fofo, ou daquela sandália que achou no provador, escolha as descrições e clique em analisar. Vou te falar de amiga para amiga se você vai usar de verdade ou se vai ficar encalhado.”
                    </p>
                  </div>
                )}

                {isEvaluatingCHIC && (
                  <div className="bg-white p-12 rounded-3xl border border-[#E8D8C3] flex flex-col items-center justify-center space-y-4 text-center">
                    <span className="text-4xl text-[#B98A5A] animate-bounce">🤎</span>
                    <RefreshCw size={32} className="text-[#6E1F2B] animate-spin" />
                    <div>
                      <h3 className="font-serif font-black text-[#5A3E32]">Conectando com o Closet Inteligente</h3>
                      <p className="text-xs text-[#8C8178] mt-1 max-w-xs leading-relaxed">
                        Cruzando cores, categorias de pernas claras e sapados escuros do seu acervo com a nova peça... 💋 Let's check!
                      </p>
                    </div>
                  </div>
                )}

                {/* THE MAJESTIC RESULTS VIEW WITH GRAND NOTA CHIC BLOCK */}
                {chicResult && (
                  <div className="space-y-6 animate-slide-up">
                    
                    {/* CORE OVERDICT BAR */}
                    <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] space-y-5">
                      
                      {/* Brand-designed Grand Score Container */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F3EC] p-5 rounded-2xl border border-[#E8D8C3] relative overflow-hidden">
                        {/* Elegant background graphics */}
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-[#6E1F2B]/5 rounded-l-full blur-xl pointer-events-none" />
                        
                        <div className="space-y-1 relative">
                          <span className="text-[10px] text-[#6E1F2B] font-black uppercase tracking-widest block">MÉTODO CHIC VEREDITO</span>
                          <h4 className="font-serif text-2xl font-black text-[#5A3E32] leading-tight capitalize">{candForm.name}</h4>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#6E1F2B] animate-pulse" />
                            <span className="text-[10px] text-[#8C8178] font-bold">Classificação: <span className="text-[#6E1F2B] uppercase tracking-wider">{chicResult.classification}</span></span>
                          </div>
                        </div>

                        {/* Grand Framed Score */}
                        <div className="flex items-center gap-3 bg-gradient-to-br from-[#5A3E32] to-[#422D24] text-white px-5 py-3 rounded-2xl border border-[#E8D8C3]/20 shadow-md self-start sm:self-auto shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] text-[#E8D8C3] uppercase font-bold tracking-wider block">Nota Geral</span>
                            <span className="text-[10px] text-gray-300 font-medium block">Compatibilidade</span>
                          </div>
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                            <span className="text-2xl font-serif font-black text-amber-300 leading-none">
                              {typeof chicResult.chicScore === 'number' ? chicResult.chicScore : (chicResult.chicScore?.final || "8.5")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CHIC PILLARS SCORES BAR LEVEL */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#F8F3EC]/50 p-2.5 rounded-xl border border-[#E8D8C3]/50 text-center">
                          <span className="text-[10px] text-[#8C8178] block font-bold" title="C — Combina com o que eu já tenho">C — Combina</span>
                          <span className="font-serif text-sm font-black text-[#5A3E32]">
                            {chicResult.scores?.combina ?? chicResult.chicScore?.combina ?? "8.0"}/10
                          </span>
                        </div>
                        <div className="bg-[#F8F3EC]/50 p-2.5 rounded-xl border border-[#E8D8C3]/50 text-center">
                          <span className="text-[10px] text-[#8C8178] block font-bold" title="H — Harmoniza com meu estilo">H — Harmoniza</span>
                          <span className="font-serif text-sm font-black text-[#5A3E32]">
                            {chicResult.scores?.harmoniza ?? chicResult.chicScore?.harmoniza ?? "8.5"}/10
                          </span>
                        </div>
                        <div className="bg-[#F8F3EC]/50 p-2.5 rounded-xl border border-[#E8D8C3]/50 text-center">
                          <span className="text-[10px] text-[#8C8178] block font-bold" title="I — Integra minha rotina">I — Integra</span>
                          <span className="font-serif text-sm font-black text-[#5A3E32]">
                            {chicResult.scores?.integra ?? chicResult.chicScore?.integra ?? "8.0"}/10
                          </span>
                        </div>
                        <div className="bg-[#F8F3EC]/50 p-2.5 rounded-xl border border-[#E8D8C3]/50 text-center">
                          <span className="text-[10px] text-[#8C8178] block font-bold" title="C — Compensa comprar">C — Compensa</span>
                          <span className="font-serif text-sm font-black text-[#5A3E32]">
                            {chicResult.scores?.compensa ?? chicResult.chicScore?.compensa ?? "9.0"}/10
                          </span>
                        </div>
                      </div>

                      {/* RESULT CLASSIFICATION RIBBON */}
                      <div className="flex items-start gap-2.5 p-3.5 bg-[#6E1F2B]/5 rounded-2xl border border-[#6E1F2B]/15 text-left">
                        <span className="text-xl">🤎</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-[#6E1F2B]">
                            Recomendação da Lay:
                          </p>
                          <p className="text-xs text-[#8C8178] leading-relaxed">
                            {chicResult.recommendation || "Seu guarda-roupa precisa trabalhar a seu favor."}
                          </p>
                        </div>
                      </div>

                      {/* TEXT VERDICT FROM LAY */}
                      <div className="p-4 bg-[#E8D8C3]/20 rounded-2xl space-y-1.5 border border-[#E8D8C3] text-left">
                        <span className="font-serif font-black text-[10px] text-[#5A3E32] block uppercase tracking-wider">O Toque Sincero da Lay focado na sua vida:</span>
                        <p className="text-xs text-[#5A3E32] italic leading-relaxed whitespace-pre-line select-none leading-relaxed">
                          “{chicResult.verdictText || chicResult.verdict || chicResult.summary || chicResult.layComment}”
                        </p>
                      </div>

                      {/* STATS COUNT */}
                      {typeof chicResult.possibleOutfitsCount === 'number' && (
                        <div className="p-3.5 bg-[#F8F3EC] rounded-xl border border-[#E8D8C3]/60 flex items-center justify-between text-xs text-[#5A3E32]">
                          <span className="font-bold font-serif">Looks reais possíveis que esta peça gera:</span>
                          <span className="bg-[#6E1F2B] text-white font-bold px-3 py-0.5 rounded-full text-xs">
                            {chicResult.possibleOutfitsCount} {chicResult.possibleOutfitsCount === 1 ? 'look' : 'looks'}
                          </span>
                        </div>
                      )}

                      {/* WARNING SECTIONS OF DUPLICATE OR INDEPENDENT ORPHAN */}
                      {chicResult.warnings && chicResult.warnings.length > 0 && (
                        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-left">
                          <span className="text-[10px] text-[#B98A5A] uppercase font-black tracking-wider flex items-center gap-1">
                            <AlertTriangle size={13} />
                            <span>Atenção e Alertas Importantes:</span>
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {chicResult.warnings.map((warn: string, i: number) => (
                              <li key={i} className="text-[11px] text-amber-800 italic leading-snug">{warn}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* LOOK BOARDS VISUALS PREVIEW */}
                    <div className="space-y-4">
                      <h4 className="font-serif font-bold text-md text-[#5A3E32] tracking-tight">
                        Look Boards sugeridos com o que você já possui:
                      </h4>

                      {(!chicResult.generatedOutfits || chicResult.generatedOutfits.length === 0) ? (
                        <div className="bg-[#F8F3EC]/50 p-6 rounded-2xl border border-[#E8D8C3] text-center text-xs text-[#8C8178] italic">
                          Não foi possível gerar looks correspondentes com suas peças atuais. Considere adicionar peças complementares para aumentar a versatilidade!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chicResult.generatedOutfits.map((outfit: any, idx: number) => {
                            const matchedIds = outfit.items || outfit.matchingItemIds || [];
                            return (
                              <div key={idx} className="bg-white p-4 rounded-2xl border border-[#E8D8C3] shadow-sm space-y-3.5">
                                <div className="flex items-center justify-between text-xs border-b border-[#F8F3EC] pb-2">
                                  <span className="font-black text-[#6E1F2B] font-serif capitalize">
                                    {outfit.name}
                                  </span>
                                  <span className="text-[10px] bg-[#F8F3EC] px-2.5 py-0.5 rounded-full text-[#5A3E32]">
                                    {outfit.occasion}
                                  </span>
                                </div>

                                <p className="text-xs text-[#8C8178] leading-relaxed italic">
                                  “{outfit.explanation}”
                                </p>

                                {/* Grid of clothes combo */}
                                <div className="flex items-center gap-3">
                                  {/* Candidate piece always first */}
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="w-14 h-14 bg-[#6E1F2B]/10 rounded-xl border border-[#6E1F2B]/40 p-1 flex items-center justify-center relative">
                                      {candImage ? (
                                        <img src={candImage} alt="Candidate" className="w-full h-full object-contain rounded" />
                                      ) : (
                                        <ClothesIllustration category={candForm.category} color={candForm.mainColor} />
                                      )}
                                      <span className="absolute -bottom-1 -right-1 bg-[#6E1F2B] text-white text-[8px] px-1 rounded-full font-bold">
                                        Nova
                                      </span>
                                    </div>
                                    <span className="text-[8px] text-[#6E1F2B] font-bold">Em Loja</span>
                                  </div>

                                  <span className="text-[#8C8178] font-bold text-sm">+</span>

                                  {/* Closet match items */}
                                  {matchedIds.map((id: string, i: number) => {
                                const matched = closet.find(c => c.id === id);
                                if (!matched) return null;
                                return (
                                  <React.Fragment key={id}>
                                    {i > 0 && <span className="text-[#8C8178] font-bold text-xs">+</span>}
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="w-14 h-14 bg-[#F8F3EC] rounded-xl border border-[#E8D8C3] p-1 flex items-center justify-center relative">
                                        {(matched.thumbnailUrl || matched.imageUrl) ? (
                                          <img src={matched.thumbnailUrl || matched.imageUrl} alt={matched.name} className="w-full h-full object-contain rounded" />
                                        ) : (
                                          <ClothesIllustration category={matched.category} color={matched.mainColor} />
                                        )}
                                      </div>
                                      <span className="text-[9px] text-[#1F1A17] max-w-[64px] truncate text-center">{matched.name}</span>
                                    </div>
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* CHOICE DECISION AT THE BOTTOM */}
                    <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-[#5A3E32]">Qual a sua decisão para essa simulação?</p>
                        <p className="text-[10px] text-[#8C8178]">Adicione ao seu closet virtual ou cancele a compra se for "cilada bonita".</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCarryToCloset("pass")}
                          className="bg-[#F8F3EC] hover:bg-red-50 text-[#6E1F2B]/80 font-semibold px-4 py-2 rounded-xl text-xs border border-[#E8D8C3]"
                        >
                          Deixar Passar 🚫
                        </button>
                        <button
                          onClick={() => handleCarryToCloset("buy")}
                          className="bg-[#5A3E32] hover:bg-[#422D24] text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm"
                        >
                          Simular Compra ✔
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 6. MEUS LOOKS: GRADE DE COMBINAÇÕES */}
        {currentTab === "looks" && (
          <div id="looks-view" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#5A3E32]">Meus Look Boards Virtuais</h2>
                <p className="text-xs text-[#8C8178]">
                  Sua inteligência estilística catalogada para evitar o famoso "não tenho o que vestir".
                </p>
              </div>

              {/* Quick helper badge */}
              <span className="bg-[#6E1F2B]/10 text-[#6E1F2B] text-xs px-3 py-1 rounded-full border border-[#6E1F2B]/20 font-bold">
                “Repetir roupa com estilo é chic!”
              </span>
            </div>

            {/* Look Board list filter */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setFilterOccasion("todas");
                  setFilterLookFavorites(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
                  filterOccasion === "todas" && !filterLookFavorites
                    ? "bg-[#5A3E32] text-white border-[#5A3E32]"
                    : "bg-white text-[#5A3E32] border border-[#E8D8C3] hover:bg-[#F8F3EC]"
                }`}
              >
                Todas as ocasiões
              </button>

              <button
                onClick={() => {
                  setFilterLookFavorites(true);
                  setFilterOccasion("todas");
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  filterLookFavorites
                    ? "bg-[#6E1F2B] text-white border-[#6E1F2B] shadow-xs"
                    : "bg-[#FFF5F5] text-[#6E1F2B] border border-[#FAD2D2] hover:bg-[#FFEBEB]"
                }`}
              >
                <Heart size={12} className={filterLookFavorites ? "fill-white text-white" : "fill-[#6E1F2B] text-[#6E1F2B]"} />
                <span>Favoritos</span>
              </button>

              {uniqueOccasions.map(occ => (
                <button
                  key={occ}
                  onClick={() => {
                    setFilterOccasion(occ);
                    setFilterLookFavorites(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer select-none ${
                    filterOccasion === occ && !filterLookFavorites
                      ? "bg-[#5A3E32] text-white border-[#5A3E32]"
                      : "bg-white text-[#5A3E32] border border-[#E8D8C3] hover:bg-[#F8F3EC]"
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            {/* outfits collection rendering list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const displayedOutfits = outfits.filter(out => {
                  if (filterLookFavorites) return out.favorite;
                  return filterOccasion === "todas" ? true : out.occasion === filterOccasion;
                });

                if (displayedOutfits.length === 0) {
                  return (
                    <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-[#E8D8C3] flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#F8F3EC] flex items-center justify-center text-[#6E1F2B]">
                        <Heart size={20} className={filterLookFavorites ? "fill-[#6E1F2B]" : ""} />
                      </div>
                      <p className="text-sm font-serif font-black text-[#5A3E32]">
                        {filterLookFavorites ? "Nenhum look favoritado ainda" : "Nenhum look board disponível ainda"}
                      </p>
                      <p className="text-xs text-[#8C8178] max-w-sm leading-relaxed">
                        {filterLookFavorites 
                          ? "Marque suas combinações favoritas com o ícone de coração para que elas apareçam neste menu de sucesso!" 
                          : "Assim que você cadastrar algumas peças, seus looks começam a aparecer por aqui."}
                      </p>
                    </div>
                  );
                }

                return displayedOutfits.map(outfit => {
                  return (
                    <div key={outfit.id} className="bg-white rounded-3xl border border-[#E8D8C3] shadow-sm p-5 space-y-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#5A3E32]">
                      
                      {/* Heart option at top-right */}
                      <button
                        onClick={() => toggleFavoriteLook(outfit.id)}
                        className="absolute top-4 right-4 text-[#8C8178] hover:text-[#6E1F2B]"
                      >
                        <Heart size={18} className={outfit.favorite ? "fill-[#6E1F2B] text-[#6E1F2B]" : ""} />
                      </button>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#E8D8C3] text-[#5A3E32] text-[10px] font-bold px-2 rounded-full uppercase">
                            {outfit.occasion}
                          </span>
                          <span className="text-[10px] text-[#8C8178]">Nota: {outfit.formalityLevel || "7"}/10</span>
                          {outfit.wornDates && outfit.wornDates.length > 0 && (
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 rounded-full block">
                              Usado {outfit.wornDates.length}x
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif font-black text-[#5A3E32] text-md">{outfit.name}</h3>
                        <p className="text-xs text-[#8C8178] italic leading-relaxed">
                          “{outfit.explanation}”
                        </p>

                        {/* COMPONENT CARDS IN LOOK */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          {outfit.itemIds.map(itemId => {
                            const foundItem = closet.find(c => c.id === itemId);
                            if (!foundItem) return null;
                            return (
                              <div
                                key={itemId}
                                onClick={() => setSelectedItem(foundItem)}
                                title={foundItem.name}
                                className="w-14 h-14 bg-[#F8F3EC] rounded-xl border border-[#E8D8C3] p-1.5 flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
                              >
                                {(foundItem.thumbnailUrl || foundItem.imageUrl) ? (
                                  <img src={foundItem.thumbnailUrl || foundItem.imageUrl} alt={foundItem.name} className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                  <ClothesIllustration category={foundItem.category} color={foundItem.mainColor} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-[#F8F3EC] pt-3 flex items-center justify-between">
                        <button
                          onClick={() => deleteOutfit(outfit.id)}
                          className="text-[11px] text-[#6E1F2B] hover:underline hover:text-red-800"
                        >
                          Excluir combinação
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => recordLookWear(outfit.id)}
                            className="text-[11px] font-bold text-[#5A3E32] hover:text-[#6E1F2B] bg-[#F8F3EC] px-3 py-1.5 rounded-lg border border-[#E8D8C3]/60"
                          >
                            Marcar como Usado ✔
                          </button>
                          <button
                            onClick={() => setViewingSharedOutfit(outfit)}
                            className="bg-[#5A3E32] text-white hover:bg-[#422D24] text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <Share2 size={12} />
                            <span>Exportar Quadro</span>
                          </button>
                          <button
                            onClick={() => {
                              setWhatsAppShareOutfit(outfit);
                              setWhatsAppShareDay("");
                            }}
                            className="bg-[#E8F8F0] hover:bg-[#D4F4E4] text-[#128C7E] text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-[#C5ECD6] transition-all"
                            title="Compartilhar look no WhatsApp para pedir opinião"
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* 7. SEMANA: PLANEJADOR SEMANAL DE LOOKS */}
        {currentTab === "planner" && (
          <div id="planner-view" className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8D8C3]/40 pb-5">
              <div className="space-y-1.5">
                <span className="text-[10px] bg-[#6E1F2B]/10 text-[#6E1F2B] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-[#6E1F2B]/20 inline-block font-serif">
                  Rotina Semanal sob Medida 🗓️
                </span>
                <h2 className="text-3xl font-serif font-black text-[#5A3E32] tracking-tight">Planejador Semanal de Estilo</h2>
                <p className="text-xs text-[#8C8178]">
                  Se programe com carinho para a semana toda, vestindo a sua melhor versão de si mesma com muita elegância!
                </p>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#5A3E32] bg-white border border-[#E8D8C3] px-4 py-2.5 rounded-2xl shadow-xs self-start md:self-center">
                <span className="text-emerald-600 font-bold">● Modo Ativo:</span>
                <span>Sincronizado com WhatsApp 💬</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[
                { key: "segunda", label: "Segunda-feira", icon: "✨", isWeekend: false },
                { key: "terça", label: "Terça-feira", icon: "💼", isWeekend: false },
                { key: "quarta", label: "Quarta-feira", icon: "📍", isWeekend: false },
                { key: "quinta", label: "Quinta-feira", icon: "🌿", isWeekend: false },
                { key: "sexta", label: "Sexta-feira", icon: "🥂", isWeekend: false },
                { key: "sábado", label: "Sábado", icon: "☀️", isWeekend: true },
                { key: "domingo", label: "Domingo", icon: "⛪", isWeekend: true },
              ].map(dayInfo => {
                const dayKey = dayInfo.key as keyof WeeklyPlanner;
                const activeOutfitId = weeklyPlanner[dayKey];
                const activeOutfit = outfits.find(o => o.id === activeOutfitId);

                return (
                  <div 
                    key={dayInfo.key} 
                    className={`rounded-[28px] border transition-all duration-300 flex flex-col justify-between min-h-[320px] shadow-sm hover:shadow-md hover:border-[#5A3E32]/40 relative overflow-hidden group ${
                      dayInfo.isWeekend 
                        ? "bg-[#FFF9F2]/90 border-[#E8D8C3] hover:bg-[#FFF6EB]" 
                        : "bg-white border-[#E8D8C3]"
                    }`}
                  >
                    {/* Top Accent Strip */}
                    <div className={`h-1.5 w-full absolute top-0 left-0 ${dayInfo.isWeekend ? "bg-gradient-to-r from-[#B98A5A] to-[#6E1F2B]" : "bg-gradient-to-r from-[#8C8178] to-[#5A3E32]"}`} />
                    
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* Card Header row */}
                      <div className="flex items-center justify-between border-b border-[#F8F3EC] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base select-none">{dayInfo.icon}</span>
                          <span className="text-sm font-serif font-bold text-[#5A3E32] tracking-tight">
                            {dayInfo.label}
                          </span>
                        </div>
                        {activeOutfit && (
                          <button
                            onClick={() => {
                              setWeeklyPlanner(prev => ({
                                ...prev,
                                [dayKey]: undefined
                              }));
                              showToast(`Look removido de ${dayInfo.label} 🧹`);
                            }}
                            className="p-1.5 text-[#8C8178] hover:text-[#6E1F2B] hover:bg-[#F8F3EC] rounded-full transition-all cursor-pointer"
                            title="Remover look"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      
                      {/* Active Outfit Section */}
                      <div className="flex-1 flex flex-col justify-center">
                        {activeOutfit ? (
                          <div className="space-y-4 py-1">
                            <div className="space-y-1">
                              <h4 className="text-xs font-serif font-black text-[#5A3E32] line-clamp-1 leading-snug group-hover:text-[#6E1F2B] transition-colors">{activeOutfit.name}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] uppercase tracking-wider font-extrabold bg-[#F8F3EC] border border-[#E8D8C3]/50 text-[#5A3E32] px-2 py-0.5 rounded-full">
                                  {activeOutfit.occasion}
                                </span>
                              </div>
                            </div>

                            {/* Circular pieces view with rich rendering */}
                            <div className="flex -space-x-2.5 overflow-hidden py-1">
                              {activeOutfit.itemIds.slice(0, 4).map(itemId => {
                                const found = closet.find(c => c.id === itemId);
                                if (!found) return null;
                                return (
                                  <div 
                                    key={itemId} 
                                    className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-white shadow-xs shrink-0 relative hover:-translate-y-1 transition-transform"
                                    title={found.name}
                                  >
                                    <div className="w-full h-full rounded-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center border border-[#E8D8C3]/40">
                                      {(found.thumbnailUrl || found.imageUrl) ? (
                                        <img src={found.thumbnailUrl || found.imageUrl} alt={found.name} className="w-full h-full object-contain" />
                                      ) : (
                                        <ClothesIllustration category={found.category} color={found.mainColor} />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {activeOutfit.itemIds.length > 4 && (
                                <div className="w-11 h-11 rounded-full bg-[#6E1F2B] border-2 border-white shadow-xs flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                  +{activeOutfit.itemIds.length - 4}
                                </div>
                              )}
                            </div>

                            {/* Share button nicely placed */}
                            <button
                              onClick={() => {
                                setWhatsAppShareOutfit(activeOutfit);
                                setWhatsAppShareDay(dayInfo.key);
                              }}
                              className="w-full bg-[#E8F8F0] hover:bg-[#D4F4E4] text-[#128C7E] text-[10px] font-bold py-2 px-2.5 rounded-xl flex items-center justify-center gap-2 transition-all border border-[#C5ECD6] cursor-pointer"
                            >
                              <span className="text-xs">💬</span>
                              <span>Pedir Opinião (WhatsApp)</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-6 px-4 border-2 border-dashed border-[#E8D8C3]/70 rounded-2xl bg-[#FBF9F6]/50 space-y-1.5 my-2">
                            <span className="text-xl">👗</span>
                            <p className="text-[11px] text-[#5A3E32] font-semibold leading-none">Armário Livre</p>
                            <p className="text-[9px] text-[#8C8178] max-w-[150px] mx-auto leading-relaxed">Selecione uma combinação abaixo!</p>
                          </div>
                        )}
                      </div>

                      {/* Select Dropdown styling */}
                      <div className="pt-3 border-t border-[#F8F3EC]">
                        <select
                          value={activeOutfitId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWeeklyPlanner(prev => ({
                              ...prev,
                              [dayKey]: val || undefined
                            }));
                            if (val) {
                              const foundOfOf = outfits.find(o => o.id === val);
                              showToast(`Look "${foundOfOf?.name}" planejado para ${dayInfo.label}! 🤎`);
                            }
                          }}
                          className="w-full bg-[#F8F3EC] hover:bg-[#E8D8C3]/20 border border-[#E8D8C3] px-2.5 py-2.5 rounded-xl text-[10px] text-[#5A3E32] font-semibold outline-none cursor-pointer focus:border-[#5A3E32] transition-colors font-serif"
                        >
                          <option value="">{activeOutfit ? "🔄 Trocar Look..." : "➕ Escolher Look..."}</option>
                          {outfits.map(out => (
                            <option key={out.id} value={out.id}>
                              {out.name} ({out.occasion})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 bg-gradient-to-r from-[#FFF9F2] to-[#FAF8F5] border border-[#E8D8C3] rounded-3xl flex items-start gap-4 shadow-xs">
              <div className="p-2.5 bg-white rounded-2xl shadow-xs border border-[#E8D8C3]/40">
                <span className="text-2xl">💡</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-serif font-black text-[#6E1F2B] uppercase tracking-wider">Segredo de Organização da Lay:</p>
                <p className="text-xs text-[#5A3E32] leading-relaxed italic">
                  “Se organize no domingo à noite, Mariana! Gaste 10 minutinhos separando os sapatos e as blusas com antecedência. Isso salva aquela sensação irritante de 'não ter nada na hora de sair corrido pro trabalho.”
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 8. LISTA DE COMPRAS INTELIGENTES */}
        {currentTab === "shopping" && (
          <div id="shopping-view" className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-[#5A3E32]">Lista para Compras Inteligentes</h2>
              <p className="text-xs text-[#8C8178]">
                “Não é sobre comprar mais, Mariana. É sobre comprar o item certo que faz todo o seu acervo se multiplicar!”
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* RECOMMENDED BUY LIST CORES AND PIECES */}
              <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-md text-[#5A3E32] flex items-center gap-1">
                  <span>Peças Recomendadas para seu Closet</span>
                </h3>

                <div className="space-y-4">
                  {shoppingRecs.map(rec => {
                    return (
                      <div key={rec.id} className="p-4 bg-[#F8F3EC]/70 rounded-2xl border border-[#E8D8C3] space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#5A3E32]">
                          <span className="font-serif capitalize text-sm">{rec.itemType}</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                            rec.priority === "Alta" ? "bg-[#6E1F2B] text-white" : "bg-[#E8D8C3] text-[#5A3E32]"
                          }`}>{rec.priority} prioridade</span>
                        </div>

                        <div className="text-[11px] text-[#8C8178] space-y-1">
                          <p><strong className="text-[#5A3E32]">Cor sugerida:</strong> {rec.suggestedColor}</p>
                          <p>{rec.reason}</p>
                        </div>

                        <div className="pt-2 border-t border-[#E8D8C3]/30 flex items-center justify-between text-[10px]">
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                            +{rec.estimatedOutfitIncrease} looks potenciais!
                          </span>
                          <button
                            onClick={() => {
                              // Simulate setting as candidate
                              setCandForm({
                                name: `${rec.itemType} Curinga`,
                                category: rec.itemType.toLowerCase(),
                                mainColor: rec.suggestedColor.split(" ")[0],
                                styleTags: ["Elegante", "Clássico"],
                                occasions: ["Trabalho", "Igreja", "Passeio"]
                              });
                              setCurrentTab("combina");
                              showToast(`Preparamos uma simulação fofa de ${rec.itemType}! Adicione uma foto.`);
                            }}
                            className="text-[#6E1F2B] hover:underline font-bold"
                          >
                            Simular no Combina Comigo? 🛍️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AVOID SHOPPING TIPS / COMPRA CONSCIENTE LAWS */}
              <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3]/80 space-y-4">
                <h3 className="font-serif font-bold text-md text-[#5A3E32]">Leis da Compra Consciente da Lay</h3>
                
                <div className="space-y-3.5 text-xs text-[#5A3E32] leading-relaxed">
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex gap-2.5">
                    <span className="text-base">💎</span>
                    <div>
                      <p className="font-serif font-black">Evite a Peça Órfã</p>
                      <p className="text-[11px] text-[#8C8178] mt-0.5">Se a peça exige que você compre um sapato novo, uma saia específica e mais um cinto para poder usar pela primeira vez, ela é uma armadilha!</p>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex gap-2.5">
                    <span className="text-base">🖤</span>
                    <div>
                      <p className="font-serif font-black">Cuidado com o "Guarda-Roupa Pilha de Cópias"</p>
                      <p className="text-[11px] text-[#8C8178] mt-0.5">{`Você já tem 4 camisetas pretas ou 3 calças jeans extremamente parecidas. Não compre a 5ª peça idêntica achando que vai mudar seu estilo. Use o recurso Closet Map para ver o excesso!`}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2.5">
                    <span className="text-base">💋</span>
                    <div>
                      <p className="font-serif font-black">O Preço Emocional</p>
                      <p className="text-[11px] text-[#8C8178] mt-0.5">Blusa barata em promoção que pinica, ou blazer de poliéster que esquenta demais e fica parado não trabalha para você. O barato sai caro na vida real.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#F8F3EC] rounded-xl text-center space-y-2 border border-[#E8D8C3]">
                  <p className="font-serif text-[#5A3E32] italic text-xs">
                    “Deveríamos abrir nosso armário e sentir alegria pelas poucas e boas escolhas, não culpa pelo dinheiro parado.”
                  </p>
                  <p className="text-[10px] font-bold text-[#8C8188]">— Um beeeeijo da Lay 💋</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 9. PERFIL: DEFINIÇÕES DO PERFIL MARIANA & CONFIGS */}
        {currentTab === "profile" && (
          <div id="profile-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-[#E8D8C3] shadow-sm space-y-6">
              
              <div className="border-b border-[#F8F3EC] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#5A3E32]">Definições de Estilo da Mariana</h2>
                  <p className="text-xs text-[#8C8178]">
                    Ajuste os filtros de estilo e ocasiões para o algoritmo do Método CHIC refletir perfeitamente seu dia a dia!
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#E8D8C3] rounded-full flex items-center justify-center font-serif text-lg text-[#5A3E32] font-black">
                  M
                </div>
              </div>

              {/* Form elements for onboarding edit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Seu Nome de Usuária</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Rotina Dominante</label>
                  <input
                    type="text"
                    value={profile.mainRoutine}
                    onChange={(e) => setProfile({ ...profile, mainRoutine: e.target.value })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Estilo de Preferência</label>
                  <select
                    value={profile.stylePreference}
                    onChange={(e) => setProfile({ ...profile, stylePreference: e.target.value })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                  >
                    <option value="Clássico">Clássico / Tradicional</option>
                    <option value="Elegante">Elegante Moderno (Alfaiataria e Peça Fina)</option>
                    <option value="Casual">Casual Prático (Correr com fofurinhas e Mercado)</option>
                    <option value="Criativo">Criativo Autoral (Estampas e Acessório rico)</option>
                    <option value="Confortável">Confortável Despojado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Cores que Ama 🤎</label>
                  <input
                    type="text"
                    value={profile.lovedColors.join(", ")}
                    onChange={(e) => setProfile({ ...profile, lovedColors: e.target.value.split(", ") })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                    placeholder="Separe por vírgulas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Cores Secundárias que evita ou Estilo indesejado</label>
                  <input
                    type="text"
                    value={profile.avoidedColors.join(", ")}
                    onChange={(e) => setProfile({ ...profile, avoidedColors: e.target.value.split(", ") })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                    placeholder="Separe por vírgulas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#5A3E32] font-bold">Lojas queridas onde mais compra</label>
                  <input
                    type="text"
                    value={profile.stores.join(", ")}
                    onChange={(e) => setProfile({ ...profile, stores: e.target.value.split(", ") })}
                    className="w-full bg-[#F8F3EC] border border-[#E8D8C3] px-3.5 py-2 rounded-xl text-xs outline-none focus:border-[#5A3E32]"
                    placeholder="Separe por vírgulas"
                  />
                </div>
              </div>

              {/* PRIVACY SYSTEM POLICY CARD */}
              <div className="bg-[#F8F3EC] p-5 rounded-2xl border border-[#E8D8C3] space-y-3">
                <span className="text-xs font-bold text-[#5A3E32] flex items-center gap-1">
                  <Info size={14} className="text-[#6E1F2B]" />
                  <span>Aviso de Privacidade & Segurança de Imagem 🔒</span>
                </span>
                
                <p className="text-[11px] text-[#8C8178] leading-relaxed">
                  As fotos do seu guarda-roupa virtual e imagens de provadores pertencem exclusivamente a você. Nosso sistema de IA analítica funciona em ambiente seguro e não expõe suas fotos publicamente sem sua autorização explícita de compartilhamento.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (confirm("Quer realmente apagar todos os cookies locais e zerar o closet de testes?")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="bg-white hover:bg-red-50 text-[#6E1F2B] border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                  >
                    Excluir minha conta e dados
                  </button>
                  <button
                    onClick={() => {
                      showToast("Na versão de protótipo, suas imagens podem ser salvas localmente no navegador para teste. Em uma versão de produção, o ideal é usar armazenamento seguro em nuvem com controle de acesso.");
                    }}
                    className="bg-white hover:bg-[#E8D8C3]/40 text-[#5A3E32] border border-[#E8D8C3] px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                  >
                    Excluir todas as fotos carregadas
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    showToast("Suas alterações de perfil foram salvas com muito carinho! 💋");
                    setCurrentTab("dashboard");
                  }}
                  className="bg-[#5A3E32] text-[#F8F3EC] hover:bg-[#422D24] px-6 py-2 rounded-xl text-xs font-bold transition-all shadow"
                >
                  Confirmar e Salvar Definições ✔
                </button>
              </div>

            </div>
          </div>
        )}

        {currentTab === "colorimetria" && (
          <ColorAnalysis
            userProfile={profile}
            onChangeProfile={setProfile}
            showToast={showToast}
          />
        )}

        {currentTab === "mala" && (
          <TravelSuitcase
            closet={closet}
            showToast={showToast}
          />
        )}

      </main>

      {/* FOOTER AREA */}
      <footer className="border-t border-[#E8D8C3] bg-white py-8 px-4 text-center text-xs text-[#8C8178] space-y-2">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-serif text-[#5A3E32]">
            © {new Date().getFullYear()} Closet Inteligente da Lay. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:underline cursor-pointer" onClick={() => setCurrentTab("profile")}>Privacidade das Fotos</span>
            <span className="hover:underline cursor-pointer" onClick={() => setCurrentTab("profile")}>Termos de Uso Consciente</span>
            <span className="text-[#6E1F2B] font-bold">Um beeeeijo da Lay 💋</span>
          </div>
        </div>
      </footer>

      {/* OUTDATED PREVIEW STORY POPUP EXPORTER 9:16 FORMAT (SHARE COMPONENT) */}
      {viewingSharedOutfit && (
        <div className="fixed inset-0 bg-[#1F1A17]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EC] w-full max-w-sm rounded-3xl overflow-hidden border-2 border-[#E8D8C3] shadow-2xl flex flex-col">
            
            {/* Story Exporter Header */}
            <div className="p-3 bg-white border-b border-[#E8D8C3] flex items-center justify-between">
              <span className="text-xs font-serif font-black text-[#5A3E32]">Exportar Look Board (Stories Instagram)</span>
              <button
                onClick={() => setViewingSharedOutfit(null)}
                className="p-1 hover:bg-[#F8F3EC] rounded-full text-[#8C8178] hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stories board template (9:16 style) */}
            <div className="p-6 flex-1 bg-[#F8F3EC] flex flex-col justify-between space-y-6 select-none relative" style={{ minHeight: "480px" }}>
              <div className="absolute top-3 right-3 text-xs bg-white/70 px-2 py-0.5 rounded-full text-[#5A3E32] font-semibold border border-[#E8D8C3]">
                {viewingSharedOutfit.occasion}
              </div>

              {/* Branding Header inside story */}
              <div className="text-center space-y-1">
                <span className="text-xl">🤎</span>
                <h3 className="font-serif font-black uppercase text-xs tracking-widest text-[#5A3E32]">Closet Inteligente da Lay</h3>
                <p className="text-[9px] text-[#8C8178] italic font-serif">“Moda inteligente para a vida real”</p>
              </div>

              {/* Central Outfit Combination */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8D8C3] space-y-4 shadow-sm text-center">
                <h4 className="font-serif font-black text-sm text-[#6E1F2B]">{viewingSharedOutfit.name}</h4>
                
                {/* Outfits elements representation row */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {viewingSharedOutfit.itemIds.map(id => {
                    const matched = closet.find(c => c.id === id);
                    if (!matched) return null;
                    return (
                      <div key={id} className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-[#F8F3EC] rounded-xl border border-[#E8D8C3] p-1 flex items-center justify-center">
                          {(matched.thumbnailUrl || matched.imageUrl) ? (
                            <img src={matched.thumbnailUrl || matched.imageUrl} alt={matched.name} className="w-full h-full object-contain rounded animate-fade-in" />
                          ) : (
                            <ClothesIllustration category={matched.category} color={matched.mainColor} />
                          )}
                        </div>
                        <span className="text-[8px] text-[#5A3E32] max-w-[50px] truncate">{matched.name}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-[#5A3E32] leading-relaxed italic border-t border-[#F8F3EC] pt-2.5">
                  “{viewingSharedOutfit.explanation}”
                </p>
              </div>

              {/* Story visual bottom seal */}
              <div className="text-center space-y-1">
                <span className="text-[10px] bg-[#6E1F2B] text-white px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  Look CHIC Aprovado!
                </span>
                <p className="text-[9px] text-[#8C8178] pt-1">Um beeeeijo da Lay 💋</p>
              </div>
            </div>

            {/* Sharing actions */}
            <div className="p-4 bg-white border-t border-[#E8D8C3] grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  showToast("Look exportado com qualidade! Imagem copiada para a área de transferência.");
                  setViewingSharedOutfit(null);
                }}
                className="bg-[#F8F3EC] hover:bg-[#E8D8C3]/50 text-[#5A3E32] py-2.5 rounded-xl text-xs font-semibold border border-[#E8D8C3] text-center"
              >
                Copiar Imagem 📋
              </button>
              <button
                onClick={() => {
                  showToast("Look salvo na galeria do seu smartphone com sucesso!");
                  setViewingSharedOutfit(null);
                }}
                className="bg-[#5A3E32] text-white hover:bg-[#422D24] py-2.5 rounded-xl text-xs font-semibold text-center"
              >
                Salvar no Celular 📲
              </button>
            </div>

          </div>
        </div>
      )}

      {whatsAppShareOutfit && (
        <WhatsAppShareModal
          isOpen={!!whatsAppShareOutfit}
          onClose={() => {
            setWhatsAppShareOutfit(null);
            setWhatsAppShareDay("");
          }}
          outfit={whatsAppShareOutfit}
          day={whatsAppShareDay}
          closet={closet}
          showToast={showToast}
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION TABS FOR ENHANCED UX */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-[#E8D8C3] pt-2 pb-[calc(11px+env(safe-area-inset-bottom,0px))] px-3 flex justify-around items-center lg:hidden shadow-[0_-4px_20px_rgba(90,62,50,0.05)]">
        <button
          onClick={() => { setCurrentTab("dashboard"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${currentTab === "dashboard" ? "text-[#6E1F2B] font-bold" : "text-[#8C8178]"}`}
        >
          <Compass size={18} />
          <span>Principal</span>
        </button>
        <button
          onClick={() => { setCurrentTab("closet"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${currentTab === "closet" ? "text-[#6E1F2B] font-bold" : "text-[#8C8178]"}`}
        >
          <span className="text-sm">👗</span>
          <span>Closet</span>
        </button>
        <button
          onClick={() => { setCurrentTab("combina"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] relative -top-3 bg-[#6E1F2B] text-white p-2.5 rounded-full shadow-md`}
        >
          <Camera size={18} />
        </button>
        <button
          onClick={() => { setCurrentTab("looks"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${currentTab === "looks" ? "text-[#6E1F2B] font-bold" : "text-[#8C8178]"}`}
        >
          <Heart size={18} />
          <span>Looks</span>
        </button>
        <button
          onClick={() => { setCurrentTab("colorimetria"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${currentTab === "colorimetria" ? "text-[#6E1F2B] font-bold" : "text-[#8C8178]"}`}
        >
          <Palette size={18} />
          <span>Espelho</span>
        </button>
        <button
          onClick={() => { setCurrentTab("planner"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${currentTab === "planner" ? "text-[#6E1F2B] font-bold" : "text-[#8C8178]"}`}
        >
          <Calendar size={18} />
          <span>Semana</span>
        </button>
        <button
          onClick={() => { setCurrentTab("mala"); setSelectedItem(null); }}
          className={`flex flex-col items-center gap-0.5 text-[10px] ${currentTab === "mala" ? "text-[#6E1F2B] font-bold" : "text-[#8C8178]"}`}
        >
          <Briefcase size={18} />
          <span>Mala</span>
        </button>
      </div>

    </div>
  );
}
