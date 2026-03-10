export const environment = {
  production: true,
  apiBaseUrl: 'https://SUA_API.execute-api.us-east-1.amazonaws.com/prod',
  aws: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_XXXX',
    userPoolWebClientId: 'YYYY',
    domain: 'minha-plataforma-auth.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://SUA_URL_CLOUDFRONT/auth/callback',
    redirectSignOut: 'https://SUA_URL_CLOUDFRONT/',
  },
};
