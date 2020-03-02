const path = require("path")
const chai = require("chai")
const { Pact } = require("@pact-foundation/pact")
const chaiAsPromised = require("chai-as-promised")
const expect = chai.expect

const request = require('request');



chai.use(chaiAsPromised)

describe("Pact", () => {
  // (1) Create the Pact object to represent your provider
  const provider = new Pact({
    consumer: "TodoApp",
    provider: "TodoService",
    port: 1234,
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "INFO",
  })

  // this is the response you expect from your Provider
  const EXPECTED_BODY = [
    {
      id: 1,
      name: "Project 1",
      due: "2016-02-11T09:46:56.023Z",
      tasks: [
        { id: 1, name: "Do the laundry", done: true },
        { id: 2, name: "Do the dishes", done: false },
        { id: 3, name: "Do the backyard", done: false },
        { id: 4, name: "Do nothing", done: false },
      ],
    },
  ]


  context("when there are a list of projects", () => {
    describe("and there is a valid user session", () => {
      before(async () => {
          await provider.setup();
          // (3) add interactions to the Mock Server, as many as required
          console.log('asd');
          provider.addInteraction({
            // The 'state' field specifies a "Provider State"
            state: "i have a list of projects",
            uponReceiving: "a request for projects",
            withRequest: {
              method: "GET",
              path: "/projects",
              headers: {Accept: "application/json"},
            },
            willRespondWith: {
              status: 200,
              headers: {"Content-Type": "application/json"},
              body: EXPECTED_BODY,
            },
          });
        }
      )

      // (4) write your test(s)
      it("generates a list of TODOs for the main screen", async () => {

        const a = await new Promise((resolve, reject) => {
          request('http://localhost:1234/projects', { json: true }, (err, res, body) => {
            if (err) { reject(err)  } else {
              console.log(body.url);
              console.log(body.explanation);
              resolve(body)
            }
          });
        })
        console.log(a)
      })

      // (5) validate the interactions you've registered and expected occurred
      // this will throw an error if it fails telling you what went wrong
      // This should be performed once per interaction test
      afterEach(async () => provider.verify())

      // (6) write the pact file for this consumer-provider pair,
      // and shutdown the associated mock server.
      // You should do this only _once_ per Provider you are testing,
      // and after _all_ tests have run for that suite
      after(async () => provider.finalize())

    })
  })

})
