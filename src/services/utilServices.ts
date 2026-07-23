import { color } from '../assets/colors/globalColor';
import { STORAGE_KEYS } from './storageKeys';
import { ROUTES } from '../navigations/routes';
import { imagesPath } from '../assets/images/imageKey';

let nav: any;

export function setNav(navData: any) {
  nav = navData;
}

export function utilLog(msg: any) {
  console.log('[EmployeePortal Log]:', msg);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
