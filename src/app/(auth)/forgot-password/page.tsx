import { Metadata } from "next";
import ForgotPasswordContent from "./ForgotPasswordContent";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Khôi phục mật khẩu tài khoản Pesse Finance của bạn.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
