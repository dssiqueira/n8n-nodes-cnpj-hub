# n8n-nodes-cnpj-hub 🇧🇷

> **Idioma**: [English](../README.md) | [Português](README-pt.md)

Node customizado para n8n que permite consultar dados de CNPJ através de APIs públicas brasileiras.

## 🚀 Funcionalidades

- 🔄 **Fallback Automático**: Se uma API falhar, tenta automaticamente as outras
- ⏱️ **Rate Limiting**: Controle de delay entre requisições para evitar bloqueios
- 📊 **5 APIs Públicas**: CNPJ.ws, CNPJA, MinhaReceita, BrasilAPI e ReceitaWS
- 🔍 **Validação Inteligente**: Aceita CNPJ com ou sem formatação
- 🛡️ **Tratamento Robusto**: Gerenciamento avançado de erros
- 📝 **Metadados Detalhados**: Informações sobre APIs utilizadas e tentativas
- 🔄 **Normalização de Dados**: Formato padronizado entre todas as APIs para workflows consistentes

## 📋 APIs Suportadas

### 1. CNPJ.ws (Mais Completa)
- **URL**: `https://publica.cnpj.ws/cnpj/{cnpj}`
- **Características**: API mais completa com informações detalhadas sobre sócios, atividades e estabelecimentos

### 2. CNPJA (Estruturada)
- **URL**: `https://open.cnpja.com/office/{cnpj}`
- **Características**: Dados bem estruturados e organizados

### 3. MinhaReceita (Detalhada)
- **URL**: `https://minhareceita.org/{cnpj}`
- **Características**: Dados detalhados com informações de regime tributário

### 4. BrasilAPI (Oficial)
- **URL**: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`
- **Características**: API oficial do governo brasileiro

### 5. ReceitaWS (Simples)
- **URL**: `https://receitaws.com.br/v1/cnpj/{cnpj}`
- **Características**: API simples e rápida para consultas básicas

## 💻 Como Usar

### Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/douglassiqueira/n8n-nodes-cnpj-hub.git
   cd n8n-nodes-cnpj-hub
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Compile o projeto:
   ```bash
   npm run build
   ```

4. Instale o node no n8n:
   ```bash
   npm link
   ```

### Uso no n8n

1. Adicione o node "CNPJ HUB" ao seu workflow
2. **Escolha a estratégia**:
   - **Fallback Automático** (recomendado): Tenta todas as APIs até obter sucesso
   - **API Específica**: Usa apenas uma API escolhida
3. **Escolha o formato dos dados**:
   - **Normalizado** (recomendado): Formato padronizado entre todas as APIs
   - **Original**: Dados brutos da API como recebidos
4. **Configure o delay** entre requisições (aceita expressões, padrão: 1000ms)
5. Insira o CNPJ (com ou sem formatação)
6. Execute o workflow

### Exemplos de Uso

#### Fallback Automático (Recomendado)
```json
{
  "operation": "consultarCnpj",
  "apiStrategy": "fallback",
  "rateLimitDelay": "1000",
  "cnpj": "11.222.333/0001-81"
}
```

#### API Específica
```json
{
  "operation": "consultarCnpj",
  "apiStrategy": "specific",
  "api": "cnpjws",
  "rateLimitDelay": "500",
  "cnpj": "11222333000181"
}
```

#### Com Expressão Dinâmica
```json
{
  "operation": "consultarCnpj",
  "apiStrategy": "fallback",
  "rateLimitDelay": "={{$json.customDelay || 1000}}",
  "cnpj": "={{$json.cnpj}}"
}
```

## 📊 Estrutura de Dados Normalizados

Quando usar o formato **Normalizado**, todas as APIs retornam dados nesta estrutura padronizada:

```json
{
  "cnpj": "11.222.333/0001-81",
  "razao_social": "Nome da Empresa",
  "nome_fantasia": "Nome Fantasia",
  "situacao": "Ativa",
  "data_abertura": "2009-09-02",
  "porte": "Pequeno",
  "natureza_juridica": "Associação Privada",
  "capital_social": "0.00",
  "atividade_principal": {
    "codigo": "8550301",
    "descricao": "Administração de caixas escolares"
  },
  "endereco": {
    "logradouro": "Rua Garibaldi",
    "numero": "070",
    "complemento": "",
    "bairro": "Vila Rica",
    "cep": "95760000",
    "municipio": "São Sebastião do Caí",
    "uf": "RS"
  },
  "contato": {
    "telefone": "(51) 3635-4333 / (51) 3635-1603",
    "email": "exemplo@empresa.com"
  },
  "socios": [
    {
      "nome": "Nome do Sócio",
      "cpf_cnpj": "***123456**",
      "qualificacao": "Presidente",
      "data_entrada": "2016-09-29"
    }
  ],
  "atividades_secundarias": [],
  "simples": {
    "optante": false,
    "data_opcao": null,
    "data_exclusao": null
  },
  "_meta": {
    "api_utilizada": "brasilapi",
    "cnpj_consultado": "11222333000181",
    "data_consulta": "2025-08-13T03:48:00.000Z",
    "estrategia": "fallback",
    "data_format": "normalized",
    "original_data": { /* Resposta original da API */ }
  }
}
```

### Benefícios do Formato Normalizado:
- **Nomes de campos consistentes** entre todas as APIs
- **Estrutura de dados previsível** para workflows confiáveis
- **Tipos de dados padronizados** e formatos
- **Dados originais preservados** em `_meta.original_data`
- **Fácil integração** com outros nodes do n8n

## 🎨 Expressões Dinâmicas

O campo **Delay** aceita expressões do n8n, permitindo valores dinâmicos:

### Exemplos de Expressões

- **Valor fixo**: `"1000"`
- **Do item anterior**: `"={{$json.delay}}"`
- **Com fallback**: `"={{$json.customDelay || 2000}}"`
- **Baseado em condição**: `"={{$json.isPriority ? 500 : 2000}}"`
- **Cálculo dinâmico**: `"={{Math.min($json.requestCount * 100, 5000)}}"`

### Limites
- **Mínimo**: 0ms (sem delay)
- **Máximo**: 60000ms (60 segundos)
- **Padrão**: 1000ms

## 📊 Estrutura da Resposta

Todas as respostas incluem metadados detalhados:

### Resposta com Sucesso
```json
{
  "...dados_da_empresa...",
  "_meta": {
    "api_utilizada": "cnpjws",
    "cnpj_consultado": "11222333000181",
    "data_consulta": "2025-08-12T23:47:59.000Z",
    "estrategia": "fallback",
    "apis_tentadas": ["ReceitaWS: CNPJ não encontrado"]
  }
}
```

### Resposta com Erro (Continue on Fail ativado)
```json
{
  "error": "Todas as APIs falharam: cnpjws: timeout; cnpja: 500 error; receitaws: not found",
  "_meta": {
    "api_utilizada": "erro",
    "cnpj_consultado": "11222333000181",
    "data_consulta": "2025-08-12T23:47:59.000Z",
    "status": "erro",
    "estrategia": "fallback"
  }
}
```

### Campos dos Metadados

- **api_utilizada**: API que retornou os dados com sucesso
- **cnpj_consultado**: CNPJ limpo (apenas números) que foi consultado
- **data_consulta**: Timestamp da consulta
- **estrategia**: "fallback" ou "specific"
- **apis_tentadas**: Lista de erros das APIs que falharam (apenas no modo fallback)
- **status**: "erro" quando a consulta falha completamente

## 🔧 Desenvolvimento

### Scripts Disponíveis

- `npm run build` - Compila o projeto
- `npm run dev` - Modo de desenvolvimento com watch
- `npm run lint` - Verifica erros de linting
- `npm run lintfix` - Corrige erros de linting automaticamente

### Estrutura do Projeto

```
n8n-nodes-cnpj-hub/
├── nodes/
│   └── CNPJHUB/
│       ├── CNPJHUB.node.ts      # Lógica principal do node
│       ├── CNPJHUB.node.json    # Configuração do node
│       └── CNPJHUB.svg          # Ícone do node
├── package.json
└── README.md
```

## ⚠️ Limitações

- As APIs públicas podem ter limites de taxa
- Algumas APIs podem estar indisponíveis temporariamente
- Nem todos os CNPJs podem estar disponíveis em todas as APIs

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Criar um Pull Request

## 📝 Licença

[MIT](LICENSE.md) - veja o arquivo LICENSE.md para detalhes.

## 📞 Contato

- **Autor**: Douglassiqueira
- **Email**: douglassiqueira@gmail.com
- **GitHub**: [douglassiqueira](https://github.com/douglassiqueira)

---

**Nota**: Este projeto não é afiliado à Receita Federal do Brasil ou qualquer órgão governamental. Utiliza apenas APIs públicas disponíveis.
