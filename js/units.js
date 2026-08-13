// Unit preference: metric (default) or imperial. All values are STORED metric
// (kg / cm / meters); conversion happens only at input and display time, so
// benchmarks and science stay in one system.

import { getProfile, update } from './store.js';

export function isImperial() {
  return getProfile().settings?.units === 'imperial';
}

export function setUnits(units) {
  update('settings', { ...(getProfile().settings || {}), units });
}

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;
const M_PER_MILE = 1609.344;

export const lbToKg = (lb) => lb * KG_PER_LB;
export const kgToLb = (kg) => kg / KG_PER_LB;
export const inToCm = (i) => i * CM_PER_IN;
export const cmToIn = (cm) => cm / CM_PER_IN;
export const milesToM = (mi) => mi * M_PER_MILE;
export const mToMiles = (m) => m / M_PER_MILE;

export const cmToFtIn = (cm) => {
  const totalIn = cmToIn(cm);
  const ft = Math.floor(totalIn / 12);
  return { ft, inches: Math.round((totalIn - ft * 12) * 10) / 10 };
};
export const ftInToCm = (ft, inches) => inToCm((ft || 0) * 12 + (inches || 0));

// Display helpers
export function weightLabel() { return isImperial() ? 'lbs' : 'kg'; }
export function fmtWeight(kg, digits = 0) {
  return isImperial() ? `${kgToLb(kg).toFixed(digits)} lb` : `${kg.toFixed(digits)} kg`;
}
export function fmtHeight(cm) {
  if (!isImperial()) return `${cm} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}′${Math.round(inches)}″`;
}
export function fmtSmallLength(cm) {
  return isImperial() ? `${cmToIn(cm).toFixed(1)} in` : `${cm} cm`;
}
