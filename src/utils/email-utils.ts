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
        <p>${ad.header}</p>
        <p>${ad.link}</p>
        <p>${ad.description}</p>
        <p>${ad.price} €</p>
        <p>${ad.city} - ${ad.province}</p>
    `;
};

export const sendEmail = (client: EmailClient, receiver: string, ad: Ad) => {
  client.transporter.sendMail(
    {
      from: client.user,
      to: receiver,
      subject: ad.header,
      html: adToHTML(ad),
    },
    (err: any, info: any) => {
      if (err) {
        console.log(err);
      }
    }
  );
};
