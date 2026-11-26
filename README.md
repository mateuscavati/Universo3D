# Universo 3D · Gestão de impressão

Ferramenta da **Universo 3D** para precificar impressões 3D, controlar o estoque de filamentos e acompanhar encomendas, do pedido à entrega. É uma página única (`index.html`), sem servidor próprio e sem instalação.

🔗 **Acesse:** https://mateuscavati.github.io/Universo3D/

No celular, abra o link no Chrome e use **⋮ → Adicionar à tela inicial** para usar como app.

---

## Funcionalidades

### 🧮 Calculadora de preço
- Calcula enquanto você digita, sem botão de calcular.
- Custo de **filamento** (vários carretéis ou cores por peça, puxando o preço do estoque), **energia** (potência × horas × tarifa), **desgaste da máquina** (valor ÷ vida útil × horas), **margem para falhas**, **mão de obra**, **embalagem** e **outros materiais**.
- Com várias peças na mesa, o custo total da impressão é dividido pelo número de peças.
- Preço por **markup** (custo × multiplicador), com as taxas de cada canal somadas por cima: venda direta, Mercado Livre, Shopee, TikTok Shop, Etsy ou canais próprios.
- Compara o preço e o lucro em todos os canais e simula o lucro de um preço definido por você.

### 🧵 Estoque de filamentos
- Carretéis com cor, material, marca, peso, restante, preço pago e preço por kg.
- Alerta de carretel acabando e valor total em estoque.
- O filamento sai do estoque automaticamente quando uma encomenda fica **Pronta** ou **Entregue**, e volta se o status retroceder.

### 📦 Encomendas
- Fluxo de status: **A orçar → Orçamento → Confirmada → Imprimindo → Pronta → Entregue** (ou **Cancelada**).
- **Pedido sem orçamento:** anote agora e use **Fazer orçamento** para calcular o preço depois na calculadora.
- Controle de sinal e valor a receber. Encomendas não pagas continuam em **Ativas**, mesmo depois de entregues.
- Prazos com destaque para encomendas atrasadas ou próximas do vencimento.
- **WhatsApp:** botão para conversar com o cliente, envio do orçamento e aviso de "pronta para entrega ou retirada", com mensagens editáveis e variáveis como `{cliente}`, `{peca}`, `{total}`, `{sinal}` e `{prazo}`.

### ⚙️ Configurações
- Taxas dos canais de venda.
- **Google Agenda:** encomendas confirmadas viram eventos automaticamente, com a cor das impressões.
- **Sincronização entre aparelhos** pelo Google Drive.
- Backup e restauração dos dados em arquivo `.json`.

---

## Integração com Google (Agenda e Drive)

A agenda e a sincronização usam um **Google Apps Script** publicado na conta do dono (arquivo `universo3d-agenda.gs`):

1. Em [script.google.com](https://script.google.com), crie um projeto e cole o código do script.
2. Troque a constante `TOKEN` por uma senha própria. Se quiser, ajuste também `COR` (cor dos eventos) e `AGENDA_ID`.
3. Rode a função `autorizar` uma vez para liberar o acesso à agenda e ao Drive.
4. Em **Implantar → Nova implantação → App da Web**, escolha *Executar como: Eu* e *Quem pode acessar: Qualquer pessoa*.
5. Na página, em **Configurações**, cole o link `/exec` e a senha, clique em **Testar conexão** e ative a sincronização.

> Ao alterar o script, publique uma **nova versão** em *Implantar → Gerenciar implantações*. O link continua o mesmo.

---

## Onde ficam os dados

- **Este repositório não guarda nenhum dado.** Estoque, encomendas, link do script e senha ficam no navegador de cada aparelho (`localStorage`).
- Com a sincronização ativa, uma cópia fica no arquivo `Universo 3D - dados da calculadora.json`, no Google Drive do dono. Em cada carretel ou encomenda, vale a versão editada por último.
- Faça backups de vez em quando em **Configurações → Backup**.

---

## Tecnologia

- HTML, CSS e JavaScript puros, em um único arquivo, sem dependências nem build.
- Layout responsivo: no computador, menu no topo; no celular, barra de abas embaixo.
- Hospedado no **GitHub Pages**.
- Integrações: Google Apps Script (Agenda e Drive) e links `wa.me` do WhatsApp.

## Como atualizar

Edite o `index.html`, faça commit e push na branch `main`. O GitHub Pages publica a nova versão em um ou dois minutos.

---

© Universo 3D
