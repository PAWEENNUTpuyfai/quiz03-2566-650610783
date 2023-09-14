import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  readDB();
  const roomId = request.nextUrl.searchParams.get("roomId");

  const foundRoomId = DB.rooms.find((x) => x.roomId === roomId);
  if (!foundRoomId) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }
  const filtered = DB.messages.filter((ms) => ms.roomId === roomId);
  return NextResponse.json({ ok: true, messages: filtered });
};

export const POST = async (request) => {
  readDB();
  const body = await request.json();
  const roomId = body.roomId;
  const messageText = body.messageText;
  const foundRoomId = DB.rooms.find((x) => x.roomId === roomId);
  if (!foundRoomId) {
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );
  }

  const messageId = nanoid();
  DB.messages.push({ roomId, messageId, messageText });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId: messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();
  const role = payload.role;
  const body = await request.json();
  const messageId = body.messageId;
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  readDB();
  const foundMessage = DB.messages.find((x) => x.messageId === messageId);
  if (!foundMessage) {
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  }
  let filtered = DB.messages;
  filtered = filtered.filter((m) => m.messageId !== messageId);
  DB.messages = filtered;
  writeDB();
  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
