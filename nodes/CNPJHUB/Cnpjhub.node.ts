import {
	ApplicationError,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class Cnpjhub implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'CNPJ HUB',
		name: 'cnpjhub',
		icon: 'file:CNPJHUB.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consulta dados de CNPJ através de 5 APIs públicas brasileiras',
		defaults: {
			name: 'CNPJ HUB',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Query CNPJ',
						value: 'consultarCnpj',
						description: 'Query company data by CNPJ',
						action: 'Query company data by CNPJ',
					},
				],
				default: 'consultarCnpj',
			},
			{
				displayName: 'API Strategy',
				name: 'apiStrategy',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['consultarCnpj'],
					},
				},
				options: [
					{
						name: 'Specific API',
						value: 'specific',
						description: 'Use only one specific API',
					},
					{
						name: 'Automatic Fallback',
						value: 'fallback',
						description: 'Try APIs in sequence until success',
					},
				],
				default: 'fallback',
			},
			{
				displayName: 'API',
				name: 'api',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['consultarCnpj'],
						apiStrategy: ['specific'],
					},
				},
				options: [
					{
						name: 'BrasilAPI',
						value: 'brasilapi',
						description: 'Https://brasilapi.com.br',
					},
					{
						name: 'CNPJ.ws',
						value: 'cnpjws',
						description: 'Https://cnpj.ws',
					},
					{
						name: 'CNPJA',
						value: 'cnpja',
						description: 'Https://cnpja.com',
					},
					{
						name: 'MinhaReceita',
						value: 'minhareceita',
						description: 'Https://minhareceita.org',
					},
					{
						name: 'ReceitaWS',
						value: 'receitaws',
						description: 'Https://receitaws.com.br',
					},
				],
				default: 'cnpjws',
			},
			{
				displayName: 'Request Delay (Ms)',
				name: 'rateLimitDelay',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['consultarCnpj'],
					},
				},
				default: '1000',
				placeholder: '1000 or ={{$json.delay}}',
				description: 'Delay in milliseconds between requests. Accepts fixed values or expressions (e.g: 1000, ={{$JSON.delay}}).',
			},
			{
				displayName: 'Data Format',
				name: 'dataFormat',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['consultarCnpj'],
					},
				},
				options: [
					{
						name: 'Normalized',
						value: 'normalized',
						description: 'Standardized format across all APIs for consistent workflows',
					},
					{
						name: 'Original',
						value: 'original',
						description: 'Raw data from the API as received',
					},
				],
				default: 'normalized',
			},
			{
				displayName: 'CNPJ',
				name: 'cnpj',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['consultarCnpj'],
					},
				},
				default: '',
				placeholder: '11.222.333/0001-81 or 11222333000181',
				description: 'CNPJ to query (with or without formatting)',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Função auxiliar para fazer requisição com delay (rate limiting)
		const makeRequestWithDelay = async (
			url: string,
			delay: number,
		): Promise<any> => {
			// Aplicar delay se especificado
			if (delay > 0) {
				await new Promise(resolve => setTimeout(resolve, delay));
			}

			return await this.helpers.httpRequest({
				method: 'GET',
				url,
				headers: {
					'Accept': 'application/json',
					'User-Agent': 'n8n-cnpj-hub-node/1.0',
				},
				timeout: 10000,
			});
		};

		// Função auxiliar para tentar consulta com fallback
		const tryApiWithFallback = async (
			cnpj: string,
			apiStrategy: string,
			specificApi: string | undefined,
			delay: number,
		): Promise<{ data: any; apiUsed: string; errors: string[] }> => {
			const apis = [
				{ name: 'cnpjws', url: `https://publica.cnpj.ws/cnpj/${cnpj}` },
				{ name: 'cnpja', url: `https://open.cnpja.com/office/${cnpj}` },
				{ name: 'minhareceita', url: `https://minhareceita.org/${cnpj}` },
				{ name: 'brasilapi', url: `https://brasilapi.com.br/api/cnpj/v1/${cnpj}` },
				{ name: 'receitaws', url: `https://receitaws.com.br/v1/cnpj/${cnpj}` },
			];

			let apisToTry: typeof apis;

			if (apiStrategy === 'specific' && specificApi) {
				// Usar apenas a API específica
				apisToTry = apis.filter(api => api.name === specificApi);
			} else {
				// Fallback automático - tentar todas as APIs em ordem de preferência
				apisToTry = apis;
			}

			const errors: string[] = [];

			for (const api of apisToTry) {
				try {
					const response = await makeRequestWithDelay(api.url, delay);

					// Verificar se a resposta contém erro específico da ReceitaWS
					if (api.name === 'receitaws' && response.status === 'ERROR') {
						const errorMsg = `ReceitaWS: ${response.message || 'CNPJ não encontrado'}`;
						errors.push(errorMsg);
						continue;
					}

					// Sucesso - retornar dados
					return {
						data: response,
						apiUsed: api.name,
						errors,
					};

				} catch (error) {
					const errorMsg = `${api.name}: ${error.message}`;
					errors.push(errorMsg);

					// Se for API específica, lançar erro imediatamente
					if (apiStrategy === 'specific') {
						throw new ApplicationError(errorMsg);
					}

					// Continuar para próxima API no modo fallback
					continue;
				}
			}

			// Se chegou aqui, todas as APIs falharam
			throw new ApplicationError(`All APIs failed: ${errors.join('; ')}`);
		};

		// Função para normalizar dados de diferentes APIs
		const normalizeApiResponse = (data: any, apiName: string): any => {
			const normalized: any = {
				cnpj: '',
				razao_social: '',
				nome_fantasia: '',
				situacao: '',
				data_abertura: '',
				porte: '',
				natureza_juridica: '',
				capital_social: '',
				atividade_principal: {
					codigo: '',
					descricao: ''
				},
				endereco: {
					logradouro: '',
					numero: '',
					complemento: '',
					bairro: '',
					cep: '',
					municipio: '',
					uf: ''
				},
				contato: {
					telefone: '',
					email: ''
				},
				socios: [],
				atividades_secundarias: [],
				simples: {
					optante: false,
					data_opcao: null,
					data_exclusao: null
				}
			};

			switch (apiName) {
				case 'cnpjws':
					normalized.cnpj = data.estabelecimento?.cnpj || '';
					normalized.razao_social = data.razao_social || '';
					normalized.nome_fantasia = data.estabelecimento?.nome_fantasia || '';
					normalized.situacao = data.estabelecimento?.situacao_cadastral || '';
					normalized.data_abertura = data.estabelecimento?.data_inicio_atividade || '';
					normalized.porte = data.porte?.descricao || '';
					normalized.natureza_juridica = data.natureza_juridica?.descricao || '';
					normalized.capital_social = data.capital_social || '';
					normalized.atividade_principal = {
						codigo: data.estabelecimento?.atividade_principal?.id || '',
						descricao: data.estabelecimento?.atividade_principal?.descricao || ''
					};
					normalized.endereco = {
						logradouro: `${data.estabelecimento?.tipo_logradouro || ''} ${data.estabelecimento?.logradouro || ''}`.trim(),
						numero: data.estabelecimento?.numero || '',
						complemento: data.estabelecimento?.complemento || '',
						bairro: data.estabelecimento?.bairro || '',
						cep: data.estabelecimento?.cep || '',
						municipio: data.estabelecimento?.cidade?.nome || '',
						uf: data.estabelecimento?.estado?.sigla || ''
					};
					normalized.contato = {
						telefone: [data.estabelecimento?.ddd1 + data.estabelecimento?.telefone1, data.estabelecimento?.ddd2 + data.estabelecimento?.telefone2].filter(Boolean).join(' / '),
						email: data.estabelecimento?.email || ''
					};
					normalized.socios = data.socios?.map((socio: any) => ({
						nome: socio.nome,
						cpf_cnpj: socio.cpf_cnpj_socio,
						qualificacao: socio.qualificacao_socio?.descricao || '',
						data_entrada: socio.data_entrada
					})) || [];
					normalized.atividades_secundarias = data.estabelecimento?.atividades_secundarias || [];
					normalized.simples = {
						optante: data.simples?.optante || false,
						data_opcao: data.simples?.data_opcao || null,
						data_exclusao: data.simples?.data_exclusao || null
					};
					break;

				case 'cnpja':
					normalized.cnpj = data.taxId || '';
					normalized.razao_social = data.company?.name || '';
					normalized.nome_fantasia = data.alias || '';
					normalized.situacao = data.status?.text || '';
					normalized.data_abertura = data.founded || '';
					normalized.porte = data.company?.size?.text || '';
					normalized.natureza_juridica = data.company?.nature?.text || '';
					normalized.capital_social = data.company?.equity || '';
					normalized.atividade_principal = {
						codigo: data.mainActivity?.id?.toString() || '',
						descricao: data.mainActivity?.text || ''
					};
					normalized.endereco = {
						logradouro: data.address?.street || '',
						numero: data.address?.number || '',
						complemento: data.address?.details || '',
						bairro: data.address?.district || '',
						cep: data.address?.zip || '',
						municipio: data.address?.city || '',
						uf: data.address?.state || ''
					};
					normalized.contato = {
						telefone: data.phones?.map((phone: any) => `(${phone.area}) ${phone.number}`).join(' / ') || '',
						email: data.emails?.[0]?.address || ''
					};
					normalized.socios = data.company?.members?.map((member: any) => ({
						nome: member.person?.name,
						cpf_cnpj: member.person?.taxId,
						qualificacao: member.role?.text || '',
						data_entrada: member.since
					})) || [];
					normalized.atividades_secundarias = data.sideActivities || [];
					normalized.simples = {
						optante: data.company?.simples?.optant || false,
						data_opcao: data.company?.simples?.since || null,
						data_exclusao: null
					};
					break;

				case 'minhareceita':
				case 'brasilapi':
					normalized.cnpj = data.cnpj || '';
					normalized.razao_social = data.razao_social || '';
					normalized.nome_fantasia = data.nome_fantasia || '';
					normalized.situacao = data.descricao_situacao_cadastral || '';
					normalized.data_abertura = data.data_inicio_atividade || '';
					normalized.porte = data.porte || '';
					normalized.natureza_juridica = data.natureza_juridica || '';
					normalized.capital_social = data.capital_social?.toString() || '';
					normalized.atividade_principal = {
						codigo: data.cnae_fiscal?.toString() || '',
						descricao: data.cnae_fiscal_descricao || ''
					};
					normalized.endereco = {
						logradouro: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim(),
						numero: data.numero || '',
						complemento: data.complemento || '',
						bairro: data.bairro || '',
						cep: data.cep || '',
						municipio: data.municipio || '',
						uf: data.uf || ''
					};
					normalized.contato = {
						telefone: [data.ddd_telefone_1, data.ddd_telefone_2, data.ddd_fax].filter(Boolean).join(' / '),
						email: data.email || ''
					};
					normalized.socios = data.qsa?.map((socio: any) => ({
						nome: socio.nome_socio,
						cpf_cnpj: socio.cnpj_cpf_do_socio,
						qualificacao: socio.qualificacao_socio || '',
						data_entrada: socio.data_entrada_sociedade
					})) || [];
					normalized.atividades_secundarias = data.cnaes_secundarios || [];
					normalized.simples = {
						optante: data.opcao_pelo_simples || false,
						data_opcao: data.data_opcao_pelo_simples || null,
						data_exclusao: data.data_exclusao_do_simples || null
					};
					break;

				case 'receitaws':
					normalized.cnpj = data.cnpj || '';
					normalized.razao_social = data.nome || '';
					normalized.nome_fantasia = data.fantasia || '';
					normalized.situacao = data.situacao || '';
					normalized.data_abertura = data.abertura || '';
					normalized.porte = data.porte || '';
					normalized.natureza_juridica = data.natureza_juridica || '';
					normalized.capital_social = data.capital_social || '';
					normalized.atividade_principal = {
						codigo: data.atividade_principal?.[0]?.code || '',
						descricao: data.atividade_principal?.[0]?.text || ''
					};
					normalized.endereco = {
						logradouro: data.logradouro || '',
						numero: data.numero || '',
						complemento: data.complemento || '',
						bairro: data.bairro || '',
						cep: data.cep || '',
						municipio: data.municipio || '',
						uf: data.uf || ''
					};
					normalized.contato = {
						telefone: data.telefone || '',
						email: data.email || ''
					};
					normalized.socios = data.qsa?.map((socio: any) => ({
						nome: socio.nome,
						cpf_cnpj: '',
						qualificacao: socio.qual || '',
						data_entrada: ''
					})) || [];
					normalized.atividades_secundarias = data.atividades_secundarias || [];
					normalized.simples = {
						optante: data.simples?.optante || false,
						data_opcao: data.simples?.data_opcao || null,
						data_exclusao: data.simples?.data_exclusao || null
					};
					break;

				default:
					return data; // Retorna dados originais se API não reconhecida
			}

			return normalized;
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const apiStrategy = this.getNodeParameter('apiStrategy', i) as string;
				const specificApi = apiStrategy === 'specific' 
					? this.getNodeParameter('api', i) as string 
					: undefined;
				const rateLimitDelayStr = this.getNodeParameter('rateLimitDelay', i) as string;
				const dataFormat = this.getNodeParameter('dataFormat', i) as string;
				let cnpj = this.getNodeParameter('cnpj', i) as string;

				// Converter e validar delay
				const rateLimitDelay = parseInt(rateLimitDelayStr, 10);
				if (isNaN(rateLimitDelay) || rateLimitDelay < 0 || rateLimitDelay > 60000) {
					throw new NodeOperationError(
						this.getNode(),
						'Delay must be a number between 0 and 60000 milliseconds',
						{ itemIndex: i },
					);
				}

				// Limpar CNPJ (remover caracteres especiais)
				cnpj = cnpj.replace(/[^0-9]/g, '');

				// Validar CNPJ
				if (!cnpj || cnpj.length !== 14) {
					throw new NodeOperationError(
						this.getNode(),
						'CNPJ must have 14 digits',
						{ itemIndex: i },
					);
				}

				if (operation === 'consultarCnpj') {
					try {
						const result = await tryApiWithFallback(
							cnpj,
							apiStrategy,
							specificApi,
							rateLimitDelay,
						);

						// Escolher formato dos dados baseado na preferência do usuário
						const responseData = dataFormat === 'normalized' 
							? normalizeApiResponse(result.data, result.apiUsed)
							: result.data;

						// Adicionar metadados úteis
						const executionData: INodeExecutionData = {
							json: {
								...responseData,
								_meta: {
									api_utilizada: result.apiUsed,
									cnpj_consultado: cnpj,
									data_consulta: new Date().toISOString(),
									estrategia: apiStrategy,
									data_format: dataFormat,
									...(result.errors.length > 0 && { apis_tentadas: result.errors }),
									...(dataFormat === 'normalized' && { original_data: result.data })
								},
							},
						};

						returnData.push(executionData);

					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							`Error querying CNPJ: ${error.message}`,
							{ itemIndex: i },
						);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							_meta: {
								api_utilizada: 'erro',
								cnpj_consultado: this.getNodeParameter('cnpj', i),
								data_consulta: new Date().toISOString(),
								status: 'erro',
								estrategia: this.getNodeParameter('apiStrategy', i),
							},
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}