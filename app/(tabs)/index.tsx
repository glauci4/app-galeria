// app/(tabs)/index.tsx
// arquivo principal da aba de galeria, onde listamos as fotos e vídeos, aplicamos filtros, ordenação, e temos acesso às ações de CRUD e backup.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { obterLocalizacao, ordenarFotosPorProximidade } from '../servicos/localizacao';
import { exportarBackup, importarBackup } from '../servicos/backup';
import { copiarMidiaParaPermanente } from '../servicos/midia';
import {
  getAllPhotos,
  createPhoto,
  deletePhoto,
  updatePhotoTitle,
  updatePhotoFiltro,
  Photo,
} from '../database/repositorios/fotos.repositorio';
import BarraFiltros from '../componentes/BarraFiltros';
import ItemGaleria from '../componentes/ItemGaleria';
import ModalAdicionarMidia from '../componentes/ModalAdicionarMidia';
import ModalTitulo from '../componentes/ModalTitulo';
import ModalEditarTitulo from '../componentes/ModalEditarTitulo';
import VisualizarMidia from '../componentes/VisualizarMidia';
import PreviewFiltros from '../componentes/PreviewFiltros';
import { Cores } from '../style/cores';

const { width } = Dimensions.get('window');
const COLUNAS = 3;

export default function GalleryScreen() {
  // Estados principais 
  const [fotos, setFotos] = useState<Photo[]>([]);
  const [fotosExibidas, setFotosExibidas] = useState<Photo[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Modais de criação 
  const [modalMidiaVisivel, setModalMidiaVisivel] = useState(false);
  const [modalTituloVisivel, setModalTituloVisivel] = useState(false);

  const [midiaTemp, setMidiaTemp] = useState<{
    uri: string;
    tipo: 'foto' | 'video';
    thumbnailUri?: string | null;
    filtro?: string;
  } | null>(null);

  // Preview com filtros (apenas para fotos) 
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewTipo, setPreviewTipo] = useState<'foto' | 'video'>('foto');

  // Filtros e ordenação
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'recente' | 'antiga'>('recente');
  const [ordenacaoPorProximidade, setOrdenacaoPorProximidade] = useState(false);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const filtrosAnim = React.useRef(new Animated.Value(0)).current;

  // Edição de título 
  const [editModal, setEditModal] = useState<{ visivel: boolean; foto: Photo | null }>({
    visivel: false,
    foto: null,
  });
  // Edição de filtro 
  const [editFiltroModal, setEditFiltroModal] = useState<{ visivel: boolean; foto: Photo | null }>({
    visivel: false,
    foto: null,
  });

  // Visualização em tela cheia 
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Photo | null>(null);

  // Efeitos e ciclo de vida
  useFocusEffect(useCallback(() => { carregarFotos(); }, []));

  useEffect(() => {
    async function aplicar() {
      let resultado = [...fotos];
      if (busca.trim()) {
        resultado = resultado.filter((f) =>
          f.title.toLowerCase().includes(busca.toLowerCase())
        );
      }
      if (ordenacaoPorProximidade) {
        resultado = await ordenarFotosPorProximidade(resultado);
      } else if (ordenacao === 'recente') {
        resultado.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        resultado.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
      setFotosExibidas(resultado);
    }
    aplicar();
  }, [fotos, busca, ordenacao, ordenacaoPorProximidade]);

  useEffect(() => {
    Animated.timing(filtrosAnim, {
      toValue: filtrosVisiveis ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [filtrosVisiveis, filtrosAnim]);

  // Operações com dados
  async function carregarFotos() {
    try {
      setFotos(await getAllPhotos());
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as fotos.');
    }
  }

  function handleSetOrdenacao(tipo: 'recente' | 'antiga') {
    if (ordenacaoPorProximidade) setOrdenacaoPorProximidade(false);
    setOrdenacao(tipo);
  }

  async function aplicarFiltroProximidade() {
    setOrdenacaoPorProximidade(true);
    Alert.alert('Filtro aplicado', 'Fotos ordenadas pela sua localização atual.');
  }

  // Fluxo de adicionar nova mídia
  function handleEscolha(opcao: 'camera-foto' | 'camera-video' | 'galeria') {
    setModalMidiaVisivel(false);
    setTimeout(() => {
      abrirPicker(opcao);
    }, Platform.OS === 'android' ? 600 : 300);
  }

  async function abrirPicker(opcao: 'camera-foto' | 'camera-video' | 'galeria') {
    try {
      let result: ImagePicker.ImagePickerResult;
      let tipo: 'foto' | 'video';

      if (opcao === 'camera-foto' || opcao === 'camera-video') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Habilite a Câmera nas configurações do app.');
          return;
        }
        tipo = opcao === 'camera-foto' ? 'foto' : 'video';
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
          mediaTypes: tipo === 'foto'
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão necessária', 'Habilite o Armazenamento nas configurações do app.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: false,
          quality: 0.8,
          mediaTypes: ImagePicker.MediaTypeOptions.All,
        });
        tipo = result.canceled
          ? 'foto'
          : result.assets?.[0]?.type === 'video' ? 'video' : 'foto';
      }

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (tipo === 'foto') {
        setPreviewUri(asset.uri);
        setPreviewTipo('foto');
      } else {
        setCarregando(true);
        const uri = await copiarMidiaParaPermanente(asset.uri, tipo);
        setMidiaTemp({ uri, tipo, thumbnailUri: null });
        setTimeout(() => setModalTituloVisivel(true), 150);
        setCarregando(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível processar a mídia.');
    }
  }

  async function handleConfirmarFiltro(filtroId: string) {
    if (!previewUri) return;
    setPreviewUri(null);
    setCarregando(true);
    try {
      const uri = await copiarMidiaParaPermanente(previewUri, 'foto');
      setMidiaTemp({ uri, tipo: 'foto', thumbnailUri: null, filtro: filtroId });
      setTimeout(() => setModalTituloVisivel(true), 150);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível processar a foto.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleSalvarComTitulo(titulo: string) {
    if (!titulo.trim() || !midiaTemp) return;
    setModalTituloVisivel(false);
    setCarregando(true);
    try {
      const coords = await obterLocalizacao();
      await createPhoto({
        title: titulo.trim(),
        image_uri: midiaTemp.uri,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        tipo: midiaTemp.tipo,
        thumbnail_uri: midiaTemp.thumbnailUri || null,
        filtro: midiaTemp.filtro || 'original', // salva o filtro aplicado na preview
      });
      setMidiaTemp(null);
      await carregarFotos();
      Alert.alert('Sucesso', `${midiaTemp.tipo === 'foto' ? 'Foto' : 'Vídeo'} adicionado!`);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setCarregando(false);
    }
  }

  // CRUD (exclusão, edição de título, edição de filtro) 
  function handleLongPress(foto: Photo) {
    Alert.alert('Opções', foto.title, [
      {
        text: 'Editar título',
        onPress: () => setEditModal({ visivel: true, foto }),
      },
      {
        text: 'Editar filtro',
        onPress: () => setEditFiltroModal({ visivel: true, foto }),
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => confirmarExclusao(foto),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function confirmarExclusao(foto: Photo) {
    Alert.alert('Excluir mídia', `Tem certeza que deseja excluir "${foto.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deletePhoto(foto.id);
          await carregarFotos();
        },
      },
    ]);
  }

  async function salvarEdicao(novoTitulo: string) {
    if (!novoTitulo.trim() || !editModal.foto) return;
    await updatePhotoTitle(editModal.foto.id, novoTitulo.trim());
    setEditModal({ visivel: false, foto: null });
    await carregarFotos();
    Alert.alert('Sucesso', 'Título atualizado.');
  }

  async function handleSalvarFiltroEditado(filtroId: string) {
    if (!editFiltroModal.foto) return;
    await updatePhotoFiltro(editFiltroModal.foto.id, filtroId);
    setEditFiltroModal({ visivel: false, foto: null });
    await carregarFotos();
    Alert.alert('Sucesso', 'Filtro atualizado.');
  }

  // Backup
  async function handleExportar() {
    try {
      await exportarBackup();
      Alert.alert('Sucesso', 'Backup exportado!');
    } catch {
      Alert.alert('Erro', 'Falha ao exportar backup.');
    }
  }

  async function handleImportar() {
    try {
      await importarBackup();
      await carregarFotos();
      Alert.alert('Sucesso', 'Backup importado!');
    } catch (err: any) {
      Alert.alert(
        'Erro ao importar',
        err?.message ?? 'Falha ao importar backup.',
        [{ text: 'OK' }]
      );
    }
  }

  // Utilitários
  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const abrirVisualizador = (item: Photo) => {
    setSelectedMedia(item);
    setViewerVisible(true);
  };

  // Renderização
  const filtrosMaxAltura = filtrosAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });

  const renderItem = ({ item }: { item: Photo }) => (
    <ItemGaleria
      item={item}
      formatarData={formatarData}
      onLongPress={handleLongPress}
      onPress={abrirVisualizador}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Cores.fundo} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitulo}>Galeria</Text>
          <Text style={styles.headerContagem}>
            {fotosExibidas.length} {fotosExibidas.length === 1 ? 'item' : 'itens'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerIcon, filtrosVisiveis && styles.headerIconAtivo]}
            onPress={() => setFiltrosVisiveis((v) => !v)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={filtrosVisiveis ? Cores.destaque : Cores.textoPrimario}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleImportar}>
            <Ionicons name="download-outline" size={20} color={Cores.textoPrimario} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleExportar}>
            <Ionicons name="share-outline" size={20} color={Cores.textoPrimario} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros colapsáveis */}
      <Animated.View style={[styles.filtrosWrapper, { maxHeight: filtrosMaxAltura }]}>
        <BarraFiltros
          busca={busca}
          setBusca={setBusca}
          ordenacao={ordenacao}
          setOrdenacao={handleSetOrdenacao}
          onProximidade={aplicarFiltroProximidade}
          proximidadeAtiva={ordenacaoPorProximidade}
        />
      </Animated.View>

      {/* Galeria */}
      {fotosExibidas.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={64} color={Cores.icone} />
          <Text style={styles.emptyText}>Nenhuma mídia ainda</Text>
          <Text style={styles.emptySubtext}>
            Toque no + para adicionar sua primeira foto ou vídeo
          </Text>
        </View>
      ) : (
        <FlatList
          data={fotosExibidas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={COLUNAS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalMidiaVisivel(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Preview de filtros (nova mídia) */}
      {previewUri && (
        <View style={StyleSheet.absoluteFillObject}>
          <PreviewFiltros
            uri={previewUri}
            onConfirmar={handleConfirmarFiltro}
            onCancelar={() => setPreviewUri(null)}
          />
        </View>
      )}

      {/* Editar filtro (sobreposição para edição de filtro existente) */}
      {editFiltroModal.visivel && editFiltroModal.foto && (
        <View style={StyleSheet.absoluteFill}>
          <PreviewFiltros
            uri={editFiltroModal.foto.image_uri}
            filtroInicial={editFiltroModal.foto.filtro || 'original'}
            onConfirmar={handleSalvarFiltroEditado}
            onCancelar={() => setEditFiltroModal({ visivel: false, foto: null })}
          />
        </View>
      )}

      {/* Modais */}
      <ModalAdicionarMidia
        visivel={modalMidiaVisivel}
        carregando={carregando}
        onEscolha={handleEscolha}
        onCancelar={() => setModalMidiaVisivel(false)}
      />

      <ModalTitulo
        visivel={modalTituloVisivel}
        onSalvar={handleSalvarComTitulo}
        onCancelar={() => {
          setModalTituloVisivel(false);
          setMidiaTemp(null);
        }}
      />

      <ModalEditarTitulo
        visivel={editModal.visivel}
        tituloAtual={editModal.foto?.title || ''}
        onSalvar={salvarEdicao}
        onCancelar={() => setEditModal({ visivel: false, foto: null })}
      />

      <VisualizarMidia
        visible={viewerVisible}
        midia={selectedMedia}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Cores.borda,
  },
  headerTitulo: {
    color: Cores.textoPrimario,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerContagem: {
    color: Cores.textoSecundario,
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: { flexDirection: 'row', gap: 6 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Cores.input,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  headerIconAtivo: {
    backgroundColor: 'rgba(10,126,164,0.15)',
    borderColor: Cores.destaque,
  },
  filtrosWrapper: { overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: Cores.borda },
  grid: { padding: 8, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 8 },
  tile: { width: (width - 32) / 3, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: Cores.input },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: Cores.icone, fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: Cores.textoSecundario, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Cores.destaque,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Cores.destaque,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});