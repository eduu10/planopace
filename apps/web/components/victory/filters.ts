export type FilterType = "neon" | "ice" | "wanted" | "zen" | "night" | "coffee" | "military" | "landscape";

export interface FilterConfig {
  id: FilterType;
  name: string;
  accent: string;        // Primary accent hex
  accentGlow: string;    // rgba for glow effects
  cssFilter: string;     // CSS filter for live preview
  vignetteOuter: string; // Outer vignette color
  overlayTint: string;   // Overlay blend color
  phrases: string[];
}

export const FILTER_CONFIGS: Record<FilterType, FilterConfig> = {
  neon: {
    id: "neon",
    name: "Neon Fire",
    accent: "#FF6B00",
    accentGlow: "rgba(255,107,0,",
    cssFilter: "contrast(1.3) saturate(1.4) brightness(0.85)",
    vignetteOuter: "rgba(0,0,0,0.7)",
    overlayTint: "rgba(255, 100, 0, 0.08)",
    phrases: [
      "Corro porque a pizza n\u00e3o vai se queimar sozinha \ud83c\udf55",
      "Meu pace \u00e9 lento, mas meu cora\u00e7\u00e3o \u00e9 de maratonista \ud83d\udc80",
      "Acordo cedo pra correr. Mentira, acordo cedo e sofro correndo \ud83d\ude2d",
      "Se correr o bicho pega, se ficar o shape n\u00e3o vem \ud83c\udfc3\u200d\u2642\ufe0f",
      "Treino pesado, cerveja gelada. Equil\u00edbrio \u00e9 tudo \ud83c\udf7a",
      "Eu n\u00e3o corro da responsabilidade, eu corro na rua mesmo \ud83d\udee3\ufe0f",
      "Deus me livre, mas quem me dera um sub-4 \ud83d\ude4f",
      "Sofri, chorei, mas o Strava registrou \u2705",
      "N\u00e3o \u00e9 sobre velocidade, \u00e9 sobre n\u00e3o parar no meio \ud83d\udc22",
      "Hoje o treino foi t\u00e3o bom que quase desisti 3 vezes \ud83d\ude05",
    ],
  },
  ice: {
    id: "ice",
    name: "Ice Cold",
    accent: "#00D4FF",
    accentGlow: "rgba(0,212,255,",
    cssFilter: "contrast(1.2) saturate(0.6) brightness(1.1) hue-rotate(180deg)",
    vignetteOuter: "rgba(0,10,30,0.75)",
    overlayTint: "rgba(0, 150, 255, 0.1)",
    phrases: [
      "Frio no corpo, fogo na alma \u2744\ufe0f\ud83d\udd25",
      "Zero graus de frescura, 100% de treino \ud83e\uddca",
      "Geladinho por fora, sub-5 por dentro \ud83c\udf28\ufe0f",
      "At\u00e9 o vento reclamou do meu pace \ud83d\udca8",
      "Correndo t\u00e3o r\u00e1pido que o suor congela \u2744\ufe0f",
      "Meu warm-up \u00e9 o frio que t\u00e1 fazendo \ud83e\udde3",
      "Temperatura negativa, vontade positiva \ud83c\udfc3",
      "Gelou? Corre mais r\u00e1pido \u2603\ufe0f",
      "Treino de inverno forma campe\u00e3o de ver\u00e3o \ud83c\udfc6",
      "N\u00e3o \u00e9 frio, \u00e9 pr\u00e9-aquecimento natural \ud83d\ude04",
    ],
  },
  wanted: {
    id: "wanted",
    name: "Sofredor de Pace",
    accent: "#DC2626",
    accentGlow: "rgba(220,38,38,",
    cssFilter: "contrast(1.4) saturate(0.3) brightness(0.8) sepia(0.4)",
    vignetteOuter: "rgba(30,0,0,0.8)",
    overlayTint: "rgba(180, 50, 20, 0.12)",
    phrases: [
      "Crimes: correr no sol das 12h \u2600\ufe0f",
      "Acusado de achar que 5km \u00e9 aquecimento \ud83d\udea8",
      "Procurado por abandonar o sof\u00e1 \u00e0s 5h da manh\u00e3 \ud83d\uded7",
      "Ficha criminal: 3 planilhas abandonadas \ud83d\udcdd",
      "Pena: mais 10km de long run \u26d3\ufe0f",
      "Flagrado correndo de ressaca \ud83c\udf7b",
      "Delito: falar que vai parar e nunca para \ud83d\ude44",
      "Foragido do descanso ativo \ud83c\udfc3\u200d\u2642\ufe0f",
      "Sentenciado a correr at\u00e9 gostar \u2694\ufe0f",
      "Crime: comprar mais um t\u00eanis sem precisar \ud83d\udc5f",
    ],
  },
  zen: {
    id: "zen",
    name: "Zen Runner",
    accent: "#D4A853",
    accentGlow: "rgba(212,168,83,",
    cssFilter: "contrast(1.05) saturate(0.8) brightness(1.15) sepia(0.15)",
    vignetteOuter: "rgba(15,25,15,0.5)",
    overlayTint: "rgba(200, 220, 180, 0.06)",
    phrases: [
      "Cada quil\u00f4metro \u00e9 uma conversa com voc\u00ea mesmo \ud83c\udf3f",
      "O pace n\u00e3o mente, mas voc\u00ea evolui \ud83c\udf1f",
      "Correr \u00e9 meditar com os p\u00e9s \ud83e\uddd8",
      "A jornada importa mais que o tempo final \u23f3",
      "Respira fundo, o pr\u00f3ximo km \u00e9 seu \ud83c\udf2c\ufe0f",
      "Silenciar a mente, um passo de cada vez \ud83c\udf3e",
      "Gratid\u00e3o por cada corrida completada \ud83d\ude4f",
      "Voc\u00ea j\u00e1 \u00e9 mais forte que ontem \ud83c\udf31",
      "Encontre paz no movimento \u2618\ufe0f",
      "Correr \u00e9 a arte de se reconectar \ud83c\udf04",
    ],
  },
  night: {
    id: "night",
    name: "Rol\u00ea Noturno",
    accent: "#00FFCC",
    accentGlow: "rgba(0,255,204,",
    cssFilter: "contrast(1.4) saturate(1.3) brightness(0.7) hue-rotate(220deg)",
    vignetteOuter: "rgba(5,0,30,0.85)",
    overlayTint: "rgba(100, 0, 255, 0.1)",
    phrases: [
      "22h e eu na rua correndo de qu\u00ea? \ud83c\udf03",
      "GPS registrando minha loucura noturna \ud83d\udce1",
      "Neon na alma, escurid\u00e3o na rota \ud83d\udd2e",
      "A cidade dorme, eu acordo meu pace \ud83c\udf06",
      "Run.exe carregando... 100% noturno \ud83d\udcbb",
      "Meu hor\u00e1rio nobre \u00e9 depois das 21h \ud83c\udf1a",
      "Corrida + playlist lo-fi = perfeito \ud83c\udfa7",
      "Modo noturno ativado, pace desbloqueado \ud83c\udf1c",
      "Enquanto a cidade brilha, eu corro \u2728",
      "Corro de noite pra ningu\u00e9m ver meu sofrimento \ud83d\ude02",
    ],
  },
  coffee: {
    id: "coffee",
    name: "Caf\u00e9 & Corrida",
    accent: "#C87533",
    accentGlow: "rgba(200,117,51,",
    cssFilter: "contrast(1.15) saturate(0.9) brightness(1.05) sepia(0.35)",
    vignetteOuter: "rgba(40,20,5,0.65)",
    overlayTint: "rgba(180, 120, 60, 0.1)",
    phrases: [
      "Corro pra merecer o segundo caf\u00e9 \u2615",
      "Meu pr\u00e9-treino \u00e9 um expresso duplo \ud83e\udeb6",
      "Caf\u00e9 na veia, t\u00eanis no p\u00e9 \ud83d\udc5f",
      "Sem caf\u00e9 n\u00e3o corro, sem correr n\u00e3o vivo \u2764\ufe0f",
      "Primeiro o caf\u00e9, depois o sofrimento \ud83d\ude4c",
      "Espresso antes, recovery depois \ud83c\udf75",
      "Minha planilha come\u00e7a na cafeteria \ud83d\udccb",
      "Quem corre por caf\u00e9 nunca cansa \u2615\ud83c\udfc3",
      "Blend perfeito: 5km + cappuccino \ud83e\udd24",
      "O caf\u00e9 \u00e9 o motivo, a corrida \u00e9 a desculpa \u2615",
    ],
  },
  landscape: {
    id: "landscape",
    name: "Paisagem",
    accent: "#FFFFFF",
    accentGlow: "rgba(255,255,255,",
    cssFilter: "contrast(1.05) saturate(1.1) brightness(1.0)",
    vignetteOuter: "rgba(0,0,0,0.3)",
    overlayTint: "rgba(0,0,0,0.0)",
    phrases: [
      "A vista paga o esforço 🏔️",
      "Corrida + paisagem = terapia 🌅",
      "Quem corre vê o mundo diferente 🌍",
      "O melhor pós-treino é essa vista 📸",
      "Registro de quem corre livre 🏃",
      "Natureza é o melhor coach 🌿",
      "Cada km uma nova vista 👀",
      "Correr é explorar o mundo 🗺️",
      "O cenário mais bonito é suado 💦",
      "Paisagem de quem não desistiu 💪",
    ],
  },
  military: {
    id: "military",
    name: "Modo Sobreviv\u00eancia",
    accent: "#FACC15",
    accentGlow: "rgba(250,204,21,",
    cssFilter: "contrast(1.3) saturate(0.5) brightness(0.85) sepia(0.2)",
    vignetteOuter: "rgba(10,15,5,0.75)",
    overlayTint: "rgba(80, 100, 20, 0.1)",
    phrases: [
      "Miss\u00e3o cumprida, soldado! \ud83c\udf96\ufe0f",
      "Terreno hostil: ladeira dos infernos \u26f0\ufe0f",
      "Sobrevivi ao treino, status: operacional \ud83d\udfe2",
      "Baixa confirmada: minhas pernas \ud83e\uddb5",
      "Recruta promovido a maratonista \ud83c\udf1f",
      "Opera\u00e7\u00e3o Long Run: sucesso parcial \ud83d\udcca",
      "Coordenadas: onde eu quase parei \ud83d\udccd",
      "Inimigo detectado: pace acima de 6 \ud83d\udea8",
      "Relat\u00f3rio: zero desist\u00eancias hoje \ud83d\udcc3",
      "Treinamento t\u00e1tico: fugir da preguicite \ud83d\udca3",
    ],
  },
};

// Get filter-specific overlay drawer functions
export function getFilterAccent(filter: FilterType): string {
  return FILTER_CONFIGS[filter].accent;
}

export function getFilterCssFilter(filter: FilterType): string {
  return FILTER_CONFIGS[filter].cssFilter;
}

export function getFilterPhrases(filter: FilterType): string[] {
  return FILTER_CONFIGS[filter].phrases;
}
