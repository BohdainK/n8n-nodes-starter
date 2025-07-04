import { INodeType, INodeTypeDescription, IExecuteFunctions, NodeConnectionType } from 'n8n-workflow';

export class Sparkwise implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sparkwise',
		name: 'sparkwise',
		icon: 'file:creatio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["endpointUrl"]}}',
		description: 'Execute a Sparkwise model',
		defaults: {
			name: 'Sparkwise',
		},
		inputs: ['main'] as NodeConnectionType[],
		outputs: ['main'] as NodeConnectionType[],
		credentials: [
			{
				name: 'sparkwiseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Endpoint URL',
				name: 'endpointUrl',
				type: 'string',
				default: '',
				description: 'The full endpoint URL for the Sparkwise model execution',
				required: true,
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				description: 'The JSON body for the request',
				required: true,
				typeOptions: {
					json: true,
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Send API Key',
						name: 'sendApiKey',
						type: 'boolean',
						default: true,
						description: 'Whether to send the API Key in the X-Api-Key header',
					},
				],
			}
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			const credentials = await this.getCredentials('sparkwiseApi');
			const endpointUrl = this.getNodeParameter('endpointUrl', i) as string;
			const body = this.getNodeParameter('body', i) as string;
			const options = this.getNodeParameter('options', i, {}) as { sendApiKey?: boolean };

			const headers: { [key: string]: string } = {
				'Content-Type': 'application/json',
			};

			if (options.sendApiKey && credentials.apiKey) {
				headers['X-Api-Key'] = credentials.apiKey as string;
			}

			let response;
			try {
				response = await this.helpers.request({
					method: 'POST',
					url: endpointUrl,
					headers,
					body: JSON.parse(body),
					json: true,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}

			returnData.push(response);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
