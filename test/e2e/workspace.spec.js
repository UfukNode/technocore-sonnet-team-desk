"use strict";

const crypto = require("node:crypto");
const { test, expect } = require("@playwright/test");

const TEAMMATES = [
  "did:key:z6Mkp6HkpCpcfHjLwPZssQeJScseu6bG4zKXCiAbmunZBJyT",
  "did:key:z6MkgNzeXHT7LqyLJwEj2vf47BbLVnDCy7vC6b7tAsa4BKNJ",
  "did:key:z6Mkj1fuV7UmrE6kU1JtbdSVQiRbbATKULarqbNdJw7kPGYA",
];

const REFEREE = "did:key:z6MkowHQwsx9xr84WbWN3YCnKutyBnBXkT1ChKY4uEAAMzte";
const MANIFEST_SHA256 = "0c87c41b8b33bdd8641f77c9e481a12f2758a0e27d47b90452b1c0a2020a9547";

function privateKeyFixture() {
  const { privateKey } = crypto.generateKeyPairSync("ed25519");
  return privateKey.export({ format: "jwk" });
}

async function mockEmptyRooms(page) {
  await page.route("**/api/room-owners/**", async (route) => {
    const room = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, owner: null } }) });
  });
  await page.route("**/api/rooms/**", async (route) => {
    const room = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: { room, generation: 0, count: 0, first_seq: null, last_seq: 0, messages: [] } }),
    });
  });
}

test("imports a DID and builds a four-writer draft in both languages", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await mockEmptyRooms(page);
  await page.goto("/");

  await page.locator("#keyFile").setInputFiles({
    name: "private-key.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ privateKeyJwk: privateKeyFixture() })),
  });
  await expect(page.locator("#identityReady")).toBeVisible();
  await expect(page.locator("#didFull")).toHaveText(/^did:key:z6Mk/);

  await page.getByRole("button", { name: "TR", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Agentını bağla" })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();

  await page.locator('[data-view-target="teams"]').click();
  await page.locator("#gameId").fill("test-sonnet");
  await page.locator("#gameId").blur();
  for (const did of TEAMMATES) {
    await page.locator("#memberDidInput").fill(did);
    await page.locator("#addMemberButton").click();
  }
  await expect(page.locator("#memberCount")).toHaveText("4 / 8");
  await expect(page.locator("#memberList .member-row")).toHaveCount(4);

  for (const view of ["workspace", "submit", "results", "agent"]) {
    await page.locator(`[data-view-target="${view}"]`).click();
    await expect(page.locator(`[data-view="${view}"]`)).toBeVisible();
  }
  expect(consoleErrors).toEqual([]);
});

test("has no horizontal overflow on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockEmptyRooms(page);
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await page.screenshot({ path: "/tmp/sonnet-mobile-verified.png", fullPage: true });
});

test("completes registration, room request, and roster signing without sending the private key", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-11T12:10:00Z"));
  const privateJwk = privateKeyFixture();
  const publicKey = crypto.createPublicKey({ key: privateJwk, format: "jwk" });
  const rooms = new Map();
  const writes = [];
  let sequence = 10;

  const addMessage = (room, from, text, signature = "A".repeat(86)) => {
    const message = { seq: ++sequence, ts: "2026-09-11T12:10:00.000000Z", from, text, nonce: 1, sig: signature };
    rooms.set(room, [...(rooms.get(room) || []), message]);
    return message;
  };

  addMessage("d-sonnet-2-rules", REFEREE, JSON.stringify({
    type: "sonnet.launch.v1", status: "open", rooms_provisioned: true,
    configuration: { contest_id: "sonnet-2", referee: REFEREE },
    package: { sha256: MANIFEST_SHA256 },
  }));

  for (const [index, did] of TEAMMATES.entries()) {
    const requestId = `teammate-${index}`;
    addMessage("mb-sonnet-2-registration", did, JSON.stringify({ type: "sonnet.register.v1", contest_id: "sonnet-2", role: "writer", x_account_url: `https://x.com/writer${index}`, request_id: requestId }));
    addMessage("mb-sonnet-2-registration", REFEREE, JSON.stringify({ type: "sonnet.registration-receipt.v1", contest_id: "sonnet-2", for_request_id: requestId, status: "accepted" }));
  }

  await page.route("**/api/room-owners/**", async (route) => {
    const room = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, owner: REFEREE } }) });
  });

  await page.route("**/api/rooms/**", async (route) => {
    const request = route.request();
    const room = new URL(request.url()).pathname.split("/").at(-1);
    if (request.method() === "POST") {
      const signed = request.postDataJSON();
      writes.push({ room, signed });
      const stored = addMessage(room, signed.did, signed.text, signed.sig);
      const record = JSON.parse(signed.text);
      if (record.type === "sonnet.register.v1") {
        addMessage(room, REFEREE, JSON.stringify({ type: "sonnet.registration-receipt.v1", contest_id: "sonnet-2", for_request_id: record.request_id, status: "accepted" }));
      }
      if (record.type === "sonnet.team-request.v1") {
        addMessage(room, REFEREE, JSON.stringify({ type: "sonnet.team-setup-receipt.v1", contest_id: "sonnet-2", for_request_id: record.request_id, status: "accepted", game_id: record.game_id, poem_room: `d-sonnet-2-team-${record.game_id}`, room_generation: 1 }));
      }
      if (record.type === "sonnet.roster.v1") {
        for (const [index, did] of TEAMMATES.entries()) {
          addMessage(room, did, JSON.stringify({ ...record, request_id: `roster-teammate-${index}` }));
        }
        addMessage(room, REFEREE, JSON.stringify({ type: "sonnet.roster-ready.v1", contest_id: "sonnet-2", for_request_id: record.request_id, status: "accepted", game_id: record.game_id }));
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, count: 1, last_seq: stored.seq, messages: [stored] } }) });
      return;
    }
    const messages = rooms.get(room) || [];
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, generation: room.startsWith("d-sonnet-2-team-") ? 1 : 0, count: messages.length, first_seq: messages[0]?.seq ?? null, last_seq: messages.at(-1)?.seq ?? 0, messages } }) });
  });

  await page.goto("/");
  await page.locator("#keyFile").setInputFiles({ name: "private-key.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ privateKeyJwk: privateJwk })) });
  await expect(page.locator("#launchBadge")).toContainText("Contest live");
  await expect(page.locator("#registerButton")).toBeEnabled();
  await page.locator("#xHandle").fill("testwriter");
  await page.locator("#registerButton").click();
  await expect(page.locator("#registrationState")).toHaveText("Accepted");

  const registrationWrite = writes.find(({ signed }) => JSON.parse(signed.text).type === "sonnet.register.v1");
  expect(registrationWrite.signed.privateKeyJwk).toBeUndefined();
  expect(registrationWrite.signed.d).toBeUndefined();
  expect(crypto.verify(
    null,
    Buffer.from(`${registrationWrite.room}|${registrationWrite.signed.nonce}|${registrationWrite.signed.text}`),
    publicKey,
    Buffer.from(registrationWrite.signed.sig, "base64url"),
  )).toBe(true);

  await page.locator('[data-view-target="teams"]').click();
  await page.locator("#gameId").fill("flow-team");
  await page.locator("#gameId").blur();
  for (const did of TEAMMATES) {
    await page.locator("#memberDidInput").fill(did);
    await page.locator("#addMemberButton").click();
  }
  await expect(page.locator("#requestRoomButton")).toBeEnabled();
  await page.locator("#requestRoomButton").click();
  await expect(page.locator("#signRosterButton")).toBeEnabled();
  await page.locator("#signRosterButton").click();

  const rosterWrite = writes.find(({ signed }) => JSON.parse(signed.text).type === "sonnet.roster.v1");
  const roster = JSON.parse(rosterWrite.signed.text);
  expect(roster.members).toHaveLength(4);
  expect(roster.room_generation).toBe(1);
  expect(rosterWrite.signed.privateKeyJwk).toBeUndefined();

  await page.locator('[data-view-target="workspace"]').click();
  await page.locator("#wordInput").fill("did");
  await page.locator(".advanced-state summary").click();
  await page.locator("#stateHash").fill("a".repeat(64));
  await expect(page.locator("#sendWordButton")).toBeEnabled();
});

test("keeps waiting for the referee after the registration room forgets the request", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-11T12:10:00Z"));
  const privateJwk = privateKeyFixture();
  const rooms = new Map();
  let sequence = 10;
  let registrationEvicted = false;

  const addMessage = (room, from, text, signature = "A".repeat(86)) => {
    const message = { seq: ++sequence, ts: "2026-09-11T12:10:00.000000Z", from, text, nonce: 1, sig: signature };
    rooms.set(room, [...(rooms.get(room) || []), message]);
    return message;
  };

  addMessage("d-sonnet-2-rules", REFEREE, JSON.stringify({
    type: "sonnet.launch.v1", status: "open", rooms_provisioned: true,
    configuration: { contest_id: "sonnet-2", referee: REFEREE },
    package: { sha256: MANIFEST_SHA256 },
  }));

  await page.route("**/api/room-owners/**", async (route) => {
    const room = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, owner: REFEREE } }) });
  });

  await page.route("**/api/rooms/**", async (route) => {
    const request = route.request();
    const room = new URL(request.url()).pathname.split("/").at(-1);
    if (request.method() === "POST") {
      const signed = request.postDataJSON();
      const stored = addMessage(room, signed.did, signed.text, signed.sig);
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, count: 1, last_seq: stored.seq, messages: [stored] } }) });
      return;
    }
    // The ring has turned over: the participant's own registration is gone from the
    // room while the referee, running behind, has not answered it yet.
    let messages = rooms.get(room) || [];
    if (registrationEvicted) {
      messages = messages.filter((message) => JSON.parse(message.text).type !== "sonnet.register.v1");
    }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, generation: 0, count: messages.length, first_seq: messages[0]?.seq ?? null, last_seq: messages.at(-1)?.seq ?? 0, messages } }) });
  });

  await page.goto("/");
  await page.locator("#keyFile").setInputFiles({ name: "private-key.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ privateKeyJwk: privateJwk })) });
  await expect(page.locator("#launchBadge")).toContainText("Contest live");
  await page.locator('[data-role="voter"]').click();
  await page.locator("#registerButton").click();
  await expect(page.locator("#registrationState")).toContainText("waiting for referee");

  // Reload with the registration no longer in the room. Without the kept copy the
  // desk reads as never registered, and registering again would queue a second
  // request behind the first.
  registrationEvicted = true;
  await page.reload();
  await page.locator("#keyFile").setInputFiles({ name: "private-key.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ privateKeyJwk: privateJwk })) });
  await expect(page.locator("#registrationState")).toContainText("waiting for referee");
  await expect(page.locator("#roleLockNote")).toContainText("Voter");

  // The referee answers the original request id, and that answer still lands.
  const registration = (rooms.get("mb-sonnet-2-registration") || []).map((message) => JSON.parse(message.text)).find((record) => record.type === "sonnet.register.v1");
  addMessage("mb-sonnet-2-registration", REFEREE, JSON.stringify({ type: "sonnet.receipt.v1", contest_id: "sonnet-2", request_id: registration.request_id, role: "voter", status: "accepted" }));
  await expect(page.locator("#registrationState")).toHaveText("Accepted", { timeout: 20000 });
});

test("says why the ballot button will not sign", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-09-11T12:10:00Z"));
  const privateJwk = privateKeyFixture();
  const rooms = new Map();
  let sequence = 10;
  let acceptRegistration = false;

  const addMessage = (room, from, text, signature = "A".repeat(86)) => {
    const message = { seq: ++sequence, ts: "2026-09-11T12:10:00.000000Z", from, text, nonce: 1, sig: signature };
    rooms.set(room, [...(rooms.get(room) || []), message]);
    return message;
  };

  addMessage("d-sonnet-2-rules", REFEREE, JSON.stringify({
    type: "sonnet.launch.v1", status: "open", rooms_provisioned: true,
    configuration: { contest_id: "sonnet-2", referee: REFEREE },
    package: { sha256: MANIFEST_SHA256 },
  }));
  // One accepted entry to choose, so the note is never just about an empty field.
  addMessage("mb-sonnet-2-submissions", REFEREE, JSON.stringify({ type: "sonnet.receipt.v1", contest_id: "sonnet-2", request_id: "s1", entry_id: "wordcore", game_id: "wordcore", status: "accepted" }));

  await page.route("**/api/room-owners/**", async (route) => {
    const room = new URL(route.request().url()).pathname.split("/").at(-1);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, owner: REFEREE } }) });
  });
  await page.route("**/api/poem-words/**", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room: "d-sonnet-2-team-wordcore", generation: 1, accepted: 0, words: [] } }) });
  });
  await page.route("**/api/rooms/**", async (route) => {
    const request = route.request();
    const room = new URL(request.url()).pathname.split("/").at(-1);
    if (request.method() === "POST") {
      const signed = request.postDataJSON();
      const stored = addMessage(room, signed.did, signed.text, signed.sig);
      const record = JSON.parse(signed.text);
      if (record.type === "sonnet.register.v1" && acceptRegistration) {
        addMessage(room, REFEREE, JSON.stringify({ type: "sonnet.receipt.v1", contest_id: "sonnet-2", request_id: record.request_id, role: record.role, status: "accepted" }));
      }
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, count: 1, last_seq: stored.seq, messages: [stored] } }) });
      return;
    }
    const messages = rooms.get(room) || [];
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, data: { room, generation: 0, count: messages.length, first_seq: messages[0]?.seq ?? null, last_seq: messages.at(-1)?.seq ?? 0, messages } }) });
  });

  await page.goto("/");
  await page.locator('[data-view-target="submit"]').click();
  // Before a key is chosen at all.
  await expect(page.locator("#voteNote")).toContainText("private key");

  await page.locator("#keyFile").setInputFiles({ name: "private-key.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ privateKeyJwk: privateJwk })) });
  await page.locator('[data-view-target="agent"]').click();
  await page.locator('[data-role="voter"]').click();
  await page.locator("#registerButton").click();
  await page.locator('[data-view-target="submit"]').click();
  await page.locator("#voteEntryId").fill("wordcore");
  // The entry is chosen and the role is right, so the only thing left is the wait,
  // and that is what the note has to name.
  await expect(page.locator("#voteNote")).toContainText("has not accepted your voter registration yet");
  await expect(page.locator("#voteButton")).toBeDisabled();

  // Once the referee answers, the note clears and the button signs.
  acceptRegistration = true;
  const registration = (rooms.get("mb-sonnet-2-registration") || []).map((message) => JSON.parse(message.text)).find((record) => record.type === "sonnet.register.v1");
  addMessage("mb-sonnet-2-registration", REFEREE, JSON.stringify({ type: "sonnet.receipt.v1", contest_id: "sonnet-2", request_id: registration.request_id, role: "voter", status: "accepted" }));
  await expect(page.locator("#voteButton")).toBeEnabled({ timeout: 20000 });
  await expect(page.locator("#voteNote")).toHaveText("");
});
