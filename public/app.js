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
    noReasonGiven: "the referee gave no reason",
    refereeBehind: "The referee is a long way behind right now: it is answering only a small share of the registrations arriving, so almost nobody is getting a quick answer. This wait does not tell you anything about your DID, and registering again would only add a second request behind the first. Leave the page open, it keeps checking by itself.",
    watchingForReceipt: "This page is watching for the answer and will fill it in by itself, usually within a few seconds. Do not reload: your private key is held in this tab only, so reloading loses it and you have to choose the file again.", silentlyIgnored: "The referee normally answers in a few seconds and it has not answered this. It does not refuse a key that has no signed record from before 11 September 12:00 UTC, it ignores it, so a registration that stays unanswered usually means the key is too new for this contest. This is a guess from the wait, not something the referee said.", cutoffExplainer: "This key has no signed record from before 11 September 12:00 UTC, so it cannot write or vote in this contest. Trying again will not change it. Use an older DID.",
    roleLocked: "This DID is already registered for this contest. One DID is one role, and its role is:",
    roleAlreadyPosted: "This DID already has a registration waiting on the referee, for the role:", roleOpen: "Pick a role, then register. Writer is only the default on this screen: to vote, switch to Voter first. One DID holds one role and it locks for good once the referee accepts it.",
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
    finishAndSubmit: "Finish and submit", voteHeading: "Read the entries and vote", voteNav: "Vote", stepFive: "Step 5",
    xPostLinks: "X post links, one per line",
    loadingPoem: "Loading the poem from the team room...", poemUnavailable: "The poem could not be read from that team room.",
    hashVerified: "Matches the submitted hash", hashUnverified: "Hash not confirmed",
    postLinkHint: "The account that wrote the last word publishes the poem on X, then pastes the link of each post here, in reading order.",
    wrongAccount: "This link is not the registered account. The referee refuses the submission:",
    submitNote: "Only the writer of the last word publishes and submits. Every link must be on that one account: a teammate posting from their own account does not count. Their X account is fixed at registration and cannot be changed later.",
    onePost: "One post, it fits", postsInOrder: "posts, in this order", copy: "Copy", copied: "Post copied.",
    poemAutoFilled: "The accepted poem was filled in for you. Check it, publish it, then paste the post IDs.",
    voteNeedsKey: "Choose your private key JSON first, on the Connect screen.", voteNotOpen: "Voting is not open yet.", voteClosed: "Voting has closed.", voteWrongRole: "This DID is registered for the role {role}, and only a voter can sign a ballot. One DID holds one role and a writer cannot also vote, so voting needs a different DID, registered as a voter.", voteRejected: "The referee refused this registration, so no ballot from this DID will count. See the reason on the Connect screen.", voteUnconfirmed: "The referee has not answered your voter registration yet. You can still sign a ballot: the referee answers every ballot in the votes room on its own, and that answer is the one that counts. Its reply appears here within a few seconds.", ballotAccepted: "Your ballot was accepted by the referee, for entry {entry}.", ballotRefused: "The referee refused your ballot: {reason}", voteNeedsEntry: "Pick an entry from the list, or type its ID above.",
    publicEntries: "Public entries", noEntries: "No accepted entries found.", entryId: "Entry ID", castVote: "Sign public ballot", finalStage: "Final stage",
    contestResults: "Contest results", noResults: "The referee has not published results.", paymentDestination: "Payment destination from the announced method", signClaim: "Sign prize claim",
    launchNotVerified: "Launch not verified", startsIn: "Starts in", contestLive: "Contest live", contestClosed: "Contest closed", keyLoaded: "DID imported.",
    keyNotJson: "This file is not JSON. Choose the .json file your signing tool wrote, not a text note or a PEM file.",
    keyHalvesDisagree: "The private and public halves in this file do not belong together, so it cannot be used. Export the key again from the tool that made it.",
    keyDidMismatch: "This file names a different DID than its key produces. The key in it belongs to {did}. Check you picked the right file.",
    invalidKey: "No Ed25519 private key could be read from this file. A JWK, a multibase or nacl secret key, or a raw 32 byte seed as hex or base64 all work, under the usual field names.", keyForgotten: "Private key removed from this tab.", refreshDone: "Live rooms refreshed.",
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
    noReasonGiven: "referee sebep bildirmedi",
    refereeBehind: "Referee şu an çok geride: gelen kayıtların yalnızca küçük bir kısmını cevaplıyor, yani neredeyse hiç kimse hızlı cevap alamıyor. Bu bekleme DIDiniz hakkında bir şey söylemiyor ve tekrar kaydolmak sadece ilkinin arkasına ikinci bir istek ekler. Sayfayı açık bırakın, kendisi kontrol etmeye devam ediyor.",
    watchingForReceipt: "Bu sayfa cevabı kendisi bekliyor ve geldiğinde kendisi yazacak, genelde birkaç saniye içinde. Sayfayı yenilemeyin: özel anahtarınız yalnızca bu sekmede tutuluyor, yenilerseniz kaybolur ve dosyayı tekrar seçmeniz gerekir.", silentlyIgnored: "Referee normalde birkaç saniyede cevap verir ve buna cevap vermedi. 11 Eylül 12:00 UTC öncesine ait imzalı kaydı olmayan bir anahtarı reddetmiyor, yok sayıyor. Yani cevapsız kalan bir kayıt genelde anahtarın bu yarışma için çok yeni olduğu anlamına gelir. Bu, bekleme süresinden çıkarılmış bir tahmin, referee'nin söylediği bir şey değil.", cutoffExplainer: "Bu anahtarın 11 Eylül 12:00 UTC öncesine ait imzalı bir kaydı yok, bu yüzden bu yarışmada ne yazabilir ne oy verebilir. Tekrar denemek sonucu değiştirmez. Daha eski bir DID kullanın.",
    roleLocked: "Bu DID bu yarışmaya zaten kayıtlı. Bir DID tek rol alır, rolü:",
    roleAlreadyPosted: "Bu DID için referee'yi bekleyen bir kayıt zaten var, rolü:", roleOpen: "Rolü seçin, sonra kaydolun. Writer bu ekranda yalnızca varsayılan: oy verecekseniz önce Voter'a geçin. Bir DID tek rol taşır ve referee kabul ettiğinde kalıcı olarak kilitlenir.",
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
    finishAndSubmit: "Bitir ve gönder", voteHeading: "Katılımları oku ve oy ver", voteNav: "Oy ver", stepFive: "Adım 5",
    xPostLinks: "X gönderi linkleri, her satıra bir tane",
    loadingPoem: "Şiir takım odasından yükleniyor...", poemUnavailable: "Bu takımın odasından şiir okunamadı.",
    hashVerified: "Gönderilen hash ile aynı", hashUnverified: "Hash doğrulanamadı",
    postLinkHint: "Son kelimeyi yazan hesap şiiri X'te paylaşır, sonra her gönderinin linkini buraya okuma sırasıyla yapıştırır.",
    wrongAccount: "Bu link kayıtlı hesaba ait değil. Hakem gönderimi reddeder:",
    submitNote: "Şiiri sadece son kelimeyi yazan paylaşır ve sadece o gönderim yapabilir. Bütün linkler o tek hesaptan olmalı: takım arkadaşının kendi hesabından paylaşması saymaz. O kişinin X hesabı kayıtta sabitlenir, sonradan değiştirilemez.",
    onePost: "Tek gönderi, sığıyor", postsInOrder: "gönderi, bu sırayla", copy: "Kopyala", copied: "Gönderi kopyalandı.",
    poemAutoFilled: "Kabul edilen şiir sizin için dolduruldu. Kontrol edin, paylaşın, sonra post ID'lerini yapıştırın.",
    voteNeedsKey: "Önce Connect ekranından özel anahtar JSON dosyanızı seçin.", voteNotOpen: "Oylama henüz açılmadı.", voteClosed: "Oylama kapandı.", voteWrongRole: "Bu DID {role} rolüyle kayıtlı, oy pusulasını ise yalnızca voter imzalayabilir. Bir DID tek bir rol taşır ve writer olan biri oy veremez, yani oy vermek için voter olarak kayıtlı başka bir DID gerekiyor.", voteRejected: "Referee bu kaydı reddetti, bu DIDden gelen oy sayılmaz. Sebebi Connect ekranında yazıyor.", voteUnconfirmed: "Referee voter kaydınızı henüz cevaplamadı. Yine de oy imzalayabilirsiniz: referee her oyu oy odasında kendisi cevaplıyor ve sayılan cevap o. Cevabı birkaç saniye içinde burada görünür.", ballotAccepted: "Oyunuz referee tarafından kabul edildi, katılım: {entry}.", ballotRefused: "Referee oyunuzu reddetti: {reason}", voteNeedsEntry: "Listeden bir katılım seçin veya ID sini yukarıya yazın.",
    publicEntries: "Açık katılımlar", noEntries: "Kabul edilmiş katılım bulunamadı.", entryId: "Katılım ID", castVote: "Açık oyu imzala", finalStage: "Son aşama",
    contestResults: "Yarışma sonuçları", noResults: "Referee henüz sonuç yayımlamadı.", paymentDestination: "Duyurulan yönteme uygun ödeme adresi", signClaim: "Ödül talebini imzala",
    launchNotVerified: "Başlangıç doğrulanmadı", startsIn: "Başlamasına", contestLive: "Yarışma aktif", contestClosed: "Yarışma kapandı", keyLoaded: "DID içe aktarıldı.",
    keyNotJson: "Bu dosya JSON değil. İmzalama aracınızın yazdığı .json dosyasını seçin, metin notu veya PEM dosyası olmaz.",
    keyHalvesDisagree: "Bu dosyadaki özel ve açık anahtar birbirine ait değil, bu yüzden kullanılamıyor. Anahtarı üreten araçtan tekrar dışa aktarın.",
    keyDidMismatch: "Bu dosya, içindeki anahtarın ürettiğinden farklı bir DID yazıyor. Dosyadaki anahtar {did} adresine ait. Doğru dosyayı seçtiğinizden emin olun.",
    invalidKey: "Bu dosyadan Ed25519 özel anahtarı okunamadı. JWK, multibase veya nacl secret key, ya da 32 baytlık ham tohum (hex veya base64) hepsi çalışır, bilinen alan adları altında.", keyForgotten: "Private key bu sekmeden kaldırıldı.", refreshDone: "Canlı odalar yenilendi.",
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
  roleFromRoom: "",
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
  ballotMessages: [],
  resultMessages: [],
  dictionary: null,
  entryPoems: new Map(),
  currentState: { version: 0, hash: "", line: 1, poem: "", lastContributor: "", acceptedWords: [], complete: false },
  team: loadTeam(),
  poem: { canonical: "", hash: "", valid: false, xText: "" },
  registrationRefreshPending: false,
  refereeRate: null,
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

function base58Decode(value) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let number = 0n;
  for (const character of value) {
    const index = alphabet.indexOf(character);
    if (index < 0) return null;
    number = number * 58n + BigInt(index);
  }
  let hex = number.toString(16);
  if (hex.length % 2) hex = `0${hex}`;
  const digits = hex === "0" ? [] : hex.match(/../g).map((pair) => Number.parseInt(pair, 16));
  const leading = [];
  for (const character of value) { if (character === "1") leading.push(0); else break; }
  return new Uint8Array([...leading, ...digits]);
}

/** Bytes out of whatever a tool wrote them as: an array, hex, base64, base64url or multibase. */
function keyBytes(value) {
  if (Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) return new Uint8Array(value);
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (/^z[1-9A-HJ-NP-Za-km-z]+$/.test(text)) return base58Decode(text.slice(1));
  if (/^(0x)?[0-9a-f]+$/i.test(text) && text.replace(/^0x/, "").length % 2 === 0) {
    return new Uint8Array(text.replace(/^0x/, "").match(/../g).map((pair) => Number.parseInt(pair, 16)));
  }
  if (/^[A-Za-z0-9_+/=-]+$/.test(text)) { try { return base64urlToBytes(text); } catch { return null; } }
  return null;
}

/**
 * Turns a key file into the JWK this page signs with, whatever shape it arrived in.
 *
 * The contest defines no key file format. The rules say participants bring their own
 * signing tool, so the files people actually have were written by a dozen different
 * ones: a bare JWK, a JWK under some wrapper, a multibase pair from the W3C
 * libraries, a sixty-four byte secret key from the nacl family, a raw seed as hex or
 * base64. This page used to accept two of those and answer every other file with one
 * sentence saying it was not supported, which is true and useless: the key in the
 * file was almost always fine.
 *
 * Only the private seed is actually needed. Where the public half is missing it is
 * derived, by wrapping the seed as PKCS8 and letting WebCrypto hand back the pair,
 * so a file holding nothing but a seed still works. Where the file carries a public
 * key or a DID of its own, that is checked against what the seed produces rather
 * than trusted, because a mismatch means the file is not what its owner thinks.
 */
async function normalizeKeyJwk(payload) {
  const wrapped = payload?.privateKeyJwk || payload?.privateKeyJWK || payload?.jwk
    || (Array.isArray(payload?.keys) ? payload.keys[0] : null) || payload;
  const candidate = wrapped && typeof wrapped === "object" && !Array.isArray(wrapped) ? wrapped : {};

  // A JWK, however completely it was written out.
  if (candidate.d && candidate.x && (candidate.crv || "Ed25519") === "Ed25519") {
    return { kty: "OKP", crv: "Ed25519", d: candidate.d, x: candidate.x };
  }

  const seedSource = candidate.d ?? candidate.privateKeyMultibase ?? candidate.secretKey ?? candidate.privateKey
    ?? candidate.seed ?? candidate.key ?? (typeof payload === "string" ? payload : null)
    ?? (Array.isArray(payload) ? payload : null);
  let seed = keyBytes(seedSource);
  // Multibase private keys carry the 0x8026 multicodec; nacl secret keys are the
  // seed with the public key already appended.
  if (seed && seed.length === 34 && seed[0] === 0x80 && seed[1] === 0x26) seed = seed.slice(2);
  if (seed && seed.length === 64) seed = seed.slice(0, 32);
  if (!seed || seed.length !== 32) throw new Error(t("invalidKey"));

  const pkcs8 = new Uint8Array(48);
  pkcs8.set([0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20]);
  pkcs8.set(seed, 16);
  let derived;
  try {
    derived = await crypto.subtle.exportKey("jwk", await crypto.subtle.importKey("pkcs8", pkcs8, { name: "Ed25519" }, true, ["sign"]));
  } catch {
    throw new Error(t("invalidKey"));
  }
  const stated = candidate.publicKeyMultibase ?? candidate.publicKey ?? candidate.x;
  const statedBytes = stated ? keyBytes(stated) : null;
  if (statedBytes) {
    const publicKey = statedBytes.length === 34 && statedBytes[0] === 0xed && statedBytes[1] === 0x01 ? statedBytes.slice(2) : statedBytes;
    const matches = publicKey.length === 32 && bytesToBase64url(publicKey) === derived.x;
    if (!matches) throw new Error(t("keyHalvesDisagree"));
  }
  return { kty: "OKP", crv: "Ed25519", d: derived.d, x: derived.x };
}

async function importKeyFile(file) {
  let payload;
  try {
    payload = JSON.parse(await file.text());
  } catch {
    throw new Error(t("keyNotJson"));
  }
  const jwk = await normalizeKeyJwk(payload);
  if (jwk?.kty !== "OKP" || jwk?.crv !== "Ed25519" || !jwk.d || !jwk.x) throw new Error(t("invalidKey"));
  const rawPublic = base64urlToBytes(jwk.x);
  if (rawPublic.length !== 32) throw new Error(t("invalidKey"));
  const prefixed = new Uint8Array(34);
  prefixed.set([0xed, 0x01]);
  prefixed.set(rawPublic, 2);
  const did = `did:key:z${base58Encode(prefixed)}`;
  if (!DID_RE.test(did)) throw new Error(t("invalidKey"));
  // A file that names its own DID is checked against the one the key produces. The
  // W3C libraries write it as `id`, sometimes with a `#fragment` for the key inside
  // the document, so only the DID part is compared.
  const claimed = String(payload.did || payload.id || "").split("#")[0];
  if (claimed && claimed !== did) throw new Error(t("keyDidMismatch").replace("{did}", did));
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

/**
 * How much of the registration room's recent traffic the referee has answered.
 *
 * Needed to tell two very different waits apart. If the referee is answering the
 * people around you and not you, your key is the likely difference. If it is
 * answering almost nobody, the wait says nothing about your key and telling you
 * otherwise sends you off to find a second DID you did not need.
 */
async function readRefereeRate() {
  const room = await readRoom(ROOMS.registration);
  const messages = room.messages || [];
  const requests = messages.filter((message) => parseRecord(message.text)?.type === "sonnet.register.v1").length;
  const answers = messages.filter((message) => message.from === state.refereeDid).length;
  return { requests, answers };
}

const refereeIsBehind = () => {
  const rate = state.refereeRate;
  return Boolean(rate && rate.requests >= 20 && rate.answers * 4 < rate.requests);
};

async function readPoemWords(room) {
  const query = new URLSearchParams({ referee: state.refereeDid || "" });
  return api(`/api/poem-words/${encodeURIComponent(room)}?${query}`);
}
async function readRoomOwner(room) {
  return api(`/api/room-owners/${encodeURIComponent(room)}`);
}

async function postSigned(room, recordOrText) {
  const text = typeof recordOrText === "string" ? recordOrText : compact(recordOrText);
  const signed = await signText(room, text);
  const response = await api(`/api/rooms/${encodeURIComponent(room)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signed),
  });
  // Handed back so a caller can keep what it just signed. The room is the record,
  // but the room is also a ring, and a write is the one moment the sender holds the
  // message whole.
  return { response, message: { from: signed.did, nonce: signed.nonce, sig: signed.sig, text: signed.text, ts: new Date().toISOString() } };
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

/**
 * The referee's own words for why it refused.
 *
 * Every refusal carries a reason and none of it was reaching the screen, so a
 * rejected registration read as "Rejected" and nothing else. The most common
 * refusal in this contest by a wide margin is a key with no evidence from
 * before the identity cutoff, which is unfixable and worth saying out loud
 * rather than leaving someone to retry the same key.
 */
function rejectionReason(record) {
  const reason = findDeep(record, ["reason", "error", "detail"]);
  return typeof reason === "string" && reason.trim() ? reason.trim() : "";
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

/**
 * Keeps this DID's own registration across a room that has forgotten it.
 *
 * Only the participant's own signed message is kept, and only to recover the
 * request id the referee's answer will name. It proves nothing on its own: the
 * receipt still has to be read from the room and still has to be the referee's,
 * so a tampered copy buys a wrong request id and no acceptance.
 */
const registrationKey = () => `sonnet-registration-${state.did}`;

function rememberedRegistration() {
  if (!state.did) return null;
  try {
    const saved = JSON.parse(localStorage.getItem(registrationKey()) || "null");
    if (!saved || saved.from !== state.did || !saved.sig) return null;
    const record = parseRecord(saved.text);
    return record?.type === "sonnet.register.v1" && record.contest_id === CONTEST.id ? saved : null;
  } catch {
    return null;
  }
}

function saveRegistration(message) {
  if (!state.did || message.from !== state.did) return;
  try {
    localStorage.setItem(registrationKey(), JSON.stringify(message));
  } catch {
    // Losing the copy costs the recovery above, not the registration itself.
  }
}

/**
 * The public half of a did:key is the key itself: the string is the multicodec
 * prefix and the 32 raw bytes in base58. So a message can be checked against the
 * DID that claims to have written it without asking anyone.
 */
async function didPublicKey(did) {
  const bytes = base58Decode(String(did).replace(/^did:key:z/, ""));
  if (bytes.length !== 34 || bytes[0] !== 0xed || bytes[1] !== 0x01) return null;
  return crypto.subtle.importKey("raw", bytes.slice(2), { name: "Ed25519" }, false, ["verify"]);
}

async function verifyMessage(room, message) {
  try {
    const key = await didPublicKey(message.from);
    if (!key) return false;
    const canonical = `${room}|${message.nonce}|${message.text}`;
    return await crypto.subtle.verify("Ed25519", key, base64urlToBytes(message.sig), new TextEncoder().encode(canonical));
  } catch {
    return false;
  }
}

/**
 * The referee's answer has to be kept too, and for the same reason the request is:
 * the room is a ring. Under the current flood it holds about half an hour, so an
 * accepted voter who closes the tab and comes back finds neither their registration
 * nor the receipt that accepted it, and the screen has no way to tell them apart
 * from someone who never registered.
 *
 * Unlike the registration, a forged copy here would matter: it is the thing the
 * screen reads acceptance from. So it is only trusted after its Ed25519 signature
 * verifies against the referee's own DID, which is the same check the room would
 * have supported. Anyone can write a receipt; nobody else can sign one.
 */
const receiptKey = () => `sonnet-receipt-${state.did}`;

async function rememberedReceipt(requestId) {
  if (!state.did || !state.refereeDid) return null;
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(receiptKey()) || "null");
  } catch {
    return null;
  }
  if (!saved || saved.from !== state.refereeDid || !saved.sig) return null;
  const record = parseRecord(saved.text);
  if (record?.type !== "sonnet.receipt.v1" || record.contest_id !== CONTEST.id) return null;
  if (record.sender_did !== state.did) return null;
  if (requestId && record.request_id !== requestId) return null;
  return await verifyMessage(ROOMS.registration, saved) ? saved : null;
}

function saveReceipt(message) {
  if (!state.did || !message || message.from !== state.refereeDid) return;
  try {
    localStorage.setItem(receiptKey(), JSON.stringify(message));
  } catch {
    // Same as above: the copy is a convenience, the room stays the record.
  }
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
  const ownRegistration = (list) => [...list].reverse().find((message) => {
    const record = parseRecord(message.text);
    return message.from === state.did && record?.type === "sonnet.register.v1" && record.contest_id === CONTEST.id;
  });
  // The registration room is a ring and under the current flood it turns over in
  // about three hours, while the referee is running half an hour behind. So a
  // registration can age out of the room before its answer arrives, and the room
  // is then the wrong place to keep the only copy: the screen falls back to "not
  // registered", the obvious move is to register again, that goes to the back of
  // the queue, and the receipt for the first attempt can no longer be recognised
  // because the request id it answers left with the message. Keeping our own
  // registration here means the wait survives the room forgetting it.
  const remembered = rememberedRegistration();
  if (remembered && !ownRegistration(messages)) messages = mergeMessages(messages, [remembered]);
  const firstRegistration = ownRegistration(messages);
  if (firstRegistration) saveRegistration(firstRegistration);
  const firstRequestId = parseRecord(firstRegistration?.text)?.request_id;
  if (firstRequestId) {
    const receiptRoom = await readRoom(ROOMS.registration, firstRequestId);
    messages = mergeMessages(messages, receiptRoom.messages || []);
  }
  state.registrationMessages = messages;
  state.registration = ownRegistration(state.registrationMessages) || null;
  state.registrationReceipt = findReceipt(state.registrationMessages, state.registration);
  // The room answered, so that answer is kept: it is the copy that survives the
  // ring. When the room has nothing, the kept one stands in, but only after its
  // referee signature verifies.
  if (state.registrationReceipt) saveReceipt(state.registrationReceipt);
  else state.registrationReceipt = await rememberedReceipt(firstRequestId);
  state.registrationAccepted = recordStatus(parseRecord(state.registrationReceipt?.text)) === "accepted";
  // A DID already registered in this contest keeps the role it registered
  // with: one DID is one role and a writer cannot also vote. Overriding the
  // selection is correct, but doing it silently reads as the picker being
  // broken, so the reason is recorded for renderRegistration to show.
  // The receipt names the role too, and it outlives the registration here, so it
  // is the fallback once the request itself has left the room.
  const role = parseRecord(state.registration?.text)?.role || parseRecord(state.registrationReceipt?.text)?.role;
  state.roleFromRoom = role || "";
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
  await refreshBallot();
}

/**
 * Our own ballot and the referee's answer to it. Searched by DID, so the votes room
 * can hold ten thousand ballots and this still costs one narrow read.
 */
async function refreshBallot() {
  if (!state.did) {
    state.ballotMessages = [];
    return;
  }
  const room = await readRoom(ROOMS.votes, state.did);
  state.ballotMessages = room.messages || [];
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
    state.refereeRate = await readRefereeRate().catch(() => state.refereeRate);
    // Acceptance is what unlocks the ballot button, and that button is drawn by
    // renderEntries on another screen. Redrawing only the registration panel left
    // a registered voter looking at a dead button on the vote screen until they
    // happened to type in the entry field, which is a strange thing to discover.
    renderAll();
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
  // The referee's receipts carry no poem text, only state. `complete` is the
  // one authoritative signal that line 14 has closed, so it is read rather
  // than inferred from counting.
  let complete = false;
  const acceptedWords = [];
  const proposals = new Map();
  for (const message of messages) {
    const record = parseRecord(message.text);
    if (!record) continue;
    if (record.type === "sonnet.word.v1") proposals.set(record.request_id, { ...record, from: message.from });
    if (message.from !== state.refereeDid || recordStatus(record) !== "accepted") continue;
    if (record.complete === true) complete = true;
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
  return { version, hash, line, poem, lastContributor, acceptedWords, complete };
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
  // The rules fix the role on the first *accepted* registration, not on the
  // first attempt. Locking on any posted record left a rejected registration
  // holding the role forever, which is the one case the rules explicitly tell
  // people to retry, and a pending one stopped anybody who picked wrong from
  // correcting it before the referee had even answered.
  const locked = state.registrationAccepted;
  $$('[data-role]').forEach((button) => {
    button.classList.toggle("active", button.dataset.role === state.role);
    button.disabled = locked;
  });
  const note = $("#roleLockNote");
  if (locked) note.textContent = `${t("roleLocked")} ${t(state.role) || state.role}`;
  else if (state.roleFromRoom) note.textContent = `${t("roleAlreadyPosted")} ${t(state.roleFromRoom) || state.roleFromRoom}`;
  else note.textContent = state.did ? t("roleOpen") : "";
  note.classList.toggle("warn", Boolean(locked || state.roleFromRoom));
  $("#xField").classList.toggle("hidden", state.role !== "writer");
  const registerLabel = ownRecord && status !== "accepted"
    ? t("retryRegistration")
    : state.role === "writer" ? t("registerWriter") : state.role === "voter" ? t("registerVoter") : t("registerOrganizer");
  $("#registerButton").querySelector("span").textContent = registerLabel;
  const canRegister = state.did && state.launch && phase() === "live" && status !== "accepted";
  $("#registerButton").disabled = !canRegister;
  const reason = status === "rejected" ? rejectionReason(receiptRecord) : "";
  const message = !state.did ? t("registerFirst") : !state.launch ? t("officialLaunchNeeded") : status === "accepted" ? t("accepted") : status === "rejected" ? `${t("rejected")}: ${reason || t("noReasonGiven")}` : status === "pending" ? t("postedWaiting") : phase() !== "live" ? (phase() === "waiting" ? t("startsIn") : t("contestClosed")) : "";
  $("#registrationMessage").textContent = message;
  $("#registrationMessage").classList.toggle("warn", status === "rejected");
  // The cutoff refusal is the one people cannot fix by trying again, so it gets
  // said in full rather than left as a protocol string.
  // A refusal at least says something. The common case says nothing at all:
  // the referee answers eligible registrations in about four seconds and
  // simply never answers ones from a key with no pre-start evidence. Measured
  // in the live contest, 352 registrations older than ten minutes are still
  // unanswered, 217 of them voters. Without this the screen reads "waiting for
  // the referee" for the rest of the contest and never explains itself.
  const waited = status === "pending" && state.registration?.ts
    ? (Date.now() - new Date(state.registration.ts).getTime()) / 1000
    : 0;
  // And while the answer is still plausibly coming, the screen says so, because the
  // obvious thing to do with a page that looks stuck is reload it. This page keeps
  // the private key in this tab and nowhere else, so a reload costs the key and the
  // import has to be done again, to wait for an answer that was already on its way.
  $("#cutoffNote").textContent = /pre-start|evidence|cutoff/i.test(reason)
    ? t("cutoffExplainer")
    : status !== "pending" ? ""
      // A long wait only points at your key while the referee is keeping up with
      // everyone else. When it is answering a fraction of what arrives, the wait is
      // the queue, and blaming the key would send people hunting for another DID.
      : refereeIsBehind() ? t("refereeBehind")
        : waited > 120 ? t("silentlyIgnored") : t("watchingForReceipt");
  $("#cutoffNote").classList.toggle("eligibility-note", !refereeIsBehind());
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
  syncSubmissionFromRoom();
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
    return [{ entryId: String(entryId), gameId: findDeep(record, ["game_id"]) || submission?.record.game_id || t("unknown"), poemSha256: submission?.record.poem_sha256 || "", message }];
  });
}

/**
 * Loads the poem behind an entry, from that team's own room.
 *
 * Voters are asked which poem the judges will pick, and until now the list gave
 * them team names and an entry id to choose between. Every team room is public,
 * the words are in it, and the line breaks come back from the ten-syllable rule,
 * so the poem can be shown rather than described.
 *
 * The accepted words come from /api/poem-words, which walks the room's export and
 * pairs each accepted receipt with the proposal holding its word. That join used
 * to happen here, over whole rooms, which on the busiest room meant two megabytes
 * of refused attempts for 119 words and a read capped short of the opening lines.
 *
 * The referee's submission carries poem_sha256. Rebuilt text is hashed and
 * compared against it, so a poem is only labelled verified when it is provably
 * the frozen one, whatever the word list arrived looking like.
 */
async function loadEntryPoem(entry) {
  if (state.entryPoems.has(entry.entryId)) return state.entryPoems.get(entry.entryId);
  state.entryPoems.set(entry.entryId, { status: "loading" });
  try {
    await loadDictionary();
    const room = `d-sonnet-2-team-${entry.gameId}`;
    const data = await readPoemWords(room);
    const words = (data.words || []).filter((word) => WORD_RE.test(String(word))).map(String);
    const poem = rebuildPoemLines(words);
    const hash = poem ? await sha256Text(poem) : "";
    const verified = Boolean(entry.poemSha256) && hash === entry.poemSha256;
    const result = poem ? { status: "ready", poem, verified } : { status: "empty" };
    state.entryPoems.set(entry.entryId, result);
    return result;
  } catch (error) {
    const result = { status: "error", error: error.message };
    state.entryPoems.set(entry.entryId, result);
    return result;
  }
}

function entryPoemMarkup(entry) {
  const loaded = state.entryPoems.get(entry.entryId);
  if (!loaded || loaded.status === "loading") return `<p class="entry-poem quiet">${escapeHtml(t("loadingPoem"))}</p>`;
  if (loaded.status === "ready") {
    const badge = loaded.verified
      ? `<span class="poem-badge ok">${escapeHtml(t("hashVerified"))}</span>`
      : `<span class="poem-badge">${escapeHtml(t("hashUnverified"))}</span>`;
    return `${badge}<pre class="entry-poem">${escapeHtml(loaded.poem)}</pre>`;
  }
  return `<p class="entry-poem quiet">${escapeHtml(loaded.status === "empty" ? t("poemUnavailable") : loaded.error || t("poemUnavailable"))}</p>`;
}

/**
 * Says why the ballot button will not sign, when it will not.
 *
 * It was only ever disabled, with nothing beside it, and the reason is never the
 * button: it is a role, a wait, or an entry not yet chosen, all of them settled on
 * another screen. A voter who has done everything they were told to do arrives
 * here, finds a grey button, and has no way to learn which of those it is.
 */
function voteBlocker() {
  if (!state.did) return t("voteNeedsKey");
  if (phase() === "waiting") return t("voteNotOpen");
  if (phase() === "closed") return t("voteClosed");
  // Only a role the rooms actually record can block, not the one the picker happens
  // to be showing. The picker is a draft until the referee answers it, and reading
  // it as a verdict locked out voters who had simply not been answered yet.
  if (state.roleFromRoom && state.roleFromRoom !== "voter") return t("voteWrongRole").replace("{role}", state.roleFromRoom);
  if (recordStatus(parseRecord(state.registrationReceipt?.text)) === "rejected") return t("voteRejected");
  if (!$("#voteEntryId").value.trim()) return t("voteNeedsEntry");
  return "";
}

/**
 * Not a blocker, a caution. Waiting on the registration used to disable the button,
 * and that was this tool refusing on the referee's behalf, which it is not entitled
 * to do: the referee answers every ballot in the votes room on its own, and in the
 * room as it stands thousands of ballots are accepted while voter registrations go
 * unanswered under the flood. A voter held back by this screen was losing a vote the
 * referee would have counted. So the ballot goes, and its actual answer is shown.
 */
function voteCaution() {
  if (voteBlocker() || state.registrationAccepted) return "";
  return t("voteUnconfirmed");
}

/** The referee's answer to our own ballot, which is the only verdict that counts. */
function ballotVerdict() {
  if (!state.did || !state.refereeDid) return "";
  const receipt = [...state.ballotMessages].reverse().find((message) => {
    if (message.from !== state.refereeDid) return false;
    const record = parseRecord(message.text);
    // recordStatus answers "none" for anything that is not a verdict, and "none" is
    // a truthy string, so the decision itself has to be the test.
    return record?.contest_id === CONTEST.id && record.sender_did === state.did
      && ["accepted", "rejected"].includes(recordStatus(record));
  });
  if (!receipt) return "";
  const record = parseRecord(receipt.text);
  return recordStatus(record) === "accepted"
    ? t("ballotAccepted").replace("{entry}", record.entry_id || "?")
    : t("ballotRefused").replace("{reason}", record.reason || t("noReasonGiven"));
}

function renderEntries() {
  const entries = acceptedEntries();
  const list = $("#entryList");
  list.className = entries.length ? "entry-list" : "entry-list empty-state";
  list.innerHTML = entries.length ? entries.map((entry) => `<article class="entry-item"><header><div><strong>${escapeHtml(entry.gameId)}</strong><code>${escapeHtml(entry.entryId)}</code></div><button type="button" class="secondary" data-select-entry="${escapeHtml(entry.entryId)}">${escapeHtml(t("chooseEntry"))}</button></header>${entryPoemMarkup(entry)}</article>`).join("") : `<i data-lucide="inbox"></i><span>${escapeHtml(t("noEntries"))}</span>`;
  // Fetched once per entry and cached, then the list redraws with the poem in it.
  entries.filter((entry) => !state.entryPoems.has(entry.entryId))
    .forEach((entry) => loadEntryPoem(entry).then(() => renderEntries()));
  $("#entryCount").textContent = String(entries.length);
  // One expression decides both, so the button and the sentence beside it can no
  // longer disagree about why.
  const blocker = voteBlocker();
  $("#voteButton").disabled = Boolean(blocker);
  $("#voteNote").textContent = [blocker || voteCaution(), ballotVerdict()].filter(Boolean).join(" ");
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

// X counts an ordinary post at 280. A sonnet plus its attribution is around 720,
// so the single-post path only exists for accounts that can post long.
const X_LIMIT = 280;

/**
 * Splits a finished poem into posts that X will accept.
 *
 * The rules allow a thread but only permit splitting "between whole lines", so
 * stanzas are the natural seam and the split never lands mid-line. The
 * attribution rides on the last post, outside the poem, where the rules want it.
 *
 * Returns one post when the whole thing already fits, so an account that can
 * post long is not pushed into a thread it does not need.
 */
function splitForX(poem, attribution) {
  const whole = `${poem}\n\n${attribution}`;
  if (whole.length <= X_LIMIT) return [whole];
  const posts = poem.split("\n\n");
  posts[posts.length - 1] += `\n\n${attribution}`;
  // A stanza that still will not fit is split line by line rather than silently
  // shipped over the limit.
  const out = [];
  for (const post of posts) {
    if (post.length <= X_LIMIT) { out.push(post); continue; }
    let current = "";
    for (const line of post.split("\n")) {
      const candidate = current ? `${current}\n${line}` : line;
      if (candidate.length > X_LIMIT && current) { out.push(current); current = line; }
      else current = candidate;
    }
    if (current) out.push(current);
  }
  return out;
}

/**
 * Shows exactly what to post, in order, with a copy button per post.
 *
 * Handing someone 720 characters and an "Open X" button is what leaves them
 * splitting a sonnet by hand at 2am, and a split in the wrong place is refused
 * by the referee as an unverified publication.
 */
function renderPublishPlan() {
  const box = $("#publishPlan");
  if (!box) return;
  const posts = state.poem.posts || [];
  if (!posts.length) { box.innerHTML = ""; box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  const heading = posts.length === 1 ? t("onePost") : `${posts.length} ${t("postsInOrder")}`;
  box.innerHTML = `<div class="plan-head">${escapeHtml(heading)}</div>` + posts.map((text, index) => `
    <article class="plan-post">
      <header><span>${index + 1}/${posts.length}</span><b>${text.length}</b>
        <button type="button" class="copy-post" data-post="${index}">${escapeHtml(t("copy"))}</button></header>
      <pre>${escapeHtml(text)}</pre>
    </article>`).join("");
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
    // Labelled, because the rules ask the attribution to state contest_id,
    // game_id and the DID, not merely to contain the three values.
    const attribution = `contest_id: ${CONTEST.id}\ngame_id: ${state.team.gameId || "game_id"}\nFinal contributor: ${state.did || "did:key"}`;
    const full = `${canonical.text}\n\n${attribution}`;
    state.poem.xText = full;
    state.poem.posts = canonical.text ? splitForX(canonical.text, attribution) : [];
    renderPublishPlan();
    $("#openXButton").href = full.length <= X_LIMIT ? `https://x.com/intent/post?text=${encodeURIComponent(full)}` : "https://x.com/compose/post";
    $("#openXButton").classList.toggle("disabled", !canonical.text);
    renderSubmissionButton();
    showToast(t("poemPrepared"));
  } catch (error) { showToast(error.message); }
}

/**
 * Fills the submission in from the room and shows it once the poem is finished.
 *
 * Everything here is already known: the accepted text, its version, and who
 * wrote last. Asking the final contributor to retype a 130-word poem into a
 * textarea is how a stray space ends up in the frozen text and the hash stops
 * matching.
 */
/**
 * Rebuilds the poem's line breaks from the accepted words.
 *
 * The referee's receipts carry no poem text, so the tool otherwise joins the
 * accepted words with spaces and the result is one long line. The breaks are
 * recoverable without asking anyone: a line closes at exactly ten syllables,
 * which is the rule the referee enforced when it accepted each word, and the
 * stanzas are 4/4/4/2.
 *
 * Checked against a finished poem: 130 accepted words rebuilt to the frozen
 * text byte for byte.
 */
function rebuildPoemLines(words) {
  const dictionary = state.dictionary;
  if (!dictionary || !words.length) return "";
  const lines = [];
  let current = [];
  let syllables = 0;
  for (const word of words) {
    current.push(word);
    syllables += dictionary.get(bareWord(word)) || 0;
    if (syllables >= 10) { lines.push(current.join(" ")); current = []; syllables = 0; }
  }
  if (current.length) lines.push(current.join(" "));
  if (lines.length !== 14) return "";
  return lines.map((line, index) => (index === 3 || index === 7 || index === 11 ? `${line}\n` : line)).join("\n");
}

function syncSubmissionFromRoom() {
  const panel = $("#submitPanel");
  if (!panel) return;
  if (!state.currentState.complete) { panel.classList.add("hidden"); return; }
  panel.classList.remove("hidden");
  const poem = rebuildPoemLines(state.currentState.acceptedWords || []);
  if (!poem) return;
  const field = $("#finalPoem");
  if (field.value.trim() !== poem.trim()) {
    field.value = poem;
    $("#finalVersion").value = state.currentState.version || "";
    if (!state.poem.autoFilled) { state.poem.autoFilled = true; showToast(t("poemAutoFilled")); }
    checkPoem();
  } else if (!$("#finalVersion").value) {
    $("#finalVersion").value = state.currentState.version || "";
  }
}

function renderSubmissionButton() {
  const ids = parsePostIds($("#xPostIds").value);
  // The referee requires every post to be on the account the final contributor
  // registered, and refuses the whole submission otherwise. Cheaper to say so
  // here than to spend a request_id finding out.
  const registered = String(state.registration?.x_account_url || "").split("/").filter(Boolean).pop() || "";
  const wrong = registered ? parsePostHandles($("#xPostIds").value).filter((handle) => handle.toLowerCase() !== registered.toLowerCase()) : [];
  const note = $("#postLinkNote");
  if (note) {
    note.textContent = wrong.length ? `${t("wrongAccount")} @${wrong[0]}` : "";
    note.classList.toggle("warn", wrong.length > 0);
  }
  const finalVersion = Number($("#finalVersion").value);
  const isLast = !state.currentState.lastContributor || state.currentState.lastContributor === state.did;
  $("#submitPoemButton").disabled = !(state.did && state.poem.valid && ids.length && finalVersion >= 1 && state.team.generation > 0 && isLast && phase() === "live");
}

/**
 * Reads the post links people actually paste.
 *
 * The `status/` path is looked for first. Taking the first long number in the
 * string instead pulls the digits out of a handle: given
 * x.com/user12345/status/1966..., the earlier match wins and the submission
 * carries "12345" as its post id.
 *
 * A bare id is still accepted, since that is what the field used to ask for.
 */
function parsePostIds(value) {
  return String(value).split(/\s+/).map((item) => {
    const fromUrl = item.match(/status\/([0-9]{5,30})/);
    if (fromUrl) return fromUrl[1];
    const bare = item.match(/^[0-9]{5,30}$/);
    return bare ? bare[0] : "";
  }).filter(Boolean);
}

/** The handles in the pasted links, so a post from the wrong account is caught here. */
function parsePostHandles(value) {
  return String(value).split(/\s+/)
    .map((item) => item.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\//)?.[1] || "")
    .filter(Boolean);
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
    const posted = await postSigned(ROOMS.registration, record);
    // Kept before the first read, so the wait is recoverable even if the room
    // turns over between the write and the referee's answer.
    saveRegistration(posted.message);
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
  const blocker = voteBlocker();
  if (blocker) return showToast(blocker);
  const entryId = $("#voteEntryId").value.trim();
  if (!entryId) return;
  try {
    await postSigned(ROOMS.votes, { type: "sonnet.ballot.v1", contest_id: CONTEST.id, voter_did: state.did, entry_id: entryId, request_id: requestId("ballot") });
    showToast(t("ballotPosted"));
    // The answer lands in the votes room a moment later, so it is fetched and shown
    // rather than left for the next poll.
    await refreshBallot();
    renderEntries();
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
  $("#publishPlan").addEventListener("click", (event) => {
    const button = event.target.closest("[data-post]");
    if (!button) return;
    const text = (state.poem.posts || [])[Number(button.dataset.post)];
    if (text) navigator.clipboard.writeText(text).then(() => showToast(t("copied"))).catch((error) => showToast(error.message));
  });
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
