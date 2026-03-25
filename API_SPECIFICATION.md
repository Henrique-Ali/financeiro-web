# Especificação da API - Financeiro IA (Versão Sincronizada com UI)

Este documento reflete as necessidades da interface para substituir o LocalStorage pelo Backend.

---

## 0. Considerações de Segurança e Escopo

### Autenticação via Token (JWT)

Todas as requisições (exceto Registro e Login) devem incluir o cabeçalho de autorização:
`Authorization: Bearer <seu_token_jwt>`

**Exemplo técnico de uma requisição:**

```http
GET /fixed-expenses
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...
```

**Importante:** O Backend deve extrair o `usuario_id` do payload do token. **Nenhum** dado de outro usuário deve ser retornado. Os endpoints abaixo operam apenas no escopo do usuário autenticado. O `responsibleId` presente nos objetos refere-se apenas à etiqueta de quem realizou o gasto (membro da família), não à conta do sistema.

---

## 1. Autenticação

### Registro de Usuário

endpoint: `POST /auth/register`

### Login

endpoint: `POST /auth/login`

---

## 2. Contas Bancárias

### Listar Contas

endpoint: `GET /accounts`

### Criar Conta

endpoint: `POST /accounts`

### Deletar Conta

endpoint: `DELETE /accounts/:id`
**Nota:** Deve validar se não existem transações vinculadas (ou lidar com o impacto no saldo).

---

## 3. Cartões de Crédito

### Listar Cartões

endpoint: `GET /cards`

### Criar Cartão

endpoint: `POST /cards`

### Deletar Cartão

endpoint: `DELETE /cards/:id`
**Nota:** Recomenda-se "Soft Delete" se houver transações vinculadas para não perder o histórico de faturas.

---

## 4. Transações

### Criar Transação

endpoint: `POST /transactions`

### Listar Transações

endpoint: `GET /transactions`

### Deletar Transação

endpoint: `DELETE /transactions/:id`
**Importante:** Se for uma transação em dinheiro (CASH), o Backend deve estornar/reverter o valor no saldo da conta correspondente.

---

## 5. Gastos Fixos

### Listar Gastos Fixos

endpoint: `GET /fixed-expenses`

### Criar Gasto Fixo

endpoint: `POST /fixed-expenses`

### Deletar Gasto Fixo

endpoint: `DELETE /fixed-expenses/:id`

---

## 6. Categorias e Responsáveis

### Listar Categorias

endpoint: `GET /categories`

### Criar Categoria

endpoint: `POST /categories`

### Deletar Categoria

endpoint: `DELETE /categories/:id`
**Nota:** Recomenda-se "Soft Delete".

### Listar Responsáveis

endpoint: `GET /responsibles`

### Criar Responsável

endpoint: `POST /responsibles`

### Deletar Responsável

endpoint: `DELETE /responsibles/:id`
**Nota:** Recomenda-se "Soft Delete".

---

## 7. Transferências e Faturas

### Transferir Saldo

endpoint: `POST /accounts/transfer`

### Pagar Fatura de Cartão

endpoint: `POST /bills/pay`
