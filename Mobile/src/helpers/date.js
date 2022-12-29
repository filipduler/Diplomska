import { regexLiteral } from '@babel/types';
import moment, { isMoment } from 'moment';
import * as StringHelpers from './strings';

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

const DateHelper =
{
	getDateWithOffset: (minutes) => {
		const date = new Date();
		date.setMinutes(date.getMinutes() + minutes);
		return date;
	},
	getDaysInMonth: (month, year) => {
		return new Array(31)
			.fill('')
			.map((v, i) => new Date(year, month - 1, i + 1))
			.filter(v => v.getMonth() === month - 1);
	},
	getDayOfWeek: (day) => weekday[day],
	getMonth: (month) => monthNames[month],
	convertUTCToLocal: (date) => {
		var stillUtc = moment.utc(date).toDate();
		return moment(stillUtc).local();
	},
	secondsToTime: (secs) => {
		let hours = Math.floor(secs / (60 * 60));

		let divisor_for_minutes = secs % (60 * 60);
		let minutes = Math.floor(divisor_for_minutes / 60);

		let divisor_for_seconds = divisor_for_minutes % 60;
		let seconds = Math.ceil(divisor_for_seconds);

		return {
			h: hours,
			m: minutes,
			s: seconds,
		};
	},
	secondsToTimeZeroPadded: (secs) => {
		const time = DateHelper.secondsToTime(secs);

		return {
			h: StringHelpers.padStringLeft(time.h, 2, '0'),
			m: StringHelpers.padStringLeft(time.m, 2, '0'),
			s: StringHelpers.padStringLeft(time.s, 2, '0'),
		};
	},
	secondsToTimeDisplay: (secs) => {
		const time = DateHelper.secondsToTimeZeroPadded(secs);
		return `${time.h}:${time.m}:${time.s}`;
	},
	formatDate: (date) => moment(date).format('DD, MMM YYYY'),
	formatTime: (date, includeSeconds = false) => moment(date).format('HH:mm' + (includeSeconds ? 'ss' : '')),
	formatFullDate: (date, fromUTC = true) => {
		let displayTime = date;
		if (fromUTC) {
			displayTime = DateHelper.convertUTCToLocal(date);
		}

		return `${DateHelper.formatDate(displayTime)}, ${DateHelper.formatTime(displayTime)}`;
	},
	roundToDayAsUnix: (date, fromUTC = true) => {
		let displayTime = moment(date);
		if (fromUTC) {
			displayTime = DateHelper.convertUTCToLocal(date);
		}

		return displayTime.startOf('day').unix();
	},
	timeDiffInSec: (date) => {
		let ms = Date.now() - new Date(date);
		if (ms < 0) {
			ms = 0;
		}

		const secs = Math.trunc(ms / 1000);
		if (!isNaN(secs)) {
			return secs;
		}
		return null;
	},
	hmsFormat: (secs, hours = true, minutes = true, seconds = true) => {
		const hms = DateHelper.secondsToTime(secs);
		let parts = [];
		if (hours) {
			parts.push(`${hms.h}h`)
		}
		if (minutes) {
			parts.push(`${hms.m}m`)
		}
		if (seconds) {
			parts.push(`${hms.s}s`)
		}

		return parts.join(' ');
	},
	parseHMSFormat: (str) => {
		const hRegex = /\d+h/;
		const mRegex = /\d+m/;
		const sRegex = /\d+s/;

		const resObj = {
			h: 0,
			m: 0,
			s: 0
		};

		const setValue = (regex, char, selector) => {
			const match = regex.exec(str);
			if (match && match.length > 0) {
				let val = match[0].replace(char, '');
				if (!isNaN(val)) {
					selector(parseInt(val));
				}
			}
		}

		setValue(hRegex, 'h', value => resObj.h = value);
		setValue(mRegex, 'm', value => resObj.m = value);
		setValue(sRegex, 's', value => resObj.s = value);

		return resObj;
	},
	hmsObjectToSeconds: (hmsObject) => {
		return hmsObject.h * 3600 + hmsObject.m * 60 + hmsObject.s;
	},
	calculateWorkingDays: (start, workingDays) => {
		const startClone = new Date(start);
		let endDate;  
		let count = 0;
		while (count < workingDays) {
			endDate = new Date(startClone.setDate(startClone.getDate() + 1));
			if (endDate.getDay() != 0 && endDate.getDay() != 6) {
				count++;
			}
		}
		return endDate;
	}
}

export default DateHelper;


