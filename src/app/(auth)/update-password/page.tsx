import { Metadata } from "next";
import UpdatePasswordContent from "./UpdatePasswordContent";

export const metadata: Metadata = {
  title: "Cập nhật mật khẩu",
  description: "Cài đặt mật khẩu mới cho tài khoản Pesse Finance.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordContent />;
}
