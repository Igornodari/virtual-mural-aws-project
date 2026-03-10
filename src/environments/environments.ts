export const environment = {
  production: false,
  apiBaseUrl: 'https://SUA_API.execute-api.sa-east-1.amazonaws.com/prod',
  version: '0.0.1',
  aws: {
    region: 'sa-east-1',
    userPoolId: 'sa-east-1_NiMyy2V3k',
    userPoolWebClientId: '3m3i285a6d5tlje7h3p4t1ueu2',
    domain: 'sa-east-1nimyy2v3k.auth.sa-east-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:4200/auth/callback',
    redirectSignOut: 'http://localhost:4200/',
  },
};
