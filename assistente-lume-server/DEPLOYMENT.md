# Lume: notificações independentes

Projeto real criado no Firebase: `assistente-lume` (Lume Web).
O envio ainda está desativado em notification-config.json. Não ativar antes de concluir e verificar a infraestrutura.

## Pendências externas antes da implantação

1. O responsável deve ativar o faturamento Blaze no projeto. A tela Functions bloqueia no plano Spark. Não ativar cobrança automaticamente.
2. Confirmar a criação de credenciais Web Push (VAPID) e a habilitação de Authentication anônimo; nenhum usuário final precisa entrar numa conta.
3. Criar Firestore Standard em modo de produção (preferir southamerica-east1), habilitar Authentication anônimo e permitir wesleyneey.github.io como domínio autorizado.
4. Gerar o par VAPID nas configurações Cloud Messaging. Copiar somente a chave pública para `notification-config.json`; nunca adicionar a chave privada ou credenciais Admin ao repositório.
5. Fazer npm ci em functions e firebase deploy --project assistente-lume --only firestore,functions.
6. Copiar a URL real de lumeApi no resultado de deploy para apiUrl. Conferir funções e Cloud Scheduler every 1 minutes. Só então mudar enabled=true no config do cliente.

## Verificação obrigatória antes de anunciar funcionamento

- Registrar notificações no iPhone instalado na tela inicial, sem conta GPT.
- Agendar teste pelo aparelho, fechar o Lume e confirmar a notificação recebida.
- Cadastrar compromisso com 2 avisos futuros e verificar confirmação do servidor.
- Editar/cancelar o compromisso e confirmar que os avisos antigos não são enviados.
- Verificar isolamento entre dois aparelhos (UID anônimo distinto).
- As regras Firestore negam acesso direto do navegador; somente Admin das funções acessa documentos.
- O servidor verifica ID token e deriva UID exclusivamente dele. Não aceita UID de terceiros.
- O despacho usa lease e tag idempotente para reduzir duplicação; não promete entrega no segundo exato. Conexão do aparelho e agendamento podem atrasar.

## Limites e operação

No máximo 50 compromissos por aparelho; até 30 gravações por minuto por UID; maxInstances da API = 2, dispatcher = 1. Reavaliar App Check antes de abrir o produto para tráfego amplo e acompanhar orçamento/uso. O teste e o cadastro ainda podem consumir recursos se a API pública for abusada; CORS não substitui autenticação nem orçamento.
Uma edição exige confirmação de reprogramação do servidor. Alertas de horários já passados são omitidos. Um teste bem-sucedido no navegador aberto NÃO valida recebimento com o app fechado.

O projeto e o app foram criados pelo console do proprietário, sem conectar Firebase ao ChatGPT. Os avisos são executados pelo Firebase; não dependem de conversa, automação GPT ou Calendário.
