import { NextRequest, NextResponse } from 'next/server';
import { SESClient, SendEmailCommand, SESClientConfig } from '@aws-sdk/client-ses';

// Ensure environment variables are defined
const region = process.env.AWS_REGION as string;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;
const sourceEmail = process.env.SOURCE_EMAIL as string;

if (!region || !accessKeyId || !secretAccessKey || !sourceEmail) {
  throw new Error('AWS SES environment variables are not set properly.');
}

const sesClientConfig: SESClientConfig = {
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
};

const sesClient = new SESClient(sesClientConfig);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message } = await req.json();

    const params = {
      Source: sourceEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: message,
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    return NextResponse.json({ message: 'Email sent successfully', response });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
