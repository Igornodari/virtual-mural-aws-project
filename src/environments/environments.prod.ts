export const environment = {
  production: true,
  apiBaseUrl: 'https://diligent-freedom-production-94b9.up.railway.app/api/v1',
  version: '0.0.1',
  // ↓ Atualize com a chave pública do Stripe (live ou test)
  stripePublishableKey: 'pk_test_SUBSTITUA_PELA_SUA_CHAVE',
  aws: {
    region: 'sa-east-1',
    userPoolId: 'sa-east-1_NiMyy2V3k',
    userPoolWebClientId: '3m3i285a6d5tlje7h3p4t1ueu2',
    domain: 'sa-east-1nimyy2v3k.auth.sa-east-1.amazoncognito.com',
    // ↓ Atualize com a URL do seu projeto na Vercel
    redirectSignIn: 'https://SEU-PROJETO.vercel.app/auth/callback',
    redirectSignOut: 'https://SEU-PROJETO.vercel.app/',
  },
};
