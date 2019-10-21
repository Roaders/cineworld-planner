import { IEnvironment } from 'src/contracts/contracts';

const baseUrl = window.location.host.indexOf('staging') >= 0 ?
    'staging' :
    'prod';

export const environment: IEnvironment = {
    production: true,
    baseUrl
};
