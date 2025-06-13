import { TIME_SLOT_COLORS } from "./constants";

export function getColorForEmail(email: string) {
  // 1. Tenta recuperar do localStorage
  const storedColors = localStorage.getItem("emailColors");
  const emailColors = storedColors ? JSON.parse(storedColors) : {};

  // 2. Se já existir, retorna a cor armazenada
  if (emailColors[email]) {
    return emailColors[email];
  }

  // 3. Se não existir, atribui uma nova cor
  const assignedColor =
    TIME_SLOT_COLORS[Object.keys(emailColors).length % TIME_SLOT_COLORS.length];
  const newColors = { ...emailColors, [email]: assignedColor };

  // 4. Armazena localmente
  localStorage.setItem("emailColors", JSON.stringify(newColors));

  // 5. Fallback para cookie (opcional)
  document.cookie = `emailColors=${JSON.stringify(
    newColors
  )}; path=/; max-age=${60 * 60 * 24 * 30}`;

  return assignedColor;
}
