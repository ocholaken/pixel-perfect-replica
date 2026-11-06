import { createFileRoute } from "@tanstack/react-router";
import { Account } from "../components/Account";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    created: search.created === true || search.created === "true",
  }),
  component: Login,
});

function Login() {
  return <Account />;
}
