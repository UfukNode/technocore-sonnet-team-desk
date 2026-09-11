"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  CONTEST,
  ballot,
  claim,
  compact,
  findLaunch,
  findOwnRegistration,
  findReceipt,
  isWithinContest,
  normalizeMembers,
  normalizeXAccount,
  receiptStatus,
  registration,
  roster,
  submission,
  teamRequest,
  wordProposal,
} = require("../lib/protocol");

const DIDS = [
  "did:key:z6Mkt9W7ZFhqDUgVYA6hx6sCfAacc3x1sQhVnioh8KET2rAu",
  "did:key:z6Mkp6HkpCpcfHjLwPZssQeJScseu6bG4zKXCiAbmunZBJyT",
  "did:key:z6MkgNzeXHT7LqyLJwEj2vf47BbLVnDCy7vC6b7tAsa4BKNJ",
  "did:key:z6Mkj1fuV7UmrE6kU1JtbdSVQiRbbATKULarqbNdJw7kPGYA",
];
const REFEREE = "did:key:z6MkowHQwsx9xr84WbWN3YCnKutyBnBXkT1ChKY4uEAAMzte";
const MANIFEST_SHA256 = "0c87c41b8b33bdd8641f77c9e481a12f2758a0e27d47b90452b1c0a2020a9547";

test("builds the exact official writer registration shape", () => {
  assert.deepEqual(registration({ role: "writer", xAccountUrl: "@ufukdegen", requestId: "register-1" }), {
    type: "sonnet.register.v1",
    contest_id: "sonnet-2",
    role: "writer",
    x_account_url: "https://x.com/ufukdegen",
    request_id: "register-1",
  });
  assert.equal(compact(registration({ role: "voter", requestId: "vote-reg" })), '{"type":"sonnet.register.v1","contest_id":"sonnet-2","role":"voter","request_id":"vote-reg"}');
});

test("validates team IDs and identical 4-8 member rosters", () => {
  assert.deepEqual(teamRequest({ gameId: "Ufuk_Sonnet", requestId: "room-1" }), {
    type: "sonnet.team-request.v1", contest_id: "sonnet-2", game_id: "ufuk_sonnet", request_id: "room-1",
  });
  const value = roster({ gameId: "ufuk", poemRoom: "d-sonnet-2-team-ufuk", roomGeneration: 2, members: DIDS, requestId: "roster-1" });
  assert.equal(value.members.length, 4);
  assert.equal(value.room_generation, 2);
  assert.throws(() => normalizeMembers(DIDS.slice(0, 3)), /4-8/);
  assert.throws(() => normalizeMembers([DIDS[0], DIDS[0], DIDS[2], DIDS[3]]), /unique/);
});

test("builds word, submission, ballot, and claim records without extra fields", () => {
  const hash = "a".repeat(64);
  assert.equal(wordProposal({ gameId: "a", roomGeneration: 1, version: 3, previousStateHash: hash, word: "Light,", requestId: "word-4" }).word, "Light,");
  assert.equal(submission({ gameId: "a", poemRoom: "d-sonnet-2-team-a", roomGeneration: 1, finalVersion: 99, poemSha256: hash, xPostIds: ["123456"], requestId: "submit-1" }).x_post_ids[0], "123456");
  assert.equal(ballot({ did: DIDS[0], entryId: "entry-1", requestId: "ballot-1" }).voter_did, DIDS[0]);
  assert.equal(claim({ destination: "destination-1", requestId: "claim-1" }).destination, "destination-1");
  assert.throws(() => wordProposal({ gameId: "a", roomGeneration: 1, version: 0, previousStateHash: hash, word: "two words", requestId: "x" }), /exactly one/);
});

test("recognizes launch and only trusts a matching referee receipt", () => {
  const referee = REFEREE;
  const messages = [
    { from: referee, sig: "signed", text: JSON.stringify({ type: "sonnet.launch.v1", status: "open", rooms_provisioned: true, configuration: { contest_id: "sonnet-2", referee }, package: { sha256: MANIFEST_SHA256 } }) },
    { from: DIDS[0], text: JSON.stringify({ type: "sonnet.register.v1", contest_id: "sonnet-2", role: "writer", request_id: "r1" }) },
    { from: referee, text: JSON.stringify({ type: "sonnet.registration-receipt.v1", contest_id: "sonnet-2", request_id: "r1", status: "accepted" }) },
  ];
  const launch = findLaunch(messages, referee);
  const own = findOwnRegistration(messages, DIDS[0]);
  const receipt = findReceipt(messages, launch.refereeDid, own);
  assert.equal(launch.refereeDid, referee);
  assert.equal(receiptStatus(receipt.record), "accepted");
  assert.equal(findReceipt(messages, DIDS[2], own), null);
  assert.equal(findLaunch(messages, ""), null);
  assert.equal(findLaunch(messages, DIDS[2]), null);
  messages.push({ from: DIDS[2], sig: "signed", text: JSON.stringify({ type: "sonnet.launch.v1", status: "open", rooms_provisioned: true, configuration: { contest_id: "sonnet-2", referee: DIDS[2] }, package: { sha256: MANIFEST_SHA256 } }) });
  assert.equal(findLaunch(messages, referee).refereeDid, referee);
});

test("uses the configured seven-day contest window", () => {
  assert.equal(isWithinContest(new Date("2026-09-11T11:59:59Z")), "waiting");
  assert.equal(isWithinContest(new Date(CONTEST.opening)), "live");
  assert.equal(isWithinContest(new Date(CONTEST.deadline)), "live");
  assert.equal(isWithinContest(new Date("2026-09-18T12:00:01Z")), "closed");
  assert.equal(normalizeXAccount("https://twitter.com/UfukNode/"), "https://x.com/UfukNode");
});
