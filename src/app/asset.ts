import { environment } from '../environments/environment';

export const asset = (path: string): string => `${environment.assetBase}${path}`;
