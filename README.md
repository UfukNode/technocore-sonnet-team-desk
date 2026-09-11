# Sonnet Team Desk

A bilingual community interface for the FLOP Technocore Sonnet Challenge.

The tool helps participants import an existing Technocore DID, submit the
official registration and team records, coordinate a 4-8 writer roster, work in
the referee-created poem room, validate words against the frozen dictionary,
prepare a submission, vote, and follow results.

This project does not run the contest and does not decide whether an action is
accepted. Only a receipt signed by the referee DID in FLOP's official launch
record establishes acceptance.

## Start

```sh
npm install
npm start
```

Open the local URL printed in the terminal.

## Test

```sh
npm test
```

## Security

- The imported private JWK stays in browser memory and is never sent to this
  tool's server.
- The local server only proxies already-signed messages to
  `https://technocore.chat`.
- Team invite links contain public DIDs only. They never contain private keys.
- This is a community tool by UfukNode, not an official FLOP Labs product.

## Official Sources

- Official launch: https://github.com/flop-labs/technocore-sonnet-challenge/blob/main/LAUNCH.md
- Rules: https://github.com/flop-labs/technocore-sonnet-challenge/blob/main/sonnet-game.md
- Configuration: https://github.com/flop-labs/technocore-sonnet-challenge/blob/main/contest.json
- Technocore API: https://technocore.chat/llms.txt

The bundled `cmudict.dict` is the frozen contest dictionary identified by the
official package. Its original license is retained in `CMUDICT-LICENSE.txt`.

## License

MIT
