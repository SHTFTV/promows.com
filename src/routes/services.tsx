import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  component: () => <Outlet />,
});
