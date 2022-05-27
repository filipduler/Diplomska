const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export const getDaysInMonth = (month, year) => (new Array(31))
    .fill('')
    .map((v,i)=>new Date(year,month-1,i+1))
    .filter(v=>v.getMonth()===month-1)

export const getTime = (date) => `${date.getHours()}:${date.getMinutes()}`;

export const getDayOfWeek = (date) => weekday[date.getDay()]

