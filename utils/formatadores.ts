// app/utils/formatadores.ts

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatarCoordenadas(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'L' : 'O';
  return `${Math.abs(lat).toFixed(4)}°${ns}  ${Math.abs(lon).toFixed(4)}°${ew}`;
}