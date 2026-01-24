import { NavBar } from "./NavBar";
import { getMemberSession } from "@/app/member/actions";

export async function NavBarWrapper() {
  // Use full session lookup so we only treat real accounts as signed-in
  const member = await getMemberSession();
  const isAuthenticated = !!member?.id;

  return <NavBar isAuthenticated={isAuthenticated} />;
}
