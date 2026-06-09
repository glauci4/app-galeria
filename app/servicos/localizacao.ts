// servicos/localizacao.ts
// Serviço para obter a localização atual do dispositivo e calcular distâncias entre coordenadas.
// Utiliza o Expo Location para acessar os serviços de localização do dispositivo.
// Fornece uma função para ordenar fotos por proximidade com a localização atual.

import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Photo } from '../database/repositorios/fotos.repositorio';   // relativo

export async function obterLocalizacao(): Promise<{ latitude: number; longitude: number } | null> {
  console.log('[Localizacao] Iniciando obtencao de localização');

  const { status: statusAtual } = await Location.getForegroundPermissionsAsync();
  let concedido = statusAtual === 'granted';

  if (!concedido) {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    concedido = granted;
  }

  if (!concedido) {
    Alert.alert('Permissão negada', 'Permita o acesso a localização nas configurações para salvar as coordenadas das fotos.');
    return null;
  }

  const ultimaPosicao = await Location.getLastKnownPositionAsync();
  if (ultimaPosicao) {
    return {
      latitude: ultimaPosicao.coords.latitude,
      longitude: ultimaPosicao.coords.longitude,
    };
  }

  try {
    const localizacao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    return {
      latitude: localizacao.coords.latitude,
      longitude: localizacao.coords.longitude,
    };
  } catch (error) {
    console.error('[Localizacao] Erro ao obter posição atual:', error);
    return null;
  }
}

export function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const raioTerra = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return raioTerra * c;
}

export async function ordenarFotosPorProximidade(fotos: Photo[]): Promise<Photo[]> {
  const local = await obterLocalizacao();
  if (!local) return fotos;

  return [...fotos].sort((a, b) => {
    const distA = (a.latitude && a.longitude) ? calcularDistancia(local.latitude, local.longitude, a.latitude, a.longitude) : Infinity;
    const distB = (b.latitude && b.longitude) ? calcularDistancia(local.latitude, local.longitude, b.latitude, b.longitude) : Infinity;
    return distA - distB;
  });
}