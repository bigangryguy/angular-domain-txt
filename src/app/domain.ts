import { Platform } from './platform';

export interface Domain {
  id: number;
  name: string;
  platforms: Platform[];
}
