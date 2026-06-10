// servicos/backup.ts
// Serviço para exportar e importar backup do banco de dados no formato JSON.
// A exportação compartilha o arquivo via sistema (ex: e-mail, drive, salvar no dispositivo).
// A importação lê um arquivo JSON selecionado e insere os registros no banco atual.

import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import {
  getAllPhotos,
  createPhoto,
  Photo,
} from '../database/repositorios/fotos.repositorio';

// Nome fixo do arquivo de backup no diretório temporário/documento
const NOME_ARQUIVO = 'backup_galeria.json';

// Exporta todas as fotos/vídeos do banco de dados para um arquivo JSON e dispara o compartilhamento nativo (salvar, enviar, etc.).
// @returns {Promise<boolean>} - true se o compartilhamento foi iniciado com sucesso, false caso contrário
// @throws {Error} - se falhar ao criar o arquivo ou ao iniciar o compartilhamento
 
export async function exportarBackup(): Promise<boolean> {
  try {
    // Obtém todos os registros do banco de dados
    const fotos = await getAllPhotos();
    // Converte para string JSON formatada (com indentação de 2 espaços para legibilidade)
    const conteudo = JSON.stringify(fotos, null, 2);

    // Cria um arquivo no diretório de documentos do app
    const arquivo = new File(Paths.document, NOME_ARQUIVO);
    arquivo.write(conteudo);

    // Verifica se o sistema pode compartilhar arquivos
    if (await Sharing.isAvailableAsync()) {
      // Compartilha o arquivo (abre o picker nativo de compartilhamento)
      await Sharing.shareAsync(arquivo.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Salvar backup da galeria',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Backup] Erro ao exportar:', error);
    throw error;
  }
}

// Importa um arquivo de backup JSON selecionado pelo usuário 

export async function importarBackup(): Promise<boolean> {
  try {
    // Abre o seletor de documentos aceitando qualquer tipo (iOS ignora filtros)
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // iOS ignora filtros — a validação será feita pela extensão
      copyToCacheDirectory: true,
    });

    // Se o usuário cancelou a seleção, retorna false sem erro
    if (result.canceled) return false;

    const asset = result.assets[0];
    const uri = asset.uri;
    const nome = asset.name ?? '';

    console.log('[Backup] Arquivo selecionado:', nome, uri);

    // Valida a extensão do arquivo (deve ser .json)
    if (!nome.toLowerCase().endsWith('.json')) {
      throw new Error('Selecione um arquivo .json de backup válido.');
    }

    // Lê o conteúdo do arquivo utilizando fetch
    let conteudo: string;
    try {
      const response = await fetch(uri);
      conteudo = await response.text();
      console.log('[Backup] Conteúdo lido, tamanho:', conteudo.length);
    } catch (err) {
      console.error('[Backup] Erro ao ler arquivo via fetch:', err);
      throw new Error('Não foi possível ler o arquivo selecionado.');
    }

    // Tenta interpretar o conteúdo como JSON
    let fotosBackup: Photo[];
    try {
      fotosBackup = JSON.parse(conteudo);
    } catch {
      throw new Error('Arquivo de backup inválido ou corrompido.');
    }

    // Verifica se o JSON é um array (formato esperado)
    if (!Array.isArray(fotosBackup)) {
      throw new Error('Formato de backup inválido.');
    }

    console.log(`[Backup] ${fotosBackup.length} itens para importar`);

    // Insere cada registro no banco de dados
    for (const foto of fotosBackup) {
      await createPhoto({
        title: foto.title ?? 'Sem título',               // Usa título padrão se ausente
        image_uri: foto.image_uri ?? '',                 // URI da imagem/vídeo
        latitude: foto.latitude ?? null,                 // Coordenada latitude (opcional)
        longitude: foto.longitude ?? null,               // Coordenada longitude (opcional)
        tipo: foto.tipo ?? 'foto',                       // 'foto' ou 'video'
        thumbnail_uri: foto.thumbnail_uri ?? null,       // URI da miniatura (opcional)
        filtro: (foto as any).filtro ?? 'original',      // Nome do filtro aplicado (padrão 'original')
      });
    }

    return true;
  } catch (error) {
    console.error('[Backup] Erro ao importar:', error);
    throw error;
  }
}