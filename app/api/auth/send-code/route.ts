import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "sms_not_configured",
      authMode: process.env.AUTH_MODE ?? "password",
      message: "短信验证码接口已预留，当前版本使用手机号 + 密码。"
    },
    { status: 501 }
  );
}
