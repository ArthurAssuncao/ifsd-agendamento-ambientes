import { Environment } from "@/types/schedule";

export const EMAIL_IFSUDESTEMG_DOMAIN = "ifsudestemg.edu.br";

export const TIME_SLOT_COLORS = [
  // Grupo 1: Cores Pastéis Delicadas (Destaque Principal)
  "#FFD1DC", // Rosa bebê
  "#B5EAD7", // Mint claro
  "#C7CEEA", // Azul celeste
  "#FFE5B4", // Pêssego cremoso
  "#E2F0CB", // Verde maçã suave
  "#F8C8DC", // Rosa algodão-doce
  "#B2EBF2", // Azul geladinho
  "#FFDAC1", // Laranja névoa
  "#D5A6BD", // Lavanda rosada
  "#ACE1AF", // Verde água fresca

  // Grupo 2: Tons Suaves de Terra e Natureza
  "#DDC4AB", // Bege aconchegante
  "#A8D8B9", // Verde folha de chá
  "#C3B1E1", // Lilás poeira
  "#FFB7B2", // Coral suave
  "#A2C7E5", // Azul céu de verão
  "#E1C4AB", // Caramelo claro
  "#B8D8D8", // Azul piscina
  "#D4A5C3", // Rosa pétala
  "#A5C3D4", // Azul serenidade
  "#D4C3A5", // Amarelo areia

  // Grupo 3: Pastéis Profundos (Toques Elegantes)
  "#9BB7D4", // Azul hydrangea
  "#D4B7B7", // Rosa desbotado
  "#B7D4A5", // Verde erva-doce
  "#D4A5B7", // Rosa antigo
  "#A5B7D4", // Azul nostalgia
  "#E6B0AA", // Rosa terracota claro
  "#AED6F1", // Azul baby
  "#F5B7B1", // Pêssego rosado
  "#C39BD3", // Lilás vintage
  "#A9DFBF", // Verde menta brilhante

  // Grupo 4: Tons Quase-Neutros (Sofisticação)
  "#D2B4DE", // Lavanda pálido
  "#F9E79F", // Amarelo cremoso
  "#ABEBC6", // Verde névoa
  "#D7BDE2", // Lilás névoa
  "#FAD7A0", // Amarelo dourado suave
  "#A3E4D7", // Turquesa pastel
  "#E8DAEF", // Lilás glacial
  "#F5CBA7", // Pêssego veludo
  "#A2D9CE", // Verde oceano claro
  "#E8A87C", // Coral creme

  // Grupo 5: Tons Únicos (Destaques Especiais)
  "#85C1E9", // Azul sereno profundo
  "#F48FB1", // Rosa chiclete
  "#76D7C4", // Turquesa vibrante (mas suave)
  "#BAABDA", // Lilás moderno
  "#F0B27A", // Pêssego quente
  "#7FB3D5", // Azul denim claro
  "#D98880", // Rosa terroso
  "#73C6B6", // Verde esmeralda pastel
  "#BB8FCE", // Orquídea suave
  "#F1948A", // Coral romântico
];

export const EMAIL_SCHEDULE_COMISSION = "comissaohorario.sd@ifsudestemg.edu.br";

export const MINUTES_PER_SLOT = 15; // Duração de cada slot em minutos

export const COLOR_DISABLED_SLOT = "#535456"; // Cor para slots desabilitados

export const ENVIRONMENTS: Environment[] = [
  {
    name: "Laboratório de Informática 1",
    shortName: "Lab. Informática 1",
    id: "LabInf1",
  },
  {
    name: "Laboratório de Informática 2",
    shortName: "Lab. Informática 2",
    id: "LabInf2",
  },
  {
    name: "Laboratório de Simulação Ferroviária",
    shortName: "Lab. Simulação Ferroviária",
    id: "LabSimFer",
  },
  {
    name: "Auditório",
    shortName: "Auditório",
    id: "Auditorio",
  },
].sort((a, b) => {
  if (a.name < b.name) {
    return -1;
  } else if (a.name > b.name) {
    return 1;
  }
  return 0;
});

export const NUMBER_DAYS_OF_WORK_WEEK = 6;
