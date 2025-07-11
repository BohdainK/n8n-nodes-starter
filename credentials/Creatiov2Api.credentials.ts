import { Icon, IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class Creatiov2Api implements ICredentialType {
	displayName = 'CreatioV2 API';
	name = 'creatiov2Api';
	icon: Icon = 'file:Creatio.svg';
	documentationUrl = 'https://community.creatio.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Creatio tenant URL',
			name: 'creatioUrl',
			type: 'string',
			default: '',
			description: 'The URL of your Creatio instance (e.g., https://your-instance.creatio.com)',
		},
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
