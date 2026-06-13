import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "../types";
import {
  validateImageFile,
  resizeAndCompressImage,
  formatFileSize
} from "../lib/imageUtils";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Check, 
  HelpCircle, 
  Info, 
  Palette, 
  Sliders, 
  Smile, 
  FileImage,
  ChevronRight,
  TrendingUp,
  X,
  MapPin,
  Heart
} from "lucide-react";

// The 12 seasons of the expanded seasonal method
interface SeasonDetail {
  id: string;
  name: string;
  englishName: string;
  undertone: "Quente" | "Frio" | "Neutro-Quente" | "Neutro-Frio";
  description: string;
  contrast: string;
  contrastDesc: string;
  celebrities: string[];
  lovedColors: string[];
  lovedHex: string[];
  avoidedColors: string[];
  avoidedHex: string[];
  layTip: string;
}

const SEASONS: Record<string, SeasonDetail> = {
  "outono_quente": {
    id: "outono_quente",
    name: "Outono Quente",
    englishName: "Warm Autumn",
    undertone: "Quente",
    description: "Sua beleza é definida por tons ricos, terrosos e dourados intensos. Sua pele brilha com cores profundas e especiarias como mostarda, terracota e verde oliva.",
    contrast: "Médio",
    contrastDesc: "Contraste médio suave que harmoniza lindamente com tons amadeirados.",
    celebrities: ["Julianne Moore", "Madeline Petsch", "Giselle Itié"],
    lovedColors: ["Mostarda", "Terracota", "Verde Oliva", "Telha", "Marrom Chocolate", "Caramelo Dourado"],
    lovedHex: ["#D4A373", "#C15C3D", "#556B2F", "#A0522D", "#3E2723", "#D2B48C"],
    avoidedColors: ["Azul Royal", "Rosa Choque", "Preto Puro", "Branco Gelo", "Prata Metálico"],
    avoidedHex: ["#4169E1", "#FF1493", "#000000", "#F0F8FF", "#C0C0C0"],
    layTip: "Evite peças perto do rosto em tons extremamente frios e acinzentados. Invista em acessórios de dourado fosco ou escovado e abuse da alfaiataria caramelo!"
  },
  "outono_suave": {
    id: "outono_suave",
    name: "Outono Suave",
    englishName: "Soft Autumn",
    undertone: "Neutro-Quente",
    description: "Sua paleta é caracterizada por suavidade e elegância. Cores opacas, levemente misturadas e com fundo morno como pêssego, camelo, nude e verde sálvia valorizam sua expressão natural.",
    contrast: "Médio-Baixo",
    contrastDesc: "Pouco contraste entre pele, olhos e cabelos, pedindo drapes discretos.",
    celebrities: ["Drew Barrymore", "Gisele Bündchen", "Calista Flockhart"],
    lovedColors: ["Verde Sálvia", "Pêssego Opaco", "Rosa Queimado", "Camelo", "Cinza Quente", "Areia"],
    lovedHex: ["#8FBC8F", "#FFDAB9", "#C18286", "#C19A6B", "#8B8589", "#E6D7C3"],
    avoidedColors: ["Cores Neon", "Preto Intenso", "Azul Elétrico", "Ultra Violeta", "Fúcsia"],
    avoidedHex: ["#39FF14", "#0D0D0D", "#00FFFF", "#4B0082", "#FF007F"],
    layTip: "O contraste muito alto sabota sua beleza discreta. Crie coordenações tom sobre tom no bege, militar e rosados para um efeito chic sublime."
  },
  "outono_escuro": {
    id: "outono_escuro",
    name: "Outono Escuro / Profundo",
    englishName: "Deep Autumn",
    undertone: "Neutro-Quente",
    description: "Tons de mistério e nobreza. Suas cores são ricas e escuras, com um subtom levemente aquecido. O vinho tinto, verde floresta e marrom café parecem ter sido pintados para você.",
    contrast: "Médio-Alto",
    contrastDesc: "Pele e olhos marcantes que sustentam bloqueios de cores escuras.",
    celebrities: ["Natalie Portman", "Meghan Markle", "Juliana Paes"],
    lovedColors: ["Vinho Cabernet", "Verde Floresta", "Preto Café", "Tomate Seco", "Bronze", "Açafrão"],
    lovedHex: ["#58111A", "#1B4D3E", "#2E1C16", "#8F251E", "#CD7F32", "#F4C430"],
    avoidedColors: ["Rosa Pastel próximo ao rosto", "Verde Limão", "Prata Gelado", "Lilás Claro"],
    avoidedHex: ["#FFD1DC", "#ADFF2F", "#E6E6FA", "#E0B0FF"],
    layTip: "Você suporta ótimos looks escuros sem pesar a expressão. Se quiser usar preto, adicione colar de ouro ou lenço mostarda para iluminar o semblante!"
  },
  "verao_frio": {
    id: "verao_frio",
    name: "Verão Frio / Puro",
    englishName: "Cool Summer",
    undertone: "Frio",
    description: "Sua beleza irradia frescor e suavidade. Cores refrescantes com fundo azulado e acinzentado, como azul jeans, lavanda, menta e rosa chiclete sutil, são suas aliadas número um.",
    contrast: "Médio",
    contrastDesc: "Suave fluxo de cores frias com contraste sutil de traços.",
    celebrities: ["Kate Middleton", "Allison Williams", "Camila Pitanga"],
    lovedColors: ["Azul Jeans", "Lavanda", "Verde Menta", "Rosa Pastel", "Cinza Mescla", "Cereja Suave"],
    lovedHex: ["#5D8AA8", "#E6E6FA", "#98FF98", "#FFB7C5", "#BEBEBE", "#DE3163"],
    avoidedColors: ["Laranja Quente", "Mostarda", "Amarelo Gema", "Dourado Amarelado", "Telha"],
    avoidedHex: ["#FF4500", "#FFDB58", "#FFCC00", "#FFD700", "#CD5C5C"],
    layTip: "Tons de maquiagem ou roupas douradas/laranjas perto do rosto talvez fiquem menos harmônicos em você. Prefira brincos prateados ou em ouro branco. Use como referência, não como regra. 🤎"
  },
  "verao_claro": {
    id: "verao_claro",
    name: "Verão Claro",
    englishName: "Light Summer",
    undertone: "Neutro-Frio",
    description: "Sua paleta é leve, aérea e aquosa. Cores em tons pastel doces e macios com um leve toque gelado valorizam sua presença delicada, como lilás, rosa quartz e azul piscina.",
    contrast: "Baixo",
    contrastDesc: "Iluminada, delicada e sem grandes quebras de valor cromático.",
    celebrities: ["Reese Witherspoon", "Gwyneth Paltrow", "Carolina Dieckmann"],
    lovedColors: ["Rosa Quartz", "Lilás", "Azul Céu Claro", "Creme Frio", "Verde Água", "Cinza Pérola"],
    lovedHex: ["#F7CAC9", "#C8A2C8", "#87CEFA", "#FFFDD0", "#66CDAA", "#E5E5E5"],
    avoidedColors: ["Preto Pesado", "Marrom Escuro", "Vinho muito escuro", "Laranja Neon"],
    avoidedHex: ["#1C1C1C", "#3D2314", "#300810", "#FF5F1F"],
    layTip: "O preto puro pode pesar um pouco mais em sua expressão delicada. Substitua o pretinho básico por azul marinho suave ou cinza pérola para um look de secretária verdadeiramente refinado! Use como referência, não como regra. 🤎"
  },
  "verao_suave": {
    id: "verao_suave",
    name: "Verão Suave",
    englishName: "Soft Summer",
    undertone: "Neutro-Frio",
    description: "Neutralidade requintada. Sua beleza é valorizada por cores opacas, misteriosas e aristocráticas como malva, rosa chá, cinza azulado e ametista suave. Um visual de pura sofisticação.",
    contrast: "Baixo-Médio",
    contrastDesc: "Contraste sutil, harmonioso e sem quebras expressivas.",
    celebrities: ["Sarah Jessica Parker", "Jennifer Aniston", "Leandra Leal"],
    lovedColors: ["Rosa Chá", "Malva Seco", "Azul Slate", "Ametista", "Verde Musgo Frio", "Off-White Frio"],
    lovedHex: ["#CD8C95", "#9966CC", "#708090", "#9966CC", "#4A5D4E", "#F5F5F0"],
    avoidedColors: ["Preto Grafite Puro", "Amarelo Marca-Texto", "Laranja Tangerina", "Branco Alvejado"],
    avoidedHex: ["#000000", "#CCFF00", "#FF8000", "#FFFFFF"],
    layTip: "Seus drapes são opacos! Brilhos excessivos e peças em cores neon cruas ofuscam sua beleza. Prefira acabamentos acetinados escovados, linhos e texturas rústicas suaves."
  },
  "primavera_quente": {
    id: "primavera_quente",
    name: "Primavera Quente / Pura",
    englishName: "Warm Spring",
    undertone: "Quente",
    description: "Explosão de alegria solar! Sua pele vibra com cores quentes, radiantes e puras. O coral, amarelo pêssego, turquesa e verde grama trazem um viço sem igual à sua fisionomia.",
    contrast: "Médio",
    contrastDesc: "Cores ensolaradas vivas que comunicam calor e energia.",
    celebrities: ["Nicole Kidman", "Amy Adams", "Marina Ruy Barbosa"],
    lovedColors: ["Coral Solar", "Turquesa Vibrante", "Verde Maçã", "Pêssego Quente", "Salmão", "Creme Dourado"],
    lovedHex: ["#FF7F50", "#40E0D0", "#32CD32", "#FFCBA4", "#FA8072", "#FFF8DC"],
    avoidedColors: ["Preto Puro", "Cinza Chumbo", "Azul Cobalto Cobrado", "Magenta Esfriado"],
    avoidedHex: ["#1A1A1A", "#4F4F4F", "#0020C2", "#C71585"],
    layTip: "O dourado é sua segunda pele! Use brincos e correntes brilhantes para emoldurar o rosto com magnetismo natural. Use cores de tempero em lenços e tiaras."
  },
  "primavera_clara": {
    id: "primavera_clara",
    name: "Primavera Clara",
    englishName: "Light Spring",
    undertone: "Neutro-Quente",
    description: "Sua beleza é doce, pêssego e dourada. Cores leves, alegres e ensolaradas em tom pastel como pêssego claro, amarelo manteiga, menta suave e coral claro iluminam sua imagem.",
    contrast: "Baixo-Médio",
    contrastDesc: "Base leve, luminosa, com cabelos ou olhos de brilho expressivo.",
    celebrities: ["Taylor Swift", "Scarlett Johansson", "Amanda Seyfried"],
    lovedColors: ["Amarelo Manteiga", "Pêssego Doce", "Turquesa Claro", "Verde Limão Suave", "Coral Areia", "Champanhe"],
    lovedHex: ["#FFFDD0", "#FFDAB9", "#AFEEEE", "#98FF98", "#E6C2B1", "#F7E7CE"],
    avoidedColors: ["Preto Total", "Fúcsia Escuro", "Burgundy / Vinho", "Marrom Escuro Purista"],
    avoidedHex: ["#000000", "#911A34", "#58111A", "#3B271F"],
    layTip: "Peças muito escuras e austeras criam sombras pesadas sob o queixo. Use roupas claras combinadas com acessórios alegres para expressar sua leveza nata."
  },
  "primavera_brilhante": {
    id: "primavera_brilhante",
    name: "Primavera Brilhante / Viva",
    englishName: "Bright Spring",
    undertone: "Neutro-Quente",
    description: "Você é puro contraste e saturação! Seus olhos e cabelos têm brilho cristalino natural. Suporta cores super intensas e felizes como verde limão vibrante, vermelho quente e azul piscina.",
    contrast: "Médio-Alto",
    contrastDesc: "Vibrância excepcional que aguenta blocos cromáticos elétricos.",
    celebrities: ["Emma Stone", "Milena Toscano", "Lupita Nyong'o"],
    lovedColors: ["Azul Piscina", "Verde Limão", "Vermelho Melancia", "Coral Elétrico", "Cassis", "Laranja Papaya"],
    lovedHex: ["#00FFFF", "#00FF00", "#E34234", "#FF4F00", "#D39EAF", "#FF8C00"],
    avoidedColors: ["Bege Opaco", "Marrom Amassado", "Cinza Chumbo Sem Vida", "Verde Musgo Oco"],
    avoidedHex: ["#D1C7BD", "#6F4E37", "#5C5C5C", "#4E533C"],
    layTip: "O 'bege triste' talvez fique menos harmônico em relação ao seu brilho natural. Brinque com cores radiantes perto do rosto e use alto contraste para expressar sua assinatura criativa marcante. Use como referência, não como regra. 🤎"
  },
  "inverno_frio": {
    id: "inverno_frio",
    name: "Inverno Frio / Puro",
    englishName: "Cool Winter",
    undertone: "Frio",
    description: "Beleza de rainha da neve. Contraste forte e fundo azulado puro. Cores geladas e incisivas como azul royal, fúcsia, vermelho rubi e esmeralda pura realçam perfeitamente seus traços.",
    contrast: "Alto-Médio",
    contrastDesc: "Contraste nítido de traços que sustenta paletas gélidas de altíssimo nível.",
    celebrities: ["Anne Hathaway", "Brooke Shields", "Grazi Massafera"],
    lovedColors: ["Azul Royal", "Fúcsia Crítico", "Vermelho Rubi", "Verde Esmeralda", "Roxo Violeta", "Branco Alvejado"],
    lovedHex: ["#0000FF", "#FF007F", "#E0115F", "#50C878", "#8F00FF", "#FFFFFF"],
    avoidedColors: ["Amarelo Mostarda", "Telha / Laranja", "Bege Amarelado", "Marrom Chocolate", "Caramelo"],
    avoidedHex: ["#FFDB58", "#CD5C5C", "#F5F5DC", "#7B3F00", "#C19A6B"],
    layTip: "Você fica espetacular em preto e branco óptico de alto contraste! Fuja das bijuterias douradas perto de suas maçãs do rosto; prefira a nobreza da prata ou o brilho do ouro branco."
  },
  "inverno_vivo": {
    id: "inverno_vivo",
    name: "Inverno Vivo / Brilhante",
    englishName: "Bright Winter",
    undertone: "Neutro-Frio",
    description: "Sua beleza reluz com pureza mineral. Cabelos e olhos super vívidos apoiados em um fundo neutro-frio. O rosa choque, o verde esmeralda brilhante e o azul cobalto ficam impecáveis em você.",
    contrast: "Alto",
    contrastDesc: "Vibrância limpa e dramática que valoriza drapes de verniz purista.",
    celebrities: ["Megan Fox", "Courtney Cox", "Isis Valverde"],
    lovedColors: ["Rosa Choque", "Verde Esmeralda", "Azul Cobalto", "Amarelo Limão", "Preto Óptico", "Verde Neon Sutil"],
    lovedHex: ["#FF1493", "#097969", "#0047AB", "#DFFF00", "#000000", "#39FF14"],
    avoidedColors: ["Cores Pastéis Escurecidas", "Mostarda Opaco", "Telha Terroso", "Marrom Terra"],
    avoidedHex: ["#A19C8B", "#B19047", "#A55233", "#4A362B"],
    layTip: "O segredo para você está na intensidade! Fuja das cores cinzentas, empoeiradas ou mutas. Use peças lisas, geométricas e com cores bloqueadas e brilhantes."
  },
  "inverno_escuro": {
    id: "inverno_escuro",
    name: "Inverno Escuro / Profundo",
    englishName: "Deep Winter",
    undertone: "Neutro-Frio",
    description: "Riqueza dramática incomparável. Seus melhores tons são escuros, frios e muito sofisticados. O preto profundo, vinho bordéus, uva e azul naval escuro parecem extensões naturais da sua presença.",
    contrast: "Alto",
    contrastDesc: "Cabelos e olhos escuros marcantes gerando moldura imponente.",
    celebrities: ["Sandra Bullock", "Penélope Cruz", "Camila Pitanga"],
    lovedColors: ["Preto Absoluto", "Azul Marinho Escuro", "Burgundy / Bordéus", "Verde Floresta Frio", "Uva", "Mirtilo"],
    lovedHex: ["#000000", "#000080", "#800020", "#1E4D2B", "#662D91", "#4682B4"],
    avoidedColors: ["Amarelo Limão Pastel", "Laranja Coral Claro", "Nude Amarelado", "Pêssego Pastel"],
    avoidedHex: ["#FFF7AE", "#FAD6A5", "#EEDC82", "#FFDAB9"],
    layTip: "Você é uma das poucas que fica absurdamente chic em um visual totalmente 'All Black'. Evite tons pálidos e opacos lavados perto do rosto ou complemente com lábios vibrantes!"
  }
};

const QUESTIONS = [
  {
    title: "1. Como sua pele reage à exposição solar?",
    options: [
      { text: "Bronzeio facilmente com tom dourado, raramente queimo", score: "warm" },
      { text: "Fico vermelha de início mas depois consigo bronzear levemente", score: "neutral-warm" },
      { text: "Fico vermelha facilmente, ardo e raramente pego bronze", score: "cool" },
      { text: "Minha pele queima muito rápido ou descasca sem bronzear nada", score: "cool" }
    ]
  },
  {
    title: "2. Qual a cor que você percebe com maior evidência nas veias do seu pulso?",
    options: [
      { text: "Verde oliva marcante ou tons de marrom morno", score: "warm" },
      { text: "Uma mistura indecifrável de verde, azul e roxo", score: "neutral-cool" },
      { text: "Azul profundo ou roxo bem vívido", score: "cool" },
      { text: "Quase invisíveis, mas parecem levemente azuladas", score: "neutral-cool" }
    ]
  },
  {
    title: "3. Entre brincos de acessórios perto do rosto, qual metal valoriza mais o seu semblante?",
    options: [
      { text: "Ouro amarelo brilhante que me dá viço imediato", score: "warm" },
      { text: "Dourado escovado, envelhecido ou cobre quente", score: "warm" },
      { text: "Prata brilhante ou ouro branco super gelados", score: "cool" },
      { text: "Tanto prata quanto dourado funcionam igualmente", score: "neutral-warm" }
    ]
  },
  {
    title: "4. Qual o seu nível de contraste natural (diferença de cor entre olhos, pele e cabelo)?",
    options: [
      { text: "Baixo (Tudo muito claro ou tudo muito escuro de forma contínua)", score: "soft" },
      { text: "Médio (Olhos e cabelos um pouco mais escuros que a pele bem equilibrados)", score: "medium" },
      { text: "Alto (Pele muito clara com cabelos e sobrancelhas bem escuros dominantes)", score: "bright" },
      { text: "Contraste vibrante (Minhas cores parecem ultra brilhantes e saltam aos olhos)", score: "bright" }
    ]
  }
];

// Available collar drapes for direct live visual overlay
const DRAPE_PALETTES = [
  { name: "🍂 Tons de Outono", key: "outono", colors: ["#556B2F", "#A0522D", "#C15C3D", "#D4A373", "#3E2723"] },
  { name: "❄️ Tons de Inverno", key: "inverno", colors: ["#0000FF", "#FF007F", "#E0115F", "#50C878", "#000000"] },
  { name: "🌸 Tons de Verão", key: "verao", colors: ["#5D8AA8", "#E6E6FA", "#F7CAC9", "#66CDAA", "#CD8C95"] },
  { name: "🌷 Tons de Primavera", key: "primavera", colors: ["#FF7F50", "#40E0D0", "#FFFDD0", "#AFEEEE", "#FF4F00"] }
];

interface ColorAnalysisProps {
  userProfile: UserProfile;
  onChangeProfile: (updated: UserProfile) => void;
  showToast: (msg: string) => void;
}

export default function ColorAnalysis({ userProfile, onChangeProfile, showToast }: ColorAnalysisProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [compressingSelfie, setCompressingSelfie] = useState(false);
  const [selfieCompressionStatus, setSelfieCompressionStatus] = useState("");
  
  // Quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [curQuestion, setCurQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [analyzedSeason, setAnalyzedSeason] = useState<SeasonDetail | null>(null);

  // Selected drape block to draw over preview
  const [activeDrape, setActiveDrape] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Bind video element to stream when it mounts/is active
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  // Request & start camera
  const handleStartCamera = async () => {
    setCapturedPhoto(null);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(media);
      setCameraActive(true);
      showToast("Câmera frontal iniciada para testes cromáticos! 💋");
    } catch (err) {
      console.error(err);
      showToast("Não conseguimos acessar sua câmera. Use a opção de carregar foto abaixo! 📸");
    }
  };

  // Stop camera
  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  // Take snap
  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0); // mirror
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedPhoto(dataUrl);
        handleStopCamera();
        showToast("Retrato fixado com sucesso! Agora escolha os drapes para colar.");
      }
    }
  };

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showToast(validation.error || "Arquivo inválido.");
      return;
    }

    setCompressingSelfie(true);
    setSelfieCompressionStatus("Preparando sua foto…");
    try {
      const compressed = await resizeAndCompressImage(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82
      });

      setCapturedPhoto(compressed.dataUrl);
      handleStopCamera();
      
      const origSizeStr = formatFileSize(compressed.originalSize);
      const compSizeStr = formatFileSize(compressed.compressedSize);
      const ratioPct = Math.round(compressed.compressionRatio * 100);
      setSelfieCompressionStatus(`Foto otimizada com sucesso: ${origSizeStr} ➔ ${compSizeStr} (-${ratioPct}%)`);
      showToast("Foto de rosto carregada com sucesso! Prontinho para avaliar.");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Não consegui preparar essa imagem.");
      setSelfieCompressionStatus("");
    } finally {
      setCompressingSelfie(false);
    }
  };

  // Drag over drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      showToast(validation.error || "Arquivo inválido.");
      return;
    }

    setCompressingSelfie(true);
    setSelfieCompressionStatus("Preparando sua foto…");
    try {
      const compressed = await resizeAndCompressImage(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.82
      });

      setCapturedPhoto(compressed.dataUrl);
      handleStopCamera();

      const origSizeStr = formatFileSize(compressed.originalSize);
      const compSizeStr = formatFileSize(compressed.compressedSize);
      const ratioPct = Math.round(compressed.compressionRatio * 100);
      setSelfieCompressionStatus(`Foto otimizada com sucesso: ${origSizeStr} ➔ ${compSizeStr} (-${ratioPct}%)`);
      showToast("Sua foto foi solta e carregada no simulador com sucesso!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Não consegui preparar essa imagem.");
      setSelfieCompressionStatus("");
    } finally {
      setCompressingSelfie(false);
    }
  };

  // Quiz evaluation
  const startAssessment = () => {
    setQuizStarted(true);
    setCurQuestion(0);
    setAnswers([]);
    setAnalyzedSeason(null);
  };

  const selectAnswer = (score: string) => {
    const nextAnswers = [...answers, score];
    setAnswers(nextAnswers);

    if (curQuestion < QUESTIONS.length - 1) {
      setCurQuestion(curQuestion + 1);
    } else {
      // Finished! Evaluate season based on answers
      evaluateSeason(nextAnswers);
    }
  };

  const evaluateSeason = (allAnswers: string[]) => {
    // Count properties
    let warmCounts = allAnswers.filter(a => a.includes("warm")).length;
    let coolCounts = allAnswers.filter(a => a.includes("cool")).length;
    
    // Low, medium, bright checks
    let softCounts = allAnswers.filter(a => a === "soft").length;
    let mediumCounts = allAnswers.filter(a => a === "medium").length;
    let brightCounts = allAnswers.filter(a => a === "bright").length;

    // Direct scoring logic
    let tempSeason = "outono_quente"; // default

    if (warmCounts > coolCounts) {
      // Warm seasons family: Outono ou Primavera
      if (brightCounts > softCounts) {
        // Bright Spring
        tempSeason = "primavera_brilhante";
      } else if (softCounts > brightCounts) {
        // Soft Autumn
        tempSeason = "outono_suave";
      } else {
        // Core Warm Autumn or Warm Spring
        tempSeason = Math.random() > 0.5 ? "outono_quente" : "primavera_quente";
      }
    } else if (coolCounts > warmCounts) {
      // Cool seasons family: Inverno ou Verão
      if (brightCounts > softCounts) {
        // Bright Winter or Cool Winter
        tempSeason = Math.random() > 0.5 ? "inverno_vivo" : "inverno_frio";
      } else if (softCounts > brightCounts) {
        // Soft Summer or Light Summer
        tempSeason = "verao_suave";
      } else {
        // Cool Summer or Deep Winter
        tempSeason = Math.random() > 0.5 ? "verao_frio" : "inverno_escuro";
      }
    } else {
      // Neutral balance
      if (brightCounts > softCounts) {
        tempSeason = "inverno_vivo";
      } else if (softCounts > brightCounts) {
        tempSeason = "outono_suave";
      } else {
        tempSeason = "verao_claro";
      }
    }

    setAnalyzedSeason(SEASONS[tempSeason]);
    setQuizStarted(false);
    showToast(`Avaliação concluída! Sua paleta recomendada é ${SEASONS[tempSeason].name} 🎨`);
  };

  // Apply result directly to profile
  const handleApplyPalette = () => {
    if (!analyzedSeason) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      lovedColors: analyzedSeason.lovedColors,
      avoidedColors: analyzedSeason.avoidedColors,
      stylePreference: userProfile.stylePreference || "Clássico"
    };

    // Storing seasonal metadata to string tag
    (updatedProfile as any).personalPalette = analyzedSeason.id;
    (updatedProfile as any).personalPaletteName = analyzedSeason.name;

    onChangeProfile(updatedProfile);
    showToast(`Que lindo! A paleta "${analyzedSeason.name}" foi integrada e guiará seu Closet a partir de hoje! 💋`);
  };

  const curDrapeColors = DRAPE_PALETTES.find(d => d.key === activeDrape)?.colors || [];

  return (
    <div className="space-y-8 animate-fade-in py-2">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-[#5A3E32] to-[#422D24] p-6 sm:p-10 rounded-[32px] text-white space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full pointer-events-none transform translate-x-12 -translate-y-12" />
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-100/10 text-amber-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
            <Sparkles size={12} className="text-amber-500" />
            <span>EXCLUSIVO: COLORIMETRIA SAZONAL EXPANDIDA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold">Teste de Colorimetria</h1>
          <p className="text-xs sm:text-sm text-[#E8D8C3]/90 leading-relaxed font-serif">
            Coloque drapes coloridos virtuais sob seu queixo usando sua câmera ou faça upload de um retrato iluminado para descobrir quais tons valorizam seu viço natural e combatem olheiras. Este é um simulador inicial e não substitui uma análise profissional.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: LIVE CAMERA STAGE & DRAPES */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-lg text-[#5A3E32] flex items-center gap-1.5">
                <Camera size={18} className="text-[#6E1F2B]" />
                <span>1. Espelho Digital Cromático</span>
              </h3>
              <div className="space-x-1">
                {cameraActive ? (
                  <button
                    onClick={handleStopCamera}
                    className="bg-red-50 text-[#6E1F2B] hover:bg-red-100 text-[10px] uppercase font-bold px-3 py-1.5 rounded-xl transition-all"
                  >
                    Desligar Câmera
                  </button>
                ) : (
                  <button
                    onClick={handleStartCamera}
                    className="bg-[#5A3E32] text-white hover:bg-[#422D24] text-[10px] uppercase font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Camera size={12} /> Ligar Câmera
                  </button>
                )}
              </div>
            </div>

            {/* MAIN CAMERA STAGE SCREEN */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative aspect-video w-full rounded-2xl bg-[#F8F3EC] border border-[#E8D8C3] overflow-hidden flex flex-col justify-center items-center shadow-inner group"
            >
              {/* Selfie preparation overlay */}
              {compressingSelfie && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center space-y-3 z-30">
                  <RefreshCw size={24} className="text-[#6E1F2B] animate-spin" />
                  <p className="text-xs font-bold text-[#5A3E32] animate-pulse">
                    {selfieCompressionStatus || "Preparando sua foto…"}
                  </p>
                  <p className="text-[10px] text-[#8C8178] max-w-[250px] text-center leading-relaxed">
                    Ajustando proporções e otimizando o peso da foto com amor... 🤎
                  </p>
                </div>
              )}

              {/* Fallback pattern background when idle */}
              <div className="absolute inset-0 bg-[radial-gradient(#E8D8C3_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

              {!cameraActive && !capturedPhoto ? (
                // INITIAL PLACEHOLDER & DRAG ZONE
                <div className="text-center p-8 space-y-4 max-w-sm">
                  <div className="p-4 bg-white rounded-full w-max mx-auto shadow-sm text-[#8C8178] border border-[#E8D8C3]/50">
                    <Camera size={36} className="text-[#5A3E32]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#5A3E32] text-sm">Monte seus Drapes Virtuais</h4>
                    <p className="text-[11px] text-[#8C8178] mt-1 leading-relaxed">
                      Ative a câmera para um teste fluido ou solte um retrato seu aqui para aplicar golas coloridas sob seu queixo.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={handleStartCamera}
                      className="bg-[#5A3E32] hover:bg-[#422D24] text-white font-serif font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Usar Câmera ao Vivo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-[#F8F3EC] text-[#5A3E32] border border-[#E8D8C3] font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                    >
                      Subir Retrato
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>
              ) : cameraActive && !capturedPhoto ? (
                // LIVE STEAM COMPONENT
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover transform -scale-x-100" 
                  />
                  
                  {/* Portrait guides overlay */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#6E1F2B]/10 flex justify-center items-center">
                    <div className="w-56 h-72 border-4 border-amber-400/35 rounded-full relative transform -translate-y-4">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-amber-500/80 bg-[#1F1A17]/85 uppercase tracking-widest px-2 py-0.5 rounded">
                        Posicione o rosto
                      </div>
                    </div>
                  </div>

                  {/* Shutter snapshot control */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <button
                      onClick={captureSnapshot}
                      className="p-4 bg-[#6E1F2B] hover:bg-[#52131C] text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-md border-4 border-white/60"
                      title="Capturar Retrato"
                    >
                      <Camera size={22} />
                    </button>
                  </div>
                </>
              ) : (
                // PHOTO PREVIEW / SNAPSHOT MODE
                <>
                  <img 
                    src={capturedPhoto || ""} 
                    alt="Captured test" 
                    className="w-full h-full object-cover" 
                  />
                  {selfieCompressionStatus && (
                    <div className="absolute bottom-3 left-3 bg-[#1F1A17]/85 text-[10px] text-[#F8F3EC] px-3 py-1.5 rounded-xl backdrop-blur-sm shadow border border-white/10 pointer-events-none font-sans z-10 flex items-center gap-1.5 font-semibold">
                      <span>✨</span>
                      <span>{selfieCompressionStatus}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setCapturedPhoto(null);
                      setSelfieCompressionStatus("");
                      if (stream) handleStopCamera();
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-[#1F1A17]/80 hover:bg-[#6E1F2B] text-white rounded-full transition-all z-10"
                    title="Remover foto"
                  >
                    <X size={14} />
                  </button>
                </>
              )}

              {/* FLOATING VIRTUAL DRAPES COLLAR OVERLAY */}
              {activeDrape && curDrapeColors.length > 0 && (
                <div className="absolute bottom-0 inset-x-0 h-1/4 pointer-events-none flex flex-col justify-end">
                  {/* Visual drape collar shape */}
                  <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent flex items-bottom">
                    <div className="w-2/3 mx-auto h-full flex transform translate-y-3">
                      {curDrapeColors.map((color, idx) => (
                        <div 
                          key={idx} 
                          style={{ backgroundColor: color }} 
                          className="flex-1 h-full rounded-t-full transition-all border-t border-white/30 transform hover:-translate-y-1 shadow-md"
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DRAPE SELECTION PALETTES CARDS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#5A3E32]">
                <span>Selecione uma Gola (Drape Virtual):</span>
                {activeDrape && (
                  <button 
                    onClick={() => setActiveDrape(null)}
                    className="text-[#6E1F2B] font-bold hover:underline"
                  >
                    Remover Gola
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DRAPE_PALETTES.map((p) => {
                  const isSel = activeDrape === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setActiveDrape(p.key)}
                      className={`p-3 text-left rounded-2xl border transition-all text-xs space-y-2 ${
                        isSel 
                          ? "bg-[#6E1F2B]/5 border-[#6E1F2B] shadow-sm" 
                          : "bg-white border-[#E8D8C3] hover:bg-[#F8F3EC]/40"
                      }`}
                    >
                      <span className="font-bold text-[#5A3E32] block">{p.name}</span>
                      <div className="flex gap-0.5">
                        {p.colors.map((c, idx) => (
                          <div 
                            key={idx} 
                            style={{ backgroundColor: c }} 
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" 
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INSTRUCTIONS GUIDE */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex gap-3 text-xs text-[#5A3E32] leading-relaxed">
              <Info size={20} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Como fazer a análise:</span>
                Escolha luz do dia indireta (evite lâmpadas amareladas). Coloque drapes de famílias diferentes. Observe qual drape faz suas olheiras ou traços parecem mais suaves e iluminados, e qual drape deixa sua pele desbotada ou cinzenta!
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COMPONENT: IA QUESTIONNAIRE & RESULTS PANEL */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* METHOD STATEMENT OR ACTIVE QUIZ */}
          <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-5">
            
            <div className="border-b border-[#F8F3EC] pb-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#6E1F2B] tracking-wider block">Estudo das Harmonias</span>
              <h2 className="text-xl font-serif font-black text-[#5A3E32]">2. Mapeamento de Subtom</h2>
            </div>

            {!quizStarted && !analyzedSeason ? (
              // WELCOME TO MAPPING
              <div className="space-y-4">
                <p className="text-xs text-[#8C8178] leading-relaxed">
                  Para diagnosticar sua estação exata no método sazonal expandido, responda com carinho às quatro perguntas básicas elaboradas pela Lay Reis sobre seu comportamento de contrastes cutâneos.
                </p>
                <button
                  onClick={startAssessment}
                  className="w-full bg-[#5A3E32] hover:bg-[#422D24] text-[#F8F3EC] font-serif font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Iniciar Questionário de Tons</span>
                </button>
              </div>
            ) : quizStarted ? (
              // ACTIVE QUESTIONNAIRE LOOP
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#8C8178] uppercase">
                  <span>Passo {curQuestion + 1} de {QUESTIONS.length}</span>
                  <span className="text-amber-700">Contraste & Melanina</span>
                </div>

                <div className="w-full bg-[#F8F3EC] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${((curQuestion + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <p className="font-serif font-bold text-sm text-[#5A3E32] pt-1">
                  {QUESTIONS[curQuestion].title}
                </p>

                <div className="space-y-2 pt-2">
                  {QUESTIONS[curQuestion].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(opt.score)}
                      className="w-full p-3.5 text-left bg-[#F8F3EC]/50 hover:bg-[#E8D8C3]/50 border border-[#E8D8C3]/60 hover:border-[#5A3E32]/40 rounded-xl transition-all flex items-center justify-between text-xs text-[#5A3E32] focus:outline-none"
                    >
                      <span>{opt.text}</span>
                      <ChevronRight size={14} className="text-[#8C8178]" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setQuizStarted(false)}
                  className="text-[10px] font-bold text-[#8C8178] hover:text-[#6E1F2B] uppercase tracking-wider block text-center mx-auto"
                >
                  Cancelar Teste
                </button>
              </div>
            ) : (
              // RESULT HAS GENERATED
              <div className="space-y-5 animate-fade-in bg-gradient-to-br from-[#F8F3EC]/70 to-amber-50/50 p-5 rounded-2xl border border-amber-200/50">
                
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] uppercase font-black text-amber-800 tracking-widest bg-amber-100 px-2.5 py-0.5 rounded-full">Resultado Calculado ✓</span>
                  <p className="text-2xl font-serif font-black text-[#5A3E32] leading-tight">
                    {analyzedSeason?.name}
                  </p>
                  <p className="text-[11px] text-[#8C8178] font-mono">{analyzedSeason?.englishName} • Subtom {analyzedSeason?.undertone}</p>
                </div>

                <p className="text-xs text-[#5A3E32] leading-relaxed text-center italic font-serif">
                  “{analyzedSeason?.description}”
                </p>

                {/* RECOMMENDED COLOR BLOCKS SWATCH */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#5A3E32] uppercase block">🌟 Suas Cores de Viço (Ideal perto do Rosto):</span>
                  <div className="grid grid-cols-3 gap-2">
                    {analyzedSeason?.lovedHex.map((hex, idx) => (
                      <div key={idx} className="bg-white border border-[#E8D8C3]/60 p-1.5 rounded-xl text-center space-y-1">
                        <div style={{ backgroundColor: hex }} className="w-full h-6 rounded-md shadow-inner" />
                        <span className="text-[9px] text-[#5A3E32] font-semibold truncate block">
                          {analyzedSeason?.lovedColors[idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AVOID BLOCKS */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#8C8178] uppercase block">⚠️ Evitar perto do rosto (Cores que Ofuscam):</span>
                  <div className="flex flex-wrap gap-1">
                    {analyzedSeason?.avoidedColors.map((color, idx) => (
                      <span 
                        key={idx}
                        className="bg-red-50 text-[#6E1F2B] border border-red-100 text-[10px] font-medium px-2 py-0.5 rounded"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* EXTRA CELEBRITIES AND LAY ADVICE */}
                <div className="border-t border-[#E1D7CE] pt-3.5 space-y-3">
                  <div className="text-xs text-[#5A3E32] leading-relaxed">
                    <strong>Celebridades Amigas:</strong> {analyzedSeason?.celebrities.join(", ")}
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-[11px] text-[#5A3E32] italic relative">
                    <span className="font-bold text-[#6E1F2B] not-italic block mb-0.5">🤎 Dica do Toque da Lay:</span>
                    “{analyzedSeason?.layTip}”
                  </div>
                </div>

                {/* INTEGRATE WITH APP BUTTON */}
                <div className="pt-2 text-center flex gap-2">
                  <button
                    onClick={startAssessment}
                    className="flex-1 bg-white hover:bg-[#F8F3EC] text-[#5A3E32] border border-[#E8D8C3] py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Refazer Teste
                  </button>
                  <button
                    onClick={handleApplyPalette}
                    className="flex-[2] bg-[#6E1F2B] hover:bg-[#52131C] text-[#F8F3EC] text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Aplicar ao meu Perfil
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* ACTIVE COLOR PROFILE DISPLAY */}
          <div className="bg-white rounded-3xl border border-[#E8D8C3] shadow-[0_8px_30px_rgba(90,62,50,0.03)] p-6 space-y-3.5">
            <h4 className="text-xs font-bold text-[#5A3E32] uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={16} className="text-amber-500" />
              <span>Sua Paleta Registrada</span>
            </h4>
            
            {(userProfile as any).personalPaletteName ? (
              <div className="bg-[#F8F3EC]/50 p-4 rounded-2xl border border-[#E8D8C3]/80 space-y-2">
                <p className="text-sm font-serif font-black text-[#5A3E32]">
                  {(userProfile as any).personalPaletteName}
                </p>
                <p className="text-[10px] text-[#8C8178] leading-relaxed">
                  Sua conta está integrada com as cores ideais da sua harmonia facial. O Closet priorizará e fará destaques em tons de <strong className="text-[#6E1F2B]">{userProfile.lovedColors.slice(0, 3).join(", ")}</strong>!
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#8C8178] italic">Você ainda não tem uma paleta sazonal associada. Faça o teste acima para integrar suas cores!</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
