import { IEnvironment } from 'src/contracts/contracts';

const baseUrl = window.location.host.indexOf('staging') >= 0 ?
    'https://cineworld-staging.herokuapp.com' :
    'https://cineworld-planner.herokuapp.com';

export const environment: IEnvironment = {
    production: true,
    baseUrl
};
