import { INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';

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
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'creatioApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Authenticate',
						//@ts-ignore
						//resolveWithFullResponse: true,
						value: 'authenticate',
						description: 'Authenticate with Creatio',
						action: 'Authenticate with creatio',
					},
				],
				default: 'authenticate',
			},
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const credentials = await this.getCredentials('creatioApi');
			const operation = this.getNodeParameter('operation', i) as string;

			if (operation === 'authenticate') {
				const response = await this.helpers.request({
					resolveWithFullResponse: true,
					method: 'POST',
					url: `${credentials.creatioUrl}/ServiceModel/AuthService.svc/Login`,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'ForceUseSession': 'true',
					},
					body: {
						UserName: credentials.username,
						UserPassword: credentials.password,
					},
					json: true,
				});

				const cookies = response.headers['set-cookie'];

				const authCookie = cookies.find((c: string) => c.startsWith('.ASPXAUTH='));
				const csrfCookie = cookies.find((c: string) => c.startsWith('BPMCSRF='));

				const cookieHeader = [
					authCookie?.split(';')[0],
					csrfCookie?.split(';')[0]
				].filter(Boolean).join('; ');

				returnData.push({ cookieHeader });
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
