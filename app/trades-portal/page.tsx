import { redirect } from "next/navigation";
import { getMyTradeWorker } from "@/app/actions/trades-portal";

export default async function TradesPortalIndexPage() {
  const worker = await getMyTradeWorker();

  if (worker) {
    redirect("/trades-portal/dashboard");
  }

  redirect("/trades-portal/sign-in");
}
