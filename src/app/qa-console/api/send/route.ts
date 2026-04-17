/**
 * POST /qa-console/api/send
 *
 * Firma un payload WhatsApp Cloud API y lo POSTea al webhook real de
 * api-service en Railway, simulando un mensaje del phone indicado.
 *
 * Body: { phone: string; text: string; interactiveId?: string }
 */

import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { PROFILE_BY_PHONE } from "../../lib/qa-console";

const WEBHOOK_URL =
  process.env.QA_WEBHOOK_URL ?? "https://api.cualesminombre.com/webhook/whatsapp";
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET;
const PHONE_NUMBER_ID = process.env.QA_WA_PHONE_NUMBER_ID ?? "1022524394270943";
const WABA_ID = process.env.QA_WA_WABA_ID ?? "qa-console";

interface SendRequest {
  phone: string;
  text?: string;
  interactiveId?: string;
}

function buildTextPayload(phone: string, text: string) {
  const wamid = `wamid.QA${crypto.randomUUID().replace(/-/g, "")}`;
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: WABA_ID,
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: phone,
                phone_number_id: PHONE_NUMBER_ID,
              },
              contacts: [{ profile: { name: "QA Console" }, wa_id: phone }],
              messages: [
                {
                  from: phone,
                  id: wamid,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: "text",
                  text: { body: text },
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };
}

function buildInteractivePayload(phone: string, interactiveId: string) {
  const wamid = `wamid.QA${crypto.randomUUID().replace(/-/g, "")}`;
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: WABA_ID,
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: phone,
                phone_number_id: PHONE_NUMBER_ID,
              },
              contacts: [{ profile: { name: "QA Console" }, wa_id: phone }],
              messages: [
                {
                  from: phone,
                  id: wamid,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: "interactive",
                  interactive: {
                    type: "button_reply",
                    button_reply: { id: interactiveId, title: interactiveId },
                  },
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };
}

function sign(body: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  return `sha256=${hmac.digest("hex")}`;
}

export async function POST(req: Request) {
  if (!WHATSAPP_APP_SECRET) {
    return NextResponse.json(
      { error: "WHATSAPP_APP_SECRET no configurada en env" },
      { status: 500 }
    );
  }

  let body: SendRequest;
  try {
    body = (await req.json()) as SendRequest;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.phone || !PROFILE_BY_PHONE.has(body.phone)) {
    return NextResponse.json(
      { error: `Phone no autorizado: ${body.phone}` },
      { status: 403 }
    );
  }

  if (!body.text && !body.interactiveId) {
    return NextResponse.json(
      { error: "Necesitas text o interactiveId" },
      { status: 400 }
    );
  }

  const payload = body.interactiveId
    ? buildInteractivePayload(body.phone, body.interactiveId)
    : buildTextPayload(body.phone, body.text!);

  const payloadStr = JSON.stringify(payload);
  const signature = sign(payloadStr, WHATSAPP_APP_SECRET);
  const sentAt = Date.now();

  let upstream: Response;
  try {
    upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signature,
      },
      body: payloadStr,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Falla red al webhook: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  const upstreamText = await upstream.text().catch(() => "");

  return NextResponse.json({
    ok: upstream.ok,
    status: upstream.status,
    upstreamBody: upstreamText.slice(0, 500),
    sentAt,
    payloadSize: payloadStr.length,
    wamid: payload.entry[0].changes[0].value.messages[0].id,
  });
}
