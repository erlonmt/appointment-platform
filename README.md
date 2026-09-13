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
- PostgreSQL, com acesso pelo pacote pg
- Docker e Docker Compose
- ESLint e Prettier

Supabase, Vitest e Playwright estão previstos para etapas futuras.

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

## Estrutura do projeto

```text
.
├── .env.example
├── compose.yaml
├── database
│   ├── migrations
│   ├── queries
│   ├── seeds
│   └── tests
├── docs
├── README.md
└── web
    ├── src
    │   ├── app
    │   │   ├── api
    │   │   ├── booking
    │   │   └── dashboard
    │   ├── components
    │   ├── config
    │   ├── data
    │   ├── data-access
    │   └── lib
    └── package.json
```

- `app`: páginas e endpoints HTTP.
- `components`: componentes da interface.
- `config`: configurações da aplicação.
- `data`: conteúdo estático.
- `data-access`: consultas ao banco e transformação dos resultados.
- `lib`: infraestrutura compartilhada.
- `database`: migrations, consultas, dados de demonstração e testes SQL.
- `docs`: documentação do domínio e do esquema relacional.

## Estado atual

- Ambiente Next.js e PostgreSQL configurado com Docker Compose.
- Landing page responsiva, com componentes e conteúdo separados.
- Quatro migrations SQL para a estrutura inicial do banco.
- Dados de demonstração e testes SQL de restrições do banco.
- Painéis de demonstração para consultar serviços e profissionais.
- APIs GET para consultar horários e profissionais disponíveis.
- Disponibilidade considerando duração, intervalo, bloqueios e agendamentos existentes.
- Fluxo de agendamento: serviço, data e horário, profissional, dados do cliente e revisão.
- Formatação com Prettier, análise com ESLint e TypeScript estrito.

A gravação de clientes e agendamentos pelo fluxo, a autenticação e a
autorização multiempresa permanecem como próximas etapas.
