# n8n-nodes-cnpj-hub 🇧🇷

> **Language**: [English](README.md) | [Português](docs/README-pt.md)

Custom n8n node for querying Brazilian CNPJ data through public APIs.

## 🇧🇷 What is CNPJ?

**CNPJ** (Cadastro Nacional da Pessoa Jurídica) is the Brazilian national registry of legal entities. It's a unique 14-digit identifier assigned to every company, organization, and legal entity operating in Brazil.

- **Format**: `XX.XXX.XXX/XXXX-XX` (e.g., `11.222.333/0001-81`)
- **Purpose**: Official business identification for tax, legal, and regulatory purposes
- **Equivalent to**: EIN (USA), VAT number (EU), or Company Registration Number in other countries
- **Contains**: Company registration data, address, business activities, partners, and legal status

This node allows you to easily retrieve comprehensive company information using just the CNPJ number.

## 🚀 Features

- 🔄 **Automatic Fallback**: If one API fails, automatically tries others
- ⏱️ **Rate Limiting**: Configurable delay between requests to avoid blocking
- 📊 **5 Public APIs**: CNPJ.ws, CNPJA, MinhaReceita, BrasilAPI and ReceitaWS
- 🔍 **Smart Validation**: Accepts CNPJ with or without formatting
- 🛡️ **Robust Error Handling**: Advanced error management
- 📝 **Detailed Metadata**: Information about APIs used and attempts
- 🔄 **Data Normalization**: Standardized output format across all APIs for consistent workflows

## 📋 Supported APIs

### 1. CNPJ.ws (Most Complete)
- **URL**: `https://publica.cnpj.ws/cnpj/{cnpj}`
- **Features**: Most comprehensive API with detailed information about partners, activities and establishments

### 2. CNPJA (Structured)
- **URL**: `https://open.cnpja.com/office/{cnpj}`
- **Features**: Well-structured and organized data

### 3. MinhaReceita (Detailed)
- **URL**: `https://minhareceita.org/{cnpj}`
- **Features**: Detailed data with tax regime information

### 4. BrasilAPI (Official)
- **URL**: `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`
- **Features**: Official Brazilian government API

### 5. ReceitaWS (Simple)
- **URL**: `https://receitaws.com.br/v1/cnpj/{cnpj}`
- **Features**: Simple and fast API for basic queries

## 💻 How to Use

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/douglassiqueira/n8n-nodes-cnpj-hub.git
   cd n8n-nodes-cnpj-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Install the node in n8n:
   ```bash
   npm link
   ```

### Usage in n8n

1. Add the "CNPJ HUB" node to your workflow
2. **Choose strategy**:
   - **Automatic Fallback** (recommended): Tries all APIs until success
   - **Specific API**: Uses only one chosen API
3. **Choose data format**:
   - **Normalized** (recommended): Standardized format across all APIs
   - **Original**: Raw data from the API as received
4. **Configure delay** between requests (accepts expressions, default: 1000ms)
5. Enter the CNPJ (with or without formatting)
6. Execute the workflow

### Usage Examples

#### Automatic Fallback (Recommended)
```json
{
  "operation": "consultarCnpj",
  "apiStrategy": "fallback",
  "rateLimitDelay": "1000",
  "cnpj": "11.222.333/0001-81"
}
```

#### Specific API
```json
{
  "operation": "consultarCnpj",
  "apiStrategy": "specific",
  "api": "cnpjws",
  "rateLimitDelay": "500",
  "cnpj": "11222333000181"
}
```

#### With Dynamic Expression
```json
{
  "operation": "consultarCnpj",
  "apiStrategy": "fallback",
  "rateLimitDelay": "={{$json.customDelay || 1000}}",
  "cnpj": "={{$json.cnpj}}"
}
```

## 🎨 Dynamic Expressions

The **Delay** field accepts n8n expressions, allowing dynamic values:

### Expression Examples

- **Fixed value**: `"1000"`
- **From previous item**: `"={{$json.delay}}"`
- **With fallback**: `"={{$json.customDelay || 2000}}"`
- **Condition-based**: `"={{$json.isPriority ? 500 : 2000}}"`
- **Dynamic calculation**: `"={{Math.min($json.requestCount * 100, 5000)}}"`

### Limits
- **Minimum**: 0ms (no delay)
- **Maximum**: 60000ms (60 seconds)
- **Default**: 1000ms

## 📊 Normalized Data Structure

When using **Normalized** format, all APIs return data in this standardized structure:

```json
{
  "cnpj": "11.222.333/0001-81",
  "razao_social": "Company Name",
  "nome_fantasia": "Trade Name",
  "situacao": "Active",
  "data_abertura": "2009-09-02",
  "porte": "Small",
  "natureza_juridica": "Private Association",
  "capital_social": "0.00",
  "atividade_principal": {
    "codigo": "8550301",
    "descricao": "School fund administration"
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
    "email": "example@company.com"
  },
  "socios": [
    {
      "nome": "Partner Name",
      "cpf_cnpj": "***123456**",
      "qualificacao": "President",
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
    "data_consulta": "2025-08-13T03:41:00.000Z",
    "estrategia": "fallback",
    "data_format": "normalized",
    "original_data": { /* Raw API response */ }
  }
}
```

### Benefits of Normalized Format:
- **Consistent field names** across all APIs
- **Predictable data structure** for reliable workflows
- **Standardized data types** and formats
- **Original data preserved** in `_meta.original_data`
- **Easy integration** with other n8n nodes

## 📊 Response Structure

All responses include detailed metadata:

### Successful Response
```json
{
  "...company_data...",
  "_meta": {
    "api_utilizada": "cnpjws",
    "cnpj_consultado": "11222333000181",
    "data_consulta": "2025-08-12T23:47:59.000Z",
    "estrategia": "fallback",
    "apis_tentadas": ["ReceitaWS: CNPJ não encontrado"]
  }
}
```

### Error Response (Continue on Fail enabled)
```json
{
  "error": "All APIs failed: cnpjws: timeout; cnpja: 500 error; receitaws: not found",
  "_meta": {
    "api_utilizada": "erro",
    "cnpj_consultado": "11222333000181",
    "data_consulta": "2025-08-12T23:47:59.000Z",
    "status": "erro",
    "estrategia": "fallback"
  }
}
```

### Metadata Fields

- **api_utilizada**: API that successfully returned data
- **cnpj_consultado**: Clean CNPJ (numbers only) that was queried
- **data_consulta**: Query timestamp
- **estrategia**: "fallback" or "specific"
- **apis_tentadas**: List of errors from failed APIs (fallback mode only)
- **status**: "erro" when query fails completely

## 🔧 Development

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Development mode with watch
- `npm run lint` - Check linting errors
- `npm run lintfix` - Fix linting errors automatically

### Project Structure

```
n8n-nodes-cnpj-hub/
├── nodes/
│   └── CNPJHUB/
│       ├── CNPJHUB.node.ts      # Main node logic
│       ├── CNPJHUB.node.json    # Node configuration
│       └── CNPJHUB.svg          # Node icon
├── docs/
│   └── README-pt.md             # Portuguese documentation
├── package.json
└── README.md
```

## ⚠️ Limitations

- Public APIs may have rate limits
- Some APIs may be temporarily unavailable
- Not all CNPJs may be available in all APIs

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

[MIT](LICENSE.md) - see LICENSE.md file for details.

## 📞 Contact

- **Author**: Douglassiqueira
- **Email**: douglassiqueira@gmail.com
- **GitHub**: [douglassiqueira](https://github.com/douglassiqueira)

---

**Note**: This project is not affiliated with the Brazilian Federal Revenue Service or any government agency. It only uses publicly available APIs.
