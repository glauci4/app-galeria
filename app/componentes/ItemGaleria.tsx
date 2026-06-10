// app/componentes/ItemGaleria.tsx
// Componente para exibir cada foto ou vídeo na galeria, com título, data e ícone de localização (se houver coordenadas).

import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Photo } from '../database/repositorios/fotos.repositorio';

interface Props {
  item: Photo;
  onLongPress: (foto: Photo) => void;
  onPress: (foto: Photo) => void;
  formatarData?: (iso: string) => string;
}

// Mesma configuração de filtros do VisualizarMidia
const FILTRO_CORES: Record<string, { tint: string; opacity: number }> = {
  original: { tint: 'transparent', opacity: 0 },
  pb:       { tint: '#888',     opacity: 0.6 },
  sepia:    { tint: '#704214',  opacity: 0.35 },
  frio:     { tint: '#0066ff',  opacity: 0.2 },
  quente:   { tint: '#ff6600',  opacity: 0.2 },
  rosa:     { tint: '#ff69b4',  opacity: 0.25 },
  verde:    { tint: '#00cc66',  opacity: 0.2 },
  roxo:     { tint: '#7c5cbf',  opacity: 0.3 },
  escuro:   { tint: '#000',     opacity: 0.4 },
  claro:    { tint: '#fff',     opacity: 0.25 },
  drama:    { tint: '#001133',  opacity: 0.45 },
  vintage:  { tint: '#8B4513',  opacity: 0.3 },
};

function FiltroOverlay({ filtroId }: { filtroId?: string }) {
  if (!filtroId || filtroId === 'original') return null;
  const f = FILTRO_CORES[filtroId];
  if (!f) return null;
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: f.tint, opacity: f.opacity }]}
      pointerEvents="none"
    />
  );
}

export default function ItemGaleria({ item, onLongPress, onPress, formatarData }: Props) {
  const dataFormatada = formatarData
    ? formatarData(item.created_at)
    : new Date(item.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });

  const isVideo = item.tipo === 'video';
  const temImagem = !isVideo || !!item.thumbnail_uri;
  const sourceUri = isVideo ? item.thumbnail_uri : item.image_uri;

  return (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      activeOpacity={0.8}
    >
      {temImagem && sourceUri ? (
        <Image source={{ uri: sourceUri }} style={styles.tileImage} />
      ) : (
        <View style={[styles.tileImage, styles.videoPlaceholder]}>
          <Ionicons name="film-outline" size={32} color="#555" />
        </View>
      )}

      {/* Filtro aplicado sobre a imagem (somente fotos) */}
      {!isVideo && <FiltroOverlay filtroId={(item as any).filtro} />}

      {isVideo && (
        <Ionicons
          name="play-circle"
          size={28}
          color="#fff"
          style={styles.playIcon}
        />
      )}

      <View style={styles.tileOverlay}>
        <Text style={styles.tileTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.tileDate}>{dataFormatada}</Text>
        {item.latitude != null && (
          <Ionicons name="location" size={10} color="#4fc" style={{ marginTop: 2 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#111',
    margin: 1,
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -14,
    marginTop: -14,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tileOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
  },
  tileTitle: { color: '#fff', fontSize: 10, fontWeight: '700' },
  tileDate: { color: '#aaa', fontSize: 9 },
});