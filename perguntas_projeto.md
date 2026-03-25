# Perguntas sobre o Projeto Financeiro

Responda abaixo de cada pergunta para que possamos detalhar o funcionamento do sistema.

## 1. Autenticação (Login/Registro)

- Como você imagina o login? Apenas um usuário fixo (ex: localstorage) ou precisa de um sistema preparado para múltiplos usuários com banco de dados?
  R: a priori para teste e devsenvolvimento do prototipo eu não quero nada que necessite de backend, depois vou adicionar isso eu mesmo, então pode deixar tudo sendo armazenado no localstorage ou no navegador, sei lá.
- Quais campos seriam necessários no registro? (Nome, E-mail, Senha, etc.)
  R: Nome, e-mail e senha apenas. o login tem que ser possível tanto com nome quanto com e-mail

## 2. Gestão de "Caixa" e "Contas"

- O "Caixa" é uma conta especial ou é a soma de todas as suas contas bancárias?
  R: É uma conta especial, por que minhas outras contas são para guardar dinheiro, o dinheiro que está em caixa é basicamente o dinheiro que eu vou poder gastar.
- Quando você diz "transferir entre contas", isso deve gerar um histórico de transação do tipo "Transferência" ou algo interno?
  R: Não não precisa ter um historico de trasações entre contas.
- O dinheiro que entra (Receita) vai direto para o "Caixa" ou você escolhe uma "Conta" específica?
  R: Direto para o caixa e só depois vou passar parte ou tudo para outras contas.

## 3. Cartões de Crédito e Faturas

- Como o sistema deve saber em qual fatura (mês/ano) colocar uma compra? Baseado na data da compra e no dia de fechamento do cartão?
  R: Eu quero poder especificar isso logo no cadastro de uma compra (transação), vou poder escolher o cartão, ou se foi em dinheiro vai sair direto do caixa, o dia, e a número de parcelas, dependendo do número de parcelas ele já vai dividir para as próximas faturas do cartão.
- O "Pagamento da Fatura" deve ser uma transação que retira dinheiro do "Caixa" e "limpa" a fatura do dashboard?
  R: Não eu quero um registro das faturas, ele pode sim tirar o dinheiro do caixa, mas eu quero que fique registrado as informações daquela fatura incluido se ela foi paga.
- Se uma compra for parcelada no cartão, o sistema deve criar automaticamente as transações para os meses seguintes?
  R: Como dito em uma pergunta anterior sim, deve criar!

## 4. Transações e Responsáveis

- O "Responsável" é apenas uma etiqueta (ex: "Henrique", "Esposa") para saber quem gastou, ou ele tem saldo próprio?
  R: Apenas uma etiqueta que eu vou querer poder filtrar depois, exatamente isso, "Henrique", "Esposa", "Filho" e etc, mas eu mesmo vou querer poder cadastrar um responsavel, sendo que só vai ser necessário o nome/descrição dele.
- As categorias (Ex: Alimentação, Lazer) podem ter orçamentos (limites de gastos mensais)?
  R: Sim eu quero que tenha esse limites mensais, e caso chegue em 70% do uso fique uma mensagem lá no dashboard em amarelo, e caso passe do valor fique em vermelhor.

## 5. Dashboard e Visualização

- Além do "Valor em Caixa" e "Faturas a Pagar", você gostaria de algum gráfico (ex: gastos por categoria, evolução mensal)?
  R: Sim quero algums gráficos ai você pode pensar, mas também quero um relatório mensal, tipo comparaçaõ de cartões, e gastos fixos dos meses passados e desse mês.
- Os cards das faturas devem mostrar o limite disponível do cartão também?
  R: Pode ser, pode mostrar o limite sim, e quero que mais apagado, mais escondido já msotre o valor da fatura seguinte também

## 6. Tecnologia e UI

- Você prefere usar alguma biblioteca de componentes pronta (como **shadcn/ui** ou **Radix**) ou quer que eu construa tudo do zero com **Tailwind CSS puro**?
  R: No geral quero do zero, apenas algumas funcionalidades que iriam ficar muito complexas por exemplos os gráficos ai pode usar alguma bibioteca
- Para os ícones, prefere alguma biblioteca específica (Lucide React, FontAwesome)?
  R: Pode usar o Lucide React mesmo

## 7. Persistência de Dados

- Por enquanto, vamos salvar tudo no `LocalStorage` do navegador ou você já quer integrar com algum serviço como Firebase/Supabase?
  R: LocalStorage mesmo.

## 8. Detalhamento de Lógica (Novas Dúvidas)

- **Natureza do "Caixa":** O "Caixa" deve ser tratado como uma conta bancária comum que já vem criada por padrão (chamada "Caixa"), ou ele é um campo totalmente separado das outras contas?
  R: Pode ser, deixa já padrão mesmo!
- **Transferências sem Histórico:** Se não houver histórico de transferência, apenas alteramos o saldo numérico de uma conta para outra. Isso é suficiente para você, ou gostaria de ver pelo menos uma indicação de "Última transferência: R$ X para Conta Y"?
  R: Só muda diretamente mesmo, sem nenhuma indicação, apenas um aviso falando que a transferencia foi bem sucedida.
- **Cálculo de Fatura Automático:** Para o sistema saber se uma compra cai na fatura deste mês ou do próximo, preciso saber o "Dia de Fechamento". Exemplo: Se o fechamento é dia 15 e eu compro dia 16, vai para o mês seguinte. É assim que você imagina?
  R: Sim, quero passar essa informação na hora de cadastrar o cartão.
- **Despesas Fixas:** Você mencionou "gastos fixos" no relatório. Como você quer definir que uma despesa é fixa? (Ex: Um checkbox "Repetir mensalmente" no cadastro?)
  R: Quero pode cadastar despesas fixas, pode exemplo "luz", "àgua" e etc, ai nessas despesas fixas quero qeu tenha o botão de pagar, e vou poder escolher se eu paguei o valor que eu colocar nas despesas fixa ou se foi outro valor, por exmeplo, luz eu cadastrei como 350 reais, mas a fatura veio 320, na hora de colcoar pra pagar eu quero pdoer colocar que foi apenas 320.
- **Pagamento de Fatura:** Quando você pagar a fatura, o sistema deve gerar uma "Transação de Saída" automática no histórico do Caixa para registro, ou apenas mudar o status da fatura para "Paga"?
  R: Na verdade não precisa, esse registro já vai ser de tudo que eu inserir no cartão, só precisa mudar para pago mesmo!
- **Saldo Inicial:** Você quer poder definir um "Saldo Inicial" para cada conta e para o Caixa ao cadastrá-los pela primeira vez?
  R: Sim pode ser, como atualmente eu já tenho dinheiro nas contas e no caixa seria bom!
