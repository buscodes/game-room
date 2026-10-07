# Oyun Salonu — Satranç, Pişti, Pis Yedili

Bilgisayara karşı **satranç**, **pişti** ve **pis yedili** oynanan, TypeScript/React ile yazılmış tam yığın bir web
uygulaması. Gerçekçi ahşap tahta, gerçek iskambil kartı görselleri, üç zorluk seviyesi, Türkçe/İngilizce arayüz ve
her oyundan önce animasyonlu bir tanıtım içerir.

## Hızlı başlangıç

Node.js 20 veya üzeri gerekir.

```bash
npm install
npm run dev        # API :3001 + web :5173  →  http://localhost:5173
npm test           # birim + mimari testleri (vitest)
npm run typecheck  # TypeScript denetimi
npm run lint       # ESLint
npm run format     # Prettier
```

## Oyunlar

|                | Kolay                                                 | Orta                               | Zor                                                                |
| -------------- | ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| **Satranç**    | 6 rastgele yasal hamle arasından olasılığa göre seçim | Stockfish (derinlik 6) en iyi aday | Stockfish (derinlik 14) en iyi aday                                |
| **Pişti**      | Yalnızca "alır mı?" bilgisi, rastgele ağırlıklı seçim | Masadaki ve eldeki kartları bilir  | Oynanmış bütün kartları sayar, rakibe pişti verme riskini hesaplar |
| **Pis Yedili** | Rastgele ağırlıklı seçim                              | En iyi hamle                       | Sıradaki oyuncunun hangi türlerde kart çektiğini hatırlar          |

**Pis Yedili** 2–5 oyunculu (sen + 1–4 bot) ve yardımlıdır: oynanabilir kartlar parlar, uymayan kartların üzerinde
nedeni yazar, yardım çubuğu o anki durumu anlatır, **İpucu** düğmesi en iyi hamleyi önerir.
Kurallar: aynı tür ya da değer atılır · **7** sıradakine 3 kart çektirir (7 ile karşılanırsa ceza birikir) ·
**8** sıradakini atlatır · **vale** jokerdir ve tür seçtirir. Kurallar `packages/domain/src/pis7/rules.ts` içindedir.

Yan paneldeki **"Rakibin düşüncesi"**, bilgisayarın her hamlede tarttığı adayları, olasılıklarını ve konum
değerlendirmesini canlı gösterir.

## Dil ve tanıtım

- Varsayılan dil İngilizce. Üst bardaki **TR / EN** düğmesi tüm siteyi çevirir; seçim tarayıcıda saklanır.
  Ortak metinler `apps/web/src/shared/presentation/i18n/locales/`, her oyunun metinleri kendi modülünde
  (`features/<oyun>/presentation/i18n/`). Sunucu dil bilmez; çeviri tamamen web'de yapılır.
- Her oyuna girerken fragman tarzı bir **tanıtım** açılır (oynatıcı `shared/presentation/organisms/onboarding/`, sahneler her oyun modülünde);
  "Bir daha gösterme" ile kapatılabilir, üst bardaki "Nasıl oynanır?" ile tekrar açılır.

## Mimari

**Clean Architecture + oyun başına modül.** Her oyun (satranç, pişti, pis yedili) sunucuda ve web'de ayrı bir
modüldür; katmanlar ve Atomic Design her modülün içinde uygulanır. Ortak parçalar `shared` modülündedir ve hiçbir
oyunu bilmez. Kurallar `tests/architecture.test.ts` ile otomatik denetlenir:

- bağımlılıklar yalnızca içe doğru akar (presentation/interface → application → domain),
- modüller birbirine yalnızca `index.ts` üzerinden erişir,
- atoms → molecules → organisms → templates → pages sırası korunur.

```
packages/
  domain/          Saf iş kuralları (dil, ağ, dosya bilmez)
    common/  ai/     kartlar, zorluk, kural ihlali; botların karar modeli ve seçimi
    chess/ pisti/ pis7/   kurallar, botlar, ChessEngine portu
  contracts/       Sunucu ↔ web API sözleşmesi (DTO'lar, hata kodları)

apps/server/src/
  shared/          GameStateStore portu + AES-256-GCM uygulaması, HTTP uygulaması ve hata eşleme
  modules/
    chess/           application (use-case'ler) · infrastructure (Stockfish) · interface (route, presenter) · index.ts
    pisti/  pis7/    application · interface · index.ts
  main/            bileşim kökü; yerel sunucu ve Vercel giriş noktaları

apps/web/src/
  shared/          ortak modül
    application/     createDependency (DI), Preferences portu, ApiError
    infrastructure/  HTTP istemcisi, localStorage
    presentation/    atoms · molecules · organisms (TopBar, AiPanel, Onboarding …) · templates · i18n · styles
  features/
    home/            lobi: oyun modüllerinin lobi kartlarını gösterir
    chess/           application (useChessGame, ChessApi portu) · infrastructure (HTTP)
                     presentation/ atoms · molecules · organisms · pages · i18n (tr/en) · index.ts
    pisti/  pis7/    aynı yapı
  app/             bileşim kökü (port uygulamaları + rotalar)
```

- **Sunucu dil bilmez.** Botun seçenekleri, gerekçeleri ve hatalar kod + parametre olarak gelir
  (ör. `{ code: "capturesPile", params: { n: 3, pts: 2 } }`); metne çeviri yalnızca web'de, `useFormat` ile yapılır.
- **Sunucu durumsuzdur.** Oyunun tüm durumu AES-256-GCM ile şifrelenmiş bir **jeton** olarak tarayıcıda durur ve
  her istekte geri gönderilir. Rakibin eli okunamaz; jeton değiştirilirse reddedilir. Eski bir jetonu yeniden
  göndererek hamle geri almak mümkündür — bilgisayara karşı oyunda sorun değildir.
- **Stockfish 19 Lite** WASM olarak API'nin içinde (ayrı süreç açmadan) çalışır ve `ChessEngine` portunu uygular.
- Use-case'ler portlar sayesinde altyapı olmadan test edilir (`apps/server/src/modules/*/application/use-cases.test.ts`).

## Vercel'e yayınlama

Ayrı bir sunucu ya da veritabanı gerekmez; her şey tek bir Vercel projesidir.

1. Repoyu GitHub'a gönder, Vercel'de **Add New → Project** ile içe aktar. Ayar gerekmez, `vercel.json` hazırdır.
   Terminalden yayınlamak için: `npx vercel`.
2. İsteğe bağlı ortam değişkeni: `GAME_SECRET` — oyun jetonlarının şifreleme anahtarı. Tanımlanmazsa her dağıtıma
   özel rastgele bir anahtar üretilir (yeni dağıtımda süren oyunlar sıfırlanır).

`npm run build:vercel`, [Build Output API](https://vercel.com/docs/build-output-api) biçiminde `.vercel/output`
üretir: `static/` (web) ve `functions/api.func` (tek dosyaya paketlenmiş API + Stockfish WASM, toplam ≈3 MB).

## Güvenlik

- Repoda gizli anahtar yoktur; `.env` dosyaları `.gitignore`'dadır.
- Oyun jetonları AES-256-GCM ile şifrelenir ve imzalanır. Üretimde `GAME_SECRET` tanımlanmalıdır; tanımlanmazsa
  repodaki geliştirme anahtarı **kullanılmaz**, süreç başına rastgele bir anahtar üretilir (Vercel derlemesi
  dağıtıma özel anahtarı kendisi ekler).
- İstek gövdeleri sınırlıdır (256 KB), girdiler doğrulanır (zorluk, aralıklar, satranç kareleri, terfi taşı),
  hatalar iç ayrıntı sızdırmadan kodla döner. Yanıtlarda `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `Permissions-Policy` başlıkları vardır.
- Hız sınırı uygulamada yoktur; herkese açık yayında Vercel Firewall ile bir kural eklenmesi önerilir.

## Lisans

[GNU GPL v3.0 veya sonrası](LICENSE). Proje, aynı lisansla gelen [Stockfish](https://github.com/nmrugg/stockfish.js)'i
sunucu fonksiyonunun içinde birlikte dağıttığı ve GPL'li cburnett taş görsellerini kullandığı için GPL-3.0 ile
lisanslanmıştır. Diğer görsellerin kaynakları ve lisansları: `apps/web/public/assets/CREDITS.md`.
