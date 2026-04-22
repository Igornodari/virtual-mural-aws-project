import { Injectable } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class AmplifyService {
  private configured = false;

  ensureConfigured() {
    if (this.configured) return;

    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: environment.aws.userPoolId,
          userPoolClientId: environment.aws.userPoolWebClientId,
          loginWith: {
            oauth: {
              domain: environment.aws.domain,
              scopes: ['openid', 'email', 'profile', 'aws.cognito.signin.user.admin'],
              redirectSignIn: [environment.aws.redirectSignIn],
              redirectSignOut: [environment.aws.redirectSignOut],
              responseType: 'code',
            },
          },
        },
      },
    });

    this.configured = true;
  }
}
