# Closet Inteligente da Lay

O **Closet Inteligente da Lay** é um protótipo avançado e funcional de guarda-roupa virtual inteligente. Ele foi desenvolvido com muito carinho para ajudar mulheres reais a cadastrarem suas peças de roupa, descobrirem combinações reais, planejarem sua rotina semanal e testarem novas aquisições de moda antes de gastar, reduzindo o desperdício ambiental e financeiro.

## Visão Geral

Este projeto é um **MVP (Minimum Viable Product) visual e funcional** do Closet Inteligente da Lay. Ele serve como validação do conceito e usabilidade para demonstrar como a tecnologia e consultoria de estilo podem caminhar de mãos dadas, mas ainda não deve ser considerado uma versão finalizada de produção.

> *"Moda possível na vida real, com o toque da Lay."* 🤎

---

## Funcionalidades Principais

* **Cadastro Inteligente de Peças:** Envie fotos do seu guarda-roupa com compressão de imagem integrada no navegador.
* **Análise por IA:** Identificação automática de características de estilo como cor principal, tecido, modelagem, ocasiões e notas de visibilidade através do modelo Gemini.
* **Simulador de Colorimetria:** Teste drapes em golas digitais sob seu rosto e responda a um questionário personalizado de melanina e subtom para identificar sua paleta de cores.
* **O Quadro "Combina Comigo?":** Analise se peças candidatas de lojas externas merecem entrar no seu guarda-roupa usando as roupas reais que você já tem de base.
* **Algoritmo de Nota CHIC:** Nota consolidada de compatibilidade usando o método proprietário.
* **Mala Inteligente:** Gere listas de malas dinâmicas para viagens baseadas no destino, clima, duração e peças existentes no seu acervo físico.
* **Planejador Semanal de Looks:** Distribua suas combinações para organizar seus looks de segunda a domingo de forma prática e estilosa.
* **Lista de Compras Inteligentes:** Sugestões humanas de compras complementares que fariam seu closet render ao máximo, em vez de acumular mais roupas parecidas.

---

## O Método CHIC

O coração e a filosofia da Lay no aplicativo se apoiam no **Método CHIC**:

1. **C — Combina com o que eu já tenho:** A peça em avaliação casa com pelo menos 3 looks usando as roupas que já estão no meu guarda-roupa?
2. **H — Harmoniza com meu estilo:** Os elementos de design, tecido e caimento dessa peça se alinham com a imagem pessoal que desejo passar?
3. **I — Integra minha rotina:** A roupa serve de forma realista no meu dia a dia (trabalho, igreja, passeios, maternidade, clima local) ou vai ficar guardada mofando?
4. **C — Compensa comprar:** O preço e a durabilidade fazem sentido? Ela trabalha por mim ou eu trabalho para mantê-la limpa e passada?

---

## Tecnologias Usadas

* **Front-end:** React (v19) com TypeScript, Vite.
* **Estilização:** Tailwind CSS (v4) com animações interativas fluidas usando a biblioteca `motion`.
* **Back-end:** Node.js com Express e proteção de cabeçalhos via `helmet`.
* **Inteligência Artificial:** SDK Oficial `@google/genai` (Gemini API) com lazy initialization preventivo.
* **Validação e Segurança:** `zod` para validação robusta de esquemas de requisição no back-end e `express-rate-limit` para contenção de flood de requisições sensíveis de IA.

---

## Como Rodar Localmente

Certifique-se de possuir o Node.js instalado em sua máquina.

1. Instale as dependências recomendadas do projeto:
```id="b4g44i"
npm install
```

2. Inicie o servidor de desenvolvimento que integra o front-end e o back-end em uma única porta unificada de desenvolvimento (3000):
```id="b4g44i"
npm run dev
```

Abra o navegador em `http://localhost:3000`.

---

## Como Construir para Produção (Build)

Para testar a compilação final e otimizar arquivos estáticos:
```id="rzn7g8"
npm run build
```

E para iniciar em modo de produção:
```id="rzn7g8"
npm run start
```

---

## Variáveis de Ambiente

Crie ou configure o seu arquivo `.env` a partir do seguinte exemplo de preenchimento (`.env.example`):
```id="t1nfi3"
# Chave secreta obtida no Google AI Studio
GEMINI_API_KEY=sua_chave_aqui

# Porta local ou de contêineres gerenciada
PORT=3000

# Origens permitidas para segurança CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Token estático para demonstração de login seguro
VITE_DEMO_AUTH_TOKEN=dev-token-change-me
DEMO_AUTH_TOKEN=dev-token-change-me
```

---

## Modo de Execução com IA vs. Modo Simulado (Fallback)

* **Com Gemini API Ativa:** Quando a variável `GEMINI_API_KEY` está configurada corretamente, o aplicativo faz chamadas reais inteligentes ao Gemini para analisar suas fotos enviadas, ler padrões e estilos, e dar feedbacks personalizados com a linguagem refinada e humana da Lay.
* **Modo Simulado / Fallback:** Caso a chave de API não esteja configurada ou o limite local seja atingido, o applet aciona algoritmos probabilísticos locais e respostas carinhosas pré-estruturadas de consultoria para garantir que você continue tendo uma experiência completa e fluida de simulação.

---

## Limitações do MVP Padrão

Por se tratar de um MVP visual e conceitual, as seguintes restrições estão presentes:
* **Autenticação de Demonstração:** O fluxo de segurança é simplificado para facilitar testes rápidos por investidores ou usuários beta através de sessões rápidas e um Token estático de demonstração no ambiente de testes.
* **Armazenamento de Imagens:** As fotos de peças de roupas são processadas e comprimidas diretamente no navegador e mantidas em estados de armazenamento local client-side (`sessionStorage`/`localStorage`).
* **Não é um Provador Virtual 3D:** O aplicativo não realiza projeções das roupas em modelos 3D ou fotos faciais de corpo inteiro físicas; ele atua no nível de consultoria de estilo, harmonização cromática e versatilidade de combinações de cabide.
* **Não substitui Análise Professional:** O teste estético e cromático é informativo. Sinta-se incentivada a utilizar luz do dia e espelhos reais.

---

## Aviso de Privacidade para a Fase de Protótipo

A privacidade das nossas usuárias é prioridade:
* Na versão atual de protótipo, suas fotos e imagens carregadas são armazenadas localmente no seu próprio navegador para teste e validação de privacidade imediata.
* Quando enviadas para análise opcional de inteligência artificial através das chamadas de API do servidor, as imagens são passadas de forma direta, segura e transitória, sem persistência nos servidores do protótipo.
* Em uma versão futura de produção completa, os arquivos serão encaminhados para estruturas de armazenamento em nuvem de ponta (como Google Cloud Storage ou Firebase Storage) amparados por rigorosas regras de segurança e controle de acessos da LGPD (Lei Geral de Proteção de Dados).

---

## Próximos Passos Recomendados para Produção

1. **Estrutura de Banco de Dados de Produção:** Integrar um banco de dados relacional ou noSQL profissional (como Firestore ou PostgreSQL/Supabase) para persistência perene das peças do closet e contas de usuárias reais de forma multi-dispositivo.
2. **Armazenamento de Mídia:** Adotar buckets de mídia em nuvem seguros para arquivamento definitivo de drapes e peças.
3. **Plataforma de Pagamentos:** Cadastrar intermediadores de pagamento (como Stripe ou Asaas) caso seja aberta uma área de assinaturas premium para consultoria direta com a Lay de forma personalizada no app.

---

*Um beeeeijo da Lay!* 💋🤎
