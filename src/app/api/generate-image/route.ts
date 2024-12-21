import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { buffer } from "stream/consumers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text

    console.log(text);
    const url = new URL("https://lassnajmuldeen--sd-turbo-model-generate.modal.run/");

    // Adds given prompt to link
    url.searchParams.set("prompt",text)

    console.log("Requesting URL", url.toString());

    // Create fetch request to the url
    const response = await fetch(url.toString(),{
      method: "GET",
      headers: {
        "X_API_Key": process.env.API_KEY || "",
        Accept: "image/jpeg"
      },
    });

    // Error handling
    if (!response.ok){
      const errorText = await response.text();
      console.error("API Response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();

    const filename = `${crypto.randomUUID()}.jpg`
    
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/jpeg"
    })

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}