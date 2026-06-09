// app/componentes/VisualizarMidia.tsx

import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
  Dimensions, Image, Modal, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Photo } from '../database/repositorios/fotos.repositorio';
import { Cores } from '../style/cores';

interface Props {
  visible: boolean;
  midia: Photo | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

// Configuração dos filtros: cor de sobreposição e opacidade
const FILTRO_CORES: Record<string, { tint: string; opacity: number; saturate?: boolean }> = {
  original: { tint: 'transparent', opacity: 0 },
  pb:       { tint: '#888', opacity: 0.6, saturate: true },
  sepia:    { tint: '#704214', opacity: 0.35 },
  frio:     { tint: '#0066ff', opacity: 0.2 },
  quente:   { tint: '#ff6600', opacity: 0.2 },
  rosa:     { tint: '#ff69b4', opacity: 0.25 },
  verde:    { tint: '#00cc66', opacity: 0.2 },
  roxo:     { tint: '#7c5cbf', opacity: 0.3 },
  escuro:   { tint: '#000', opacity: 0.4 },
  claro:    { tint: '#fff', opacity: 0.25 },
  drama:    { tint: '#001133', opacity: 0.45 },
  vintage:  { tint: '#8B4513', opacity: 0.3 },
};

// Componente que sobrepõe um semi-transparente colorido sobre a imagem
function FiltroOverlay({ filtroId }: { filtroId?: string }) {
  if (!filtroId || filtroId === 'original') return null;
  const f = FILTRO_CORES[filtroId];
  if (!f) return null;
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: f.tint, opacity: f.opacity },
      ]}
      pointerEvents="none"
    />
  );
}

export default function VisualizarMidia({ visible, midia, onClose }: Props) {
  const videoRef = useRef(null);
  const [infoVisivel, setInfoVisivel] = useState(false);

  if (!midia) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Botão fechar */}
        <TouchableOpacity style={styles.fechar} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Botão info */}
        <TouchableOpacity style={styles.info} onPress={() => setInfoVisivel(true)}>
          <Ionicons name="information-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>

        {midia.tipo === 'foto' ? (
          <View style={{ width, height }}>
            <Image
              source={{ uri: midia.image_uri }}
              style={styles.imagem}
              resizeMode="contain"
            />
            <FiltroOverlay filtroId={(midia as any).filtro} />
          </View>
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: midia.image_uri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            shouldPlay={true}
            isLooping={false}
            useNativeControls={true}
            resizeMode={ResizeMode.CONTAIN}
            style={styles.video}
          />
        )}

        {/* Modal de metadados */}
        <Modal
          visible={infoVisivel}
          transparent
          animationType="slide"
          onRequestClose={() => setInfoVisivel(false)}
        >
          <View style={styles.infoBackdrop}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitulo}>Detalhes da mídia</Text>
                <TouchableOpacity onPress={() => setInfoVisivel(false)}>
                  <Ionicons name="close" size={22} color={Cores.textoSecundario} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <MetadadoLinha
                  icone="text-outline"
                  label="Título"
                  valor={midia.title}
                />
                <MetadadoLinha
                  icone={midia.tipo === 'foto' ? 'camera-outline' : 'videocam-outline'}
                  label="Tipo"
                  valor={midia.tipo === 'foto' ? 'Foto' : 'Vídeo'}
                />
                <MetadadoLinha
                  icone="calendar-outline"
                  label="Data"
                  valor={new Date(midia.created_at).toLocaleString('pt-BR')}
                />
                {midia.latitude != null && midia.longitude != null ? (
                  <>
                    <MetadadoLinha
                      icone="location-outline"
                      label="Latitude"
                      valor={midia.latitude.toFixed(6)}
                    />
                    <MetadadoLinha
                      icone="location-outline"
                      label="Longitude"
                      valor={midia.longitude.toFixed(6)}
                    />
                  </>
                ) : (
                  <MetadadoLinha
                    icone="location-outline"
                    label="Localização"
                    valor="Sem dados de GPS"
                  />
                )}
                <MetadadoLinha
                  icone="link-outline"
                  label="URI"
                  valor={midia.image_uri}
                  monoEspaço
                />
                {/* Exibe o filtro aplicado, se existir */}
                {(midia as any).filtro && (midia as any).filtro !== 'original' && (
                  <MetadadoLinha
                    icone="color-palette-outline"
                    label="Filtro"
                    valor={(midia as any).filtro}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

function MetadadoLinha({
  icone, label, valor, monoEspaço,
}: {
  icone: string;
  label: string;
  valor: string;
  monoEspaço?: boolean;
}) {
  return (
    <View style={meta.linha}>
      <Ionicons name={icone as any} size={16} color={Cores.destaque} style={meta.icone} />
      <View style={meta.conteudo}>
        <Text style={meta.label}>{label}</Text>
        <Text style={[meta.valor, monoEspaço && meta.mono]} selectable>
          {valor}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fechar: {
    position: 'absolute',
    top: 50, left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  info: {
    position: 'absolute',
    top: 50, right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  imagem: { width, height },
  video: { width, height: height * 0.8 },
  infoBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  infoCard: {
    backgroundColor: Cores.cartao,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    maxHeight: height * 0.7,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitulo: {
    color: Cores.textoPrimario,
    fontSize: 17,
    fontWeight: '700',
  },
});

const meta = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  icone: { marginTop: 2 },
  conteudo: { flex: 1 },
  label: {
    color: Cores.textoSecundario,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  valor: {
    color: Cores.textoPrimario,
    fontSize: 14,
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: Cores.textoSecundario,
  },
});