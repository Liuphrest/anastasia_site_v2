import { CONFIG } from '../constants/config';

export const getExperienceYears = () => {
  const startYear = CONFIG.EXPERIENCE_START_YEAR;
  const currentYear = new Date().getFullYear();
  return currentYear - startYear + 1;
};