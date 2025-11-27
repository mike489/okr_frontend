export const PeriodNaming = (name) => {
  if (name) {
    let f_name;
    switch (name) {
      case 'Monthly':
        f_name = 'Month';
        break;

      case 'Annually':
        f_name = 'Annum';
        break;

      case 'Quarterly':
        f_name = 'Quarter';
        break;

      case 'Weekly':
        f_name = 'Week';
        break;

      case 'Bi-weekly':
        f_name = 'Bi-weekly';
        break;

      case 'Daily':
        f_name = 'Day';
        break;
      case 'Period':
        f_name = 'Period';
        break;

      default:
        f_name = 'Quarter';
        break;
    }
    return f_name;
  }
};

export const formatDate = (createdAt) => {
  if (!createdAt) {
    // Handle invalid date input
    return { monthName: '', formattedDate: '' };
  }

  const date = new Date(createdAt);

  if (isNaN(date.getTime())) {
    // Handle invalid date
    return { monthName: '', formattedDate: '' };
  }

  // Get the month name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const month = monthNames[date.getMonth()];

  if (!month) {
    // Handle unexpected error with month
    return { monthName: '', formattedDate: '' };
  }

  // Get the day and pad it with leading zeros if necessary
  const day = String(date.getDate()).padStart(2, '0');

  // Get the year
  const year = date.getFullYear();

  // Format the date as DDMMYYYY
  const formattedDate = `${month.slice(0, 3)}, ${day}/${year}`;

  return {
    monthName: month.slice(0, 3),
    formattedDate: formattedDate
  };
};

export const formattedDate = (dateString) => {
  if (dateString) {
    const [datePart] = dateString.split(' ');

    const [year, month, day] = datePart.split('-');

    return `${day}/${month}/${year}`;
  } else {
    return dateString;
  }
};

export const MeasuringUnitConverter = (mu) => {
  let MeasuredBy = '';

  switch (mu) {
    case 'Percentage':
      MeasuredBy = '%';
      break;

    case 'Money':
      MeasuredBy = 'ETB';
      break;

    case 'Time':
      MeasuredBy = 'Hour';
      break;

    default:
      MeasuredBy = '';
  }
  return MeasuredBy;
};

export const getStatusColor = (status = '') => {
  const normalizedStatus = status.toLowerCase();

  const greenStatuses = ['approved', 'done', 'accepted', 'active'];
  const blueStatuses = ['in-progress', 'open for discussion'];
  const purpleStatuses = ['completed', 'escalated', 'blocked'];

  if (greenStatuses.includes(normalizedStatus)) return 'green';
  if (blueStatuses.includes(normalizedStatus)) return 'blue';
  if (purpleStatuses.includes(normalizedStatus)) return 'purple';

  switch (normalizedStatus) {
    case 'pending':
      return '#FFA500';

    case 'rejected':
      return 'red';
    case 'reviewed':
      return '#3498db';
    default:
      return 'gray';
  }
};

export const taskStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'done':
      return 'green';
    case 'pending':
      return '#FFA500';
    case 'cancelled':
      return 'red';
    case 'inprogress':
      return 'blue';
    case 'blocked':
      return 'purple';
    default:
      return 'gray';
  }
};

export const getTodayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = days[new Date().getDay()];

  return todayDayName;
};

export function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
}
