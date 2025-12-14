# Claude Code への指示

## 目的

Playwright専用ブラウザで「今見ている画面のテキスト」を1秒ごとに取得し、ファイルに保存するツールを作成する。

これにより、ユーザーが見ている内容をClaudeがリアルタイムで把握できるようになる。

---

## 作業ディレクトリ

```
C:\Users\user\Projects\note-to-markdown\
```

既存ファイルがある場所。ここに追加する。

---

## 作成するファイル

### 1. `live_view.py`

**機能：**
- Playwright で Chromium ブラウザを起動（GUI表示、ヘッドレスではない）
- 既存の Cookie（`.cookies\note_cookies.json`）を読み込んでログイン状態を維持
- 指定URLを開く（デフォルト：note有料記事のURL）
- 1秒ごとに画面内の可視テキストを取得
- `current_view.txt` に上書き保存
- ユーザーがブラウザを操作（スクロール等）するとリアルタイムで反映

**仕様：**
```python
# 起動方法
python live_view.py

# または URL指定
python live_view.py "https://note.com/oji_to_moji/n/xxxxx"
```

**取得するテキスト：**
- 画面に「今見えている範囲」のテキストのみ
- スクロール位置も記録（上から何%の位置か）
- body全体ではなく、viewport内のみ

**出力ファイル形式（current_view.txt）：**
```
=== 更新時刻: 2025-12-14 15:30:45 ===
=== スクロール位置: 35% ===
=== URL: https://note.com/... ===

（ここに画面内テキスト）
```

---

## 技術要件

1. **Playwright使用**（既にインストール済み）
2. **Cookie読み込み**
   - `.cookies\note_cookies.json` から読み込む
   - 前回作成した `note_to_markdown.py` と同じ形式
3. **非同期処理**
   - 1秒ごとのループ
   - ブラウザ操作をブロックしない
4. **エラーハンドリング**
   - ブラウザが閉じられたら終了
   - ネットワークエラーは無視して継続

---

## 実装のヒント

### viewport内テキスト取得（JavaScript）
```javascript
// 画面内の可視要素のテキストを取得
function getVisibleText() {
    const elements = document.body.querySelectorAll('*');
    let visibleText = [];
    
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
        
        if (isVisible && el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            const text = el.textContent.trim();
            if (text) visibleText.push(text);
        }
    });
    
    return visibleText.join('\n');
}
```

### スクロール位置取得
```javascript
function getScrollPercent() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round((scrollTop / docHeight) * 100);
}
```

---

## 確認事項（作業前に聞いて）

1. note有料記事のURLは何を使うか？
2. ブラウザウィンドウのサイズ指定はあるか？
3. 他に取得したい情報はあるか？（現在のセクション名など）

---

## 完成後の使い方

```
1. python live_view.py を実行
2. Playwrightブラウザが開く
3. note記事が表示される
4. ユーザーが自由にスクロール操作
5. current_view.txt が1秒ごとに更新される
6. Claudeは current_view.txt を読んで「今どこを見てるか」把握
```

---

## 優先度

- まず最小構成で動くものを作る
- 細かい調整は後から

作業開始してOK。質問あれば聞いて。
