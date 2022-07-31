import moment from 'moment';
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
			h: StringHelpers.padStringLeft(hours, 2, '0'),
			m: StringHelpers.padStringLeft(minutes, 2, '0'),
			s: StringHelpers.padStringLeft(seconds, 2, '0'),
		};
	},
	secondsToTimeDisplay: (secs) => {
		const time = DateHelper.secondsToTime(secs);
		return `${time.h}:${time.m}:${time.s}`;
	},
	formatDate: (date) => moment(date).format('DD, MMM YYYY'),
	formatTime: (date, includeSeconds = false) => moment(date).format('HH:mm' + (includeSeconds ? 'ss' : '')),
}

export default DateHelper;


