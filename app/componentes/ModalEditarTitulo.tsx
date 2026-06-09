// app/componentes/ModalEditarTitulo.tsx
// Modal para editar o título de uma foto ou vídeo. Recebe o título atual e retorna o novo título ao salvar.

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Cores } from "../style/cores";

interface Props {
  visivel: boolean;
  tituloAtual: string;
  setTituloAtual?: (titulo: string) => void; // opcional (não usado internamente)
  onSalvar: (titulo: string) => void; // recebe o título
  onCancelar: () => void;
}

export default function ModalEditarTitulo({
  visivel,
  tituloAtual,
  onSalvar,
  onCancelar,
}: Props) {
  const [texto, setTexto] = useState(tituloAtual);

  useEffect(() => {
    if (visivel) {
      setTexto(tituloAtual);
    }
  }, [visivel, tituloAtual]);

  const handleSalvar = () => {
    if (texto.trim()) {
      onSalvar(texto.trim()); // passa direto, sem depender de setState do pai
    }
  };

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Editar título</Text>
          <TextInput
            style={styles.input}
            placeholder="Novo título"
            placeholderTextColor={Cores.placeholder}
            value={texto}
            onChangeText={setTexto}
            maxLength={60}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={onCancelar}
            >
              <Ionicons
                name="close-outline"
                size={16}
                color={Cores.textoSecundario}
              />
              <Text style={styles.btnTextSecondary}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleSalvar}
            >
              <Ionicons name="checkmark-outline" size={16} color="#fff" />
              <Text style={styles.btnTextPrimary}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: Cores.cartao,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  modalTitle: {
    color: Cores.textoPrimario,
    fontSize: 20,
    fontWeight: "700",
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
  modalButtons: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  btnPrimary: { backgroundColor: Cores.destaque },
  btnSecondary: {
    backgroundColor: Cores.input,
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  btnTextPrimary: { color: "#fff", fontWeight: "700", fontSize: 15 },
  btnTextSecondary: {
    color: Cores.textoSecundario,
    fontWeight: "600",
    fontSize: 15,
  },
});