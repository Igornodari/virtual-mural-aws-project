export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3001/api/v1',
  version: '0.0.1',
  stripePublishableKey: 'pk_test_51Stc9KE7dWoPv7ZuBIWrv5G00ehRaDv7Rglj71rDUhmi9Jcy8K79qiAS1YWDAle5heuamXb691ID6M34MfLX5pLA00jqC75W5v',
  aws: {
    region: 'sa-east-1',
    userPoolId: 'sa-east-1_NiMyy2V3k',
    userPoolWebClientId: '3m3i285a6d5tlje7h3p4t1ueu2',
    domain: 'sa-east-1nimyy2v3k.auth.sa-east-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:4200/auth/callback',
    redirectSignOut: 'http://localhost:4200/',
  },
};
