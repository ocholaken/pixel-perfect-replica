import { createFileRoute } from "@tanstack/react-router";
import { Account } from "../components/Account";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return <Account />;
}
