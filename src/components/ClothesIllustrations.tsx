import React from "react";

interface IllustrationProps {
  category: string;
  color: string; // Hex code or friendly color name (we will map it to safe colors)
  className?: string;
}

export const ClothesIllustration: React.FC<IllustrationProps> = ({
  category = "blusa",
  color = "#E8D8C3",
  className = "w-full h-full",
}) => {
  // Normalize category string
  const cat = category.toLowerCase().trim();

  // Color mapper to ensure hex readability and nice combinations
  const getColorHex = (c: string): string => {
    const low = c.toLowerCase();
    if (low.includes("branco") || low.includes("white")) return "#FFFFFF";
    if (low.includes("azul") || low.includes("marinho") || low.includes("navy")) return "#102A43";
    if (low.includes("jeans") || low.includes("claro") || low.includes("blue")) return "#829AB1";
    if (low.includes("preto") || low.includes("black")) return "#1F1A17";
    if (low.includes("nude") || low.includes("pele")) return "#F0D3B7";
    if (low.includes("caramelo") || low.includes("brown") || low.includes("brown")) return "#B98A5A";
    if (low.includes("bege") || low.includes("beige")) return "#E8D8C3";
    if (low.includes("marrom")) return "#5A3E32";
    if (low.includes("vinho") || low.includes("burgundy")) return "#6E1F2B";
    if (low.includes("#")) return c;
    return "#B98A5A"; // default chic camel
  };

  const fillHex = getColorHex(color);
  const strokeColor = fillHex === "#FFFFFF" ? "#8C8178" : "rgba(255, 255, 255, 0.4)";

  // Render SVG based on category
  switch (cat) {
    case "camisa":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shirt hanger details */}
          <path d="M50 15 C 50 10, 55 10, 55 12" stroke="#8C8178" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 22 L50 15 L75 22" stroke="#8C8178" strokeWidth="2" strokeLinecap="round" />
          {/* Main Shirt Body */}
          <path d="M22 24 L35 24 L42 35 L50 28 L58 35 L65 24 L78 24 L74 65 L76 85 L24 85 L26 65 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* Collar detail */}
          <path d="M35 24 L50 38 L65 24" stroke="#5A3E32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 24 L50 30 L58 24" fill="#FFFFFF" stroke="#5A3E32" strokeWidth="1.5" />
          {/* Seams and button plist */}
          <line x1="50" y1="38" x2="50" y2="84" stroke="#5A3E32" strokeWidth="1.5" strokeDasharray="1,4" />
          {/* Left and right pockets */}
          <rect x="30" y="42" width="10" height="12" rx="1" fill="none" stroke="#5A3E32" strokeWidth="1" />
          <rect x="60" y="42" width="10" height="12" rx="1" fill="none" stroke="#5A3E32" strokeWidth="1" />
        </svg>
      );

    case "camisa branca":
    case "camiseta":
    case "blusa":
    case "regata":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hanger */}
          <path d="M50 15 C 50 10, 53 10, 53 12" stroke="#8C8178" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M30 22 L50 15 L70 22" stroke="#8C8178" strokeWidth="1.5" />
          {/* Blouse Body */}
          <path d="M30 24 C34 24, 38 28, 42 28 C46 28, 54 28, 58 28 C62 28, 66 24, 70 24 L74 55 C74 65, 71 80, 68 82 L32 82 C29 80, 26 65, 26 55 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* Neckline */}
          <path d="M42 28 C45 32, 55 32, 58 28" stroke="#5A3E32" strokeWidth="1.5" fill="none" />
          {/* Cute fold lines */}
          <path d="M35 72 C45 74, 55 74, 65 72" stroke={strokeColor} strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case "calça":
    case "jeans":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trouser Hanger */}
          <line x1="32" y1="18" x2="68" y2="18" stroke="#8C8178" strokeWidth="2" />
          <path d="M50 18 L50 12 C50 10, 53 10, 53 12" stroke="#8C8178" strokeWidth="2" />
          {/* Trousers Body */}
          <path d="M32 20 L68 20 L68 28 L64 88 L52 88 L50 48 L48 48 L46 88 L34 88 L32 28 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* Belt Loops */}
          <rect x="36" y="20" width="2" height="4" fill="#5A3E32" />
          <rect x="48" y="20" width="2" height="4" fill="#5A3E32" />
          <rect x="62" y="20" width="2" height="4" fill="#5A3E32" />
          {/* Pockets & Zipper Seam */}
          <path d="M32 25 C38 25, 42 22, 42 20" stroke="#5A3E32" strokeWidth="1.5" />
          <path d="M68 25 C62 25, 58 22, 58 20" stroke="#5A3E32" strokeWidth="1.5" />
          <path d="M50 20 L50 35 C50 38, 48 44, 46 46" stroke="#5A3E32" strokeWidth="1.5" fill="none" />
          {/* Demin crease if Jeans */}
          {cat === "jeans" && (
            <>
              <line x1="39" y1="52" x2="43" y2="52" stroke={strokeColor} strokeWidth="1" />
              <line x1="57" y1="62" x2="61" y2="62" stroke={strokeColor} strokeWidth="1" />
            </>
          )}
        </svg>
      );

    case "saia":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Waist band */}
          <path d="M35 25 L65 25 L67 30 L33 30 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" />
          {/* Flowing Skirt */}
          <path d="M33 30 L18 85 C18 85, 33 89, 50 89 C67 89, 82 85, 82 85 L67 30 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* Plissé lines */}
          <path d="M50 30 L50 88" stroke="#5A3E32" strokeWidth="1" opacity="0.3" />
          <path d="M41 30 L33 87" stroke="#5A3E32" strokeWidth="1" opacity="0.2" />
          <path d="M59 30 L67 87" stroke="#5A3E32" strokeWidth="1" opacity="0.2" />
          <path d="M45 30 L40 88" stroke="#5A3E32" strokeWidth="1" opacity="0.2" />
          <path d="M55 30 L60 88" stroke="#5A3E32" strokeWidth="1" opacity="0.2" />
        </svg>
      );

    case "sapato":
    case "sandália":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dynamic Sandália / High Heel Graphic */}
          <path d="M22 75 L30 75 L37 53 L70 51 L80 65 L84 65 L72 45 L50 48 L33 55 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* Heel Spike */}
          <path d="M28 75 L32 75 L33 53 L28 53 Z" fill="#5A3E32" />
          {/* Elegant Ankle Strap */}
          <path d="M68 40 C68 35, 78 35, 78 40 C78 45, 68 45, 68 40 Z" stroke="#5A3E32" strokeWidth="1.5" fill="none" />
          <path d="M72 43 L72 51" stroke="#5A3E32" strokeWidth="1.5" />
          {/* Little Starry details */}
          <circle cx="75" cy="60" r="1.5" fill="#5A3E32" />
        </svg>
      );

    case "tênis":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shoe Body */}
          <path d="M15 70 L20 50 C23 45, 35 41, 45 44 L75 52 C84 55, 87 63, 85 74 L15 74 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* White Sole */}
          <path d="M14 74 L86 74 L85 79 L15 79 Z" fill="#FFFFFF" stroke="#5A3E32" strokeWidth="1.5" />
          {/* Laces */}
          <line x1="48" y1="46" x2="56" y2="52" stroke="#5A3E32" strokeWidth="2" strokeLinecap="round" />
          <line x1="52" y1="43" x2="60" y2="49" stroke="#5A3E32" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="40" x2="64" y2="46" stroke="#5A3E32" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case "bolsa":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shoulder Strap */}
          <path d="M28 45 C 28 10, 72 10, 72 45" stroke="#5A3E32" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Bag Body */}
          <rect x="22" y="42" width="56" height="40" rx="6" fill={fillHex} stroke="#5A3E32" strokeWidth="2" />
          {/* Flap cover */}
          <path d="M22 42 L78 42 L70 60 L30 60 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Golden clasp */}
          <circle cx="50" cy="58" r="4.5" fill="#E8D8C3" stroke="#5A3E32" strokeWidth="1.5" />
          <rect x="48.5" y="58" width="3" height="8" rx="1" fill="#E8D8C3" stroke="#5A3E32" strokeWidth="1" />
        </svg>
      );

    case "blazer":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hanger */}
          <path d="M50 14 C 50 9, 54 9, 54 11" stroke="#8C8178" strokeWidth="2" />
          <path d="M22 23 L50 14 L78 23" stroke="#8C8178" strokeWidth="2" />
          {/* Lapels and Main Blazer structure */}
          <path d="M20 25 L35 25 L50 48 L65 25 L80 25 L75 84 L25 84 Z" fill={fillHex} stroke="#5A3E32" strokeWidth="2" strokeLinejoin="round" />
          {/* Front Open Cut / Inner shirt spot */}
          <path d="M35 25 L50 63 L65 25" fill="#FFFFFF" stroke="#5A3E32" strokeWidth="1.5" />
          {/* lapel overlays */}
          <path d="M25 25 L40 40 L35 48 L50 63 L48 65 L27 38 L25 25" fill={fillHex} stroke="#5A3E32" strokeWidth="1.5" />
          <path d="M75 25 L60 40 L65 48 L50 63 L52 65 L73 38 L75 25" fill={fillHex} stroke="#5A3E32" strokeWidth="1.5" />
          {/* Buttons */}
          <circle cx="46" cy="65" r="2.5" fill="#1F1A17" />
          <circle cx="54" cy="65" r="2.5" fill="#1F1A17" />
          {/* Side pockets */}
          <rect x="27" y="68" width="14" height="6" rx="1" fill="none" stroke="#5A3E32" strokeWidth="1.5" />
          <rect x="59" y="68" width="14" height="6" rx="1" fill="none" stroke="#5A3E32" strokeWidth="1.5" />
        </svg>
      );

    default: // generic item
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="32" fill={fillHex} stroke="#5A3E32" strokeWidth="2" />
          {/* Sparkles / Closet aesthetic hanger sign */}
          <path d="M50 35 L50 65 M35 50 L65 50" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="#5A3E32" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
      );
  }
};
