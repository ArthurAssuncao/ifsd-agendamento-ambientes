export const daysOfWeek = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const timeSlots = [
  // Manhã
  { time: "07:45", period: "morning" },
  { time: "08:00", period: "morning" },
  { time: "08:15", period: "morning" },
  { time: "08:30", period: "morning" },
  { time: "08:45", period: "morning" },
  { time: "09:00", period: "morning" },
  { time: "09:15", period: "morning" },
  { time: "09:30", period: "morning" },
  { time: "09:45", period: "morning" },
  { time: "10:00", period: "morning" },
  { time: "10:15", period: "morning" },
  { time: "10:30", period: "morning" },
  { time: "10:45", period: "morning" },
  { time: "11:30", period: "morning" },
  // break
  { time: "11:45", period: "morning-break" },
  { time: "12:00", period: "morning-break" },
  { time: "12:15", period: "morning-break" },
  { time: "12:30", period: "morning-break" },
  { time: "12:45", period: "morning-break" },
  // Tarde
  { time: "13:00", period: "afternoon" },
  { time: "13:45", period: "afternoon" },
  { time: "14:30", period: "afternoon" },
  { time: "15:15", period: "afternoon" },
  { time: "16:00", period: "afternoon" },
  { time: "16:45", period: "afternoon" },
  // break
  { time: "17:00", period: "afternoon-break" },
  { time: "17:15", period: "afternoon-break" },
  { time: "17:30", period: "afternoon-break" },
  { time: "17:45", period: "afternoon-break" },
  { time: "18:00", period: "afternoon-break" },
  { time: "18:15", period: "afternoon-break" },
  // Noite
  { time: "18:30", period: "evening" },
  { time: "19:15", period: "evening" },
  { time: "20:00", period: "evening" },
  { time: "20:45", period: "evening" },
  { time: "21:30", period: "evening" },
  { time: "22:15", period: "evening" },
];

export function getWeeks() {
  const now = new Date();
  const currentWeek = getWeekString(now);

  const weeks = [currentWeek];
  for (let i = 1; i <= 3; i++) {
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7 * i);
    weeks.push(getWeekString(nextWeek));
  }

  return weeks;
}

function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

export function getDateFromWeek(
  weekNumber: number,
  year = new Date().getFullYear()
) {
  // Cria uma data para 4 de janeiro do ano especificado (garante que está na semana 1)
  const date = new Date(year, 0, 4);

  // Obtém o dia da semana (0=Domingo, 1=Segunda, etc.)
  const dayOfWeek = date.getDay();

  // Calcula a data da segunda-feira da semana 1
  const firstMonday = new Date(
    year,
    0,
    4 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );

  // Adiciona (weekNumber - 1) semanas
  const resultDate = new Date(firstMonday);
  resultDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);

  return resultDate;
}

export function getDateFromLastOfWeek(
  weekNumber: number,
  year = new Date().getFullYear()
) {
  // Cria uma data para 4 de janeiro do ano especificado (garante que está na semana 1)
  const date = new Date(year, 0, 4);

  // Obtém o dia da semana (0=Domingo, 1=Segunda, etc.)
  const dayOfWeek = date.getDay();

  // Calcula a data da segunda-feira da semana 1
  const firstMonday = new Date(
    year,
    0,
    4 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  );

  // Adiciona (weekNumber - 1) semanas
  const resultDate = new Date(firstMonday);
  resultDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7 + 6);

  return resultDate;
}

const MAX_WEEKS_YEAR = 52;

export function getNextWeek(week: number, nextLimit = 0, weekBase = 0): number {
  if (weekBase == 0) {
    weekBase = getWeekNumber(new Date());
  }
  if (nextLimit > 0 && week + 1 <= weekBase + nextLimit) {
    if (week + 1 <= MAX_WEEKS_YEAR) {
      return week + 1;
    }
    return 1;
  }
  return week;
}

export function getPreviousWeek(
  week: number,
  prevLimit = 0,
  weekBase = 0
): number {
  if (weekBase == 0) {
    weekBase = getWeekNumber(new Date());
  }
  if (prevLimit > 0 && week - 1 >= weekBase - prevLimit) {
    if (week - 1 > 0) {
      return week - 1;
    }
    return MAX_WEEKS_YEAR;
  }
  return week;
}

export function getDateAddedDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getNextTime(time: string): string {
  const timeParts = time.split(":").map(Number);
  let hours = timeParts[0];
  let minutes = timeParts[1];
  minutes += 15;
  if (minutes >= 60) {
    minutes -= 60;
    hours += 1;
    if (hours >= 24) {
      hours = 0;
    }
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

export function getUserActivities(email: string): string[] {
  // Esta função seria substituída por uma chamada real ao seu backend
  // Aqui está um exemplo de mapeamento de email para atividades
  const activitiesMap: Record<string, string[]> = {
    "professor1@instituicao.edu.br": ["Matemática", "Física"],
    "professor2@instituicao.edu.br": ["Química", "Biologia"],
    "tecnico1@instituicao.edu.br": ["Manutenção", "Configuração"],
  };

  return activitiesMap[email] || ["Aula Livre", "Reunião"];
}

export function validateEmail(email: string): boolean {
  const allowedDomain = process.env.ALLOWED_DOMAIN;
  if (!allowedDomain) return true;

  return email.endsWith(`@${allowedDomain}`);
}
