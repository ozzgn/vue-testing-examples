import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { Override } from '@di';

import { CREDENTIALS_SERVICE_ID } from './credentials';
import AuthService, { AUTH_SERVICE_ID } from './auth.js'; // always use '.js' extension otherwise this module will be required.

export { AUTH_SERVICE_ID };

@Override(AUTH_SERVICE_ID, [CREDENTIALS_SERVICE_ID])
export default class AuthStubService extends AuthService {
  constructor (credentialsService) {
    super(credentialsService);
    this.credentialsService = credentialsService;
  }

  login (username, password) {
    let axiosMock = new AxiosMockAdapter(axios);
    if (username === password) {
      axiosMock.onPost('/api/login', { username, password }).replyOnce(200, 'random_token');
    } else {
      axiosMock.onPost('/api/login', { username, password }).replyOnce(401, { error: { message: 'Invalid username or password' } });
    }

    return super.login(username, password).finally(() => axiosMock.restore());
  }

  logout () {
    let axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onPost('/api/logout').replyOnce(204);
    return super.logout().finally(() => axiosMock.restore());
  }
}
