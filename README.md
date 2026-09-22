# PushDay — landing page

Bitta sahifali (scroll) landing. Bo'limlar ilovaning pastdagi menyusi
tartibida joylashgan: **Vazifa → Pomodoro → Statistika → Chellenj**.

## Fayllar

```
index.html                  sahifaning o'zi
assets/styles.css           barcha dizayn (ranglar, o'lchamlar, moslashuv)
assets/app.js               kichik animatsiya va sozlamalar
assets/fonts.css            shriftlar (Poppins + Inter)
assets/fonts/*.woff2        shrift fayllari (loyiha ichida, internetga bog'liq emas)
assets/screens/web/*.webp   sahifada ishlatiladigan telefon rasmlari (1x va 2x)
assets/screens/png/*.png    yuqori sifatli 2x nusxalar (zaxira/master)
images/*.png                siz bergan asl skrinshotlar (o'zgarmagan)
docs/                       sahifaning ko'rinish rasmlari (kompyuter, planshet, telefon)
tools/                      rasmlarni qayta ishlash skriptlari
```

## Ko'rish

`index.html` faylini brauzerda ochsangiz yetarli. Shriftlar va rasmlar
loyiha ichida bo'lgani uchun internet kerak emas.

## Coolify'da joylash

Landing statik sayt. Coolify'da uni `Railpack` yoki `Web application` qilib
ishga tushirmang, chunki saytda doimiy ishlaydigan server process yo'q.

Repo ichidagi `Dockerfile` Nginx orqali barqaror static server tayyorlaydi.
Coolify sozlamalari:

- Build pack: `Dockerfile`
- Base directory: `/`
- Dockerfile location: `/Dockerfile`
- Port: `80`

Docker imijini lokal tekshirish:

```sh
docker build -t pushday-landing .
docker run --rm -p 8080:80 pushday-landing
```

So'ngra brauzerda `http://localhost:8080` manzilini oching.

## Nima o'zgartiriladi

**Telegram havolasi.** Ikkita joyda: `index.html` ichidagi
`data-bot-link` belgisi bor havolalar («Botni ochish» tugmalari) va
`assets/app.js` faylidagi `botUrl` qatori. Hozir bot manzili
`https://t.me/pushdaybot`.

**Matnlar.** Barcha sarlavha va tavsiflar `index.html` ichida, o'zbek tilida.

## Rasmlar sifatini qayta ishlash

`images/` ichidagi asl skrinshotlar 564 piksel kenglikda edi — katta
ekranlarda xira ko'rinadi. `tools/process-images.js` ularni:

1. bir xil 564 × 1605 nisbatga keltiradi (pastdagi menyu har doim ramkaning
   tagida turadi),
2. 2x o'lchamga (1128 piksel) ko'taradi,
3. yengil o'tkirlashtirish beradi,
4. `assets/screens/` ichiga PNG va WebP qilib yozadi.

Qayta ishga tushirish:

```
npm install sharp --prefix tools
node tools/process-images.js
```

Boshqa skriptlar: `tools/fetch-fonts.js` (shriftlarni yuklab oladi),
`tools/shoot.js` (sahifani brauzerda ochib, `docs/` ga rasm oladi),
`tools/crop.js` (rasmning bir qismini kesish).

## Moslashuv

Test qilingan kengliklar: 430 px (telefon), 834 px (planshet),
1440 px (kompyuter). Gorizontal siljish (overflow) yo'q, shriftlar
loyihadan yuklanadi.
