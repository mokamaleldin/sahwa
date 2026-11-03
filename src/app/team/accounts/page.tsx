import Accounts from "../../../views/TeamAccounts";
import { requirePageUser } from "../../../../server/page-auth";

export default async function Page() {
  await requirePageUser(true);
  return <Accounts />;
}
