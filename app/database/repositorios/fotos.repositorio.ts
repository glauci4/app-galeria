// app/database/repositorios/fotos.repositorio.ts
// Repositório para gerenciar as operações de CRUD (Create, Read, Update, Delete) das fotos/vídeos no banco de dados SQLite.
// Define a interface Photo para representar a estrutura dos registros e funções para acessar e modificar os dados.

import { getDb } from '../banco';

// Interface que define a estrutura completa de uma foto/vídeo armazenada no banco
export interface Photo {
  id: number;
  title: string;                // Título ou nome do arquivo
  image_uri: string;           // Caminho do arquivo original (foto ou vídeo)
  latitude: number | null;     // Coordenada latitude (opcional)
  longitude: number | null;    // Coordenada longitude (opcional)
  created_at: string;          // Data/hora de criação (formato ISO)
  tipo: 'foto' | 'video';      // Distingue se é foto ou vídeo
  thumbnail_uri: string | null; // Caminho da miniatura (útil para vídeos ou pré-visualização)
  filtro: string;              // Nome do filtro aplicado (ex: 'original', 'sepia')
}

// Interface para os dados necessários ao criar uma nova foto/vídeo
// Todos os campos são obrigatórios exceto os marcados com opcional
export interface CreatePhotoInput {
  title: string;
  image_uri: string;
  latitude: number | null;
  longitude: number | null;
  tipo?: 'foto' | 'video';      // Padrão: 'foto'
  thumbnail_uri?: string | null; // Padrão: null
  filtro?: string;               // Padrão: 'original'
}

// Retorna todas as fotos/vídeos do banco, ordenadas da mais recente para a mais antiga.
// @returns Promise com array de objetos Photo
 
export async function getAllPhotos(): Promise<Photo[]> {
  const db = await getDb();
  return await db.getAllAsync<Photo>('SELECT * FROM photos ORDER BY created_at DESC');
}

// Cria um novo registro de foto/vídeo no banco de dados. A data de criação é gerada automaticamente no momento da inserção.
// @param input - Dados da nova mídia (title, image_uri, coordenadas, etc.)
// @returns Promise com o objeto Photo recém-criado (incluindo o ID gerado)

export async function createPhoto(input: CreatePhotoInput): Promise<Photo> {
  const db = await getDb();
  const createdAt = new Date().toISOString(); // Gera timestamp atual no padrão ISO
  const tipo = input.tipo || 'foto';          // Valor padrão caso não informado
  const filtro = input.filtro || 'original';  // Valor padrão caso não informado

  // Executa a inserção na tabela 'photos' usando prepared statement (evita SQL injection)
  const result = await db.runAsync(
    `INSERT INTO photos (title, image_uri, latitude, longitude, created_at, tipo, thumbnail_uri, filtro)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.image_uri,
      input.latitude,
      input.longitude,
      createdAt,
      tipo,
      input.thumbnail_uri || null, // Converte undefined para null para compatibilidade com SQLite
      filtro,
    ]
  );

  // Retorna o objeto Photo com os dados inseridos + o ID gerado pelo banco
  return {
    id: result.lastInsertRowId,   // Último ID auto-incrementado
    title: input.title,
    image_uri: input.image_uri,
    latitude: input.latitude,
    longitude: input.longitude,
    created_at: createdAt,
    tipo,
    thumbnail_uri: input.thumbnail_uri || null,
    filtro,
  };
}

// Remove uma foto/vídeo do banco de dados pelo seu ID.
// @param id - Identificador único do registro a ser deletado

export async function deletePhoto(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
}

// Atualiza apenas o título de uma foto/vídeo existente.
// @param id - ID do registro a ser alterado
// @param title - Novo título para a foto/vídeo

export async function updatePhotoTitle(id: number, title: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE photos SET title = ? WHERE id = ?', [title, id]);
}

// Atualiza o filtro aplicado a uma foto.
// @param id - ID do registro a ser alterado
// @param filtro - Nome do novo filtro (ex: 'preto-branco', 'vintage')
 
export async function updatePhotoFiltro(id: number, filtro: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE photos SET filtro = ? WHERE id = ?', [filtro, id]);
}