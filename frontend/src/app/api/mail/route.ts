import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface QueryResponse {
  result: string;
}

interface QueryRequest {
  query: string;
  prompt: string;
}

const promptMail = "Your output should be an HTML-formatted email response that answers the question.Only output the HTML body of the email, nothing else."

// Déplacer la fonction AVANT les exports et enlever 'export'
async function callSquadAgent(query: string, reqNumber: string) {
  const start = Date.now();
  const timer = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    console.log(
      `[Squad Agent] Requête #${reqNumber} toujours en cours... (${elapsed}s)`,
    );
  }, 5000);

  try {
    const response = await fetch("https://raise.logi-green.com/agent/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, prompt: promptMail } as QueryRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as QueryResponse;
    return { response: data.result };
  } finally {
    clearInterval(timer);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Créer l'objet structuré avec les données reçues
    const mailObject = {
      fromAddress: body.fromAddress ?? body.from?.value?.[0]?.address ?? "",
      threadId: body.threadId ?? "",
      fromName: body.fromName ?? body.from?.value?.[0]?.name ?? "",
      subject: body.subject ?? "",
      body: body.text ?? body.body ?? "",
    };

    console.log("Mail object created:", mailObject);
    const response = await callSquadAgent(
      `Réponds à cet email de ${mailObject.fromName} (${mailObject.fromAddress}) : ${mailObject.body}`,
      "mail-processing",
    );
    //  verifie que tout  est defini
    if (
      !mailObject.fromAddress ||
      !mailObject.threadId ||
      !mailObject.fromName ||
      !mailObject.subject ||
      !mailObject.body
    ) {
      return NextResponse.json(
        { error: "Missing required fields in mail data" },
        { status: 400 },
      );
    }

    // Envoyer vers le webhook n8n
    try {
      const webhookResponse = await fetch(
        "https://n8n.srv753028.hstgr.cloud/webhook-test/0912f56b-4eaf-4ad4-a759-957082ee64bb",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...mailObject,
            response: response.response,
          }),
        },
      );

      if (!webhookResponse.ok) {
        console.error("Webhook call failed:", webhookResponse.status);
      } else {
        console.log("Webhook called successfully");
      }
    } catch (webhookError) {
      console.error("Error calling webhook:", webhookError);
    }
    return NextResponse.json(
      {
        message: "Mail data processed successfully",
        response: response.response,
        data: mailObject,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process mail data" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Mail endpoint",
      description: "This is the mail processing endpoint",
    },
    { status: 200 },
  );
}
