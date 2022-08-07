import moment, { isMoment } from 'moment';
import * as StringHelpers from './strings';

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

const DateHelper =
{
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
		if(fromUTC) {
			displayTime = DateHelper.convertUTCToLocal(date);
		}
		
		return `${DateHelper.formatDate(displayTime)}, ${DateHelper.formatTime(displayTime)}`;
	},
	roundToDayAsUnix: (date, fromUTC = true) => {
		let displayTime = moment(date);
		if(fromUTC) {
			displayTime = DateHelper.convertUTCToLocal(date);
		}

		return displayTime.startOf('day').unix();
	}
}

export default DateHelper;


