# Lumi: avisos sem custo

Os avisos funcionam no plano gratuito (Spark) do Firebase, sem cartão:

- **Firestore** (`southamerica-east1`, modo produção) guarda o cadastro de cada aparelho (`devices/{uid}`) e os avisos programados (`alarms/{uid}_{compromisso}_{antecedência}`).
- **Login anônimo** identifica cada aparelho. As regras em `firestore.rules` só deixam cada aparelho ler e gravar o que é dele.
- **Firebase Cloud Messaging** entrega a notificação (gratuito).
- **GitHub Actions** (`.github/workflows/lume-avisos.yml`) roda a cada 5 minutos o script `dispatcher/send.js`, que envia os avisos que chegaram na hora e os apaga. O GitHub pode atrasar a execução alguns minutos em horários de pico.

## Configuração (já feita, exceto onde indicado)

1. Authentication → login Anônimo ativado; `wesleyneey.github.io` nos domínios autorizados.
2. Firestore criado em São Paulo, modo produção. Publicar o conteúdo de `firestore.rules` na aba Regras.
3. Cloud Messaging → par de chaves Web Push gerado; a chave pública está em `assistente-lume/notification-config.json`.
4. **Credencial do envio:** Configurações do projeto → Contas de serviço → Gerar nova chave privada. Colar o conteúdo do arquivo JSON no GitHub em Settings → Secrets and variables → Actions → New repository secret, com o nome `FIREBASE_SERVICE_ACCOUNT`. Nunca colocar essa chave no repositório.
5. Mudar `enabled` para `true` em `notification-config.json`.

## Verificação

- No iPhone, instalar o Lumi na tela inicial, tocar em Permitir avisos e depois em Enviar teste. Fechar o app e confirmar que a notificação chega (até uns 15 minutos).
- Cadastrar um compromisso com os dois avisos, editar e excluir, e conferir que avisos antigos não chegam.
- Em GitHub → Actions → "Avisos do Lumi", cada execução mostra quantos avisos foram enviados.
