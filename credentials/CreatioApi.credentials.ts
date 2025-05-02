import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CreatioApi implements ICredentialType {
	name = 'creatioApi';
	displayName = 'Creatio API';
	// Uses the link to this tutorial as an example
	// Replace with your own docs links when building your own nodes
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/';
	properties: INodeProperties[] = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Creatio URL',
			name: 'creatioUrl',
			type: 'string',
			default: '',
			description: 'The URL of your Creatio instance (e.g., https://your-instance.creatio.com)',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				ForceUseSession: 'true',
			},
		},
	};
}
