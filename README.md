# Armazém em Jogo: Recebimento

Jogo educacional que simula o recebimento de um armazém (assistente, conferente, analista de estoque e operador de armazenagem), usado como instrumento de pesquisa com **adultos leigos em logística**.

Fluxo do participante: **sala de entrada** (perfil + termo) → **pré-teste** (7 perguntas) → **jogo** (3 caminhões) → **pós-teste** (as mesmas 7 perguntas) → **MEEGA+** (33 afirmações) → **5 perguntas abertas** → resultado. Tudo é enviado automaticamente para uma planilha Google.

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

## Como divulgar

- **Link geral (pesquisa online):** `https://nicholasnogueira35.github.io/armazem-em-jogo/`. Os dados entram com a sala `ONLINE`.
- **Link com sala (para aplicar com um grupo ao mesmo tempo):** acrescente `?sala=CODIGO`, por exemplo `.../armazem-em-jogo/?sala=GRUPO1`. Depois do pré-teste aparece a sala de espera com quem já entrou (primeiro nome e inicial). A sala também ajuda a saber de onde veio cada participante (ex.: `?sala=LINKEDIN`, `?sala=WHATSAPP`).
- Menores de 18 anos são barrados da pesquisa (podem jogar, mas nada é enviado).
- O botão **"Quero só jogar, sem participar"** permite jogar sem enviar dados.
- Se a internet cair, o jogo tenta reenviar na próxima vez que a pessoa abrir a página.

## Pré e pós-teste

As mesmas 7 perguntas antes e depois do jogo, sempre com a opção **"Não sei"**. A ordem das alternativas é sorteada por participante (igual no pré e no pós). No código, a alternativa correta é sempre a de índice `0`; na planilha, `pre_respostas`/`pos_respostas` guardam o índice escolhido (`ns` = não sei).

| Pergunta | Tipo | Conteúdo |
|---|---|---|
| q1 | retenção | Quem confere NF, pedido e agendamento |
| q2 | retenção | O que é conferência cega |
| q3 | retenção | Caminhão sem agendamento e CNPJ divergente |
| q4 | retenção | Falta de caixas na conferência |
| q5 | retenção | Destino do palete com avaria |
| q6 | transferência | Validade abaixo do mínimo do contrato (não aparece no jogo) |
| q7 | transferência | Lacre violado com conteúdo aparentemente intacto (não aparece no jogo) |

## MEEGA+

Questionário do aluno do MEEGA+ (Petri, Gresse von Wangenheim e Borgatto, 2019), versão em português de 2018, kit Creative Commons disponível em https://gqs.ufsc.br/?p=307. Escala de 5 pontos gravada como 1 (Discordo totalmente) a 5 (Concordo totalmente), colunas `m_u1` a `m_u9` (usabilidade), `m_e01` a `m_e19` (experiência do jogador) e `m_a1` a `m_a5` (objetivos de aprendizagem).

**Adaptações (declarar no artigo):**
- Omitidos os 3 itens de interação social ("Eu pude interagir com outras pessoas durante o jogo", "O jogo promove momentos de cooperação e/ou competição entre os jogadores", "Eu me senti bem interagindo com outras pessoas durante o jogo"), porque o jogo é individual e online.
- Nos itens `m_e15`, `m_e16`, `m_e18` e `m_e19`, "disciplina" foi trocado por "o tema do recebimento de mercadorias em logística" (e, no `m_e19`, "outras atividades da disciplina" por "outras formas de aprender sobre o assunto"), porque os participantes não estão cursando uma disciplina.
- Itens de objetivo de aprendizagem (`m_a1` a `m_a5`) criados no modelo do instrumento: "O jogo contribuiu para compreender..." o que faz cada uma das quatro funções e por que pular etapas de conferência gera problemas.
- Dados demográficos: frequência de jogos digitais e não-digitais na escala original; instituição, curso, disciplina e sexo não são coletados.
- As 3 perguntas abertas do MEEGA+ vão para `meega_gostou`, `meega_melhorar` e `meega_comentario`.

## O que fica registrado

**Entradas:** data e hora, sala, nome, `sid`, idade, escolaridade, área, se estuda/trabalha com logística, frequência com que joga e `publico` (`alvo` = sem formação nem experiência em logística; `parcial` = só teve logística como disciplina de outro curso; `fora` = fez curso de logística ou trabalha/trabalhou na área).

**Resultados:** perfil; pré e pós-teste (total, retenção, transferência, quantos "não sei", tempo); acertos no jogo e por função; tempo total e por caminhão; atalhos aceitos; respostas abertas; e, em `decisoes_json`, cada decisão com o feedback recebido.

## Atualizar o script depois de uma mudança

Cole o novo `Code.gs` no Apps Script, salve, rode `setup` uma vez e vá em **Implantar > Gerenciar implantações > lápis > Versão: Nova versão > Implantar**. A URL `/exec` continua a mesma. As colunas novas aparecem sozinhas no fim das abas, sem apagar as antigas.

## Cuidados (LGPD e ética)

- A planilha contém **dados pessoais** (nome e turma). Não compartilhe e não publique a planilha.
- O código do jogo é público, mas os dados não ficam no GitHub: vão direto para a sua planilha.
- Quem tem a URL `/exec` consegue enviar dados falsos. O código da sala e o `sid` ajudam a filtrar isso na análise.
- O termo da sala de entrada é **provisório**. Substitua pelo TCLE aprovado no CEP antes de usar os dados em pesquisa.
- Para analisar, exporte a planilha e troque os nomes por códigos (pseudonimização) antes de qualquer tratamento estatístico.
