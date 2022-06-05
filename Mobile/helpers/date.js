import * as StringHelpers from './strings';

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const getDaysInMonth = (month, year) => (new Array(31))
    .fill('')
    .map((v,i)=>new Date(year,month-1,i+1))
    .filter(v=>v.getMonth()===month-1)

export const getTime = (date) => `${StringHelpers.padStringLeft(date.getHours(), 2, '0')}:${StringHelpers.padStringLeft(date.getMinutes(), 2, '0')}`;

export const getDayOfWeek = (date) => weekday[date.getDay()]
export const getMonth = (month) =>  monthNames[month];

export const convertDateToUTC = (date) => new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())
export const convertUTCDateToLocal = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())

export const secondsToTimeDisplay = (secs) => {
  const time = secondsToTime(secs);
  return `${time.h}:${time.m}:${time.s}`;
}

export const secondsToTime = (secs) => {
  let hours = Math.floor(secs / (60 * 60));

  let divisor_for_minutes = secs % (60 * 60);
  let minutes = Math.floor(divisor_for_minutes / 60);

  let divisor_for_seconds = divisor_for_minutes % 60;
  let seconds = Math.ceil(divisor_for_seconds);

  return {
      h: StringHelpers.padStringLeft(hours, 2, '0'),
      m: StringHelpers.padStringLeft(minutes, 2, '0'),
      s: StringHelpers.padStringLeft(seconds, 2, '0'),
  };
}

