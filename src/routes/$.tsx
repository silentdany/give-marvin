import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/lib/error-component";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
});
