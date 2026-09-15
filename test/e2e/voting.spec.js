"use strict";

const crypto = require("node:crypto");
const { test, expect } = require("@playwright/test");

const REFEREE = "did:key:z6MkowHQwsx9xr84WbWN3YCnKutyBnBXkT1ChKY4uEAAMzte";
const MANIFEST_SHA256 = "0c87c41b8b33bdd8641f77c9e481a12f2758a0e27d47b90452b1c0a2020a9547";
const ENTRY_ID = "t-flop-babula";

function privateKeyFixture() {
  const { privateKey } = crypto.generateKeyPairSync("ed25519");
  return privateKey.export({ format: "jwk" });
}

function message(seq, from, record) {
  return { seq, ts: new Date().toISOString(), from, text: JSON.stringify(record), nonce: String(seq), sig: "x".repeat(86) };
}

const LAUNCH = message(1, REFEREE, {
  type: "sonnet.launch.v1",
  contest_id: "sonnet-2",
  referee_did: REFEREE,
  manifest_sha256: MANIFEST_SHA256,
  status: "open",
  rooms_provisioned: true,
});

const SUBMISSION = message(2, REFEREE, {
  type: "sonnet.receipt.v1",
  contest_id: "sonnet-2",
  status: "accepted",
  entry_id: ENTRY_ID,
  game_id: "babula",
  poem_room: "d-sonnet-2-team-babula",
});

/**
 * The contest as it actually stands: the launch is published, entries are in, and
 * the registration room has rotated past this DID's registration, which is the
 * state every voter reaches about half an hour after registering.
 */
async function mockLiveContest(page, { registrationMessages = [], voteMessages = [] } = {}) {
  await page.route("**/api/room-owners/**", async (route) => {
    const room = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { room, owner: room === "d-sonnet-2-rules" ? REFEREE : null } }),
    });
  });
  await page.route("**/api/rooms/**", async (route) => {
    const room = decodeURIComponent(new URL(route.request().url()).pathname.split("/").at(-1));
    const messages = room === "d-sonnet-2-rules" ? [LAUNCH]
      : room === "mb-sonnet-2-submissions" ? [SUBMISSION]
      : room === "mb-sonnet-2-registration" ? registrationMessages
      : room === "mb-sonnet-2-votes" ? voteMessages
      : [];
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { room, generation: 1, count: messages.length, first_seq: messages[0]?.seq ?? null, last_seq: messages.at(-1)?.seq ?? 0, messages } }),
    });
  });
}

async function connect(page) {
  await page.locator("#keyFile").setInputFiles({
    name: "private-key.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ privateKeyJwk: privateKeyFixture() })),
  });
  await expect(page.locator("#identityReady")).toBeVisible();
  return page.locator("#didFull").textContent();
}

/**
 * The bug this covers cost real votes. The referee answers every ballot in the votes
 * room on its own, and while the registration room was flooded it was answering
 * thousands of ballots and almost no voter registrations. This screen nonetheless
 * required a registration receipt before it would let the button work, so a voter
 * the referee would have counted sat in front of a grey button instead.
 */
test("an unanswered voter registration does not disable the ballot", async ({ page }) => {
  await mockLiveContest(page);
  await page.goto("/");
  await connect(page);

  await page.locator('[data-view-target="submit"]').click();
  await page.locator("#voteEntryId").fill(ENTRY_ID);
  await page.locator("#voteEntryId").blur();

  await expect(page.locator("#voteButton")).toBeEnabled();
  await expect(page.locator("#voteNote")).toContainText("has not answered your voter registration yet");
});

test("the referee's own answer to the ballot is shown", async ({ page }) => {
  await mockLiveContest(page, { voteMessages: [] });
  await page.goto("/");
  const did = await connect(page);

  await page.unroute("**/api/rooms/**");
  await mockLiveContest(page, {
    voteMessages: [message(40, REFEREE, {
      type: "sonnet.receipt.v1",
      contest_id: "sonnet-2",
      sender_did: did,
      entry_id: ENTRY_ID,
      status: "rejected",
      reason: "voter: verified pre-start evidence required",
    })],
  });

  await page.locator('[data-view-target="submit"]').click();
  await page.locator("#refreshEntriesButton").click();
  await expect(page.locator("#voteNote")).toContainText("verified pre-start evidence required");
});

test("a rejected registration still blocks the ballot", async ({ page }) => {
  const seedPage = page;
  await mockLiveContest(seedPage);
  await seedPage.goto("/");
  const did = await connect(seedPage);

  await seedPage.unroute("**/api/rooms/**");
  await mockLiveContest(seedPage, {
    registrationMessages: [
      message(10, did, { type: "sonnet.register.v1", contest_id: "sonnet-2", role: "voter", request_id: "reg-voter-1" }),
      message(11, REFEREE, { type: "sonnet.receipt.v1", contest_id: "sonnet-2", request_id: "reg-voter-1", sender_did: did, role: "voter", status: "rejected", reason: "voter: verified pre-start evidence required" }),
    ],
  });

  await seedPage.locator('[data-view-target="submit"]').click();
  await seedPage.locator("#refreshAllButton").click();
  await seedPage.locator("#voteEntryId").fill(ENTRY_ID);
  await seedPage.locator("#voteEntryId").blur();

  await expect(seedPage.locator("#voteButton")).toBeDisabled();
});

/**
 * The kept receipt is the one thing a participant could forge to their own screen,
 * so it is only believed with the referee's signature on it. A receipt signed by
 * anyone else has to count for nothing.
 */
test("a receipt not signed by the referee is ignored", async ({ page }) => {
  await mockLiveContest(page);
  await page.goto("/");
  const did = await connect(page);

  await page.evaluate(([participant, referee]) => {
    localStorage.setItem(`sonnet-receipt-${participant}`, JSON.stringify({
      from: referee,
      nonce: "1",
      sig: "A".repeat(86),
      text: JSON.stringify({ type: "sonnet.receipt.v1", contest_id: "sonnet-2", sender_did: participant, role: "voter", status: "accepted", request_id: "reg-voter-1" }),
    }));
  }, [did, REFEREE]);

  await page.locator("#refreshAllButton").click();
  await page.locator('[data-view-target="submit"]').click();
  await page.locator("#voteEntryId").fill(ENTRY_ID);
  await page.locator("#voteEntryId").blur();

  // The button stays usable, because a ballot is the referee's call, but the screen
  // must not have been talked into reporting an acceptance that never happened.
  await expect(page.locator("#voteNote")).toContainText("has not answered your voter registration yet");
});
