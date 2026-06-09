// componentes/ModalTitulo.tsx
// Modal para inserir o título de uma nova foto ou vídeo

import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Cores } from '../style/cores';

interface Props {
  visivel: boolean;
  onSalvar: (titulo: string) => void;
  onCancelar: () => void;
}

export default function ModalTitulo({ visivel, onSalvar, onCancelar }: Props) {
  const [titulo, setTitulo] = useState('');

  // limpa o campo sempre que o modal abre
  useEffect(() => {
    if (visivel) setTitulo('');
  }, [visivel]);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Título da mídia</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite um título"
            placeholderTextColor={Cores.placeholder}
            value={titulo}
            onChangeText={setTitulo}
            autoFocus
            maxLength={100}
            returnKeyType="done"
            onSubmitEditing={() => titulo.trim() && onSalvar(titulo)}
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancelar}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSave]}
              onPress={() => titulo.trim() && onSalvar(titulo)}
            >
              <Text style={styles.btnSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Cores.cartao,
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  title: {
    color: Cores.textoPrimario,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: Cores.input,
    color: Cores.textoPrimario,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Cores.borda,
    marginBottom: 20,
  },
  buttons: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: Cores.input,
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  btnCancelText: { color: Cores.textoSecundario, fontWeight: '600' },
  btnSave: { backgroundColor: Cores.destaque },
  btnSaveText: { color: '#fff', fontWeight: '700' },
});