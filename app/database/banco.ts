// app/database/banco.ts

import * as SQLite from 'expo-sqlite';

// Variável para armazenar a instância do banco de dados (singleton)
let db: SQLite.SQLiteDatabase | null = null;
// Promise para garantir que a inicialização seja feita apenas uma vez
let dbReadyPromise: Promise<void> | null = null;

// Retorna a instância do banco de dados (abre a conexão se ainda não existir)
// @returns Promise com a instância do SQLiteDatabase

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    // Abre o banco de dados com nome 'galeria.db' (cria se não existir)
    db = await SQLite.openDatabaseAsync('galeria.db');
  }
  return db;
}

// Inicializa o banco de dados:
// - Cria a tabela 'photos' se não existir
// - Aplica migrações para colunas adicionadas posteriormente (tipo, thumbnail_uri, filtro)
// - Configura o modo WAL (Write-Ahead Logging) para melhor performance
// @returns Promise que resolve quando a inicialização estiver concluída

export async function initDatabase(): Promise<void> {
  // Evita executar a inicialização mais de uma vez simultaneamente
  if (dbReadyPromise) return dbReadyPromise;

  dbReadyPromise = (async () => {
    const database = await getDb();

    // Habilita o modo WAL para permitir leitura durante escrita e melhorar concorrência
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- Criação da tabela principal de fotos/vídeos
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,                -- Título ou nome do arquivo
        image_uri TEXT NOT NULL,            -- Caminho do arquivo original
        latitude REAL,                      -- Latitude da geolocalização (opcional)
        longitude REAL,                     -- Longitude da geolocalização (opcional)
        created_at TEXT NOT NULL,           -- Data/hora de criação (formato ISO)
        tipo TEXT NOT NULL DEFAULT 'foto',  -- Tipo: 'foto' ou 'video'
        thumbnail_uri TEXT,                 -- Caminho da miniatura (para vídeos ou otimização)
        filtro TEXT DEFAULT 'original'      -- Nome do filtro aplicado à imagem
      );
    `);

    // MIGRAÇÕES: verifica se colunas existem e as adiciona caso necessário ===
    // Obtém informações das colunas da tabela 'photos'
    const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(photos)');
    const columnNames = columns.map((c) => c.name);

    // Coluna 'tipo', adicionada posteriormente para suporte a vídeos
    if (!columnNames.includes('tipo')) {
      await database.execAsync("ALTER TABLE photos ADD COLUMN tipo TEXT NOT NULL DEFAULT 'foto'");
    }
    // Coluna 'thumbnail_uri', armazenar miniatura de vídeos/imagens otimizadas
    if (!columnNames.includes('thumbnail_uri')) {
      await database.execAsync('ALTER TABLE photos ADD COLUMN thumbnail_uri TEXT');
    }
    // Coluna 'filtro', registro do filtro aplicado (ex: 'original', 'sepia', 'preto-branco')
    if (!columnNames.includes('filtro')) {
      await database.execAsync("ALTER TABLE photos ADD COLUMN filtro TEXT DEFAULT 'original'");
    }

    console.log('[DB] Banco inicializado com suporte a vídeos e filtros');
  })();

  return dbReadyPromise;
}