const Bluebird = require("bluebird");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const { props: yp, rest, utils } = require("yajsapi");
const { program } = require("commander");

dayjs.extend(utc);

const { Configuration, Market } = rest;
const { CancellationToken } = utils;
const cancellationToken = new CancellationToken();

async function list_offers(conf, subnetTag) {
  let client = await conf.market();
  let market_api = new Market(client);
  let dbuild = new yp.DemandBuilder();

  let idx = new yp.NodeInfo(subnetTag);
  idx.name.value = "some scanning node";
  dbuild.add(idx);

  let act = new yp.Activity();
  act.expiration.value = dayjs().utc().unix() * 1000;
  dbuild.add(act);

  const subscription = await market_api.subscribe(dbuild.properties(), dbuild.constraints());
  for await (const event of subscription.events(cancellationToken)) {
    console.log(`Offer: ${event.id()}`);
    console.log(`from ${event.issuer()}`);
    console.log(`props ${JSON.stringify(event.props(), null, 4)}`);
    console.log("\n\n");
  }
  await subscription.delete();
  console.log("done");
}

const promiseTimeout = (seconds) =>
  new Promise((resolve) =>
    setTimeout(() => {
      cancellationToken.cancel();
      resolve();
    }, seconds * 1000)
  );

program.option("--subnet-tag <subnet>", "set subnet name", "devnet-beta");
program.parse();
const options = program.opts();
console.log(`Using subnet: ${options.subnetTag}`);

Bluebird.Promise.any([list_offers(new Configuration(), options.subnetTag), promiseTimeout(4)]);
