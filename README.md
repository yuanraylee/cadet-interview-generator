# Cadet Interview Generator — modular version

這是從你上傳的 `index(1).html` 整理的原生 HTML / CSS / JavaScript 網站。網站執行時**不需要 npm、React、API Key 或伺服器**；只有維護文章庫、執行驗證與測試時需要 Node.js 18 以上版本，不需安裝第三方套件。

## 專案結構

```text
cadet-interview-generator/
├── index.html                  網頁結構和 script / CSS 引用
├── assets/
│   ├── icons/eye.svg           題目右側的眼睛圖示
│   ├── logos/favicon.svg       瀏覽器和左上角共用 Logo
│   └── images/                 預留文章圖片、照片
├── css/
│   ├── base.css                基礎及歷代基礎樣式
│   ├── theme.css               黑白主題
│   ├── cards.css               卡片、版面與手機顯示
│   ├── header.css              網站 Logo 與標題
│   ├── answers.css             題目及答案控制外觀
│   └── print.css               列印樣式
├── data/
│   ├── article-library/        每篇文章一個 JSON（文章資料來源）
│   ├── articles.js             自動產生的網站文章庫，請勿手動編輯
│   ├── questions.js            Q4 / Q5 題庫
│   └── atc.js                  ATC 模擬句型
├── schemas/
│   └── article.schema.json     Article Schema V1.0
├── scripts/
│   ├── validate-articles.js    結構、內容與跨檔重複檢查
│   └── build-article-bank.js   產生網站既有格式的 articles.js
├── tests/
│   └── articles.test.cjs       遷移完整性與驗證回歸測試
└── js/
    ├── utils/helpers.js        共用工具、目前題目資料
    ├── generators/
    │   ├── articles.js         文章篩選
    │   ├── questions.js        心算、轉向、溫度、五問
    │   └── atc.js              ATC 隨機生成
    ├── ui/
    │   ├── render.js           題目及答案的 HTML
    │   ├── answers.js          Show All 和眼睛按鈕
    │   └── export.js           Copy 和 Print
    └── app.js                  Generate 事件與初始化
```

## 使用方式

1. VS Code 選 **File → Open Folder**，選擇整個資料夾。
2. 用 **Live Server** 擴充功能或 `python3 -m http.server 8000` 在本機預覽（瀏覽器開 `http://localhost:8000`）。
3. `index.html` 只是一個入口檔案；**部署到 GitHub / Netlify 時，要一起上傳全部資料夾**。
4. 建議先用獨立的 `dev` 分支測試，確認後再合併到 `main`。

## 要改什麼就去哪裡

- **換左上角與 Favicon：** `assets/logos/favicon.svg`（同一份檔案）
- **增加一個眼睛或其他 Icon：** 放到 `assets/icons/`，再由 HTML 或 `js/ui/render.js` 引用
- **增加文章插圖：** 放到 `assets/images/`，並按需求改 `js/ui/render.js` 顯示圖片
- **新增文章：** 在 `data/article-library/` 新增 JSON，驗證後重新產生 `data/articles.js`
- **新增 Q4 / Q5：** `data/questions.js`
- **改 ATC 句型：** `data/atc.js`
- **改答案互動：** `js/ui/answers.js`
- **改列印：** `css/print.css`

## 重構原則

- 保留 Show All / Hide All、每題眼睛、Copy、Print、出題與原有內容。
- 目前使用依順序載入的傳統 JavaScript（`defer`），避免引入工具鏈。**不要隨意交換 `index.html` 中的 script 順序**。
- CSS 先按歷次樣式層次拆分，避免改變畫面優先順序；後續可以在有畫面回歸測試後繼續移除重複樣式。
- 圖片和 Logo 的權利需自行確認。

## Article Library V1.0

目前 27 篇既有文章已逐篇遷移至 `data/article-library/AV-0001.json`～`AV-0027.json`。網站仍依原本方式載入 `data/articles.js`，所以既有 UI、隨機選文、字數篩選與部署方式不需修改；該檔案改由建置程式產生。

每篇 JSON 包含固定 ID、標題、分類、難度、狀態、來源、逐段內容、標籤與四項審核紀錄。英文與繁中以段落為單位配對；目前 GitHub `main` 的既有文章只有英文，因此遷移資料的 `zh` 為 `null`，`review.translation` 為 `false`，沒有虛構或自動補入翻譯。

### 新增或修改文章

1. 複製一份現有 JSON，使用下一個永久 ID（例如 `AV-0028`），檔名必須與 ID 相同。
2. 編輯 `data/article-library/AV-0028.json`。不要重複使用已刪除文章的 ID，也不要手動填寫字數。
3. 驗證文章庫：

   ```bash
   node scripts/validate-articles.js
   ```

4. 重新產生網站文章庫：

   ```bash
   node scripts/build-article-bank.js
   ```

5. 執行回歸測試：

   ```bash
   node --test tests/*.test.cjs
   ```

也可以使用 `npm run validate:articles`、`npm run build:articles` 與 `npm test`；`package.json` 沒有任何第三方相依套件。

### 驗證與發布規則

- ID 必須符合 `AV-0000` 格式，且 ID、標題及正規化後的英文全文不可重複。
- 英文內容必須介於 100～500 字，標題、分類、來源、標籤與審核欄位不可缺漏。
- 翻譯必須「全部段落完成」或「全部為 `null`」，不允許只翻一部分卻標記完成。
- `published` 文章的英文、事實與著作權審核必須通過；只有 `published` 文章會進入網站文章庫。
- `node scripts/build-article-bank.js --check` 只檢查產出是否為最新版，不會改寫檔案，適合 CI 或送出 PR 前使用。

`schemas/article.schema.json` 是資料交換規格；`scripts/validate-articles.js` 另外執行字數、翻譯完整性、檔名一致性與跨檔重複檢查。新增來源文章仍需由維護者確認內容正確性與使用權，通過格式驗證不代表已取得轉載權。


## English interface and A4 printing

The website uses an English interface. The `css/print.css` stylesheet is the print-only A4 portrait layout, including page margins and typography. It prints only currently visible answers. Click **Show All** before **Print** to include the complete answer key; leave answers collapsed for a questions-only worksheet.

To remove the browser-generated `index.html` URL, date, and page numbers from the paper or PDF, open your browser's print dialog and turn **Headers and footers** **off** (Chrome / Edge: **More settings → Headers and footers**). Webpage CSS cannot reliably disable the browser's own print header/footer.

In the print dialog, select **A4**, **Portrait**, and preferably **100% scale**. Test the print preview before publishing.

## New ATC practice: Squawk / IDENT

The generator includes simulated **Squawk code assignment** and **Squawk IDENT** scenarios in Easy, Normal, and Hard difficulties. Codes use four digits in the 0–7 range. The existing 3-ATC random generation, individual answer reveals, Show All, Copy and Print remain unchanged.

**Printing the local URL:** `127.0.0.1:5500/index.html` is added by the browser, not by the site. In Chrome/Edge's Print dialog choose **More settings → Headers and footers → Off**. This must be changed in browser settings; CSS cannot guarantee removal.


## ATC Expanded Edition

- Adds 21 simulated situation templates in `data/atc-extra.js`: IFR clearance, start-up, pushback facing, taxi routes, holding short, runway crossing, frequency transfers, direct routing, speed control, crossing restrictions, holding, QNH, ILS/visual approaches, go-around, runway vacating, taxi to stand, repeat/verification, position reports, weather advisories, and revised clearances.
- Original situations including Squawk / IDENT are retained. Three transmissions use distinct flight/communication phases when available and different airline callsigns.
- Everything is for **interview memory practice**, not for actual aircraft operations. Some templates deliberately assume fictional taxiways, runways, frequencies, and fixes. Real readback requirements differ by instruction type and jurisdiction.
- `index.html` loads `data/atc-extra.js` after `data/atc.js`; **upload this file along with the other changed files**.


## Hard+ ATC memory mode

The **Hard** selection now uses nine dedicated advanced templates with **6–8 information units**, varied numbers, conditional timing, and sequence-sensitive readbacks. The existing Easy and Normal pools are unchanged. Each generation still provides three different callsigns across distinct phases. These are hypothetical memory drills, **not published operational clearances**.

New source: `data/atc-hard-plus.js`, loaded in `index.html` before the generator script. When copying the upgrade into a clone, remember to include this new file.


## ATC 80,000 indexed training variants

Hard mode draws from an on-demand 80,000-item combinatorial catalog in `data/atc-80k.js` (eight scenario families with 10,000 indexed parameter combinations each). **80,000 distinct synthetic variants, not 80,000 sourced real-world transmissions.** On each Generate, one departure, one en-route, and one arrival prompt are sampled. The simulator never loads a 80,000-line static file. `window.CadetAtcCatalog.byId(0..79999, 'Dynasty 521')` retrieves a reproducible item in the browser console.

Phraseology study reference: ICAO Doc 9432, 4th edition (2007), Chapters 2 (numbers, call signs, readback), 4 (aerodrome), 6 (surveillance/SSR), 7 (approach). Scenario combinations and readbacks are educational approximations, not certified ATC phraseology or operational clearances. Some combinations can be operationally unrealistic, and all fictitious routes/levels require independent validation before use in real aviation.


## ATC expanded teaching answers

Every ATC question now includes: flight phase/context, ICAO-style written pronunciation for numerals in the original transmission, reference readback, written pronunciation of the readback, explanation of each information item, and a learning point. The teaching template is `js/ui/atc-explanation.js`; its styles are in `css/answers.css`. The original ATC generator and its 80,000 indexed Hard combinations remain unchanged.

**Aviation caveat:** These are synthetic interview drills. The number pronunciation is an ICAO-style learning aid, not speech playback; waypoints and airline call signs are not individually phoneticized. Some generated readback phrases are simplified training references, not operationally validated phraseology. Do not use these as actual ATC clearances.
