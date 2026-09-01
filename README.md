# Appointment Platform

Plataforma de agendamentos para negócios que trabalham com horários, profissionais e serviços.

O projeto está sendo desenvolvido como estudo de uma aplicação SaaS multiempresa, com foco em organização, segurança e evolução incremental.

## Funcionalidades planejadas

- Cadastro de organizações e unidades.
- Cadastro de profissionais, serviços, preços e durações.
- Horários de trabalho, intervalos, folgas e bloqueios.
- Escolha de serviço e profissional pelo cliente.
- Opção “qualquer profissional disponível”.
- Confirmação automática ou manual por profissional.
- Prevenção de agendamentos sobrepostos.
- Finalização de atendimentos.
- Faturamento diário, semanal, mensal e por profissional.
- Confirmações e lembretes pelo WhatsApp.

## Tecnologias

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Docker e Docker Compose
- ESLint
- Prettier
- Playwright e Vitest

## Executando localmente

É necessário ter Docker e Docker Compose instalados.

Inicie o ambiente:

```bash
docker compose up
```

Acesse:

```text
http://localhost:3000
```

Encerre o ambiente com `Ctrl+C`.

## Verificações de qualidade

```bash
docker compose run --rm web npm run format:check
docker compose run --rm web npm run lint
docker compose run --rm web npm run build
```

Para aplicar a formatação:

```bash
docker compose run --rm web npm run format
```

## Estrutura inicial

```text
.
├── compose.yaml
├── README.md
└── web
    ├── src
    │   ├── app
    │   ├── components
    │   └── data
    └── package.json
```

## Estado atual

- Ambiente Next.js configurado com Docker.
- Landing page responsiva.
- Componentes e dados da landing page separados.
- Formatação e análise de código configuradas.
- Modelagem do domínio em andamento.
