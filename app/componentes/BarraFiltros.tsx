// app/componentes/BarraFiltros.tsx

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cores } from '../style/cores';

interface Props {
  busca: string;
  setBusca: (texto: string) => void;
  ordenacao: 'recente' | 'antiga';
  setOrdenacao: (tipo: 'recente' | 'antiga') => void;
  onProximidade: () => void;
  proximidadeAtiva: boolean; 
}

export default function BarraFiltros({
  busca,
  setBusca,
  ordenacao,
  setOrdenacao,
  onProximidade,
  proximidadeAtiva,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.buscaInput}
        placeholder="Buscar por título..."
        placeholderTextColor={Cores.placeholder}
        value={busca}
        onChangeText={setBusca}
      />
      <View style={styles.botoes}>
        {/* Botão Recente */}
        <TouchableOpacity
          style={[styles.botao, ordenacao === 'recente' && !proximidadeAtiva && styles.botaoAtivo]}
          onPress={() => setOrdenacao('recente')}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={ordenacao === 'recente' && !proximidadeAtiva ? Cores.destaque : Cores.textoSecundario}
          />
          <Text
            style={[
              styles.botaoTexto,
              {
                color: ordenacao === 'recente' && !proximidadeAtiva ? Cores.destaque : Cores.textoSecundario,
              },
            ]}
          >
            Recente
          </Text>
        </TouchableOpacity>

        {/* Botão Antiga */}
        <TouchableOpacity
          style={[styles.botao, ordenacao === 'antiga' && !proximidadeAtiva && styles.botaoAtivo]}
          onPress={() => setOrdenacao('antiga')}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={ordenacao === 'antiga' && !proximidadeAtiva ? Cores.destaque : Cores.textoSecundario}
          />
          <Text
            style={[
              styles.botaoTexto,
              {
                color: ordenacao === 'antiga' && !proximidadeAtiva ? Cores.destaque : Cores.textoSecundario,
              },
            ]}
          >
            Antiga
          </Text>
        </TouchableOpacity>

        {/* Botão Próximo */}
        <TouchableOpacity
          style={[styles.botao, proximidadeAtiva && styles.botaoAtivo]}
          onPress={onProximidade}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color={proximidadeAtiva ? Cores.destaque : Cores.textoSecundario}
          />
          <Text
            style={[
              styles.botaoTexto,
              {
                color: proximidadeAtiva ? Cores.destaque : Cores.textoSecundario,
              },
            ]}
          >
            Próximo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Cores.fundo,
  },
  buscaInput: {
    backgroundColor: Cores.input,
    color: Cores.textoPrimario,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 0,
    marginBottom: 12,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Cores.input,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  botaoAtivo: {
    backgroundColor: Cores.destaque + '20',
    borderWidth: 1,
    borderColor: Cores.destaque,
  },
  botaoTexto: {
    fontSize: 12,
    color: Cores.textoSecundario,
  },
});