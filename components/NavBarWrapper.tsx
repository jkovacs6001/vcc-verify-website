import { NavBar } from "./NavBar";
import { getMemberSession } from "@/app/member/actions";

export async function NavBarWrapper() {
  const member = await getMemberSession();
  const isAuthenticated = !!member?.id;

  // Hide "Apply" if member has already submitted a verification application
  const hasActiveApplication =
    isAuthenticated &&
    member?.status !== null &&
    member?.status !== undefined;

  return <NavBar isAuthenticated={isAuthenticated} hasActiveApplication={hasActiveApplication} />;
}
