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

Execute os comandos na raiz do projeto, onde está o arquivo compose.yaml.

### Primeira instalação

Siga os passos na ordem, avançando quando cada comando terminar com sucesso.

1. Crie o arquivo de configuração:

```bash
cp -n .env.example .env
```

Abra o arquivo `.env` e configure `POSTGRES_DB`, `POSTGRES_USER`
e `POSTGRES_PASSWORD`.

2. Inicie o banco e aguarde ficar disponível:

```bash
docker compose up -d --wait db
```

3. Instale as dependências da aplicação:

```bash
docker compose run --rm --no-deps web npm ci
```

4. Aplique as migrations em ordem:

```bash
cat database/migrations/*.sql | docker compose exec -T db sh -c 'exec psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
```

Esse passo é para um banco vazio. As migrations atuais são aplicadas
manualmente e não devem ser reaplicadas ao reiniciar o projeto.

5. Carregue os dados de demonstração:

```bash
docker compose exec -T db sh -c 'exec psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < database/seeds/development.sql
```

6. Inicie a aplicação:

```bash
docker compose up -d web
```

### Uso diário

Depois da primeira instalação, inicie o ambiente com:

```bash
docker compose up -d
```

### Endereços locais

- [Página inicial](http://localhost:3000)
- [Agendamento](http://localhost:3000/booking)
- [Profissionais](http://localhost:3000/dashboard/professionals)
- [Serviços](http://localhost:3000/dashboard/services)

### Encerrando o ambiente

```bash
docker compose down
```

Esse comando encerra os containers e preserva o volume com os dados do banco.

## Verificações de qualidade

Execute os comandos na raiz do projeto, com o ambiente de desenvolvimento iniciado.

### Formatação, lint e TypeScript

```bash
docker compose exec -T web npm run check
git diff --check
```

O script `check` executa formatação, lint e TypeScript nessa ordem.

Para aplicar a formatação aos arquivos da aplicação web:

```bash
docker compose exec -T web npm run format
```

### Teste das APIs de agendamento

Com `web` e `db` ativos e os dados de demonstração carregados:

```bash
docker compose exec -T web npm run test:api
```

O teste faz apenas consultas GET e compara a contagem de profissionais com a lista retornada para alguns horários.

### Build de produção

Os containers compartilham a pasta da aplicação. Pause o servidor de
desenvolvimento durante o build e reinicie depois:

```bash
docker compose stop web
docker compose run --rm --no-deps web npm run build
docker compose up -d web
```

Reinicie o serviço web também se o build falhar.

### Testes SQL

Execute no ambiente local de desenvolvimento, com o banco iniciado
e as quatro migrations aplicadas.

Rode os arquivos sequencialmente, pois utilizam os mesmos identificadores
para os registros de teste:

```bash
docker compose exec -T db sh -c 'exec psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < database/tests/availability_overlap.sql

docker compose exec -T db sh -c 'exec psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < database/tests/appointments.sql
```

Os testes verificam restrições de sobreposição e expiração manual.
Criam registros dentro de uma transação e terminam com rollback.
Uma restrição que não se comporte como esperado faz o script retornar erro.

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
    │   ├── contracts
    │   ├── config
    │   ├── data
    │   ├── data-access
    │   └── lib
    └── package.json
```

- `app`: páginas e endpoints HTTP.
- `components`: componentes da interface.
- `contracts`: tipos de dados compartilhados entre consultas, APIs e interface.
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
