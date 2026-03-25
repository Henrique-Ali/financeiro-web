# Documentação Técnica da API - Financeiro IA

Esta documentação detalha todos os endpoints necessários para o funcionamento pleno do frontend.
**Base URL (AWS):** `https://z6ogy2t70b.execute-api.sa-east-1.amazonaws.com`

---

## 1. Autenticação

### Registro de Usuário

- **Endpoint:** `POST /auth/register`
- **Envio:**

```json
{
  "nome": "Henrique",
  "email": "henrique@exemplo.com",
  "senha_hash": "sua_senha_segura"
}
```

- **Retorno Esperado (201):**

```json
{
  "id": "uuid-usuario",
  "nome": "Henrique",
  "token": "jwt-token-aqui"
}
```

### Login de Usuário

- **Endpoint:** `POST /auth/login`
- **Envio:**

```json
{
  "login": "henrique@exemplo.com",
  "senha_hash": "sua_senha_segura"
}
```

- **Retorno Esperado (200):**

```json
{
  "id": "uuid-usuario",
  "nome": "Henrique",
  "email": "henrique@exemplo.com",
  "token": "jwt-token-aqui"
}
```

---

## 2. Contas Bancárias

### Listar Contas

- **Endpoint:** `GET /accounts`
- **Retorno:** `[ { "id": "uuid", "name": "Nubank", "balance": 5000.0, "isCash": false } ]`

### Criar Conta

- **Endpoint:** `POST /accounts`
- **Envio:** `{ "name": "Inter", "balance": 1000.0, "isCash": false }`
- **Retorno Esperado (201):**

```json
{
  "id": "uuid-gerado",
  "name": "Inter",
  "balance": 1000.0,
  "isCash": false
}
```

### Deletar Conta

- **Endpoint:** `DELETE /accounts/:id`
- **Retorno esperado:** `204 No Content` ou `{ "message": "Conta removida" }`

### Transferência entre Contas

- **Endpoint:** `POST /accounts/transfer`
- **Envio:**

```json
{
  "fromAccountId": "uuid-origem",
  "toAccountId": "uuid-destino",
  "amount": 250.0
}
```

- **Retorno Esperado (200):**

```json
{ "message": "Transferência realizada com sucesso" }
```

---

## 3. Cartões de Crédito

### Listar Cartões

- **Endpoint:** `GET /cards`
- **Retorno:** `[ { "id": "uuid", "name": "Nubank", "limit": 5000.0, "closingDay": 5, "dueDay": 12 } ]`

### Criar Cartão

- **Endpoint:** `POST /cards`
- **Envio:** `{ "name": "Mastercard", "limit": 2000.0, "closingDay": 10, "dueDay": 17 }`
- **Retorno Esperado (201):**

```json
{
  "id": "uuid-gerado",
  "name": "Mastercard",
  "limit": 2000.0,
  "closingDay": 10,
  "dueDay": 17
}
```

---

## 4. Transações (Compras e Receitas)

### Listar Transações

- **Endpoint:** `GET /transactions`
- **Retorno:**

```json
[
  {
    "id": "uuid",
    "description": "Mercado",
    "amount": 150.0,
    "date": "2026-03-18T10:00:00Z",
    "type": "EXPENSE",
    "method": "CARD",
    "categoryId": "uuid-cat",
    "responsibleId": "uuid-res",
    "cardId": "uuid-card",
    "accountId": "uuid-acc",
    "installments": 1,
    "isPaid": true
  }
]
```

### Criar Transação

- **Endpoint:** `POST /transactions`
- **Envio (Compra no Cartão):**

```json
{
  "description": "Mercado Mensal",
  "amount": 450.0,
  "date": "2026-03-18T14:30:00Z",
  "type": "EXPENSE",
  "method": "CARD",
  "cardId": "uuid-do-cartao",
  "categoryId": "uuid-alimentacao",
  "responsibleId": "uuid-henrique",
  "installments": 1, // Se for > 1, o backend deve criar as parcelas futuras
  "isPaid": true
}
```

- **Envio (Gasto em Dinheiro/Pix):**

```json
{
  "description": "Padaria",
  "amount": 15.5,
  "date": "2026-03-18T08:00:00Z",
  "type": "EXPENSE",
  "method": "CASH",
  "accountId": "uuid-da-conta-origem",
  "categoryId": "uuid-alimentacao",
  "responsibleId": "uuid-henrique",
  "isPaid": true
}
```

- **Retorno Esperado (201):** O objeto da transação criado incluindo o `id`.

---

## 5. Gastos Fixos

### Listar Gastos Fixos

- **Endpoint:** `GET /fixed-expenses`
- **Retorno:**

```json
[
  {
    "id": "uuid",
    "description": "Aluguel",
    "amount": 1500.0,
    "day": 5,
    "responsibleId": "uuid-res",
    "lastPaidDate": "2026-02-05T10:00:00Z" // Importante para o controle de pendência
  }
]
```

### Criar Gasto Fixo

- **Endpoint:** `POST /fixed-expenses`
- **Envio:** `{ "description": "Netflix", "amount": 55.90, "day": 15, "responsibleId": "uuid-res" }`
- **Retorno Esperado (201):** O objeto criado incluindo o `id` e `lastPaidDate` (inicialmente null).

### Pagar Gasto Fixo (Baixa Mensal)

- **Endpoint:** `POST /fixed-expenses/pay`
- **Envio:**

```json
{
  "expenseId": "uuid-gasto-fixo",
  "amountPaid": 1450.0,
  "date": "2026-03-18T10:00:00Z"
}
```

- **Retorno Esperado (200):**

```json
{ "message": "Pagamento registrado com sucesso" }
```

---

## 6. Categorias e Responsáveis

### Categorias

- **Listar:** `GET /categories`
- **Criar:** `POST /categories` -> `{ "name": "Lazer", "monthlyLimit": 500 }`
- **Retorno Criar (201):** `{ "id": "uuid-gerado", "name": "Lazer", "monthlyLimit": 500 }`

### Responsáveis

- **Listar:** `GET /responsibles`
- **Criar:** `POST /responsibles` -> `{ "name": "Esposa" }`
- **Retorno Criar (201):** `{ "id": "uuid-gerado", "name": "Esposa" }`

---

## 7. Faturas (Bills)

### Pagar Fatura de Cartão

- **Endpoint:** `POST /bills/pay`
- **Envio:**

```json
{
  "cardId": "uuid-card",
  "month": 2,
  "year": 2026,
  "accountId": "uuid-acc-origem-pagamento"
}
```

- **Retorno Esperado (200):**

```json
{ "message": "Fatura paga com sucesso" }
```

---

## 8. Tratamento de Erros (Padrão)

Para erros de regra de negócio (como saldo insuficiente), o backend deve retornar:

- **Status Code:** `422 Unprocessable Entity`
- **Exemplo de Corpo:**

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "Saldo insuficiente para realizar esta operação."
}
```

O Frontend está preparado para ler o campo `message` e exibir um alerta para o usuário.
