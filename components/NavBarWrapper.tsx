import { cookies } from "next/headers";
import { NavBar } from "./NavBar";

export async function NavBarWrapper() {
  const cookieStore = await cookies();
  const memberEmail = cookieStore.get("member_email")?.value;
  const isAuthenticated = !!memberEmail;

  return <NavBar isAuthenticated={isAuthenticated} />;
}
