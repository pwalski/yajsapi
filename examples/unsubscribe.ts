import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { rest } from "yajsapi";

dayjs.extend(utc);
const { Configuration, Market } = rest;

async function unlist_offers(conf: any): Promise<void> {
  const client = await conf.market();
  const market_api = new Market(client);
  for await (const subscription of market_api.subscriptions()) {
    console.log("subscription:", subscription);
    subscription.delete();
  }
  console.log("done");
}

unlist_offers(new Configuration());
