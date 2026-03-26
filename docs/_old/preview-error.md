# pnpm preview エラーまとめ

## 症状
- `pnpm preview`（wrangler dev）が `Uncaught ReferenceError: document is not defined` で起動失敗。
- エラー位置は SSR バンドル `dist/index.js` の top-level 参照。

## 原因
- SSR 依存解決が `browser` 条件を優先し、ブラウザ専用エクスポートを選択。
- 例: named character reference の処理が `document.createElement` を使う browser 実装に解決され、Workers で `document` が未定義。

## 解決手法
- Vite の SSR 解決条件を `workerd/worker` 優先に固定し、`browser` を外す。
- これにより Workers 互換のエクスポートが選ばれ、`document` 参照が消える。

## 確認手順
1. `pnpm run build`
2. `pnpm preview`（サーバが正常起動）

## 変更点
- `vite.config.ts`: `ssr.resolve.conditions` を追加。
