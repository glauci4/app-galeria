// app/componentes/ModalAdicionarMidia.tsx
// componente de modal para escolher entre tirar foto, gravar vídeo ou selecionar da galeria

import React from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback,
  ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cores } from '../style/cores';

interface Props {
  visivel: boolean;
  carregando: boolean;
  onEscolha: (opcao: 'camera-foto' | 'camera-video' | 'galeria') => void;
  onCancelar: () => void;
}

export default function ModalAdicionarMidia({
  visivel, carregando, onEscolha, onCancelar,
}: Props) {
  if (!visivel) return null;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onCancelar}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.card}>
        <View style={styles.alca} />
        <Text style={styles.titulo}>Adicionar Mídia</Text>

        {carregando ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Cores.destaque} />
            <Text style={styles.loadingText}>Processando...</Text>
          </View>
        ) : (
          <>
            <View style={styles.linha}>
              <TouchableOpacity
                style={styles.botao}
                onPress={() => onEscolha('camera-foto')}
                activeOpacity={0.75}
              >
                <View style={styles.iconeCirculo}>
                  <Ionicons name="camera-outline" size={26} color={Cores.destaque} />
                </View>
                <Text style={styles.botaoLabel}>Foto</Text>
                <Text style={styles.botaoSub}>Câmera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botao}
                onPress={() => onEscolha('camera-video')}
                activeOpacity={0.75}
              >
                <View style={styles.iconeCirculo}>
                  <Ionicons name="videocam-outline" size={26} color={Cores.destaque} />
                </View>
                <Text style={styles.botaoLabel}>Vídeo</Text>
                <Text style={styles.botaoSub}>Câmera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botao}
                onPress={() => onEscolha('galeria')}
                activeOpacity={0.75}
              >
                <View style={styles.iconeCirculo}>
                  <Ionicons name="images-outline" size={26} color={Cores.destaque} />
                </View>
                <Text style={styles.botaoLabel}>Galeria</Text>
                <Text style={styles.botaoSub}>Foto ou vídeo</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelar} onPress={onCancelar}>
              <Text style={styles.cancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  card: {
    backgroundColor: Cores.cartao,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    borderWidth: 1,
    borderColor: Cores.borda,
    borderBottomWidth: 0,
    zIndex: 1000,
  },
  alca: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Cores.borda,
    alignSelf: 'center', marginBottom: 20,
  },
  titulo: {
    color: Cores.textoPrimario,
    fontSize: 18, fontWeight: '700',
    marginBottom: 20, textAlign: 'center',
  },
  linha: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  botao: {
    flex: 1,
    borderWidth: 1, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', gap: 6,
    backgroundColor: Cores.input, borderColor: Cores.borda,
  },
  iconeCirculo: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(10,126,164,0.12)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  botaoLabel: {
    fontSize: 13, fontWeight: '700', color: Cores.destaque,
  },
  botaoSub: {
    fontSize: 11, color: Cores.textoSecundario, marginTop: -4,
  },
  loading: {
    alignItems: 'center', paddingVertical: 40, gap: 14,
  },
  loadingText: {
    color: Cores.textoSecundario, fontSize: 14,
  },
  cancelar: {
    marginTop: 8, alignItems: 'center', paddingVertical: 14,
    borderRadius: 12, backgroundColor: Cores.input,
    borderWidth: 1, borderColor: Cores.borda,
  },
  cancelarText: {
    color: Cores.textoSecundario, fontSize: 15, fontWeight: '600',
  },
});