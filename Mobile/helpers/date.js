import * as StringHelpers from './strings';

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export const getDaysInMonth = (month, year) => (new Array(31))
    .fill('')
    .map((v,i)=>new Date(year,month-1,i+1))
    .filter(v=>v.getMonth()===month-1)

export const getTime = (date) => `${StringHelpers.padStringLeft(date.getHours(), 2, '0')}:${StringHelpers.padStringLeft(date.getMinutes(), 2, '0')}`;

export const getDayOfWeek = (date) => weekday[date.getDay()]

export const convertDateToUTC = (date) => new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
export const convertUTCDateToLocal = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())


