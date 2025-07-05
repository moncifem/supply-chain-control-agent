import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PROMPT_FILE_PATH = path.join(
  process.cwd(),
  "src/app/api/prompt/prompt.txt",
);

export async function GET() {
  try {
    // check si le fichier existe
    console.log("Checking if prompt file exists at:", PROMPT_FILE_PATH);
    const data = await fs.readFile(PROMPT_FILE_PATH, "utf8");
    return NextResponse.json({ prompt: data });
  } catch (error) {
    // Si le fichier n'existe pas, retourner un prompt vide
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ prompt: "" });
    }
    return NextResponse.json(
      { error: "Failed to read prompt file" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const promptText = (body.prompt as string) ?? "";

    // Écrire directement le prompt dans le fichier txt
    await fs.writeFile(PROMPT_FILE_PATH, promptText, "utf8");

    return NextResponse.json(
      { message: "Prompt saved successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save prompt file" },
      { status: 500 },
    );
  }
}
