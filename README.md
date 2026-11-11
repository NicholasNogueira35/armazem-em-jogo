# Armazém em Jogo: Recebimento

Jogo educacional que simula o recebimento de um armazém (assistente, conferente, analista de estoque e operador de armazenagem), com sala de entrada, sala de espera por turma e envio automático dos resultados para uma planilha Google.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O jogo inteiro |
| `config.js` | Única coisa que você edita: a URL da planilha |
| `apps-script/Code.gs` | Código que recebe os dados dentro da planilha Google |

## Passo 1: criar a planilha que recebe os dados (cerca de 10 minutos)

1. Abra o Google Planilhas e crie uma planilha em branco. Dê um nome, por exemplo **Armazém em Jogo: Dados**.
2. No menu, clique em **Extensões > Apps Script**.
3. Apague o que estiver escrito e cole todo o conteúdo do arquivo `apps-script/Code.gs`. Clique no disquete para salvar.
4. No topo, ao lado de "Depurar", escolha a função **setup** e clique em **Executar**.
   - O Google vai pedir autorização. Clique em **Revisar permissões**, escolha sua conta, depois **Avançado > Acessar (não seguro)** e **Permitir**. O aviso aparece porque o script é seu e não foi verificado pelo Google; é normal.
   - Volte à planilha: devem ter aparecido as abas **Entradas** e **Resultados**.
5. Clique em **Implantar > Nova implantação**.
   - No ícone de engrenagem, escolha **App da Web**.
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa
   - Clique em **Implantar** e copie a **URL do app da Web** (termina em `/exec`).

> Se um dia você mudar o código do Apps Script, use **Implantar > Gerenciar implantações > editar (lápis) > Nova versão**. Assim a URL continua a mesma.

## Passo 2: colocar a URL no jogo

Abra `config.js` e cole a URL entre as aspas:

```js
window.ARMAZEM_CONFIG = {
  apiUrl: 'https://script.google.com/macros/s/SEU_CODIGO/exec'
};
```

Com `apiUrl` vazio, o jogo funciona em modo demonstração (não envia nada e não pede código da sala).

## Passo 3: publicar no GitHub Pages (gratuito)

1. Crie um repositório **público** no GitHub, por exemplo `armazem-em-jogo`.
2. Envie os arquivos (`index.html`, `config.js`, `README.md` e a pasta `apps-script`).
3. No repositório, vá em **Settings > Pages**. Em **Source**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**, e salve.
4. Em 1 ou 2 minutos o jogo estará em `https://SEU-USUARIO.github.io/armazem-em-jogo/`.

## Como usar em sala

1. Escolha um **código de sala** curto para cada turma (ex.: `ADM2N`) e escreva no quadro junto com o link.
2. O aluno entra com nome, código da sala e turma e aceita o termo. Depois vai para a sala de espera, onde vê quem já entrou (só primeiro nome e inicial).
3. Ao terminar, o resultado vai sozinho para a aba **Resultados**. Se a internet cair, o jogo tenta reenviar na próxima vez que o aluno abrir a página, e o código de participação continua na tela como plano B.

## O que fica registrado

**Entradas:** data e hora, sala, nome, turma e identificador da partida (`sid`).

**Resultados:** acertos e total de decisões, % de acerto, tempo total e meta do supervisor, atalhos aceitos, acertos por função (assistente, conferente, analista, operador), tempo de cada caminhão e, em `decisoes_json`, cada decisão com o texto do feedback (útil para a análise qualitativa).

## Cuidados (LGPD e ética)

- A planilha contém **dados pessoais** (nome e turma). Não compartilhe e não publique a planilha.
- O código do jogo é público, mas os dados não ficam no GitHub: vão direto para a sua planilha.
- Quem tem a URL `/exec` consegue enviar dados falsos. O código da sala e o `sid` ajudam a filtrar isso na análise.
- O termo da sala de entrada é **provisório**. Substitua pelo TCLE aprovado no CEP antes de usar os dados em pesquisa.
- Para analisar, exporte a planilha e troque os nomes por códigos (pseudonimização) antes de qualquer tratamento estatístico.
