# Sistema de Gerenciamento de Distribuição de Água
## Documentação de Funcionalidades

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Módulo de Autenticação](#módulo-de-autenticação)
3. [Dashboard Principal](#dashboard-principal)
4. [Gestão de Famílias](#gestão-de-famílias)
5. [Sistema de Cisternas](#sistema-de-cisternas)
6. [Registro e Histórico de Entregas](#registro-e-histórico-de-entregas)
7. [Cálculos e Previsões](#cálculos-e-previsões)
8. [Configurações do Sistema](#configurações-do-sistema)
9. [Sistema de Alertas](#sistema-de-alertas)
10. [Perfil do Usuário](#perfil-do-usuário)

---

## 🎯 Visão Geral

Sistema completo para gerenciamento de distribuição de água para famílias com cisternas em regiões semiáridas. O sistema segue as recomendações da ONU (50 litros/dia por pessoa) e da Articulação Semiárido Brasileiro - ASA (13 litros/dia), incluindo cálculos de consumo, previsão de abastecimento e gestão de dados de precipitação.

### Tecnologias Utilizadas
- **Frontend**: React com TypeScript
- **Roteamento**: React Router (Data Mode)
- **Estilização**: Tailwind CSS v4
- **Persistência**: LocalStorage
- **Notificações**: Sonner (Toast)
- **Componentes UI**: Radix UI

---

## 🔐 Módulo de Autenticação

### 1. Login de Usuários
- **Autenticação**: Login com email e senha
- **Validação**: Verificação de credenciais contra dados armazenados localmente
- **Persistência**: Sessão mantida no localStorage
- **Redirecionamento**: Após login bem-sucedido, usuário é direcionado ao dashboard
- **Proteção de Rotas**: Rotas protegidas redirecionam usuários não autenticados para login

### 2. Cadastro de Usuários
- **Campos**: Nome completo, email e senha
- **Validação de Email**: Verifica se email já está cadastrado
- **Senha Mínima**: Requisito de 6 caracteres
- **Login Automático**: Após cadastro, usuário é automaticamente autenticado

### 3. Logout
- **Botão Independente**: Ícone de logout na barra superior
- **Limpeza de Sessão**: Remove dados do usuário do localStorage
- **Redirecionamento**: Retorna à tela de login

---

## 📊 Dashboard Principal

### 1. Visualização de Famílias
- **Layout em Grid**: Cards responsivos com informações das famílias (3 colunas em desktop, 2 em tablet, 1 em mobile)
- **Informações Exibidas por Card**:
  - Nome da família
  - Status de urgência (badge colorido)
  - Coordenadas geográficas (latitude/longitude)
  - Número de membros
  - Capacidade total das cisternas
  - Nível atual de água (%)
  - Barra de progresso visual com código de cores
  - Dias restantes até cisterna vazia
  - Alerta de próxima entrega (quando falta 7 dias ou menos)
  - Badge indicando sistema de captação de chuva (se aplicável)

### 2. Sistema de Busca e Filtros
- **Busca por Nome**: Campo de pesquisa em tempo real
- **Ordenação**:
  - Por urgência (padrão)
  - Por nome (A-Z)
  - Por nível de água (maior para menor)
  - Por nível de água (menor para maior)
- **Contador de Resultados**: Exibe quantidade de famílias encontradas
- **Estado Vazio**: Mensagens e ações quando não há famílias cadastradas ou resultados de busca

### 3. Código de Cores para Status
- **Verde/Secundário**: Cisterna com mais de 10 dias restantes (Status: Normal)
- **Amarelo**: Cisterna com 10 dias ou menos restantes (Status: Atenção)
- **Vermelho**: Cisterna com 5 dias ou menos restantes (Status: Urgente)

### 4. Navegação
- **Botão "Nova Família"**: Acesso rápido ao cadastro
- **Botão "Configurações"**: Acesso às configurações do sistema
- **Click no Card**: Abre detalhes completos da família
- **Menu do Usuário**: Avatar com dropdown para perfil e logout

---

## 👨‍👩‍👧‍👦 Gestão de Famílias

### 1. Cadastro de Nova Família
**Informações Básicas**:
- Nome da família (obrigatório)
- Coordenadas geográficas (latitude e longitude)

**Membros da Família**:
- Adicionar múltiplos membros
- Campos por membro:
  - Nome (obrigatório)
  - Idade
  - Status de acamado (switch)
- Botões para adicionar/remover membros
- Mínimo de 1 membro obrigatório

**Cisternas**:
- Adicionar múltiplas cisternas por família
- Campos por cisterna:
  - Capacidade (litros) - obrigatório, maior que zero
  - Volume Atual (litros) - volume inicial de água na cisterna
- Validação: Volume atual não pode exceder a capacidade
- Botões para adicionar/remover cisternas
- Mínimo de 1 cisterna obrigatória
- Identificação automática (Cisterna 1, 2, 3...)
- Cards visuais diferenciados para cada cisterna

**Sistema de Captação de Chuva**:
- Switch para ativar/desativar
- Campos condicionais (aparecem apenas se ativado):
  - Eficiência de captação (%) - padrão 80%
  - Área de captação (m²) - padrão 50m²

### 2. Visualização de Detalhes
**Painel Esquerdo (Principal)**:
- **Informações Gerais**:
  - Nome e coordenadas
  - Badge de urgência (se aplicável)
  - Número de membros
  - Capacidade total das cisternas
  - Consumo diário calculado
  - Indicador de sistema de captação

- **Status da Cisterna**:
  - Nível atual em % e litros
  - Barra visual de progresso com cores
  - Dias restantes até cisterna vazia
  - Data prevista da próxima entrega
  - Alerta visual para situações urgentes

- **Lista de Membros**:
  - Cards com nome, idade
  - Badge para membros acamados

- **Lista de Cisternas**:
  - Cards individuais para cada cisterna
  - Capacidade e volume inicial de cada uma

**Painel Direito (Lateral)**:
- **Formulário de Registro de Entrega**
- **Histórico de Entregas** (últimas 5)

### 3. Edição de Família
- Todos os campos do cadastro disponíveis para edição
- Adicionar/remover membros
- Adicionar/remover cisternas
- Atualizar informações de captação de chuva
- Botão "Salvar Alterações"
- Botão "Cancelar" para descartar mudanças

### 4. Exclusão de Família
- Botão de exclusão com confirmação
- Dialog de alerta com confirmação dupla
- Aviso sobre perda de dados e histórico
- Redirecionamento ao dashboard após exclusão

---

## 🚰 Sistema de Cisternas

### 1. Suporte a Múltiplas Cisternas
- Cada família pode ter várias cisternas
- Gerenciamento individual de cada cisterna
- Cálculos somam todas as cisternas da família

### 2. Informações por Cisterna
- **Capacidade**: Volume máximo em litros
- **Volume Atual**: Quantidade inicial de água
- **Identificação**: Numeração automática (Cisterna 1, 2, 3...)

### 3. Validações
- Volume atual não pode exceder capacidade
- Mínimo de 1 cisterna por família
- Capacidade deve ser maior que zero

### 4. Cálculos Integrados
- **Capacidade Total**: Soma de todas as cisternas
- **Volume Total Atual**: Soma dos volumes de todas
- **Nível Percentual**: Baseado no total de todas as cisternas
- **Previsões**: Consideram consumo sobre o total disponível

---

## 📦 Registro e Histórico de Entregas

### 1. Registro de Nova Entrega
**Campos do Formulário**:
- **Data da Entrega**: Seletor de data (padrão: data atual)
- **Volume Enviado**: Quantidade de água disponibilizada (litros)
- **Volume Entregue**: Quantidade efetivamente entregue (litros)

**Validações**:
- Todos os campos obrigatórios
- Volume entregue não pode ser maior que enviado
- Volume não pode exceder capacidade total das cisternas
- Valores devem ser positivos

**Ação após Registro**:
- Atualização automática do nível das cisternas
- Atualização dos cálculos e previsões
- Notificação de sucesso (toast)
- Limpeza do formulário

### 2. Histórico de Entregas
**Exibição**:
- Lista ordenada por data (mais recente primeiro)
- Últimas 5 entregas visíveis no painel
- Contador de entregas antigas

**Informações por Entrega**:
- Data formatada
- Volume enviado (com label)
- Volume entregue (destacado em azul)
- Ícone de calendário

**Estado Vazio**:
- Mensagem quando não há entregas registradas

---

## 🧮 Cálculos e Previsões

### 1. Consumo Diário
**Fórmula Base**:
```
Consumo Diário = Número de Membros × Consumo por Pessoa
```

**Parâmetros Configuráveis**:
- Consumo por pessoa (padrão: 50L - ONU)
- Alternativa: 13L (ASA - regiões semiáridas)

### 2. Nível Atual da Cisterna
**Cálculo**:
1. Volume inicial: Soma de volumes iniciais de todas as cisternas
2. Considera todas as entregas registradas
3. Subtrai consumo diário desde a última entrega ou início
4. Calcula percentual sobre capacidade total

**Fórmula**:
```
Volume Atual = Volume Inicial + Σ Entregas - (Dias Decorridos × Consumo Diário)
Percentual = (Volume Atual / Capacidade Total) × 100
```

### 3. Dias Restantes
**Cálculo**:
```
Dias Restantes = Volume Atual / Consumo Diário
```

**Considerações**:
- Se volume atual ≤ 0: "Cisterna vazia"
- Arredondamento para dias inteiros

### 4. Data da Próxima Entrega
**Critérios**:
- Baseado em intervalo médio entre entregas anteriores
- Adiciona ao dia da última entrega
- Se histórico insuficiente, usa período padrão de 30 dias

**Alerta de Urgência**:
- Ativado quando faltam 7 dias ou menos
- Badge e notificação visual no card

### 5. Captação de Água da Chuva (Opcional)
**Quando Ativo**:
- Considera dados de precipitação mensal
- Aplica eficiência de captação configurada
- Calcula volume captado por área de telhado

**Fórmula**:
```
Volume Captado = Precipitação (mm) × Área (m²) × Eficiência (%) / 1000
```

---

## ⚙️ Configurações do Sistema

### 1. Parâmetros de Consumo
**Consumo Diário por Pessoa**:
- Campo editável (litros/dia)
- Botões de atalho:
  - "Usar ONU (50L)": Define 50 litros
  - "Usar ASA (13L)": Define 13 litros
- Descrição das recomendações
- Botão "Salvar Configurações"

**Impacto**:
- Afeta todos os cálculos de consumo
- Recalcula previsões automaticamente
- Aplica-se a todas as famílias

### 2. Dados de Precipitação
**Cadastro de Precipitação**:
- Seletor de ano (últimos 10 anos)
- Seletor de mês
- Campo de precipitação em mm (aceita decimais)
- Botão "Adicionar"

**Gerenciamento**:
- Lista de dados cadastrados
- Ordenação por data (mais recente primeiro)
- Exibição: Mês Ano - XX.X mm
- Atualização automática se mês/ano já existir
- Scroll para listas longas

**Uso nos Cálculos**:
- Integra com famílias que têm sistema de captação
- Melhora precisão das previsões
- Considera sazonalidade

---

## 🚨 Sistema de Alertas

### 1. Alertas de Urgência
**Critérios de Ativação**:
- 5 dias ou menos restantes até a cisterna vazia

**Indicadores Visuais**:
- Badge vermelho "Urgente"
- Barra de progresso vermelha
- Card destacado no topo da lista (ordenação por urgência)

### 2. Alertas de Atenção
**Critérios**:
- 10 dias ou menos restantes até a cisterna vazia (mas mais de 5 dias)

**Indicadores**:
- Badge "Atenção"
- Barra de progresso amarela

### 3. Status Normal
**Critérios**:
- Mais de 10 dias restantes até a cisterna vazia

**Indicadores**:
- Badge "Normal" (secundário/verde)
- Barra de progresso azul/verde

### 4. Alerta de Dias Restantes
**Quando Exibido**:
- 7 dias ou menos até cisterna vazia
- Apenas se ainda houver água

**Formato**:
- Ícone de alerta
- Texto: "X dias restantes"
- Cor laranja

### 5. Alerta de Próxima Entrega
**Quando Exibido**:
- Faltam 7 dias ou menos para entrega programada
- Cisterna ainda tem mais de 3 dias de reserva

**Formato**:
- Caixa azul com borda
- Ícone de calendário
- Texto: "Entrega em X dias"

### 6. Notificações (Toast)
**Ações que Geram Notificação**:
- ✅ Sucesso:
  - Família cadastrada
  - Família atualizada
  - Família excluída
  - Entrega registrada
  - Configurações salvas
  - Dados de precipitação adicionados
  - Perfil atualizado
  - Senha alterada

- ❌ Erro:
  - Validações de formulário
  - Email já cadastrado
  - Senha antiga incorreta
  - Volumes inválidos

---

## 👤 Perfil do Usuário

### 1. Acesso ao Perfil
- Click no avatar do usuário (canto superior direito)
- Menu dropdown com opções:
  - Nome e email do usuário
  - "Meu Perfil"
  - Separador visual

### 2. Tela de Perfil
**Seção: Informações Pessoais**:
- Card com título "Meu Perfil"
- Campos:
  - Nome completo (ícone de usuário)
  - Email (ícone de email)
- Estados:
  - **Visualização**: Campos desabilitados
  - **Edição**: Campos habilitados

**Controles**:
- Modo Visualização:
  - Botão "Editar Dados"
- Modo Edição:
  - Botão "Salvar Alterações"
  - Botão "Cancelar" (reverte mudanças)

**Seção: Segurança**:
- Card separado "Segurança"
- Botão "Alterar Senha" com ícone de cadeado

### 3. Alteração de Senha
**Modal de Alteração**:
- Título: "Alterar Senha"
- Descrição explicativa
- Campos:
  - **Senha Antiga**: Campo obrigatório, tipo password
  - **Nova Senha**: Campo obrigatório, mínimo 6 caracteres
  - Hint: "A senha deve ter no mínimo 6 caracteres"

**Botões**:
- "Cancelar": Fecha modal sem salvar
- "Confirmar Alteração": Valida e salva

**Validações**:
- Todos os campos obrigatórios
- Nova senha mínimo 6 caracteres
- Verifica se senha antiga está correta
- Notifica erro se senha antiga incorreta
- Notifica sucesso e fecha modal ao concluir

### 4. Navegação
- Botão "Voltar" para retornar ao dashboard
- Integração com sistema de rotas protegidas

---

## 💾 Persistência de Dados

### LocalStorage Keys
- `users`: Array de usuários cadastrados
- `currentUser`: Usuário atualmente logado
- `water-families`: Array de famílias cadastradas
- `water-settings`: Configurações do sistema

### Estrutura de Dados

**User**:
```typescript
{
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}
```

**Family**:
```typescript
{
  id: string;
  name: string;
  cisterns: Cistern[];
  hasRainGutter: boolean;
  rainCaptureEfficiency?: number;
  cisternCaptureArea?: number;
  coordinates: { latitude: number; longitude: number };
  members: Person[];
  deliveries: WaterDelivery[];
  createdAt: string;
}
```

**Cistern**:
```typescript
{
  id: string;
  capacity: number;
  currentVolume: number;
}
```

**Person**:
```typescript
{
  id: string;
  name: string;
  age: number;
  bedridden: boolean;
}
```

**WaterDelivery**:
```typescript
{
  id: string;
  date: string;
  volumeDelivered: number;
  volumeSent: number;
}
```

**Settings**:
```typescript
{
  dailyConsumptionPerPerson: number;
  rainfallData: RainfallData[];
}
```

**RainfallData**:
```typescript
{
  year: number;
  month: number;
  precipitation: number;
}
```

---

## 🗺️ Estrutura de Navegação

### Rotas Públicas
- `/login` - Tela de login
- `/registro` - Tela de cadastro

### Rotas Protegidas (Requer Autenticação)
- `/` - Dashboard (lista de famílias)
- `/nova-familia` - Cadastro de família
- `/familia/:id` - Detalhes da família
- `/familia/:id/editar` - Edição da família
- `/configuracoes` - Configurações do sistema
- `/perfil` - Perfil do usuário

### Proteção de Rotas
- Middleware verifica presença de usuário logado
- Redirecionamento automático para `/login` se não autenticado
- Após login, redireciona para página solicitada ou dashboard

---

## 🎨 Interface e UX

### Design System
- **Cores**: Sistema de cores baseado em Tailwind CSS
- **Tipografia**: Uso de classes semânticas do Tailwind
- **Componentes**: Baseados em Radix UI
- **Responsividade**: Mobile-first design

### Feedback Visual
- **Loading States**: Durante operações assíncronas
- **Estados Vazios**: Mensagens e ações quando não há dados
- **Validações**: Feedback inline em formulários
- **Confirmações**: Dialogs para ações destrutivas

### Acessibilidade
- Labels associados a inputs
- Textos alternativos (sr-only) para ícones
- Navegação por teclado
- Contraste adequado de cores
- Foco visível em elementos interativos

---

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px (1 coluna)
- **Tablet**: 640px - 1024px (2 colunas)
- **Desktop**: > 1024px (3 colunas)

### Adaptações
- Grid de famílias ajusta número de colunas
- Formulários empilham campos em mobile
- Header adapta espaçamento e tamanhos
- Tabelas rolam horizontalmente em telas pequenas

---

## 🔄 Fluxos de Uso Principais

### 1. Primeiro Acesso
1. Acessar sistema
2. Criar conta (registro)
3. Login automático após cadastro
4. Dashboard vazio
5. Configurar consumo diário (opcional)
6. Cadastrar primeira família
7. Adicionar membros e cisternas
8. Registrar entregas

### 2. Monitoramento Diário
1. Login
2. Visualizar dashboard
3. Identificar famílias em situação urgente (badges vermelhos)
4. Click em família para ver detalhes
5. Verificar dias restantes
6. Planejar entregas

### 3. Registro de Entrega
1. Acessar detalhes da família
2. Preencher formulário de entrega
3. Informar data, volume enviado e entregue
4. Confirmar registro
5. Sistema atualiza cálculos automaticamente

### 4. Gestão de Dados
1. Acessar configurações
2. Ajustar consumo diário conforme realidade local
3. Adicionar dados de precipitação mensalmente
4. Sistema usa dados para melhorar previsões

---

## 📊 Indicadores e Métricas

### Dashboard Fornece
- Total de famílias cadastradas
- Famílias em situação urgente
- Famílias que precisam de atenção
- Próximas entregas programadas

### Por Família
- Consumo diário calculado
- Dias até cisterna vazia
- Histórico de entregas
- Intervalo médio entre entregas
- Taxa de utilização das cisternas

---

## 🔒 Segurança

### Autenticação
- Senhas armazenadas em texto plano (LocalStorage)
- **Nota**: Para produção, implementar hash de senhas

### Validações
- Validação client-side em todos os formulários
- Sanitização de inputs
- Validação de tipos e ranges

### Dados
- Isolamento por usuário
- Não há compartilhamento entre usuários
- Dados persistem apenas localmente

---

## 🚀 Funcionalidades Futuras Sugeridas

1. **Exportação de Dados**
   - Exportar lista de famílias para CSV/Excel
   - Relatórios de entregas em PDF

2. **Mapa Interativo**
   - Visualização geográfica das famílias
   - Rota otimizada para entregas

3. **Dashboard Analítico**
   - Gráficos de consumo ao longo do tempo
   - Estatísticas agregadas
   - Projeções de demanda

4. **Notificações**
   - Alertas por email
   - Lembretes de entregas programadas
   - Notificações push

5. **Multi-usuário**
   - Diferentes níveis de permissão
   - Colaboração entre operadores
   - Histórico de ações

6. **Integração com APIs**
   - Dados climáticos automáticos
   - Integração com serviços de GPS
   - Backend para sincronização

7. **Modo Offline**
   - Service Worker para PWA
   - Sincronização quando online

---

## 📝 Conclusão

Este sistema oferece uma solução completa e intuitiva para o gerenciamento de distribuição de água em comunidades com cisternas. As funcionalidades implementadas atendem às necessidades de planejamento, monitoramento e registro de entregas, com cálculos precisos baseados em recomendações internacionais e considerando as particularidades de regiões semiáridas.

A interface amigável, sistema de alertas visuais e flexibilidade de configuração tornam o sistema adequado para uso por organizações, cooperativas e gestores públicos que atuam na distribuição de água para comunidades vulneráveis.

---

**Versão**: 1.0  
**Data**: Março 2026  
**Desenvolvido para**: Gerenciamento de distribuição de água em comunidades com cisternas