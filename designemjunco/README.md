# Designemjunco — Gestão de vendas

Aplicativo estático em GitHub Pages, com login e banco de dados Supabase e acesso separado por loja.

## Atualização

O código está em `source/`. Rode `npm install` e `npm run build` nesse diretório. Copie o conteúdo de `source/dist/` para esta pasta, preservando `source/` e este README.

Configure as URLs de autenticação no painel do projeto Supabase com a URL publicada, incluindo o caminho `/mundo-encantado-kids/designemjunco/`. Configure o envio SMTP para os endereços da equipe antes de usar cadastro e recuperação de senha em produção. O app faz atualização automática das vendas a cada 15 segundos.

As migrações em `source/supabase/migrations/` já foram aplicadas ao projeto Designemjunco. Não execute novamente. Não há promoção automática do primeiro cadastro a administrador. Os acessos são definidos pelo administrador. A chave do navegador é publicável, e os dados são protegidos por RLS. Nunca publique service-role ou outras chaves secretas.
