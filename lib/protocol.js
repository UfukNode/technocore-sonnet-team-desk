"use strict";

const crypto = require("node:crypto");

const CONTEST = Object.freeze({
  id: "sonnet-2",
  rulesVersion: "0.5",
  opening: "2026-09-11T12:00:00Z",
  deadline: "2026-09-18T12:00:00Z",
  identityCutoff: "2026-09-11T12:00:00Z",
  poemPrize: 50000,
  voterPrize: 50000,
  refereeDid: "did:key:z6MkowHQwsx9xr84WbWN3YCnKutyBnBXkT1ChKY4uEAAMzte",
  manifestSha256: "0c87c41b8b33bdd8641f77c9e481a12f2758a0e27d47b90452b1c0a2020a9547",
});

const ROOMS = Object.freeze({
  rules: "d-sonnet-2-rules",
  registration: "mb-sonnet-2-registration",
  discovery: "mb-sonnet-2-discovery",
  campaign: "mb-sonnet-2-campaign",
  votes: "mb-sonnet-2-votes",
  submissions: "mb-sonnet-2-submissions",
  results: "d-sonnet-2-results",
});

const DID_RE = /^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{44}$/;
const GAME_ID_RE = /^[a-z0-9][a-z0-9_-]{0,15}$/;
const WORD_RE = /^[A-Za-z]+(?:'[A-Za-z]+)*[,.;:!?]?$/;

function requireDid(value, label = "DID") {
  const did = String(value || "").trim();
  if (!DID_RE.test(did)) throw new Error(`${label} must be an Ed25519 did:key.`);
  return did;
}

function requireGameId(value) {
  const gameId = String(value || "").trim().toLowerCase();
  if (!GAME_ID_RE.test(gameId)) {
    throw new Error("Game ID must be 1-16 lowercase letters, numbers, hyphens, or underscores.");
  }
  return gameId;
}

function requireRequestId(value) {
  const requestId = String(value || "").trim();
  if (!/^[A-Za-z0-9._:-]{1,96}$/.test(requestId)) {
    throw new Error("Request ID contains unsupported characters.");
  }
  return requestId;
}

function requestId(prefix = "request") {
  const safePrefix = String(prefix).replace(/[^a-z0-9_-]/gi, "-").slice(0, 24) || "request";
  return `${safePrefix}-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
}

function normalizeXAccount(value) {
  let text = String(value || "").trim();
  text = text.replace(/^@/, "").replace(/^https?:\/\/(?:www\.)?(?:twitter|x)\.com\//i, "").replace(/\/$/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(text)) throw new Error("Enter a valid X handle.");
  return `https://x.com/${text}`;
}

function normalizeMembers(values) {
  const members = values.map((value, index) => requireDid(value, `Member ${index + 1}`));
  if (members.length < 4 || members.length > 8) throw new Error("A team must contain 4-8 writers.");
  if (new Set(members).size !== members.length) throw new Error("Every roster DID must be unique.");
  return members;
}

function compact(record) {
  return JSON.stringify(record);
}

function registration({ role, xAccountUrl, requestId: id }) {
  if (!["writer", "voter", "organizer"].includes(role)) throw new Error("Invalid contest role.");
  const record = {
    type: "sonnet.register.v1",
    contest_id: CONTEST.id,
    role,
  };
  if (role === "writer") record.x_account_url = normalizeXAccount(xAccountUrl);
  record.request_id = requireRequestId(id);
  return record;
}

function teamRequest({ gameId, requestId: id }) {
  return {
    type: "sonnet.team-request.v1",
    contest_id: CONTEST.id,
    game_id: requireGameId(gameId),
    request_id: requireRequestId(id),
  };
}

function roster({ gameId, poemRoom, roomGeneration, members, requestId: id }) {
  const normalizedGameId = requireGameId(gameId);
  const expectedRoom = `d-${CONTEST.id}-team-${normalizedGameId}`;
  if (String(poemRoom) !== expectedRoom) throw new Error(`Poem room must be ${expectedRoom}.`);
  if (!Number.isSafeInteger(Number(roomGeneration)) || Number(roomGeneration) < 0) {
    throw new Error("Room generation must be a non-negative integer from the setup receipt.");
  }
  return {
    type: "sonnet.roster.v1",
    contest_id: CONTEST.id,
    game_id: normalizedGameId,
    poem_room: expectedRoom,
    room_generation: Number(roomGeneration),
    members: normalizeMembers(members),
    request_id: requireRequestId(id),
  };
}

function withdraw({ gameId, requestId: id }) {
  return {
    type: "sonnet.withdraw.v1",
    contest_id: CONTEST.id,
    game_id: requireGameId(gameId),
    request_id: requireRequestId(id),
  };
}

function wordProposal({ gameId, roomGeneration, version, previousStateHash, word, requestId: id }) {
  const token = String(word || "").trim();
  if (!WORD_RE.test(token)) throw new Error("Add exactly one English word with optional allowed punctuation.");
  if (!Number.isSafeInteger(Number(version)) || Number(version) < 0) throw new Error("Version must be a non-negative integer.");
  const hash = String(previousStateHash || "").trim();
  if (!/^[a-f0-9]{64}$/i.test(hash)) throw new Error("Use the state hash from the latest referee receipt.");
  return {
    type: "sonnet.word.v1",
    contest_id: CONTEST.id,
    game_id: requireGameId(gameId),
    room_generation: Number(roomGeneration),
    version: Number(version),
    previous_state_hash: hash,
    word: token,
    request_id: requireRequestId(id),
  };
}

function submission({ gameId, poemRoom, roomGeneration, finalVersion, poemSha256, xPostIds, requestId: id }) {
  const ids = xPostIds.map((value) => String(value || "").trim()).filter(Boolean);
  if (!ids.length || ids.some((value) => !/^[0-9]{5,30}$/.test(value))) {
    throw new Error("Enter the numeric post ID from each X post in order.");
  }
  const game = requireGameId(gameId);
  const expectedRoom = `d-${CONTEST.id}-team-${game}`;
  if (poemRoom !== expectedRoom) throw new Error(`Poem room must be ${expectedRoom}.`);
  if (!Number.isSafeInteger(Number(finalVersion)) || Number(finalVersion) < 1) throw new Error("Final version is required.");
  if (!/^[a-f0-9]{64}$/i.test(String(poemSha256 || ""))) throw new Error("Poem SHA-256 is invalid.");
  return {
    type: "sonnet.submit.v1",
    contest_id: CONTEST.id,
    game_id: game,
    poem_room: expectedRoom,
    room_generation: Number(roomGeneration),
    final_version: Number(finalVersion),
    poem_sha256: String(poemSha256).toLowerCase(),
    x_post_ids: ids,
    request_id: requireRequestId(id),
  };
}

function ballot({ did, entryId, requestId: id }) {
  const entry = String(entryId || "").trim();
  if (!entry || entry.length > 128) throw new Error("Entry ID is required.");
  return {
    type: "sonnet.ballot.v1",
    contest_id: CONTEST.id,
    voter_did: requireDid(did),
    entry_id: entry,
    request_id: requireRequestId(id),
  };
}

function claim({ destination, requestId: id }) {
  const target = String(destination || "").trim();
  if (!target || target.length > 256) throw new Error("Payment destination is required.");
  return {
    type: "sonnet.claim.v1",
    contest_id: CONTEST.id,
    request_id: requireRequestId(id),
    destination: target,
  };
}

function parseRecord(text) {
  try {
    const value = JSON.parse(String(text));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function findDeep(record, keys) {
  if (!record || typeof record !== "object") return undefined;
  for (const key of keys) if (record[key] !== undefined) return record[key];
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const found = findDeep(value, keys);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function receiptStatus(record) {
  if (!record) return "none";
  const status = String(record.status || record.result || record.decision || "").toLowerCase();
  if (record.accepted === true || ["accepted", "registered", "ready", "ok", "success"].includes(status)) return "accepted";
  if (record.accepted === false || ["rejected", "invalid", "denied", "failed", "error"].includes(status)) return "rejected";
  return "pending";
}

function referencedRequestId(record) {
  return String(
    record?.request_id
    || record?.for_request_id
    || record?.in_reply_to?.request_id
    || record?.request?.request_id
    || "",
  );
}

function findOwnRegistration(messages, did) {
  return [...messages].reverse().map((message) => ({ message, record: parseRecord(message.text) })).find(({ message, record }) => (
    message.from === did
    && record?.type === "sonnet.register.v1"
    && record?.contest_id === CONTEST.id
  )) || null;
}

function findReceipt(messages, refereeDid, request) {
  if (!request || !refereeDid) return null;
  const target = request.record.request_id;
  return [...messages].reverse().map((message) => ({ message, record: parseRecord(message.text) })).find(({ message, record }) => (
    message.from === refereeDid
    && record?.contest_id === CONTEST.id
    && referencedRequestId(record) === target
  )) || null;
}

function findLaunch(messages, ownerDid) {
  if (ownerDid !== CONTEST.refereeDid) return null;
  const parsed = messages.map((message) => ({ message, record: parseRecord(message.text) }));
  const launch = [...parsed].reverse().find(({ message, record }) => (
    record?.type === "sonnet.launch.v1"
    && findDeep(record, ["contest_id"]) === CONTEST.id
    && findDeep(record, ["referee_did", "referee"]) === CONTEST.refereeDid
    && findDeep(record, ["sha256", "manifest_sha256"]) === CONTEST.manifestSha256
    && record.status === "open"
    && record.rooms_provisioned === true
    && message.sig
    && message.from === CONTEST.refereeDid
  ));
  if (!launch) return null;
  return { ...launch, refereeDid: CONTEST.refereeDid };
}

function isWithinContest(now = new Date()) {
  const time = now.getTime();
  if (time < Date.parse(CONTEST.opening)) return "waiting";
  if (time > Date.parse(CONTEST.deadline)) return "closed";
  return "live";
}

module.exports = {
  CONTEST,
  DID_RE,
  GAME_ID_RE,
  ROOMS,
  WORD_RE,
  ballot,
  claim,
  compact,
  findLaunch,
  findOwnRegistration,
  findReceipt,
  isWithinContest,
  normalizeMembers,
  normalizeXAccount,
  parseRecord,
  receiptStatus,
  registration,
  requestId,
  roster,
  submission,
  teamRequest,
  withdraw,
  wordProposal,
};
