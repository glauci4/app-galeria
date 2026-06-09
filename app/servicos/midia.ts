// servicos/midia.ts
// Serviço para gerenciar arquivos de mídia (fotos e vídeos) no sistema de arquivos do dispositivo.
// Fornece funções para copiar arquivos temporários para um local permanente e para remover arquivos quando necessário.

import { File, Directory, Paths } from 'expo-file-system';

function gerarNomeUnico(extensao: string): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extensao}`;
}

export async function copiarMidiaParaPermanente(
  uriTemp: string,
  tipo: 'foto' | 'video'
): Promise<string> {
  try {
    const dir = new Directory(Paths.document, 'midias');
    if (!dir.exists) dir.create();

    const extensao = tipo === 'foto' ? 'jpg' : 'mp4';
    const nomeDestino = gerarNomeUnico(extensao);

    const origem = new File(uriTemp);
    if (!origem.exists) {
      console.warn('[Midia] Arquivo de origem não encontrado, retornando URI original');
      return uriTemp;
    }

    const destino = new File(dir, nomeDestino);
    origem.copy(destino);

    if (!destino.exists) {
      console.warn('[Midia] Destino não criado, retornando URI original');
      return uriTemp;
    }

    return destino.uri;
  } catch (error) {
    console.error('[Midia] copiarMidiaParaPermanente erro (usando URI original):', error);
    return uriTemp;
  }
}

export async function removerMidiaPermanente(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.error('[Midia] Erro ao remover arquivo:', error);
  }
}