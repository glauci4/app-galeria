// app/componentes/PreviewFiltros.tsx
// componente para pré-visualizar os filtros aplicados em uma foto antes de salvar. Recebe a URI da imagem, o filtro inicial (opcional) e callbacks para confirmar ou cancelar.

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Cores } from '../style/cores';

const { width, height } = Dimensions.get('window');

// Definição dos filtros, cada filtro é uma sobreposição de cor + opacidade sobre a imagem.
// tint: cor da sobreposição | opacity: intensidade | label: nome exibido

interface Filtro {
  id: string;
  label: string;
  tint: string;
  opacity: number;
  saturate?: boolean; // simula dessaturação via overlay cinza
  sepia?: boolean;
}

const FILTROS: Filtro[] = [
  { id: 'original', label: 'Original', tint: 'transparent', opacity: 0 },
  { id: 'pb',       label: 'P&B',      tint: '#000',        opacity: 0, saturate: true },
  { id: 'sepia',    label: 'Sépia',    tint: '#704214',     opacity: 0.35 },
  { id: 'frio',     label: 'Frio',     tint: '#0066ff',     opacity: 0.2 },
  { id: 'quente',   label: 'Quente',   tint: '#ff6600',     opacity: 0.2 },
  { id: 'rosa',     label: 'Rosa',     tint: '#ff69b4',     opacity: 0.25 },
  { id: 'verde',    label: 'Verde',    tint: '#00cc66',     opacity: 0.2 },
  { id: 'roxo',     label: 'Roxo',     tint: '#7c5cbf',     opacity: 0.3 },
  { id: 'escuro',   label: 'Escuro',   tint: '#000',        opacity: 0.4 },
  { id: 'claro',    label: 'Claro',    tint: '#fff',        opacity: 0.25 },
  { id: 'drama',    label: 'Drama',    tint: '#001133',     opacity: 0.45 },
  { id: 'vintage',  label: 'Vintage',  tint: '#8B4513',     opacity: 0.3 },
];

interface Props {
  uri: string;
  filtroInicial?: string; // permite iniciar com um filtro já selecionado (útil para edição)
  onConfirmar: (filtroId: string) => void;
  onCancelar: () => void;
}

export default function PreviewFiltros({ uri, filtroInicial, onConfirmar, onCancelar }: Props) {
  // Estado inicial: se filtroInicial for fornecido, usa o filtro correspondente, senão usa 'original'
  const [filtroSelecionado, setFiltroSelecionado] = useState<Filtro>(
    FILTROS.find((f) => f.id === filtroInicial) ?? FILTROS[0]
  );

  function renderFiltroPreview({ item }: { item: Filtro }) {
    const ativo = item.id === filtroSelecionado.id;
    return (
      <TouchableOpacity
        style={[styles.filtroItem, ativo && styles.filtroItemAtivo]}
        onPress={() => setFiltroSelecionado(item)}
        activeOpacity={0.8}
      >
        {/* Miniatura com filtro aplicado */}
        <View style={styles.miniaturaContainer}>
          <Image source={{ uri }} style={styles.miniatura} />
          {item.saturate ? (
            // P&B: duas sobreposições simulam dessaturação
            <>
              <View style={[styles.overlay, { backgroundColor: '#fff', opacity: 0.15 }]} />
              <View style={[styles.overlay, { backgroundColor: '#000', opacity: 0.3, mixBlendMode: 'color' }]} />
            </>
          ) : (
            <View style={[styles.overlay, { backgroundColor: item.tint, opacity: item.opacity }]} />
          )}
        </View>
        <Text style={[styles.filtroLabel, ativo && styles.filtroLabelAtivo]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Preview principal */}
      <View style={styles.previewContainer}>
        <Image source={{ uri }} style={styles.previewImagem} resizeMode="contain" />
        {/* Filtro aplicado sobre o preview */}
        {filtroSelecionado.saturate ? (
          <>
            <View style={[styles.overlay, styles.overlayFullscreen, { backgroundColor: '#888', opacity: 0.6 }]} />
            <View style={[styles.overlay, styles.overlayFullscreen, { backgroundColor: '#000', opacity: 0.15 }]} />
          </>
        ) : (
          <View style={[
            styles.overlay,
            styles.overlayFullscreen,
            { backgroundColor: filtroSelecionado.tint, opacity: filtroSelecionado.opacity },
          ]} />
        )}

        {/* Botão cancelar */}
        <TouchableOpacity style={styles.btnFechar} onPress={onCancelar}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Nome do filtro ativo */}
        {filtroSelecionado.id !== 'original' && (
          <View style={styles.filtroNomeTag}>
            <Text style={styles.filtroNomeText}>{filtroSelecionado.label}</Text>
          </View>
        )}
      </View>

      {/* Barra de filtros */}
      <View style={styles.barraFiltros}>
        <FlatList
          data={FILTROS}
          keyExtractor={(f) => f.id}
          renderItem={renderFiltroPreview}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtroLista}
        />

        {/* Botão confirmar com texto dinâmico */}
        <TouchableOpacity
          style={styles.btnConfirmar}
          onPress={() => onConfirmar(filtroSelecionado.id)}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.btnConfirmarText}>
            {filtroInicial ? 'Salvar filtro' : 'Usar foto'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const MINIATURA = 64;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Preview principal
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImagem: {
    width: '100%',
    height: '100%',
  },
  overlayFullscreen: {
    ...StyleSheet.absoluteFillObject,
  },
  btnFechar: {
    position: 'absolute',
    top: 52,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    padding: 8,
  },
  filtroNomeTag: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filtroNomeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Barra inferior
  barraFiltros: {
    backgroundColor: '#111',
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  filtroLista: {
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 14,
  },
  filtroItem: {
    alignItems: 'center',
    gap: 6,
    padding: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filtroItemAtivo: {
    borderColor: Cores.destaque,
  },
  miniaturaContainer: {
    width: MINIATURA,
    height: MINIATURA,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  miniatura: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  filtroLabel: {
    color: Cores.textoSecundario,
    fontSize: 11,
    fontWeight: '500',
  },
  filtroLabelAtivo: {
    color: Cores.destaque,
    fontWeight: '700',
  },

  // Botão confirmar
  btnConfirmar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Cores.destaque,
  },
  btnConfirmarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});