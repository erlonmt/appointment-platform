# Esquema relacional do banco de dados

Este documento traduz o modelo de domínio da Appointment Platform para tabelas
que posteriormente serão implementadas no PostgreSQL.

## Convenções

- Os nomes das tabelas e colunas usam `snake_case`.
- As chaves primárias usam UUID.
- Toda tabela pertencente a um negócio possui `organization_id`.
- Valores monetários são armazenados em centavos.
- Datas com horário são armazenadas em UTC.
- As tabelas principais possuem `created_at` e `updated_at`.
- Registros importantes são desativados com `active`, em vez de apagados.

## Tipos enumerados

### member_role

- `owner`
- `admin`
- `receptionist`
- `professional`

### confirmation_mode

- `automatic`
- `manual`

### appointment_status

- `pending`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`
- `rejected`
- `no_show`
- `expired`

## Tabelas

### organizations

Representa cada empresa que utiliza a plataforma.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| name | Nome da organização |
| slug | Identificador público único |
| timezone | Fuso horário principal |
| active | Indica se a organização está ativa |
| created_at | Data de criação |
| updated_at | Data da última atualização |

### units

Representa as unidades físicas de uma organização.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| name | Nome da unidade |
| address | Endereço opcional |
| timezone | Fuso horário opcional da unidade |
| active | Indica se a unidade está ativa |
| created_at | Data de criação |
| updated_at | Data da última atualização |

### organization_members

Representa os usuários que administram ou trabalham na organização.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização à qual o usuário pertence |
| user_id | Usuário autenticado |
| role | Papel do usuário na organização |
| active | Indica se o acesso está ativo |
| created_at | Data de criação |
| updated_at | Data da última atualização |

Um mesmo usuário poderá participar de organizações diferentes.

### professionals

Representa os profissionais que recebem agendamentos.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| member_id | Membro vinculado, quando possuir acesso ao sistema |
| name | Nome público do profissional |
| confirmation_mode | Confirmação automática ou manual |
| active | Indica se o profissional está ativo |
| created_at | Data de criação |
| updated_at | Data da última atualização |

O `member_id` é opcional porque inicialmente um profissional pode existir sem
possuir acesso próprio ao sistema.

### services

Representa os serviços oferecidos pela organização.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| name | Nome do serviço |
| description | Descrição opcional |
| price_cents | Preço padrão em centavos |
| duration_minutes | Duração padrão em minutos |
| buffer_minutes | Intervalo adicional após o serviço |
| active | Indica se o serviço está disponível |
| created_at | Data de criação |
| updated_at | Data da última atualização |

### professional_units

Relaciona profissionais e unidades.

| Coluna | Descrição |
| --- | --- |
| organization_id | Organização proprietária |
| professional_id | Profissional |
| unit_id | Unidade |

A combinação entre `professional_id` e `unit_id` não pode ser repetida.

### professional_services

Relaciona profissionais e serviços.

| Coluna | Descrição |
| --- | --- |
| organization_id | Organização proprietária |
| professional_id | Profissional |
| service_id | Serviço |
| price_override_cents | Preço específico opcional |
| duration_override_minutes | Duração específica opcional |
| active | Indica se o profissional ainda oferece o serviço |

A combinação entre `professional_id` e `service_id` não pode ser repetida.

### customers

Representa os clientes da organização.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| name | Nome do cliente |
| phone | Telefone |
| email | E-mail opcional |
| notes | Observações internas |
| created_at | Data de criação |
| updated_at | Data da última atualização |

O cliente não precisa possuir uma conta para realizar um agendamento.

### availability_rules

Representa os horários recorrentes de trabalho de cada profissional.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| unit_id | Unidade do atendimento |
| professional_id | Profissional |
| weekday | Dia da semana, entre 0 e 6 |
| start_time | Horário inicial |
| end_time | Horário final |
| active | Indica se a regra está ativa |
| created_at | Data de criação |
| updated_at | Data da última atualização |

Um profissional poderá possuir mais de um intervalo no mesmo dia.

### blocked_periods

Representa folgas, férias, feriados e outros bloqueios.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| unit_id | Unidade afetada |
| professional_id | Profissional afetado, quando o bloqueio não for geral |
| starts_at | Início do bloqueio |
| ends_at | Final do bloqueio |
| reason | Motivo opcional |
| created_at | Data de criação |
| updated_at | Data da última atualização |

Quando `professional_id` estiver vazio, o bloqueio afeta toda a unidade.

### appointments

Representa os agendamentos.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| unit_id | Unidade escolhida |
| professional_id | Profissional responsável |
| customer_id | Cliente |
| status | Situação atual do agendamento |
| confirmation_mode | Forma de confirmação usada no momento da reserva |
| scheduled_start_at | Início previsto |
| scheduled_end_at | Final previsto |
| expires_at | Prazo da confirmação manual |
| actual_start_at | Início real do atendimento |
| actual_end_at | Final real do atendimento |
| expected_amount_cents | Valor previsto |
| final_amount_cents | Valor efetivamente recebido |
| completed_at | Momento da conclusão |
| created_at | Data de criação |
| updated_at | Data da última atualização |

Mesmo quando o cliente escolher “qualquer profissional”, o sistema deverá
selecionar um profissional antes de salvar o agendamento.

O `confirmation_mode` é copiado para o agendamento. Assim, uma mudança posterior
na configuração do profissional não altera reservas já existentes.

### appointment_services

Armazena os serviços incluídos em cada agendamento.

| Coluna | Descrição |
| --- | --- |
| id | Chave primária |
| organization_id | Organização proprietária |
| appointment_id | Agendamento |
| service_id | Serviço original |
| service_name_snapshot | Nome do serviço no momento da reserva |
| price_cents_snapshot | Preço no momento da reserva |
| duration_minutes_snapshot | Duração no momento da reserva |
| buffer_minutes_snapshot | Intervalo no momento da reserva |
| created_at | Data de criação |

Os campos de snapshot preservam o histórico quando o serviço original for
alterado posteriormente.

## Regras que o banco deverá garantir

1. Nenhum registro pode acessar dados de outra organização.
2. O horário final deve ser posterior ao horário inicial.
3. Preços e durações não podem ser negativos.
4. O dia da semana deve estar entre 0 e 6.
5. Um profissional não pode possuir agendamentos sobrepostos.
6. Um agendamento deve possuir pelo menos um serviço.
7. Agendamentos manuais devem possuir prazo de expiração.
8. Somente agendamentos concluídos entram no faturamento.
9. Relações entre profissionais, unidades e serviços devem pertencer à mesma organização.
10. O valor final deve ser informado quando o atendimento for concluído.

## Cálculo do faturamento

O faturamento será calculado usando:

- `appointments.status = completed`
- `appointments.final_amount_cents`
- `appointments.completed_at`

O período diário, semanal ou mensal será calculado considerando o fuso horário
da organização.
