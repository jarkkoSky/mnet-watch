import moment from 'moment';

export const log = (msg: string) => {
  console.log(`${moment().format('HH:mm:SS')} ${msg}`);
};
