import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	NodeConnectionType,
} from 'n8n-workflow';

export class Creatio implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Creatio',
		name: 'creatio',
		icon: 'file:creatio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Creatio API',
		defaults: {
			name: 'Creatio',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'creatioApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'GET',
						description: 'Gets record',
						value: 'GET',
						action: 'Get one or more records',
					},
				],
				default: 'GET',
			},
			{
				displayName: 'Subpath',
				name: 'subpath',
				type: 'string',
				default: '',
				description: 'The OData path to target (e.g., Account, Contact)',
				required: true,
				displayOptions: {
					show: {
						operation: ['GET'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['GET'],
					},
				},
				options: [
					{
						displayName: 'Select Fields',
						name: 'select',
						type: 'string',
						default: '',
						description: 'Comma-separated list of fields to select (e.g., "Name,Web")',
					},
					{
						displayName: 'Top',
						name: 'top',
						type: 'number',
						default: 10,
						description: 'Number of records to return',
					},
					{
						displayName: 'Filter',
						name: 'filter',
						type: 'string',
						default: '',
						description: 'OData filter expression (e.g., "Name eq \'John\'")',
					},
					{
						displayName: 'Expand',
						name: 'expand',
						type: 'string',
						default: '',
						description: 'Comma-separated list of related entities to expand',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const credentials = await this.getCredentials('creatioApi');
			const operation = this.getNodeParameter('operation', i) as string;

			// Authentication
			const authResponse = await this.helpers.request({
				resolveWithFullResponse: true,
				method: 'POST',
				url: `${credentials.creatioUrl}/ServiceModel/AuthService.svc/Login`,
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					ForceUseSession: 'true',
				},
				body: {
					UserName: credentials.username,
					UserPassword: credentials.password,
				},
				json: true,
			});

			const cookies = authResponse.headers['set-cookie'];
			const authCookie = cookies.find((c: string) => c.startsWith('.ASPXAUTH='));
			const csrfCookie = cookies.find((c: string) => c.startsWith('BPMCSRF='));
			const cookieHeader = [authCookie?.split(';')[0], csrfCookie?.split(';')[0]]
				.filter(Boolean)
				.join('; ');

			let response;
			switch (operation) {
				case 'GET': {
					const subpath = this.getNodeParameter('subpath', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as {
						select?: string;
						top?: number;
						filter?: string;
						expand?: string;
					};

					// Build the URL with parameters
					let url = `${credentials.creatioUrl}/0/odata/${subpath}`;
					const queryParams: string[] = [];

					// Add optional parameters if they exist
					if (additionalFields.select) {
						queryParams.push(`$select=${encodeURIComponent(additionalFields.select)}`);
					}
					if (additionalFields.top) {
						queryParams.push(`$top=${additionalFields.top}`);
					}
					if (additionalFields.filter) {
						queryParams.push(`$filter=${encodeURIComponent(additionalFields.filter)}`);
					}
					if (additionalFields.expand) {
						queryParams.push(`$expand=${encodeURIComponent(additionalFields.expand)}`);
					}

					// Add query parameters to URL if any exist
					if (queryParams.length > 0) {
						url += `?${queryParams.join('&')}`;
					}

					response = await this.helpers.request({
						method: 'GET',
						url,
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
							Cookie: cookieHeader,
							BPMCSRF: csrfCookie?.split('=')[1] || '',
						},
						json: true,
					});
					break;
				}

				case 'PUT': {
					//const subpath = this.getNodeParameter('subpath', i) as string;
				}
			}

			returnData.push(response);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
