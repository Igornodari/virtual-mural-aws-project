export const environment = {
  production: true,
  apiBaseUrl: 'https://diligent-freedom-production-94b9.up.railway.app/api/v1',
  version: '0.0.1',
  stripePublishableKey: 'pk_test_51Stc9CENa5vvo4XzaLtiHrX2gCNjm6YJ89UF7y5N7DxajFHccfR6ahRVgCVae3K5ZwfMYNZmII1pMUlGKBfVwEh200jEqJbfS1',
  aws: {
    region: 'sa-east-1',
    userPoolId: 'sa-east-1_NiMyy2V3k',
    userPoolWebClientId: '3m3i285a6d5tlje7h3p4t1ueu2',
    domain: 'sa-east-1nimyy2v3k.auth.sa-east-1.amazoncognito.com',
    redirectSignIn: 'https://virtual-mural-aws-project.vercel.app/auth/callback',
    redirectSignOut: 'https://virtual-mural-aws-project.vercel.app/',
  },
};
