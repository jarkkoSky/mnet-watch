import nodemailer from 'nodemailer';
import { Ad } from '../models/Ad';
import 'dotenv/config';
import * as R from 'ramda';

type EmailClient = {
  user: string;
  transporter: any;
};

export const initEmail = (): EmailClient => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  return {
    user,
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    }),
  };
};

const adToHTML = (ad: Ad) => {
  return `
    <br />
        <p>${ad.header}</p>
        <p>${ad.link}</p>
        <p>${ad.description}</p>
    <br />
    `;
};

export const sendEmail = (client: EmailClient, receiver: string, ads: Ad[]) => {
  client.transporter.sendMail(
    {
      from: client.user,
      to: receiver,
      subject: 'Joku myy tavaraa mitä halutaan',
      html: R.map(adToHTML, ads),
    },
    (err: any, info: any) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    }
  );
};
