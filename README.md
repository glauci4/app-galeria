# Galeria App

[![Expo](https://img.shields.io/badge/Expo-%2351c5cf?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-%2361dafb?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev)
[![SQLite](https://img.shields.io/badge/SQLite-%230073c9?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> Aplicativo mobile em React Native e Expo para gerenciar uma galeria de fotos com filtros avançados, ordenação por proximidade, backup local e visualização de mídias no mapa.

---

## Índice

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação rápida](#instalação-rápida)
- [Configuração](#configuração)
- [Uso](#uso)
- [Gerar APK com EAS](#gerar-apk-com-eas)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Possíveis problemas](#possíveis-problemas)
- [Licença](#licença)
- [Autora](#autora)

---

## Descrição

Galeria App é um aplicativo móvel desenvolvido com React Native e Expo para organizar, visualizar e salvar fotos e mídias em um banco de dados local SQLite. O sistema destaca-se pela aplicação de filtros, ordenação de itens por data e proximidade, backup em JSON e visualização das mídias em um mapa com marcadores. Além do cadastro tradicional, o app oferece geolocalização automática das mídias, organização por distância e acesso offline aos dados salvos. Esses diferenciais tornam o Galeria App ideal para quem precisa gerenciar conteúdos multimídia de forma intuitiva e segura.

## Funcionalidades

- Adição de mídia com pré-visualização de filtros aplicados antes do salvamento.
- Geolocalização automática das imagens ou vídeos cadastrados.
- Ordenação de mídias por data de criação e por proximidade em relação ao usuário.
- Edição de título de mídia e aplicação de filtros para facilitar a organização.
- Backup dos dados em arquivo JSON para exportação e restauração.
- Mapa com marcadores para visualizar a localização de cada mídia cadastrada.

## Tecnologias

- [React Native](https://reactnative.dev)
- [Expo](https://expo.dev)
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/)
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [expo-router](https://expo.github.io/router/docs)
- TypeScript

## Requisitos

- Node.js 18+ ou superior
- npm ou Yarn
- Expo CLI
- Android Studio (para Android)
- Xcode / macOS (para iOS)
- Dispositivo ou emulador Android/iOS
- Git

### Verificação rápida

```bash
node -v
npm -v
git --version
npx expo --version
```

## Instalação rápida

```bash
git clone https://github.com/seu-usuario/app-galeria.git
cd app-galeria
npm install
```

### Executar em desenvolvimento

```bash
npm run start
```

### Executar no Android

```bash
npm run android
```

### Executar no iOS

```bash
npm run ios
```

### Executar na web

```bash
npm run web
```

## Configuração

O projeto utiliza o Expo e não requer variáveis de ambiente específicas para rodar localmente. Garanta que as permissões de câmera, armazenamento e localização estejam habilitadas no dispositivo ou emulador.

Se necessário, instale o Expo CLI globalmente:

```bash
npm install --global expo-cli
```

### Configuração de SQLite

O banco de dados é gerenciado internamente pelo `expo-sqlite`. Não é preciso configurar conexão externa, pois os dados são armazenados diretamente no dispositivo.

### Configuração de backup

O backup local utiliza o sistema de arquivos do Expo. Verifique se a pasta de destino está acessível e se o aplicativo possui permissão para leitura e escrita.

## Uso

1. Abra o app com `npm run start`.
2. Adicione uma nova mídia usando o botão de cadastro.
3. Preencha título e selecione imagem ou vídeo.
4. Salve o item para enviar ao banco local SQLite.
5. Use a tela de listagem para buscar, editar ou visualizar a mídia.
6. Acesse o mapa para ver a localização das mídias cadastradas.

## Gerar APK com EAS

```bash
eas build -p android --profile preview
```

## Estrutura do projeto

```
app-galeria/
│
├── android/
├── ios/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── mapa.tsx
│   ├── componentes/
│   │   ├── BarraFiltros.tsx
│   │   ├── ItemGaleria.tsx
│   │   ├── ModalAdicionarMidia.tsx
│   │   ├── ModalEditarTitulo.tsx
│   │   ├── ModalTitulo.tsx
│   │   ├── PreviewFiltros.tsx
│   │   └── VisualizarMidia.tsx
│   ├── database/
│   │   ├── banco.ts
│   │   └── repositorios/
│   │       └── fotos.repositorio.ts
│   ├── servicos/
│   │   ├── backup.ts
│   │   ├── localizacao.ts
│   │   └── midia.ts
│   ├── style/
│   │   └── cores.ts
│   └── utils/
├── assets/
│   └── images/
├── scripts/
│   └── reset-project.js
├── utils/
│   └── formatadores.ts
├── app.json
├── eas.json
├── eslint.config.js
├── expo-env.d.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Possíveis problemas

### Geral
- Erro ao instalar dependências: execute `npm install` novamente.
- Expo não inicia: verifique se nenhuma outra instância está em execução e feche a porta usada.
- Emulador não conecta: reinicie o emulador ou o dispositivo.
- Versão incompatível de Node: use Node.js 18+.

### Android / iOS
- Permissão negada: habilite câmera, galeria e localização no dispositivo.
- Build falha no Android: limpe o cache do Gradle e execute novamente.
- Build falha no iOS: garanta que o Xcode esteja atualizado.

### SQLite
- Banco não abre: reinicie o app e verifique se há espaço disponível no dispositivo.
- Dados não aparecem: confirme se o cadastro foi salvo com sucesso e reinicie o app.

## Licença

Projeto licenciado sob MIT — consulte o arquivo `LICENSE`.

## Autora

- Glaucia (https://github.com/glauci4)

Este projeto foi desenvolvido como parte da disciplina de **Desenvolvimento Mobile**, com o objetivo de aplicar na prática os conceitos estudados sobre React Native, Expo, persistência local com SQLite, geolocalização e mapas. A aplicação foi construída individualmente, contemplando todos os requisitos obrigatórios e diferenciais propostos.