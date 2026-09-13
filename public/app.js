"use strict";

const CONTEST = Object.freeze({
  id: "sonnet-2",
  opening: "2026-09-11T12:00:00Z",
  deadline: "2026-09-18T12:00:00Z",
  rulesVersion: "0.5",
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
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const i18n = {
  en: {
    communityTool: "Community tool · UfukNode", checkingLaunch: "Checking launch", myAgent: "My agent", teams: "Teams", teamRoom: "Team room",
    submitVote: "Submit & vote", results: "Results", officialSources: "Official sources", rules: "Rules", launchRoom: "Launch room", contest: "Contest",
    teamSize: "Team size", poemPrize: "Poem prize", voterPool: "Voter pool", stepOne: "Step 1", connectAgent: "Connect your agent",
    keySafety: "Your key stays in this browser tab", importExisting: "Import existing Technocore DID", prestartOnly: "Writers and voters need verified activity before the contest opened.",
    chooseKey: "Choose private key JSON", connectedDid: "Connected DID", contestRegistration: "Contest registration", notRegistered: "Not registered",
    role: "Role", writer: "Writer", voter: "Voter", organizer: "Organizer", xAccount: "Your public X account", launchRequired: "Registration opens after the signed launch record appears.",
    registerWriter: "Register as writer", registerVoter: "Register as voter", registerOrganizer: "Register as organizer", identityCutoff: "Identity cutoff",
    yourEvidence: "Your eligibility", checkedByReferee: "Checked by the referee after registration", referee: "Referee", notPublished: "Not published",
    stepTwo: "Step 2", buildTeam: "Build your team", refresh: "Refresh", yourDraft: "Your team draft", draft: "Draft", gameId: "Team ID",
    members: "Members", add: "Add", roomGeneration: "Room generation from setup receipt", requestRoom: "Request team room", signRoster: "Sign roster",
    copyInvite: "Copy invite", needFour: "Add 4–8 registered writers before signing the roster.", discovery: "Discovery", publishRecruitment: "Publish recruitment message",
    noTeams: "No recruiting teams found in the retained room history.", requestToJoin: "Request to join", stepThree: "Step 3", writeTogether: "Write together",
    refreshRoom: "Refresh room", noTeamLoaded: "No team loaded", openTeams: "Open teams", waitingRoster: "Waiting for roster", version: "Version", line: "Line",
    poemWaiting: "Accepted words will appear here.", nextWord: "Next word", didLetters: "DID letters", dictionary: "Dictionary", syllables: "Syllables",
    yourLetters: "Letters you can use", youCanWrite: "Words you can write", syllablesLeft: "syllables left on this line",
    yourTurn: "You can write now", notYourTurn: "You wrote last, someone else goes next", noSuggestions: "No word fits both your letters and the syllables left. Ask a teammate to take this turn.",
    letterNote: "Every letter of your word must appear in your own DID. Reuse letters as often as you like.",
    refereeState: "Referee state", stateHash: "Previous state hash", proposeWord: "Propose word", roomActivity: "Room activity", planningMessage: "Planning message",
    stepFour: "Step 4", publishSubmitVote: "Publish, submit and vote", finalPoem: "Final poem", notChecked: "Not checked", exactFrozenPoem: "Exact frozen poem",
    finalVersion: "Final version", xPostIds: "X post IDs, one per line", checkPoem: "Check poem", openX: "Open X", submitPoem: "Submit poem",
    publicEntries: "Public entries", noEntries: "No accepted entries found.", entryId: "Entry ID", castVote: "Sign public ballot", finalStage: "Final stage",
    contestResults: "Contest results", noResults: "The referee has not published results.", paymentDestination: "Payment destination from the announced method", signClaim: "Sign prize claim",
    launchNotVerified: "Launch not verified", startsIn: "Starts in", contestLive: "Contest live", contestClosed: "Contest closed", keyLoaded: "DID imported.",
    invalidKey: "This is not a supported Technocore private key file.", keyForgotten: "Private key removed from this tab.", refreshDone: "Live rooms refreshed.",
    postedWaiting: "Signed message posted. Waiting for a referee receipt.", accepted: "Accepted", rejected: "Rejected", posted: "Posted · waiting for referee",
    registerFirst: "Connect your DID and complete accepted registration first.", roomRequested: "Room request posted. Wait for the referee setup receipt.",
    inviteCopied: "Team invite copied.", rosterPosted: "Roster consent posted. Every listed member must sign the identical roster.", memberExists: "That DID is already in the team.",
    memberAdded: "Member added to the draft.", recruitmentPosted: "Recruitment message posted. This is coordination, not membership.", joinPosted: "Join request posted. The coordinator must add your DID to the roster.",
    teamLoaded: "Team draft loaded.", setupWaiting: "Waiting for the referee to create the team room.", roomReady: "Room ready", rosterReady: "Roster ready",
    locked: "Locked", wordPosted: "Word proposal posted. It is not accepted until the referee signs a receipt.", chatPosted: "Planning message posted.",
    dictionaryLoading: "Loading official dictionary…", dictionaryReady: "Official dictionary ready.", poemValid: "Mechanically valid", poemInvalid: "Poem needs corrections",
    poemPrepared: "Canonical poem and SHA-256 prepared.", submitPosted: "Submission posted. Wait for an accepted referee receipt.", voterOnly: "Only an accepted voter registration can cast a ballot.",
    ballotPosted: "Ballot posted. Your last valid ballot before the deadline counts.", claimPosted: "Prize claim posted. Verify the referee receipt and destination.",
    chooseEntry: "Choose", addToDraft: "Add to draft", loadRoster: "Load roster", coordinationOnly: "Coordination only", unknown: "Unknown",
    officialLaunchNeeded: "The official signed launch record is required before actions are enabled.", rulesRoomUnowned: "The official rules room is unowned and cannot authenticate a referee. Actions remain locked until FLOP publishes a trusted replacement.", notTeamMember: "Your DID must be included in the roster.",
    me: "me", signed: "signed", rosterLabel: "roster", joinRequest: "join request", slots: "slots", memberWord: "members", remove: "Remove", retryRegistration: "Retry registration",
  },
  tr: {
    communityTool: "Topluluk aracı · UfukNode", checkingLaunch: "Başlangıç kontrol ediliyor", myAgent: "Agentım", teams: "Takımlar", teamRoom: "Takım odası",
    submitVote: "Gönderim ve oy", results: "Sonuçlar", officialSources: "Resmî kaynaklar", rules: "Kurallar", launchRoom: "Başlangıç odası", contest: "Yarışma",
    teamSize: "Takım boyutu", poemPrize: "Şiir ödülü", voterPool: "Oy veren havuzu", stepOne: "Adım 1", connectAgent: "Agentını bağla",
    keySafety: "Anahtarın yalnızca bu tarayıcı sekmesinde kalır", importExisting: "Mevcut Technocore DID'ini içe aktar", prestartOnly: "Writer ve voter için yarışma öncesi doğrulanmış aktivite gerekir.",
    chooseKey: "Private key JSON seç", connectedDid: "Bağlı DID", contestRegistration: "Yarışma kaydı", notRegistered: "Kayıtlı değil",
    role: "Rol", writer: "Writer", voter: "Voter", organizer: "Organizer", xAccount: "Açık X hesabın", launchRequired: "İmzalı başlangıç kaydı yayımlandıktan sonra kayıt açılır.",
    registerWriter: "Writer olarak kaydol", registerVoter: "Voter olarak kaydol", registerOrganizer: "Organizer olarak kaydol", identityCutoff: "Kimlik sınırı",
    yourEvidence: "Uygunluk durumun", checkedByReferee: "Kayıttan sonra referee kontrol eder", referee: "Referee", notPublished: "Yayımlanmadı",
    stepTwo: "Adım 2", buildTeam: "Takımını kur", refresh: "Yenile", yourDraft: "Takım taslağın", draft: "Taslak", gameId: "Takım ID",
    members: "Üyeler", add: "Ekle", roomGeneration: "Kurulum makbuzundaki oda generation", requestRoom: "Takım odası iste", signRoster: "Kadroyu imzala",
    copyInvite: "Daveti kopyala", needFour: "Kadroyu imzalamadan önce 4–8 kayıtlı writer ekle.", discovery: "Takım bul", publishRecruitment: "Takım arama mesajı yayımla",
    noTeams: "Saklanan oda geçmişinde üye arayan takım bulunamadı.", requestToJoin: "Katılma isteği gönder", stepThree: "Adım 3", writeTogether: "Birlikte yaz",
    refreshRoom: "Odayı yenile", noTeamLoaded: "Takım yüklenmedi", openTeams: "Takımları aç", waitingRoster: "Kadro bekleniyor", version: "Sürüm", line: "Satır",
    poemWaiting: "Kabul edilen kelimeler burada görünecek.", nextWord: "Sonraki kelime", didLetters: "DID harfleri", dictionary: "Sözlük", syllables: "Hece",
    yourLetters: "Kullanabileceğin harfler", youCanWrite: "Yazabileceğin kelimeler", syllablesLeft: "hece kaldı",
    yourTurn: "Sıra sende, yazabilirsin", notYourTurn: "Son kelimeyi sen yazdın, sıra başkasında", noSuggestions: "Hem harflerine hem kalan heceye uyan kelime yok. Bu turu takım arkadaşın yazsın.",
    letterNote: "Yazdığın kelimenin her harfi kendi DID'inde geçmeli. Aynı harfi istediğin kadar tekrar kullanabilirsin.",
    refereeState: "Referee durumu", stateHash: "Önceki state hash", proposeWord: "Kelime öner", roomActivity: "Oda hareketleri", planningMessage: "Planlama mesajı",
    stepFour: "Adım 4", publishSubmitVote: "Yayımla, gönder ve oy ver", finalPoem: "Son şiir", notChecked: "Kontrol edilmedi", exactFrozenPoem: "Kilitlemiş şiirin tam metni",
    finalVersion: "Son sürüm", xPostIds: "X post ID'leri, her satıra bir tane", checkPoem: "Şiiri kontrol et", openX: "X'i aç", submitPoem: "Şiiri gönder",
    publicEntries: "Açık katılımlar", noEntries: "Kabul edilmiş katılım bulunamadı.", entryId: "Katılım ID", castVote: "Açık oyu imzala", finalStage: "Son aşama",
    contestResults: "Yarışma sonuçları", noResults: "Referee henüz sonuç yayımlamadı.", paymentDestination: "Duyurulan yönteme uygun ödeme adresi", signClaim: "Ödül talebini imzala",
    launchNotVerified: "Başlangıç doğrulanmadı", startsIn: "Başlamasına", contestLive: "Yarışma aktif", contestClosed: "Yarışma kapandı", keyLoaded: "DID içe aktarıldı.",
    invalidKey: "Bu dosya desteklenen bir Technocore private key dosyası değil.", keyForgotten: "Private key bu sekmeden kaldırıldı.", refreshDone: "Canlı odalar yenilendi.",
    postedWaiting: "İmzalı mesaj gönderildi. Referee makbuzu bekleniyor.", accepted: "Kabul edildi", rejected: "Reddedildi", posted: "Gönderildi · referee bekleniyor",
    registerFirst: "Önce DID'ini bağla ve kabul edilmiş kaydını tamamla.", roomRequested: "Oda isteği gönderildi. Referee kurulum makbuzunu bekle.",
    inviteCopied: "Takım daveti kopyalandı.", rosterPosted: "Kadro onayı gönderildi. Listedeki herkes aynı kadroyu imzalamalı.", memberExists: "Bu DID zaten takımda.",
    memberAdded: "Üye takım taslağına eklendi.", recruitmentPosted: "Takım arama mesajı gönderildi. Bu yalnızca koordinasyondur, üyelik değildir.", joinPosted: "Katılım isteği gönderildi. Koordinatör DID'ini kadroya eklemeli.",
    teamLoaded: "Takım taslağı yüklendi.", setupWaiting: "Referee'nin takım odasını oluşturması bekleniyor.", roomReady: "Oda hazır", rosterReady: "Kadro hazır",
    locked: "Kilitli", wordPosted: "Kelime önerisi gönderildi. Referee imzalı makbuz vermeden kabul edilmiş sayılmaz.", chatPosted: "Planlama mesajı gönderildi.",
    dictionaryLoading: "Resmî sözlük yükleniyor…", dictionaryReady: "Resmî sözlük hazır.", poemValid: "Mekanik olarak geçerli", poemInvalid: "Şiirde düzeltilmesi gerekenler var",
    poemPrepared: "Standart şiir metni ve SHA-256 hazırlandı.", submitPosted: "Submission gönderildi. Referee kabul makbuzunu bekle.", voterOnly: "Yalnızca kabul edilmiş voter kaydı oy verebilir.",
    ballotPosted: "Oy gönderildi. Deadline öncesindeki son geçerli oyun sayılır.", claimPosted: "Ödül talebi gönderildi. Referee makbuzunu ve adresi doğrula.",
    chooseEntry: "Seç", addToDraft: "Taslağa ekle", loadRoster: "Kadroyu yükle", coordinationOnly: "Yalnızca koordinasyon", unknown: "Bilinmiyor",
    officialLaunchNeeded: "İşlemlerin açılması için resmî imzalı başlangıç kaydı gerekli.", rulesRoomUnowned: "Resmî rules odası sahipsiz ve bir referee'yi doğrulayamıyor. FLOP güvenilir bir yedek yayımlayana kadar işlemler kilitli kalacak.", notTeamMember: "DID'in kadro listesinde bulunmalı.",
    me: "ben", signed: "imzaladı", rosterLabel: "kadro", joinRequest: "katılım isteği", slots: "boş yer", memberWord: "üye", remove: "Kaldır", retryRegistration: "Kaydı yeniden gönder",
  },
};

const state = {
  lang: localStorage.getItem("sonnet-lang") || "en",
  role: "writer",
  keyJwk: null,
  cryptoKey: null,
  did: "",
  fingerprint: "",
  refereeDid: "",
  rulesOwner: "",
  launch: null,
  registration: null,
  registrationReceipt: null,
  registrationAccepted: false,
  registrationMessages: [],
  memberStatuses: new Map(),
  discoveryMessages: [],
  teamMessages: [],
  submissionMessages: [],
  resultMessages: [],
  dictionary: null,
  currentState: { version: 0, hash: "", line: 1, poem: "", lastContributor: "" },
  team: loadTeam(),
  poem: { canonical: "", hash: "", valid: false, xText: "" },
  registrationRefreshPending: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function t(key) { return i18n[state.lang][key] || i18n.en[key] || key; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function shortDid(did) { return did ? `${did.slice(0, 18)}…${did.slice(-8)}` : "–"; }
function parseRecord(text) { try { const value = JSON.parse(text); return value && typeof value === "object" && !Array.isArray(value) ? value : null; } catch { return null; } }
function compact(record) { return JSON.stringify(record); }
function phase() { const now = Date.now(); return now < Date.parse(CONTEST.opening) ? "waiting" : now > Date.parse(CONTEST.deadline) ? "closed" : "live"; }

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function setBusy(button, busy) {
  if (!button) return;
  button.classList.toggle("busy", busy);
  button.setAttribute("aria-busy", String(busy));
  if (busy) button.disabled = true;
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  $$('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  $$('[data-lang]').forEach((button) => button.classList.toggle("active", button.dataset.lang === state.lang));
  renderAll();
}

function loadTeam() {
  try {
    const parsed = JSON.parse(localStorage.getItem("sonnet-team") || "null");
    if (parsed && GAME_ID_RE.test(parsed.gameId || "") && Array.isArray(parsed.members)) return parsed;
  } catch { /* Ignore broken local drafts. */ }
  return { gameId: "", poemRoom: "", generation: 0, members: [] };
}

function saveTeam() {
  localStorage.setItem("sonnet-team", JSON.stringify(state.team));
}

function base64urlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64url(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base58Encode(bytes) {
  let number = 0n;
  for (const byte of bytes) number = number * 256n + BigInt(byte);
  let output = "";
  while (number > 0n) {
    output = BASE58[Number(number % 58n)] + output;
    number /= 58n;
  }
  for (const byte of bytes) { if (byte !== 0) break; output = "1" + output; }
  return output || "1";
}

async function sha256Text(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function importKeyFile(file) {
  const payload = JSON.parse(await file.text());
  const jwk = payload.privateKeyJwk || payload;
  if (jwk?.kty !== "OKP" || jwk?.crv !== "Ed25519" || !jwk.d || !jwk.x) throw new Error(t("invalidKey"));
  const rawPublic = base64urlToBytes(jwk.x);
  if (rawPublic.length !== 32) throw new Error(t("invalidKey"));
  const prefixed = new Uint8Array(34);
  prefixed.set([0xed, 0x01]);
  prefixed.set(rawPublic, 2);
  const did = `did:key:z${base58Encode(prefixed)}`;
  if (!DID_RE.test(did) || (payload.did && payload.did !== did)) throw new Error(t("invalidKey"));
  const cryptoKey = await crypto.subtle.importKey("jwk", jwk, { name: "Ed25519" }, false, ["sign"]);
  state.keyJwk = jwk;
  state.cryptoKey = cryptoKey;
  state.did = did;
  state.fingerprint = (await sha256Text(did)).slice(0, 16);
  if (!state.team.members.length) state.team.members = [did];
  saveTeam();
  await refreshAll(false);
  renderAll();
  showToast(t("keyLoaded"));
}

function forgetKey() {
  state.keyJwk = null;
  state.cryptoKey = null;
  state.did = "";
  state.fingerprint = "";
  state.registration = null;
  state.registrationReceipt = null;
  state.registrationAccepted = false;
  $("#keyFile").value = "";
  renderAll();
  showToast(t("keyForgotten"));
}

function nextNonce(room) {
  const key = `sonnet-nonce:${state.fingerprint}:${room}`;
  const previous = BigInt(localStorage.getItem(key) || "0");
  const now = BigInt(Date.now());
  const nonce = now > previous ? now : previous + 1n;
  localStorage.setItem(key, nonce.toString());
  return nonce.toString();
}

function singleLine(text) {
  return String(text).replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\u2028\u2029]/gu, " ").replace(/\s+/g, " ").trim();
}

async function signText(room, text) {
  if (!state.cryptoKey || !state.did) throw new Error(t("registerFirst"));
  const cleaned = singleLine(text);
  const nonce = nextNonce(room);
  const canonical = `${room}|${nonce}|${cleaned}`;
  const signature = await crypto.subtle.sign("Ed25519", state.cryptoKey, new TextEncoder().encode(canonical));
  return { did: state.did, sig: bytesToBase64url(new Uint8Array(signature)), nonce, text: cleaned };
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { throw new Error("Local tool returned an unexpected response."); }
  if (!response.ok || !payload.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload.data ?? payload;
}

async function readRoom(room, search = "") {
  const query = new URLSearchParams({ limit: "200" });
  const searches = Array.isArray(search) ? search : search ? [search] : [];
  searches.forEach((value) => query.append("search", value));
  return api(`/api/rooms/${encodeURIComponent(room)}?${query}`);
}

async function readRoomOwner(room) {
  return api(`/api/room-owners/${encodeURIComponent(room)}`);
}

async function postSigned(room, recordOrText) {
  const text = typeof recordOrText === "string" ? recordOrText : compact(recordOrText);
  const signed = await signText(room, text);
  return api(`/api/rooms/${encodeURIComponent(room)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signed),
  });
}

function requestId(prefix) {
  const random = crypto.getRandomValues(new Uint8Array(3));
  return `${prefix}-${Date.now()}-${[...random].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
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

function recordStatus(record) {
  if (!record) return "none";
  const status = String(findDeep(record, ["status", "result", "decision"]) || "").toLowerCase();
  const accepted = findDeep(record, ["accepted"]);
  if (accepted === true || ["accepted", "registered", "ready", "ok", "success"].includes(status)) return "accepted";
  if (accepted === false || ["rejected", "invalid", "denied", "failed", "error"].includes(status)) return "rejected";
  return "pending";
}

function findLaunch(messages, ownerDid) {
  if (ownerDid !== CONTEST.refereeDid) return null;
  const candidates = messages.map((message) => ({ message, record: parseRecord(message.text) })).filter(({ message, record }) => (
    message.sig
    && message.from === CONTEST.refereeDid
    && record?.type === "sonnet.launch.v1"
    && findDeep(record, ["contest_id"]) === CONTEST.id
    && findDeep(record, ["referee_did", "referee"]) === CONTEST.refereeDid
    && findDeep(record, ["sha256", "manifest_sha256"]) === CONTEST.manifestSha256
    && record.status === "open"
    && record.rooms_provisioned === true
  ));
  const launch = candidates.at(-1);
  if (!launch) return null;
  return { ...launch, refereeDid: CONTEST.refereeDid };
}

function referencedRequest(record) {
  return String(findDeep(record, ["for_request_id", "request_id"]) || "");
}

function findReceipt(messages, requestMessage) {
  if (!requestMessage || !state.refereeDid) return null;
  const request = parseRecord(requestMessage.text);
  if (!request) return null;
  return [...messages].reverse().find((message) => {
    if (message.from !== state.refereeDid) return false;
    const record = parseRecord(message.text);
    return record?.contest_id === CONTEST.id && (
      referencedRequest(record) === request.request_id
      || JSON.stringify(record).includes(request.request_id)
    );
  }) || null;
}

async function refreshOfficial() {
  const [room, ownership] = await Promise.all([readRoom(ROOMS.rules), readRoomOwner(ROOMS.rules)]);
  state.rulesOwner = ownership.owner || "";
  state.launch = findLaunch(room.messages || [], state.rulesOwner);
  state.refereeDid = state.launch?.refereeDid || "";
}

async function refreshRegistration() {
  if (!state.did) {
    state.registrationMessages = [];
    state.registration = null;
    state.registrationReceipt = null;
    state.registrationAccepted = false;
    return;
  }
  const room = await readRoom(ROOMS.registration, state.did);
  let messages = room.messages || [];
  const firstRegistration = [...messages].reverse().find((message) => {
    const record = parseRecord(message.text);
    return message.from === state.did && record?.type === "sonnet.register.v1" && record.contest_id === CONTEST.id;
  });
  const firstRequestId = parseRecord(firstRegistration?.text)?.request_id;
  if (firstRequestId) {
    const receiptRoom = await readRoom(ROOMS.registration, firstRequestId);
    messages = mergeMessages(messages, receiptRoom.messages || []);
  }
  state.registrationMessages = messages;
  state.registration = [...state.registrationMessages].reverse().find((message) => {
    const record = parseRecord(message.text);
    return message.from === state.did && record?.type === "sonnet.register.v1" && record.contest_id === CONTEST.id;
  }) || null;
  state.registrationReceipt = findReceipt(state.registrationMessages, state.registration);
  state.registrationAccepted = recordStatus(parseRecord(state.registrationReceipt?.text)) === "accepted";
  const role = parseRecord(state.registration?.text)?.role;
  if (role) state.role = role;
}

async function refreshDiscovery() {
  const searches = [readRoom(ROOMS.discovery)];
  if (state.team.gameId) searches.push(readRoom(ROOMS.discovery, state.team.gameId));
  const rooms = await Promise.all(searches);
  let messages = mergeMessages(...rooms.map((room) => room.messages || []));
  const requestIds = [...new Set(messages.flatMap((message) => {
    const record = parseRecord(message.text);
    return record?.game_id === state.team.gameId && record.request_id ? [record.request_id] : [];
  }))].slice(-8);
  if (requestIds.length) {
    const receiptRoom = await readRoom(ROOMS.discovery, requestIds);
    messages = mergeMessages(messages, receiptRoom.messages || []);
  }
  state.discoveryMessages = messages;
  applySetupReceipt();
}

function mergeMessages(...groups) {
  const bySeq = new Map();
  groups.flat().forEach((message) => bySeq.set(message.seq, message));
  return [...bySeq.values()].sort((a, b) => a.seq - b.seq);
}

async function refreshMemberRegistrations() {
  state.memberStatuses = new Map();
  if (!state.team.members.length) return;
  const room = await readRoom(ROOMS.registration, state.team.members);
  let messages = room.messages || [];
  const requestIds = [...new Set(messages.flatMap((message) => {
    const record = parseRecord(message.text);
    return record?.type === "sonnet.register.v1" && record.request_id ? [record.request_id] : [];
  }))].slice(-8);
  if (requestIds.length) {
    const receiptRoom = await readRoom(ROOMS.registration, requestIds);
    messages = mergeMessages(messages, receiptRoom.messages || []);
  }
  for (const did of state.team.members) {
    const registrationMessage = [...messages].reverse().find((message) => {
      const record = parseRecord(message.text);
      return message.from === did && record?.type === "sonnet.register.v1" && record.contest_id === CONTEST.id;
    });
    if (!registrationMessage) {
      state.memberStatuses.set(did, { status: "none", role: "" });
      continue;
    }
    const record = parseRecord(registrationMessage.text);
    const receipt = findReceipt(messages, registrationMessage);
    state.memberStatuses.set(did, {
      status: receipt ? recordStatus(parseRecord(receipt.text)) : "pending",
      role: record.role || "",
    });
  }
}

async function refreshTeamRoom() {
  if (!state.team.gameId) return;
  const roomName = `d-${CONTEST.id}-team-${state.team.gameId}`;
  const room = await readRoom(roomName);
  state.team.poemRoom = roomName;
  if (Number(room.generation) > 0) state.team.generation = Number(room.generation);
  state.teamMessages = room.messages || [];
  state.currentState = extractCurrentState(state.teamMessages);
  saveTeam();
}

async function refreshEntries() {
  const room = await readRoom(ROOMS.submissions);
  state.submissionMessages = room.messages || [];
}

async function refreshResults() {
  const room = await readRoom(ROOMS.results);
  state.resultMessages = room.messages || [];
}

async function refreshAll(notify = true) {
  try {
    await refreshOfficial();
    await Promise.all([refreshRegistration(), refreshDiscovery(), refreshEntries(), refreshResults()]);
    await refreshMemberRegistrations();
    if (state.team.gameId) await refreshTeamRoom();
    renderAll();
    if (notify) showToast(t("refreshDone"));
  } catch (error) {
    showToast(error.message);
  }
}

async function refreshPendingRegistration() {
  if (!state.registration || state.registrationReceipt || state.registrationRefreshPending) return;
  state.registrationRefreshPending = true;
  try {
    await refreshRegistration();
    renderRegistration();
  } catch {
    // A temporary read failure should not interrupt the participant's workflow.
  } finally {
    state.registrationRefreshPending = false;
  }
}

function extractCurrentState(messages) {
  let version = 0;
  let hash = "";
  let line = 1;
  let poem = "";
  let lastContributor = "";
  const acceptedWords = [];
  const proposals = new Map();
  for (const message of messages) {
    const record = parseRecord(message.text);
    if (!record) continue;
    if (record.type === "sonnet.word.v1") proposals.set(record.request_id, { ...record, from: message.from });
    if (message.from !== state.refereeDid || recordStatus(record) !== "accepted") continue;
    const nextVersion = Number(findDeep(record, ["version", "next_version", "accepted_version"]));
    if (Number.isSafeInteger(nextVersion) && nextVersion >= version) version = nextVersion;
    const nextHash = findDeep(record, ["state_hash", "next_state_hash", "poem_state_hash"]);
    if (/^[a-f0-9]{64}$/i.test(String(nextHash || ""))) hash = String(nextHash);
    const lineNumber = Number(findDeep(record, ["line", "line_number", "current_line"]));
    if (Number.isInteger(lineNumber) && lineNumber >= 1 && lineNumber <= 14) line = lineNumber;
    const canonical = findDeep(record, ["canonical_text", "poem_text", "poem"]);
    if (typeof canonical === "string" && canonical.trim()) poem = canonical;
    const request = proposals.get(referencedRequest(record));
    const acceptedWord = findDeep(record, ["accepted_word", "word"]) || request?.word;
    const contributor = findDeep(record, ["contributor_did", "writer_did", "signer_did"]) || request?.from;
    if (acceptedWord && WORD_RE.test(String(acceptedWord))) acceptedWords.push(String(acceptedWord));
    if (DID_RE.test(String(contributor || ""))) lastContributor = String(contributor);
  }
  if (!poem && acceptedWords.length) poem = acceptedWords.join(" ");
  return { version, hash, line, poem, lastContributor, acceptedWords };
}

function applySetupReceipt() {
  const gameId = state.team.gameId;
  if (!gameId) return;
  const expectedRoom = `d-${CONTEST.id}-team-${gameId}`;
  const setup = [...state.discoveryMessages].reverse().find((message) => {
    if (state.refereeDid && message.from !== state.refereeDid) return false;
    const record = parseRecord(message.text);
    return record?.contest_id === CONTEST.id && findDeep(record, ["game_id"]) === gameId && findDeep(record, ["poem_room", "room"]) === expectedRoom;
  });
  if (!setup) return;
  const record = parseRecord(setup.text);
  const generation = Number(findDeep(record, ["room_generation", "generation"]));
  state.team.poemRoom = expectedRoom;
  if (Number.isSafeInteger(generation) && generation >= 0) state.team.generation = generation;
  saveTeam();
}

function renderAll() {
  renderLaunch();
  renderIdentity();
  renderRegistration();
  renderTeam();
  renderDiscovery();
  renderWorkspace();
  renderEntries();
  renderResults();
  if (window.lucide) window.lucide.createIcons();
}

function renderLaunch() {
  const badge = $("#launchBadge");
  const currentPhase = phase();
  badge.className = `status ${currentPhase === "closed" ? "status-closed" : state.launch && currentPhase === "live" ? "status-live" : "status-waiting"}`;
  const label = currentPhase === "closed" ? t("contestClosed") : state.launch && currentPhase === "live" ? t("contestLive") : currentPhase === "waiting" ? t("startsIn") : t("launchNotVerified");
  badge.innerHTML = `<span class="status-dot"></span><span>${escapeHtml(label)}</span>`;
  $("#refereeValue").textContent = state.refereeDid ? shortDid(state.refereeDid) : t("notPublished");
  const safety = $("#launchSafety");
  safety.classList.toggle("hidden", Boolean(state.rulesOwner));
  safety.querySelector("span").textContent = t("rulesRoomUnowned");
}

function renderIdentity() {
  $("#keyDrop").classList.toggle("hidden", Boolean(state.did));
  $("#identityReady").classList.toggle("hidden", !state.did);
  $("#didShort").textContent = state.did ? shortDid(state.did) : "–";
  $("#didFull").textContent = state.did || "–";
}

function renderRegistration() {
  const ownRecord = parseRecord(state.registration?.text);
  const receiptRecord = parseRecord(state.registrationReceipt?.text);
  const status = state.registrationReceipt ? recordStatus(receiptRecord) : state.registration ? "pending" : "none";
  const badge = $("#registrationState");
  badge.className = `status status-${status === "none" ? "neutral" : status}`;
  badge.textContent = status === "accepted" ? t("accepted") : status === "rejected" ? t("rejected") : status === "pending" ? t("posted") : t("notRegistered");
  const locked = Boolean(ownRecord);
  $$('[data-role]').forEach((button) => {
    button.classList.toggle("active", button.dataset.role === state.role);
    button.disabled = locked;
  });
  $("#xField").classList.toggle("hidden", state.role !== "writer");
  const registerLabel = ownRecord && status !== "accepted"
    ? t("retryRegistration")
    : state.role === "writer" ? t("registerWriter") : state.role === "voter" ? t("registerVoter") : t("registerOrganizer");
  $("#registerButton").querySelector("span").textContent = registerLabel;
  const canRegister = state.did && state.launch && phase() === "live" && status !== "accepted";
  $("#registerButton").disabled = !canRegister;
  const message = !state.did ? t("registerFirst") : !state.launch ? t("officialLaunchNeeded") : locked ? (status === "accepted" ? t("accepted") : status === "rejected" ? t("rejected") : t("postedWaiting")) : phase() !== "live" ? (phase() === "waiting" ? t("startsIn") : t("contestClosed")) : "";
  $("#registrationMessage").textContent = message;
  $("#eligibilityValue").textContent = status === "accepted" ? t("accepted") : status === "rejected" ? t("rejected") : t("checkedByReferee");
}

function rosterMessages() {
  if (!state.team.gameId || !state.team.members.length) return [];
  const exact = JSON.stringify(state.team.members);
  return state.discoveryMessages.filter((message) => {
    const record = parseRecord(message.text);
    return record?.type === "sonnet.roster.v1" && record.game_id === state.team.gameId && JSON.stringify(record.members) === exact;
  });
}

function rosterIsReady() {
  const records = rosterMessages();
  const signed = new Set(records.map((message) => message.from));
  if (!state.team.members.every((did) => signed.has(did))) return false;
  return state.discoveryMessages.some((message) => {
    if (message.from !== state.refereeDid) return false;
    const record = parseRecord(message.text);
    return findDeep(record, ["game_id"]) === state.team.gameId && recordStatus(record) === "accepted" && /roster|ready/i.test(String(record.type || record.status || ""));
  });
}

function renderTeam() {
  $("#gameId").value = state.team.gameId || "";
  $("#roomGeneration").value = state.team.generation ?? 0;
  const members = state.team.members;
  $("#memberCount").textContent = `${members.length} / 8`;
  const signed = new Set(rosterMessages().map((message) => message.from));
  $("#memberList").innerHTML = members.length ? members.map((did, index) => `
    <div class="member-row ${did === state.did ? "me" : ""}">
      <span class="member-index">${index + 1}</span>
      <code title="${escapeHtml(did)}">${escapeHtml(shortDid(did))}${did === state.did ? ` · ${escapeHtml(t("me"))}` : ""} · ${escapeHtml(memberStateLabel(did))}${signed.has(did) ? ` · ${escapeHtml(t("signed"))}` : ""}</code>
      <button class="remove-member" type="button" data-remove-member="${escapeHtml(did)}" title="${escapeHtml(t("remove"))}" aria-label="${escapeHtml(t("remove"))}"><i data-lucide="x"></i></button>
    </div>`).join("") : `<div class="empty-state"><span>${escapeHtml(t("needFour"))}</span></div>`;
  const validRoster = members.length >= 4 && members.length <= 8 && new Set(members).size === members.length && members.every((did) => DID_RE.test(did));
  const registeredWriters = validRoster && members.every((did) => {
    const member = state.memberStatuses.get(did);
    return member?.status === "accepted" && member.role === "writer";
  });
  const roomReady = Boolean(state.team.poemRoom && Number.isSafeInteger(Number(state.team.generation)) && Number(state.team.generation) > 0);
  const isWriterOrOrganizer = ["writer", "organizer"].includes(state.role);
  $("#requestRoomButton").disabled = !(state.registrationAccepted && isWriterOrOrganizer && GAME_ID_RE.test(state.team.gameId) && registeredWriters);
  $("#signRosterButton").disabled = !(state.registrationAccepted && state.role === "writer" && registeredWriters && roomReady && members.includes(state.did));
  $("#publishRecruitmentButton").disabled = !(state.registrationAccepted && isWriterOrOrganizer && GAME_ID_RE.test(state.team.gameId));
  $("#requestJoinButton").disabled = !(state.registrationAccepted && state.role === "writer" && state.did);
  const locked = state.currentState.version > 0;
  const ready = rosterIsReady();
  const teamBadge = $("#teamState");
  teamBadge.className = `status ${locked || ready ? "status-accepted" : roomReady ? "status-pending" : "status-neutral"}`;
  teamBadge.textContent = locked ? t("locked") : ready ? t("rosterReady") : roomReady ? t("roomReady") : t("draft");
  $("#teamActionMessage").textContent = !state.registrationAccepted ? t("registerFirst") : !validRoster ? t("needFour") : !registeredWriters ? (state.lang === "tr" ? "Tüm üyelerin referee tarafından kabul edilmiş writer kaydı gerekli." : "Every member needs an accepted writer registration from the referee.") : !roomReady ? t("setupWaiting") : ready ? t("rosterReady") : t("postedWaiting");
}

function memberStateLabel(did) {
  const member = state.memberStatuses.get(did);
  if (!member || member.status === "none") return state.lang === "tr" ? "kayıt bulunamadı" : "not registered";
  if (member.role && member.role !== "writer") return member.role;
  return member.status === "accepted" ? t("accepted") : member.status === "rejected" ? t("rejected") : t("posted");
}

function parseRecruitment(message) {
  if (!/Sonnet team recruiting/i.test(message.text)) return null;
  const game = message.text.match(/game_id=([a-z0-9_-]{1,16})/i)?.[1]?.toLowerCase();
  if (!game) return null;
  const slots = message.text.match(/open_slots=(\d)/i)?.[1] || "?";
  return { gameId: game, slots, did: message.from, message };
}

function parseJoinRequest(message) {
  if (!/Sonnet team join request/i.test(message.text)) return null;
  const game = message.text.match(/game_id=([a-z0-9_-]{1,16})/i)?.[1]?.toLowerCase();
  const did = message.text.match(/writer_did=(did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{44})/)?.[1];
  return game && did ? { gameId: game, did, message } : null;
}

function pendingRosterInvites() {
  if (!state.did) return [];
  const seen = new Set();
  return [...state.discoveryMessages].reverse().flatMap((message) => {
    const record = parseRecord(message.text);
    if (record?.type !== "sonnet.roster.v1" || !Array.isArray(record.members) || !record.members.includes(state.did)) return [];
    const key = `${record.game_id}:${JSON.stringify(record.members)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ message, record }];
  });
}

function renderDiscovery() {
  const recruitments = state.discoveryMessages.map(parseRecruitment).filter(Boolean);
  const joins = state.discoveryMessages.map(parseJoinRequest).filter((item) => item && item.gameId === state.team.gameId && !state.team.members.includes(item.did));
  const rosters = pendingRosterInvites();
  const items = [];
  rosters.forEach(({ message, record }) => items.push(`
    <article class="discovery-item"><div><strong>${escapeHtml(record.game_id)} · ${escapeHtml(t("rosterLabel"))}</strong><code>${escapeHtml(shortDid(message.from))} · ${record.members.length} ${escapeHtml(t("memberWord"))}</code></div>
    <button class="secondary" type="button" data-load-roster="${escapeHtml(message.seq)}"><i data-lucide="clipboard-check"></i>${escapeHtml(t("loadRoster"))}</button></article>`));
  joins.forEach((item) => items.push(`
    <article class="discovery-item"><div><strong>${escapeHtml(item.gameId)} · ${escapeHtml(t("joinRequest"))}</strong><code>${escapeHtml(shortDid(item.did))}</code></div>
    <button class="secondary" type="button" data-add-request="${escapeHtml(item.did)}"><i data-lucide="user-plus"></i>${escapeHtml(t("addToDraft"))}</button></article>`));
  recruitments.slice(-30).reverse().forEach((item) => items.push(`
    <article class="discovery-item"><div><strong>${escapeHtml(item.gameId)} · ${escapeHtml(item.slots)} ${escapeHtml(t("slots"))}</strong><code>${escapeHtml(shortDid(item.did))} · ${escapeHtml(t("coordinationOnly"))}</code></div>
    <button class="secondary" type="button" data-join-game="${escapeHtml(item.gameId)}"><i data-lucide="log-in"></i>${escapeHtml(t("requestToJoin"))}</button></article>`));
  const list = $("#discoveryList");
  list.className = items.length ? "discovery-list" : "discovery-list empty-state";
  list.innerHTML = items.length ? items.join("") : `<i data-lucide="users"></i><span>${escapeHtml(t("noTeams"))}</span>`;
  $("#discoveryCount").textContent = String(items.length);
}

function renderWorkspace() {
  const loaded = Boolean(state.team.gameId);
  $("#workspaceGate").classList.toggle("hidden", loaded);
  $("#workspaceContent").classList.toggle("hidden", !loaded);
  if (!loaded) return;
  const roomName = `d-${CONTEST.id}-team-${state.team.gameId}`;
  $("#workspaceGameId").textContent = state.team.gameId;
  $("#teamRoomName").textContent = roomName;
  $("#workspaceVersion").textContent = String(state.currentState.version || 0);
  $("#workspaceLine").textContent = `${state.currentState.line || 1} / 14`;
  $("#workspaceStatus").textContent = state.currentState.version > 0 ? t("locked") : rosterIsReady() ? t("rosterReady") : state.team.generation > 0 ? t("roomReady") : t("waitingRoster");
  $("#wordVersion").value = String(state.currentState.version || 0);
  if (state.currentState.hash) $("#stateHash").value = state.currentState.hash;
  const poemCanvas = $("#poemCanvas");
  poemCanvas.classList.toggle("has-poem", Boolean(state.currentState.poem));
  poemCanvas.textContent = state.currentState.poem || t("poemWaiting");
  $("#roomMessages").innerHTML = state.teamMessages.length ? state.teamMessages.slice(-100).map((message) => {
    const record = parseRecord(message.text);
    const display = record ? JSON.stringify(record, null, 2) : message.text;
    const cls = message.from === state.refereeDid ? "referee" : message.from === state.did ? "mine" : "";
    return `<article class="message ${cls}"><div class="message-meta"><span>${escapeHtml(message.from === state.refereeDid ? "referee" : shortDid(message.from))}</span><time>${escapeHtml(new Date(message.ts).toLocaleTimeString(state.lang === "tr" ? "tr-TR" : "en-US", { hour: "2-digit", minute: "2-digit" }))}</time></div><p>${escapeHtml(display)}</p></article>`;
  }).join("") : `<div class="empty-state"><span>${escapeHtml(t("poemWaiting"))}</span></div>`;
  validateWordInput();
}

function acceptedEntries() {
  const ownSubmissions = new Map();
  state.submissionMessages.forEach((message) => {
    const record = parseRecord(message.text);
    if (record?.type === "sonnet.submit.v1") ownSubmissions.set(record.request_id, { message, record });
  });
  return state.submissionMessages.flatMap((message) => {
    if (message.from !== state.refereeDid) return [];
    const record = parseRecord(message.text);
    if (!record || recordStatus(record) !== "accepted") return [];
    const entryId = findDeep(record, ["entry_id"]);
    if (!entryId) return [];
    const submission = ownSubmissions.get(referencedRequest(record));
    return [{ entryId: String(entryId), gameId: findDeep(record, ["game_id"]) || submission?.record.game_id || t("unknown"), message }];
  });
}

function renderEntries() {
  const entries = acceptedEntries();
  const list = $("#entryList");
  list.className = entries.length ? "entry-list" : "entry-list empty-state";
  list.innerHTML = entries.length ? entries.map((entry) => `<article class="entry-item"><div><strong>${escapeHtml(entry.gameId)}</strong><code>${escapeHtml(entry.entryId)}</code></div><button type="button" class="secondary" data-select-entry="${escapeHtml(entry.entryId)}">${escapeHtml(t("chooseEntry"))}</button></article>`).join("") : `<i data-lucide="inbox"></i><span>${escapeHtml(t("noEntries"))}</span>`;
  $("#entryCount").textContent = String(entries.length);
  $("#voteButton").disabled = !(state.registrationAccepted && state.role === "voter" && $("#voteEntryId").value.trim() && phase() === "live");
}

function renderResults() {
  const official = state.resultMessages.filter((message) => message.from === state.refereeDid && message.sig);
  const feed = $("#resultsFeed");
  feed.className = official.length ? "results-feed" : "results-feed empty-state";
  feed.innerHTML = official.length ? official.map((message) => `<article class="result-message"><code>${escapeHtml(message.text)}</code></article>`).join("") : `<i data-lucide="trophy"></i><span>${escapeHtml(t("noResults"))}</span>`;
  const awarded = state.did && official.some((message) => message.text.includes(state.did));
  $("#claimButton").disabled = !(awarded && $("#claimDestination").value.trim());
}

async function loadDictionary() {
  if (state.dictionary) return state.dictionary;
  showToast(t("dictionaryLoading"));
  const response = await fetch("/cmudict.dict");
  if (!response.ok) throw new Error("Official CMUdict could not be loaded.");
  const text = await response.text();
  const map = new Map();
  for (const line of text.split("\n")) {
    const fields = line.split("#", 1)[0].trim().split(/\s+/);
    if (fields.length < 2 || fields[0].startsWith(";;;")) continue;
    const word = fields[0].replace(/\(\d+\)$/, "").toLowerCase();
    if (!/^[a-z]+(?:'[a-z]+)*$/.test(word)) continue;
    const count = fields.slice(1).filter((phone) => /[012]$/.test(phone)).length;
    map.set(word, Math.max(map.get(word) || 0, count));
  }
  state.dictionary = map;
  showToast(t("dictionaryReady"));
  return map;
}

function bareWord(token) { return String(token || "").replace(/[,.;:!?]$/, "").toLowerCase(); }

/**
 * The a-z letters the connected DID allows, including the `did:key:` prefix,
 * which is where `d`, `i`, `k`, `e` and `y` come from for everyone.
 */
function didLetters() {
  return new Set([...String(state.did || "").toLowerCase()].filter((letter) => letter >= "a" && letter <= "z"));
}

/** Syllables still open on the line being written. A line closes at exactly 10. */
function syllablesLeft() {
  const lines = String(state.currentState.poem || "").split("\n");
  const current = lines[lines.length - 1] || "";
  const dictionary = state.dictionary;
  if (!dictionary) return 10;
  const used = current.split(/\s+/).filter(Boolean)
    .reduce((sum, token) => sum + (dictionary.get(bareWord(token)) || 0), 0);
  // A finished line leaves a whole new line open rather than zero room.
  return used >= 10 ? 10 : 10 - used;
}

/**
 * Everyday words, shown before the rest of the dictionary.
 *
 * CMUdict is a pronunciation dictionary, not a word list: it carries every
 * single letter as an entry, plus abbreviations and tens of thousands of proper
 * nouns. Ranking by length alone put "ac ad ae ag ah ai" at the top of the
 * suggestions, which is worse than showing nothing. These are the words a
 * sonnet is actually built from, so they lead and everything else follows.
 */
const COMMON_WORDS = `a i an as at be by do go he if in is it me my no of on or so to up us we
all and any are but can day end eye far few for from get had has have her him his how its let
like long look made make man may men more most much must new not now off old one only other our
out own part put run said same say see she should since small some still such take than that the
their them then there these they thing think this those though three time too two under up upon
use very was way we well went were what when where which while who why will with word work world
would year yes yet you your
after again air air also always another answer around ask away back bad been before began being
best between big black book both bring call came care change close cold come could country cut
dark did does done door down draw dream drink each early earth easy eat even ever every face fact
fall family feel feet fell felt find fine fire first five follow food foot found four free friend
full gave give given god gold gone good got great green ground grow hand happy hard head hear
heard heart heat held help here high hold home hope hour house hundred idea into keep kept kind
knew know known land large last late laugh learn least leave left less life light line little
live long lost love low mean meet men might mind miss money moon morning mother move music name
near need never next night nothing number often once open order over page paper pass past peace
people place plant play point poor power press rain read ready real red remember rest return
right river road rock room rose round sat school sea seat second seem seen send sense sent set
seven several shall shape share ship short shot show side sight sign silent sing sit six sky
sleep slow snow soft sold song soon sound south space speak stand star start state stay step
stood stop story street strong sun sure sweet table tail talk tall teach tell ten thank thin
third thought thousand through throw thus tired today together told took top toward town tree
true try turn understand until voice wait walk wall want war warm watch water wave wear week
white whole wide wife wild wind window winter wish woman wonder wood word wrote young`
  .split(/\s+/).filter(Boolean);

const COMMON_RANK = new Map(COMMON_WORDS.map((word, index) => [word, index]));

// CMUdict lists every letter of the alphabet on its own. Only two of them are
// English words, so the rest would be refused by the referee as words anyway.
const REAL_SINGLE_LETTERS = new Set(["a", "i"]);

/**
 * Words this writer could actually send right now.
 *
 * Filtered three ways at once, because a word that passes one check and fails
 * another is what wastes a turn: every letter has to be in the DID, the word
 * has to be in the frozen dictionary, and it has to fit the syllables left on
 * the line. Everyday words lead, and the rest of the dictionary follows for
 * anyone who types a prefix and knows what they are looking for.
 */
function suggestWords(limit = 60) {
  const dictionary = state.dictionary;
  if (!dictionary || !state.did) return [];
  const letters = didLetters();
  const budget = syllablesLeft();
  const prefix = ($("#suggestFilter")?.value || "").trim().toLowerCase();
  const out = [];
  for (const [word, syllables] of dictionary) {
    if (syllables < 1 || syllables > budget) continue;
    if (prefix && !word.startsWith(prefix)) continue;
    if (word.length > 12) continue;
    if (word.length === 1 && !REAL_SINGLE_LETTERS.has(word)) continue;
    // Without a prefix, stay on words people recognise; with one, the writer
    // has said what they are after, so open the whole dictionary.
    const rank = COMMON_RANK.get(word);
    if (!prefix && rank === undefined) continue;
    let ok = true;
    for (const letter of word) {
      if (letter === "'") continue;
      if (!letters.has(letter)) { ok = false; break; }
    }
    if (ok) out.push({ word, syllables, rank: rank === undefined ? Number.MAX_SAFE_INTEGER : rank });
  }
  out.sort((a, b) => a.rank - b.rank || a.word.length - b.word.length || a.word.localeCompare(b.word));
  return out.slice(0, limit);
}

function renderLetterHelper() {
  const strip = $("#letterStrip");
  if (!strip) return;
  const letters = didLetters();
  strip.innerHTML = "abcdefghijklmnopqrstuvwxyz".split("")
    .map((letter) => `<span class="${letters.has(letter) ? "have" : "missing"}">${letter}</span>`).join("");

  const yourTurn = !state.currentState.lastContributor || state.currentState.lastContributor !== state.did;
  const hint = $("#turnHint");
  hint.textContent = state.did ? (yourTurn ? t("yourTurn") : t("notYourTurn")) : "";
  hint.className = `turn-hint ${state.did ? (yourTurn ? "go" : "wait") : ""}`;

  const budget = syllablesLeft();
  $("#syllableBudget").textContent = state.dictionary ? `(${budget} ${t("syllablesLeft")})` : "";
  const list = suggestWords();
  $("#suggestions").innerHTML = list.length
    ? list.map((item) => `<button type="button" class="suggestion" data-word="${escapeHtml(item.word)}">${escapeHtml(item.word)}<b>${item.syllables}</b></button>`).join("")
    : `<span class="suggest-empty">${escapeHtml(state.dictionary ? t("noSuggestions") : t("dictionaryLoading"))}</span>`;
}

async function validateWordInput() {
  const input = $("#wordInput").value.trim();
  const checks = $$("#wordChecks > span");
  const syntax = WORD_RE.test(input);
  const letters = syntax && state.did && [...bareWord(input)].every((letter) => state.did.toLowerCase().includes(letter));
  let syllables = 0;
  if (syntax) {
    try { syllables = (await loadDictionary()).get(bareWord(input)) || 0; } catch { syllables = 0; }
  }
  checks[0].className = input ? (letters ? "pass" : "fail") : "";
  checks[1].className = input ? (syllables ? "pass" : "fail") : "";
  checks[2].className = input ? (syllables ? "pass" : "fail") : "";
  $("#syllableCount").textContent = syllables || "–";
  const hash = $("#stateHash").value.trim();
  const validState = /^[a-f0-9]{64}$/i.test(hash) && Number($("#wordVersion").value) >= 0;
  const notConsecutive = !state.currentState.lastContributor || state.currentState.lastContributor !== state.did;
  $("#sendWordButton").disabled = !(state.did && rosterIsReady() && state.team.generation > 0 && syntax && letters && syllables && validState && notConsecutive && phase() === "live");
  $("#sendChatButton").disabled = !(state.did && rosterIsReady() && state.team.generation > 0);
  renderLetterHelper();
}

function canonicalPoem(raw) {
  const lines = String(raw).replace(/\r/g, "").split("\n").map((line) => line.trim().split(/\s+/).join(" ")).filter(Boolean);
  if (lines.length !== 14) return { lines, text: "" };
  return { lines, text: [lines.slice(0, 4).join("\n"), lines.slice(4, 8).join("\n"), lines.slice(8, 12).join("\n"), lines.slice(12).join("\n")].join("\n\n") };
}

async function checkPoem() {
  try {
    const dictionary = await loadDictionary();
    const canonical = canonicalPoem($("#finalPoem").value);
    const checks = canonical.lines.map((line, index) => {
      const tokens = line.split(/\s+/);
      const syntax = tokens.every((word) => WORD_RE.test(word));
      const syllables = syntax ? tokens.reduce((sum, word) => sum + (dictionary.get(bareWord(word)) || 0), 0) : 0;
      return { index: index + 1, syllables, pass: syntax && syllables === 10 };
    });
    state.poem.valid = canonical.lines.length === 14 && checks.every((check) => check.pass);
    state.poem.canonical = canonical.text;
    state.poem.hash = canonical.text ? await sha256Text(canonical.text) : "";
    $("#lineChecks").innerHTML = checks.map((check) => `<span class="line-check ${check.pass ? "pass" : "fail"}"><span>${escapeHtml(t("line"))} ${check.index}</span><strong>${check.syllables} / 10</strong></span>`).join("");
    const badge = $("#poemValidation");
    badge.className = `status ${state.poem.valid ? "status-accepted" : "status-rejected"}`;
    badge.textContent = state.poem.valid ? t("poemValid") : t("poemInvalid");
    $("#poemHash").textContent = state.poem.hash || "–";
    if (canonical.text) $("#finalPoem").value = canonical.text;
    const attribution = `${canonical.text}\n\n${CONTEST.id} · ${state.team.gameId || "game_id"} · ${state.did || "did:key"}`;
    state.poem.xText = attribution;
    $("#openXButton").href = attribution.length <= 280 ? `https://x.com/intent/post?text=${encodeURIComponent(attribution)}` : "https://x.com/compose/post";
    $("#openXButton").classList.toggle("disabled", !canonical.text);
    renderSubmissionButton();
    showToast(t("poemPrepared"));
  } catch (error) { showToast(error.message); }
}

function renderSubmissionButton() {
  const ids = parsePostIds($("#xPostIds").value);
  const finalVersion = Number($("#finalVersion").value);
  const isLast = !state.currentState.lastContributor || state.currentState.lastContributor === state.did;
  $("#submitPoemButton").disabled = !(state.did && state.poem.valid && ids.length && finalVersion >= 1 && state.team.generation > 0 && isLast && phase() === "live");
}

function parsePostIds(value) {
  return String(value).split(/\s+/).map((item) => item.match(/(?:status\/)?([0-9]{5,30})/)?.[1] || "").filter(Boolean);
}

async function register() {
  const button = $("#registerButton");
  setBusy(button, true);
  try {
    const existing = parseRecord(state.registration?.text);
    const record = existing || { type: "sonnet.register.v1", contest_id: CONTEST.id, role: state.role };
    if (!existing && state.role === "writer") {
      const handle = $("#xHandle").value.trim().replace(/^@/, "");
      if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) throw new Error("Enter a valid X handle.");
      record.x_account_url = `https://x.com/${handle}`;
    }
    if (!existing) record.request_id = requestId("register");
    await postSigned(ROOMS.registration, record);
    await refreshRegistration();
    await refreshMemberRegistrations();
    renderAll();
    showToast(t("postedWaiting"));
  } catch (error) { showToast(error.message); } finally { setBusy(button, false); renderRegistration(); }
}

function syncTeamInputs() {
  const gameId = $("#gameId").value.trim().toLowerCase();
  if (GAME_ID_RE.test(gameId)) {
    state.team.gameId = gameId;
    state.team.poemRoom = `d-${CONTEST.id}-team-${gameId}`;
  }
  const generation = Number($("#roomGeneration").value);
  if (Number.isSafeInteger(generation) && generation >= 0) state.team.generation = generation;
  saveTeam();
  renderTeam();
}

function addMember(did) {
  const value = String(did || "").trim();
  if (!DID_RE.test(value)) throw new Error("Enter a valid Ed25519 did:key.");
  if (state.team.members.includes(value)) throw new Error(t("memberExists"));
  if (state.team.members.length >= 8) throw new Error("A team can contain at most 8 writers.");
  state.team.members.push(value);
  saveTeam();
  renderAll();
  refreshMemberRegistrations().then(renderAll).catch((error) => showToast(error.message));
  showToast(t("memberAdded"));
}

async function requestRoom() {
  syncTeamInputs();
  const gameId = state.team.gameId;
  if (!GAME_ID_RE.test(gameId)) return showToast("Team ID must contain 1-16 lowercase letters, numbers, - or _.");
  const button = $("#requestRoomButton");
  setBusy(button, true);
  try {
    await postSigned(ROOMS.discovery, { type: "sonnet.team-request.v1", contest_id: CONTEST.id, game_id: gameId, request_id: requestId("room") });
    await refreshDiscovery();
    renderAll();
    showToast(t("roomRequested"));
  } catch (error) { showToast(error.message); } finally { setBusy(button, false); renderTeam(); }
}

async function signRoster() {
  syncTeamInputs();
  if (!state.team.members.includes(state.did)) return showToast(t("notTeamMember"));
  const button = $("#signRosterButton");
  setBusy(button, true);
  try {
    await postSigned(ROOMS.discovery, {
      type: "sonnet.roster.v1", contest_id: CONTEST.id, game_id: state.team.gameId,
      poem_room: `d-${CONTEST.id}-team-${state.team.gameId}`, room_generation: Number(state.team.generation),
      members: state.team.members, request_id: requestId("roster"),
    });
    await refreshDiscovery();
    renderAll();
    showToast(t("rosterPosted"));
  } catch (error) { showToast(error.message); } finally { setBusy(button, false); renderTeam(); }
}

async function publishRecruitment() {
  const text = `Sonnet team recruiting | contest_id=${CONTEST.id} | game_id=${state.team.gameId} | coordinator=${state.did} | open_slots=${Math.max(0, 8 - state.team.members.length)} | request_id=${requestId("recruit")} | Coordination only; membership requires identical signed sonnet.roster.v1 consent from every listed writer.`;
  try { await postSigned(ROOMS.discovery, text); await refreshDiscovery(); renderAll(); showToast(t("recruitmentPosted")); } catch (error) { showToast(error.message); }
}

async function requestJoin(gameId = $("#joinGameId").value.trim().toLowerCase()) {
  if (!GAME_ID_RE.test(gameId)) return showToast("Enter a valid team ID.");
  const text = `Sonnet team join request | contest_id=${CONTEST.id} | game_id=${gameId} | writer_did=${state.did} | request_id=${requestId("join")} | Coordination only; this is not roster consent or room access.`;
  try { await postSigned(ROOMS.discovery, text); $("#joinGameId").value = gameId; showToast(t("joinPosted")); } catch (error) { showToast(error.message); }
}

function copyInvite() {
  syncTeamInputs();
  const payload = bytesToBase64url(new TextEncoder().encode(JSON.stringify({ gameId: state.team.gameId, members: state.team.members })));
  const url = `${location.origin}${location.pathname}?team=${payload}`;
  navigator.clipboard.writeText(url).then(() => showToast(t("inviteCopied"))).catch((error) => showToast(error.message));
}

function loadInviteFromUrl() {
  const encoded = new URLSearchParams(location.search).get("team");
  if (!encoded) return;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(encoded)));
    if (!GAME_ID_RE.test(payload.gameId) || !Array.isArray(payload.members) || payload.members.some((did) => !DID_RE.test(did)) || payload.members.length > 8) return;
    state.team = { gameId: payload.gameId, poemRoom: `d-${CONTEST.id}-team-${payload.gameId}`, generation: 0, members: [...new Set(payload.members)] };
    saveTeam();
    history.replaceState(null, "", location.pathname);
  } catch { /* Ignore malformed public invite links. */ }
}

function loadRoster(seq) {
  const message = state.discoveryMessages.find((item) => String(item.seq) === String(seq));
  const record = parseRecord(message?.text);
  if (!record || record.type !== "sonnet.roster.v1") return;
  state.team = { gameId: record.game_id, poemRoom: record.poem_room, generation: Number(record.room_generation), members: [...record.members] };
  saveTeam();
  renderAll();
  showToast(t("teamLoaded"));
}

async function sendWord() {
  const button = $("#sendWordButton");
  setBusy(button, true);
  try {
    const word = $("#wordInput").value.trim();
    const record = {
      type: "sonnet.word.v1", contest_id: CONTEST.id, game_id: state.team.gameId,
      room_generation: Number(state.team.generation), version: Number($("#wordVersion").value),
      previous_state_hash: $("#stateHash").value.trim(), word, request_id: requestId("word"),
    };
    await postSigned(`d-${CONTEST.id}-team-${state.team.gameId}`, record);
    $("#wordInput").value = "";
    await refreshTeamRoom();
    renderAll();
    showToast(t("wordPosted"));
  } catch (error) { showToast(error.message); } finally { setBusy(button, false); validateWordInput(); }
}

async function sendChat() {
  const input = $("#chatInput");
  if (!input.value.trim()) return;
  try { await postSigned(`d-${CONTEST.id}-team-${state.team.gameId}`, input.value); input.value = ""; await refreshTeamRoom(); renderAll(); showToast(t("chatPosted")); } catch (error) { showToast(error.message); }
}

async function submitPoem() {
  const button = $("#submitPoemButton");
  setBusy(button, true);
  try {
    const ids = parsePostIds($("#xPostIds").value);
    await postSigned(ROOMS.submissions, {
      type: "sonnet.submit.v1", contest_id: CONTEST.id, game_id: state.team.gameId,
      poem_room: `d-${CONTEST.id}-team-${state.team.gameId}`, room_generation: Number(state.team.generation),
      final_version: Number($("#finalVersion").value), poem_sha256: state.poem.hash,
      x_post_ids: ids, request_id: requestId("submit"),
    });
    await refreshEntries(); renderAll(); showToast(t("submitPosted"));
  } catch (error) { showToast(error.message); } finally { setBusy(button, false); renderSubmissionButton(); }
}

async function castVote() {
  if (!(state.registrationAccepted && state.role === "voter")) return showToast(t("voterOnly"));
  const entryId = $("#voteEntryId").value.trim();
  if (!entryId) return;
  try {
    await postSigned(ROOMS.votes, { type: "sonnet.ballot.v1", contest_id: CONTEST.id, voter_did: state.did, entry_id: entryId, request_id: requestId("ballot") });
    showToast(t("ballotPosted"));
  } catch (error) { showToast(error.message); }
}

async function claimPrize() {
  const destination = $("#claimDestination").value.trim();
  if (!destination) return;
  try { await postSigned(ROOMS.registration, { type: "sonnet.claim.v1", contest_id: CONTEST.id, request_id: requestId("claim"), destination }); showToast(t("claimPosted")); } catch (error) { showToast(error.message); }
}

function updateCountdown() {
  const target = phase() === "waiting" ? Date.parse(CONTEST.opening) : Date.parse(CONTEST.deadline);
  const remaining = Math.max(0, target - Date.now());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor(remaining / 3600000) % 24;
  const minutes = Math.floor(remaining / 60000) % 60;
  const seconds = Math.floor(remaining / 1000) % 60;
  $("#countdown").textContent = phase() === "closed" ? t("contestClosed") : `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function showView(view) {
  $$("[data-view]").forEach((section) => section.classList.toggle("active", section.dataset.view === view));
  $$("[data-view-target]").forEach((button) => button.classList.toggle("active", button.dataset.viewTarget === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindEvents() {
  $("#chooseKeyButton").addEventListener("click", () => $("#keyFile").click());
  $("#keyFile").addEventListener("change", (event) => event.target.files[0] && importKeyFile(event.target.files[0]).catch((error) => showToast(error.message)));
  const drop = $("#keyDrop");
  ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.remove("dragging"); }));
  drop.addEventListener("drop", (event) => event.dataTransfer.files[0] && importKeyFile(event.dataTransfer.files[0]).catch((error) => showToast(error.message)));
  $("#forgetKeyButton").addEventListener("click", forgetKey);
  $("#registerButton").addEventListener("click", register);
  $("#refreshAllButton").addEventListener("click", () => refreshAll());
  $("#refreshDiscoveryButton").addEventListener("click", async () => { try { await refreshDiscovery(); await refreshMemberRegistrations(); renderAll(); showToast(t("refreshDone")); } catch (error) { showToast(error.message); } });
  $("#refreshTeamButton").addEventListener("click", async () => { try { await refreshTeamRoom(); renderAll(); } catch (error) { showToast(error.message); } });
  $("#refreshEntriesButton").addEventListener("click", async () => { try { await refreshEntries(); renderAll(); } catch (error) { showToast(error.message); } });
  $("#refreshResultsButton").addEventListener("click", async () => { try { await refreshResults(); renderAll(); } catch (error) { showToast(error.message); } });
  $("#addMemberButton").addEventListener("click", () => { try { addMember($("#memberDidInput").value); $("#memberDidInput").value = ""; } catch (error) { showToast(error.message); } });
  $("#gameId").addEventListener("change", syncTeamInputs);
  $("#roomGeneration").addEventListener("change", syncTeamInputs);
  $("#requestRoomButton").addEventListener("click", requestRoom);
  $("#signRosterButton").addEventListener("click", signRoster);
  $("#copyInviteButton").addEventListener("click", copyInvite);
  $("#publishRecruitmentButton").addEventListener("click", publishRecruitment);
  $("#requestJoinButton").addEventListener("click", () => requestJoin());
  $("#suggestFilter").addEventListener("input", renderLetterHelper);
  // A suggestion is only a shortcut into the same input, so it still goes
  // through every check before the button enables.
  $("#suggestions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-word]");
    if (!button) return;
    $("#wordInput").value = button.dataset.word;
    validateWordInput();
  });
  $("#wordInput").addEventListener("input", validateWordInput);
  $("#wordVersion").addEventListener("input", validateWordInput);
  $("#stateHash").addEventListener("input", validateWordInput);
  $("#sendWordButton").addEventListener("click", sendWord);
  $("#sendChatButton").addEventListener("click", sendChat);
  $("#chatInput").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); sendChat(); } });
  $("#preparePoemButton").addEventListener("click", checkPoem);
  $("#xPostIds").addEventListener("input", renderSubmissionButton);
  $("#finalVersion").addEventListener("input", renderSubmissionButton);
  $("#submitPoemButton").addEventListener("click", submitPoem);
  $("#voteEntryId").addEventListener("input", renderEntries);
  $("#voteButton").addEventListener("click", castVote);
  $("#claimDestination").addEventListener("input", renderResults);
  $("#claimButton").addEventListener("click", claimPrize);
  $("#openXButton").addEventListener("click", () => {
    if ($("#openXButton").href.includes("/compose/post") && state.poem.xText) {
      navigator.clipboard.writeText(state.poem.xText).catch(() => {});
    }
  });

  document.addEventListener("click", (event) => {
    const lang = event.target.closest("[data-lang]");
    if (lang) { state.lang = lang.dataset.lang; localStorage.setItem("sonnet-lang", state.lang); applyLanguage(); }
    const nav = event.target.closest("[data-view-target]");
    if (nav) showView(nav.dataset.viewTarget);
    const go = event.target.closest("[data-go]");
    if (go) showView(go.dataset.go);
    const role = event.target.closest("[data-role]");
    if (role && !role.disabled) { state.role = role.dataset.role; renderRegistration(); }
    const remove = event.target.closest("[data-remove-member]");
    if (remove) { state.team.members = state.team.members.filter((did) => did !== remove.dataset.removeMember); saveTeam(); renderAll(); }
    const join = event.target.closest("[data-join-game]");
    if (join) requestJoin(join.dataset.joinGame);
    const add = event.target.closest("[data-add-request]");
    if (add) { try { addMember(add.dataset.addRequest); } catch (error) { showToast(error.message); } }
    const roster = event.target.closest("[data-load-roster]");
    if (roster) loadRoster(roster.dataset.loadRoster);
    const entry = event.target.closest("[data-select-entry]");
    if (entry) { $("#voteEntryId").value = entry.dataset.selectEntry; renderEntries(); }
  });
}

loadInviteFromUrl();
bindEvents();
applyLanguage();
updateCountdown();
setInterval(updateCountdown, 1000);
setInterval(refreshPendingRegistration, 10000);
refreshAll(false);
