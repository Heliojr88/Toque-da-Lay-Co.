export interface UserProfile {
  id: string;
  name: string;
  mainRoutine: string; // ex: "Trabalho comercial", "Maternidade/Home Office", "Estudante", "Autônoma"
  occasions: string[]; // ex: ["Trabalho", "Igreja", "Passeio", "Almoço de família", "Dia a dia", "Jantar"]
  styleGoals: string[]; // ex: ["Ficar mais arrumada", "Usar peças paradas", "Visual clássico com bossa", "Feminina e delicada"]
  lovedColors: string[];
  avoidedColors: string[];
  stores: string[]; // ex: ["Renner", "C&A", "Zara", "Riachuelo", "Brechós", "Online"]
  stylePreference: string; // "Clássico" | "Elegante" | "Criativo" | "Confortável" | "Casual"
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  role: "admin" | "user";
  name: string;
  status: "active" | "blocked";
  createdAt: string;
  lastLogin?: string;
  profileSetupCompleted: boolean;
  securityQuestion: string;
  securityAnswer: string;
  customTipFromLay?: string; // Custom consulting advice left directly by an admin
}

export interface ClosetItem {
  id: string;
  userId?: string; // Links this item to a specific UserAccount
  name: string;
  category: string; // blusa, camiseta, camisa, regata, calça, jeans, saia, short, vestido, macacão, blazer, jaqueta, cardigan, colete, tricô, sapato, sandália, tênis, bota, bolsa, cinto, acessório
  subcategory?: string;
  mainColor: string;
  secondaryColors?: string[];
  pattern?: string;
  fabric?: string;
  fit?: string;
  season?: string;
  occasions: string[];
  styleTags: string[];
  loveLevel: number; // 1-5 estrelas
  frequencyOfUse: string; // "Nunca usei" | "Uso pouco" | "Uso médio" | "Uso muito"
  difficultyToStyle: string; // "Muito fácil" | "Fácil" | "Médio" | "Difícil"
  versatilityScore: number; // 0 a 100
  notes?: string;
  imageUrl: string; // base64 string ou URL do asset gerado
  thumbnailUrl?: string; // Light compressed version for grids and cards
  analysisImageUrl?: string; // Base64 optimized for AI processing
  imageMeta?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    width: number;
    height: number;
    mimeType: string;
  };
  createdAt: string;
}

export interface Outfit {
  id: string;
  userId?: string; // Links this outfit to a specific UserAccount
  name: string;
  itemIds: string[]; // IDs das ClosetItem
  candidateItem?: {
    name: string;
    category: string;
    imageUrl: string;
    mainColor: string;
  }; // Se for look board gerado para peça em loja
  occasion: string;
  styleTags?: string[];
  formalityLevel?: number; // 1-10
  weather?: string; // ex: "Dias quentes"
  explanation?: string;
  favorite: boolean;
  wornDates?: string[]; // Datas em que a usuária usou esse look
  createdAt: string;
}

export interface CandidateItemAnalysis {
  name: string;
  category: string;
  subcategory?: string;
  mainColor: string;
  secondaryColors?: string[];
  pattern?: string;
  fabric?: string;
  fit?: string;
  season?: string[];
  occasions: string[];
  styleTags: string[];
  formalityLevel?: number;
  versatilityScore?: number;
  visualWarnings?: string[];
  confidence?: number;
}

export interface PurchaseCandidate {
  id: string;
  name: string;
  category: string;
  mainColor: string;
  styleTags: string[];
  occasions: string[];
  imageUrl: string;
  chicScore?: {
    combina: number;
    harmoniza: number;
    integra: number;
    compensa: number;
    final: number;
  };
  classification?: string; // "Compra forte", "Pensar melhor", "Só compre se amar muito", "Cilada bonita"
  verdictText?: string;
  generatedOutfits?: {
    name: string;
    occasion: string;
    explanation: string;
    formalityLevel: number;
    weather: string;
    matchingItemIds: string[];
  }[];
  warnings?: string[];
  createdAt: string;
}

export interface ShoppingRecommendation {
  id: string;
  itemType: string;
  suggestedColor: string;
  reason: string;
  priority: "Alta" | "Média" | "Baixa";
  estimatedOutfitIncrease: number;
  avoidReason?: string;
}

export interface WeeklyPlanner {
  segunda?: string; // Outfit ID
  terça?: string;
  quarta?: string;
  quinta?: string;
  sexta?: string;
  sábado?: string;
  domingo?: string;
}
