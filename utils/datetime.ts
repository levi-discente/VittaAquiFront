/**
 * Formata uma data para o formato ISO sem timezone (horário local)
 * Exemplo: 2025-10-13T08:00:00
 * 
 * Isso é necessário porque o backend espera timestamp sem timezone,
 * mas .toISOString() converte para UTC, causando diferença de horas.
 */
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

/**
 * Formata apenas a data (sem hora) no formato ISO
 * Exemplo: 2025-10-13
 */
export const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata apenas o horário no formato HH:MM
 * Exemplo: 08:00
 */
export const formatTimeLocal = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
