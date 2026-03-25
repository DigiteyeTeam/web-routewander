import { redirect } from "next/navigation";

/** ลิงก์สั้น: /profile-view → หน้าแก้โปรไฟล์ไกด์จริง */
export default function ProfileViewRedirectPage() {
  redirect("/guide-manager/profile-view");
}
