# YouTube Organizer

Um dashboard simples e moderno para organizar e acompanhar vídeos dos seus canais favoritos do YouTube.

## Funcionalidades

- ✅ Adicionar canais por nome ou ID
- ✅ Organizar canais em pastas (ex: Investimentos > Thiago Nigro e Raul Sena)
- ✅ Visualizar vídeos apenas dos canais selecionados
- ✅ Cache local (localStorage) para persistir seus canais e pastas

## Como Usar

### 1. Obter uma API Key do YouTube

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **API Key**
5. Copie a API key gerada
6. (Opcional) Restrinja a API key para usar apenas a YouTube Data API v3

### 2. Configurar a API Key

1. Crie um arquivo `.env.local` na raiz do projeto:
   ```bash
   cp .env.example .env.local
   ```

2. Abra o arquivo `.env.local` e adicione sua API key:
   ```
   YOUTUBE_API_KEY=sua_api_key_aqui
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000)

### 3. Adicionar Canais

Você pode adicionar canais de três formas:
- **Por nome**: Digite o nome do canal (ex: "Thiago Nigro")
- **Por URL**: Cole a URL do canal (ex: `https://www.youtube.com/@ThiagoNigro`)
- **Por ID**: Digite o ID do canal (ex: `UC...`)

### 4. Organizar em Pastas

1. Clique em **+ Nova Pasta** para criar uma pasta
2. Ao adicionar um canal, selecione a pasta desejada no dropdown
3. Você pode mover canais entre pastas a qualquer momento

### 5. Visualizar Vídeos

- Os vídeos são carregados automaticamente dos canais adicionados
- Use o filtro no topo para ver vídeos de uma pasta específica ou de todos os canais
- Clique em **Atualizar** para buscar os vídeos mais recentes

## Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **YouTube Data API v3** - Integração com YouTube
- **localStorage** - Persistência local

## Estrutura do Projeto

```
├── app/
│   ├── api/youtube/route.ts  # API route para buscar dados do YouTube
│   ├── page.tsx               # Página principal do dashboard
│   └── layout.tsx            # Layout da aplicação
├── components/
│   ├── ApiKeySetup.tsx       # Componente para configurar API key
│   ├── ChannelManager.tsx    # Gerenciador de canais e pastas
│   └── VideoList.tsx         # Lista de vídeos
└── lib/
    ├── storage.ts            # Utilitários para localStorage
    └── types.ts              # Tipos TypeScript
```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

## Notas

- A API do YouTube tem limites de quota. A versão gratuita permite 10.000 unidades por dia.
- Os dados são salvos localmente no navegador (localStorage).
- A API key é armazenada no arquivo `.env.local` (não é commitada no git por segurança).
- Certifique-se de que o arquivo `.env.local` está no `.gitignore` para não expor sua API key.
