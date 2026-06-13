import { ClosetItem, Outfit, UserProfile, ShoppingRecommendation, WeeklyPlanner } from "../types";

export const INITIAL_PROFILE: UserProfile = {
  id: "lay_user_1",
  name: "Mariana",
  mainRoutine: "Maternidade/Home Office & Culto",
  occasions: ["Passeio", "Igreja", "Trabalho", "Almoço de família", "Dia a dia"],
  styleGoals: ["Ficar mais arrumada no dia a dia", "Aproveitar camisas e alfaiataria", "Comprar de forma mais consciente"],
  lovedColors: ["Bege", "Off-white", "Caramelo", "Azul-marinho", "Vinho"],
  avoidedColors: ["Verde limão", "Laranja neon", "Estampas exageradas"],
  stores: ["Renner", "C&A", "Boutiques do Instagram", "Shein"],
  stylePreference: "Elegante",
  createdAt: new Date().toISOString()
};

export const INITIAL_CLOSET: ClosetItem[] = [
  {
    id: "item_1",
    name: "Camisa Branca Fluida",
    category: "camisa",
    subcategory: "Camisa de botão clássica",
    mainColor: "Branco",
    pattern: "Liso",
    fabric: "Viscose acetinada",
    fit: "Fluído",
    season: "Todas as estações",
    occasions: ["Trabalho", "Igreja", "Passeio", "Almoço de família"],
    styleTags: ["Elegante", "Clássico"],
    loveLevel: 5,
    frequencyOfUse: "Uso muito",
    difficultyToStyle: "Muito fácil",
    versatilityScore: 95,
    notes: "O verdadeiro cavalo de batalha do armário. Funciona com jeans, alfaiataria ou saia. Chique, viu? 🤎",
    imageUrl: "", // empty so we render the SVG
    createdAt: new Date().toISOString()
  },
  {
    id: "item_2",
    name: "Calça de Alfaiataria Azul-marinho",
    category: "calça",
    subcategory: "Calça pantalona leve",
    mainColor: "Azul-marinho",
    pattern: "Liso",
    fabric: "Crepe",
    fit: "Acinturado, pernas largas",
    season: "Todas as estações",
    occasions: ["Trabalho", "Igreja", "Jantar"],
    styleTags: ["Elegante", "Clássico"],
    loveLevel: 5,
    frequencyOfUse: "Uso médio",
    difficultyToStyle: "Fácil",
    versatilityScore: 88,
    notes: "Minha calça favorita para parecer arrumada em 2 minutos. O marinho é o novo preto! 💋",
    imageUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "item_3",
    name: "Calça Jeans Reta Clara",
    category: "jeans",
    subcategory: "Jeans reto tradicional",
    mainColor: "Jeans claro",
    pattern: "Liso",
    fabric: "Algodão rígido",
    fit: "Corte reto reto",
    season: "Todas as estações",
    occasions: ["Passeio", "Dia a dia", "Almoço de família", "Viagem"],
    styleTags: ["Casual", "Confortável"],
    loveLevel: 4,
    frequencyOfUse: "Uso muito",
    difficultyToStyle: "Muito fácil",
    versatilityScore: 90,
    notes: "Jeans durável excelente com tênis ou salto rasteiro.",
    imageUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "item_4",
    name: "Saia Midi Plissada Preta",
    category: "saia",
    subcategory: "Saia midi fluida",
    mainColor: "Preto",
    pattern: "Liso",
    fabric: "Poliéster leve",
    fit: "Evasê soltinha",
    season: "Meia-estação",
    occasions: ["Igreja", "Passeio", "Jantar", "Almoço de família"],
    styleTags: ["Feminino", "Elegante"],
    loveLevel: 4,
    frequencyOfUse: "Uso médio",
    difficultyToStyle: "Médio",
    versatilityScore: 80,
    notes: "Traz movimento e feminilidade para o look. Fica linda com camisa branca por dentro.",
    imageUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "item_5",
    name: "Sandália Nude de Tiras",
    category: "sandália",
    subcategory: "Sandália de salto bloco baixo",
    mainColor: "Nude",
    pattern: "Liso",
    fabric: "Sintético premium",
    fit: "Salto confortável de 4cm",
    season: "Todas as estações",
    occasions: ["Trabalho", "Igreja", "Passeio", "Almoço de família"],
    styleTags: ["Elegante", "Clássico"],
    loveLevel: 5,
    frequencyOfUse: "Uso muito",
    difficultyToStyle: "Muito fácil",
    versatilityScore: 98,
    notes: "Alonga as pernas e não machuca o pé em casamentos ou cultos longos. Amo muito! 🤎",
    imageUrl: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "item_6",
    name: "Bolsa Caramelo Estruturada",
    category: "bolsa",
    subcategory: "Bolsa tiracolo média",
    mainColor: "Caramelo",
    pattern: "Liso",
    fabric: "Couro legítimo",
    fit: "Tamanho médio com alça regulável",
    season: "Todas as estações",
    occasions: ["Trabalho", "Igreja", "Passeio", "Viagem"],
    styleTags: ["Elegante", "Clássico"],
    loveLevel: 5,
    frequencyOfUse: "Uso muito",
    difficultyToStyle: "Muito fácil",
    versatilityScore: 92,
    notes: "A verdadeira cor que traz calor e sofisticação pras bases neutras. Um espetáculo! Chique, viu?",
    imageUrl: "",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_OUTFITS: Outfit[] = [
  {
    id: "look_1",
    name: "Domingo Elegante & Clássico",
    itemIds: ["item_1", "item_2", "item_5", "item_6"],
    occasion: "Igreja",
    styleTags: ["Elegante", "Clássico"],
    formalityLevel: 8,
    weather: "Todas as estações",
    explanation: "Camisa branca por dentro da calça azul-marinho de alfaiataria, finalizado com sandália nude e bolsa caramelo. Base pura de sofisticação possível na vida real! Chique, viu? 🤎",
    favorite: true,
    wornDates: ["2026-06-07"],
    createdAt: new Date().toISOString()
  },
  {
    id: "look_2",
    name: "Casual Chic de Sábado",
    itemIds: ["item_1", "item_3", "item_5", "item_6"],
    occasion: "Passeio",
    styleTags: ["Casual", "Elegante"],
    formalityLevel: 6,
    weather: "Dias quentes",
    explanation: "A mesma camisa de botão usada de forma mais descontraída, com mangas levemente dobradas, Jeans reto claro, sandália nude e bolsa caramelo. Elegância de shopping imediata! 💋",
    favorite: false,
    wornDates: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "look_3",
    name: "Feminilidade com Praticidade",
    itemIds: ["item_1", "item_4", "item_5"],
    occasion: "Almoço de família",
    styleTags: ["Feminino", "Elegante"],
    formalityLevel: 7,
    weather: "Meia-estação",
    explanation: "Camisa branca e saia midi plissada preta com sandália nude. Um look com fluidez que valoriza sem parecer exagerada. Um beeeeijo da Lay! 💋",
    favorite: true,
    wornDates: ["2026-06-04"],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SHOPPING_RECOMMENDATIONS: ShoppingRecommendation[] = [
  {
    id: "rec_1",
    itemType: "Blazer",
    suggestedColor: "Bege ou Off-white",
    reason: "Sua coleção tem excelentes bases de pernas (azul-marinho e jeans reto claro), e camisas maravilhosas. Um blazer bege trará a terceira peça perfeita para estruturar e elevar seus looks em pelo menos mais 6 combinações reais!",
    priority: "Alta",
    estimatedOutfitIncrease: 6
  },
  {
    id: "rec_2",
    itemType: "Tricô Leve / Cardigan",
    suggestedColor: "Vinho ou Marrom",
    reason: "Pra trazer um ponto de cor rica e outonal que super combina com sua paleta de caramelo e azul-marinho.",
    priority: "Média",
    estimatedOutfitIncrease: 4
  },
  {
    id: "rec_3",
    itemType: "Tênis Casual Retro",
    suggestedColor: "Branco com detalhes beges",
    reason: "Permite usar a calça azul-marinho e o jeans claro em propostas totalmente despojadas para a correria com filhos ou compras rápidas, com muito conforto.",
    priority: "Média",
    estimatedOutfitIncrease: 5
  },
  {
    id: "rec_4",
    itemType: "Vestido Preto",
    suggestedColor: "Preto liso",
    reason: "Evite comprar vestidos muito estampados que rendem poucas opções. Um vestido preto liso de bom corte é curinga.",
    priority: "Média",
    estimatedOutfitIncrease: 3
  }
];

export const INITIAL_WEEKLY_PLANNER: WeeklyPlanner = {
  segunda: "look_1",
  terça: undefined,
  quarta: "look_2",
  quinta: undefined,
  sexta: undefined,
  sábado: "look_2",
  domingo: "look_1"
};

// State fetching helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(`closet_lay_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn("Could not load from localStorage:", error);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`closet_lay_${key}`, JSON.stringify(data));
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
};
