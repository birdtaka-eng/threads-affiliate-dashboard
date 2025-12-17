import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, Lock, Play, Settings, User, Search, FileText, Calendar, BarChart3, Zap, Shield, AlertTriangle, Sparkles, Target, TrendingUp, Box, Clock, LineChart, ExternalLink, AlertCircle, XCircle, SkipForward, RotateCcw, Trash2, Plus, Edit3, Save, Key, HelpCircle, X, Eye, EyeOff } from 'lucide-react';

// 各ステップのフォーム設定（RPG風：説明・質問付き）
const stepFormConfigs = {
  '0-1': {
    fields: [
      {
        id: 'rakutenLogin',
        label: '楽天アカウントでログイン',
        type: 'checkbox',
        question: '楽天のサイトにログインできますか？',
        explanation: '楽天で買い物したことがあれば、そのアカウントでOK！\n持っていない場合は、下のリンクから新規登録してください。',
        link: {
          url: 'https://www.rakuten.co.jp/',
          text: '🔗 楽天市場を開く'
        }
      },
      {
        id: 'affiliateRegistered',
        label: '楽天アフィリ公式サイトで登録',
        type: 'checkbox',
        question: '楽天アフィリエイトに登録しましたか？',
        explanation: '登録はとってもカンタン！\n\n📝 登録手順：\n1. 下のリンクから公式サイトへ\n2. 「今すぐ登録」をクリック\n3. 楽天アカウントでログイン\n4. 利用規約に同意して完了！\n\n✨ 審査なし・即日利用OK',
        link: {
          url: 'https://affiliate.rakuten.co.jp/',
          text: '🔗 楽天アフィリエイト公式サイトを開く'
        }
      },
      {
        id: 'affiliateId',
        label: 'アフィリエイトIDをメモ',
        type: 'text',
        placeholder: '例: 12345678',
        question: '登録後に発行されたIDは何ですか？',
        explanation: '登録が完了すると、あなた専用のIDが発行されます。\n\n📍 確認方法：\n楽天アフィリエイト管理画面 → 「サイト情報」で確認できます。\n\nこのIDは後で使うので、ここにメモしておきましょう！'
      },
    ],
    completionCheck: (data) => data?.rakutenLogin && data?.affiliateRegistered && data?.affiliateId,
  },
  '0-2': {
    fields: [
      {
        id: 'hasInstagram',
        label: 'Instagramアカウントを持っている',
        type: 'checkbox',
        question: 'Instagramのアカウントはありますか？',
        explanation: 'ThreadsはInstagramと連携して作成します。なければ先にInstagramアカウントを作りましょう。'
      },
      {
        id: 'threadsCreated',
        label: 'Threadsアカウント作成完了',
        type: 'checkbox',
        question: 'Threadsアプリでアカウントを作成しましたか？',
        explanation: 'Threadsアプリをダウンロードして、Instagramアカウントでログインするだけです。'
      },
      {
        id: 'threadsUsername',
        label: 'Threadsユーザー名',
        type: 'text',
        placeholder: '@username',
        question: 'あなたのThreadsユーザー名は？',
        explanation: '後で確認するために記録しておきましょう。@から始まるユーザー名です。'
      },
    ],
    warnings: [
      { condition: (data, mode) => mode === 'beginner', message: '⚠️ PC初回ログインでアカウント停止のリスクあり。まずスマホで数投稿してから！', type: 'warning' },
    ],
    completionCheck: (data) => data?.threadsCreated && data?.threadsUsername,
  },
  '0-3': {
    fields: [
      {
        id: 'urlCopied',
        label: 'ThreadsプロフィールURLをコピーした',
        type: 'checkbox',
        question: 'ThreadsのプロフィールURLをコピーしましたか？',
        explanation: 'Threadsアプリの自分のプロフィール画面から「プロフィールをシェア」でURLをコピーできます。'
      },
      {
        id: 'siteRegistered',
        label: '楽天にサイト登録申請した',
        type: 'checkbox',
        question: '楽天アフィリエイト管理画面でサイト登録しましたか？',
        explanation: '楽天アフィリエイト管理画面 → サイト情報 → 新規サイト追加 でThreadsのURLを登録します。'
      },
      {
        id: 'approved',
        label: '審査完了（承認済み）',
        type: 'checkbox',
        question: '審査は完了しましたか？（通常1-3日）',
        explanation: '承認されるまではアフィリエイトリンクを貼っても報酬が発生しません。焦らず待ちましょう。'
      },
    ],
    completionCheck: (data) => data?.approved,
  },
  '1-1': {
    fields: [
      {
        id: 'selectedGenre',
        label: 'ジャンルを選択',
        type: 'select',
        question: 'どんな商品を紹介したいですか？',
        explanation: '初心者は「見た目が映える商品」がオススメ！画像だけで興味を引けるので、難しい言葉を考えなくてOK。インテリア・ファッション・ガジェットは画像映え◎で言葉不要。コスメ・サプリは言葉での説得が必要なので中〜上級者向け。',
        options: [
          { value: 'interior', label: 'インテリア・雑貨', difficulty: '初心者向け', warning: null },
          { value: 'fashion', label: 'ファッション', difficulty: '初心者向け', warning: null },
          { value: 'gadget', label: 'ガジェット', difficulty: '初心者向け', warning: null },
          { value: 'cosme', label: 'コスメ・美容', difficulty: '中級者向け', warning: '言葉での説得力が必要です' },
          { value: 'supplement', label: 'サプリ・健康', difficulty: '上級者向け', warning: '言葉での説得が必須。初心者には難しいジャンルです' },
          { value: 'other', label: 'その他', difficulty: '-', warning: null },
        ],
      },
      {
        id: 'customGenre',
        label: 'その他の場合、具体的に',
        type: 'text',
        placeholder: '具体的なジャンル名',
        showIf: (data) => data?.selectedGenre === 'other',
        question: '具体的にどんなジャンルですか？',
        explanation: '「見た目が大切なモノ」かどうかを考えてみてください。'
      },
      {
        id: 'genreReason',
        label: 'このジャンルを選んだ理由',
        type: 'textarea',
        placeholder: '例: 自分も好きで詳しいから、毎日見ても飽きないから',
        question: 'なぜこのジャンルに興味がありますか？',
        explanation: 'SNS副業は継続が1番重要。楽しみながら投稿できるものを選ぶと続けやすいです。好きなことなら知識ゼロでもOK！'
      },
    ],
    completionCheck: (data) => data?.selectedGenre && (data?.selectedGenre !== 'other' || data?.customGenre),
  },
  '1-2': {
    fields: [
      {
        id: 'targetAge',
        label: 'ターゲット年齢層',
        type: 'select',
        question: 'どんな年齢の人に届けたいですか？',
        explanation: '自分と同じ年代を選ぶと共感されやすいです。迷ったら「自分と同世代」を選びましょう。',
        options: [
          { value: '10-20', label: '10-20代' },
          { value: '20-30', label: '20-30代' },
          { value: '30-40', label: '30-40代' },
          { value: '40-50', label: '40-50代' },
          { value: '50+', label: '50代以上' },
          { value: 'all', label: '全年齢' },
        ]
      },
      {
        id: 'targetGender',
        label: 'ターゲット性別',
        type: 'select',
        question: '男性向け？女性向け？両方？',
        explanation: '選んだジャンルによって自然と決まることが多いです。雑貨・コスメは女性向け、ガジェットは男性向けが多いです。',
        options: [
          { value: 'female', label: '女性' },
          { value: 'male', label: '男性' },
          { value: 'all', label: '両方' },
        ]
      },
      {
        id: 'accountCharacter',
        label: 'アカウントのキャラ設定',
        type: 'textarea',
        placeholder: '例: 同世代の雑貨好き女子として、おしゃれアイテムを紹介',
        question: 'あなたはどんなキャラで発信しますか？',
        explanation: '「同世代の〇〇好き」くらいシンプルでOK。細かいペルソナ設計は不要です。'
      },
      {
        id: 'oneLiner',
        label: '一言コンセプト',
        type: 'text',
        placeholder: '〇〇な人に△△を届けるアカウント',
        question: '一言で表すと、どんなアカウント？',
        explanation: '例：「20-30代女性に素敵な暮らしアイテムを紹介するアカウント」これだけで十分！'
      },
    ],
    completionCheck: (data) => data?.targetAge && data?.targetGender && data?.oneLiner,
  },
  '1-3': {
    fields: [
      {
        id: 'accountName',
        label: 'アカウント名',
        type: 'text',
        placeholder: '例: みゆ｜暮らしの雑貨',
        question: 'あなたの名前＋ジャンルを組み合わせてみましょう',
        explanation: '覚えやすく、ジャンルが伝わる名前がベスト。「名前｜ジャンル」の形式が人気です。'
      },
      {
        id: 'profileTitle',
        label: '肩書き（1行）',
        type: 'text',
        placeholder: '例: 30代｜インテリア好き',
        question: 'あなたの年代と興味を一行で',
        explanation: '権威性がなくても大丈夫。「〇〇代｜〇〇好き」でOK。'
      },
      {
        id: 'profileValue',
        label: '提供価値',
        type: 'text',
        placeholder: '例: 毎日おしゃれアイテム紹介',
        question: 'フォローすると何が見れますか？',
        explanation: '「毎日〇〇紹介」「週3で〇〇情報」など、具体的に。'
      },
      {
        id: 'profileCTA',
        label: 'CTA（行動喚起）',
        type: 'text',
        placeholder: '例: フォローで見逃し防止',
        question: 'フォローを促す一言は？',
        explanation: '「フォローで見逃し防止」「いいねで応援」など。'
      },
      {
        id: 'fullProfile',
        label: 'プロフィール全文',
        type: 'textarea',
        placeholder: '上記を組み合わせて完成させましょう',
        question: '上の内容を組み合わせてプロフィールを完成させましょう',
        explanation: '絵文字は1-2個まで。シンプルに、3秒で価値が伝わるように。'
      },
    ],
    warnings: [
      { condition: (data) => data?.fullProfile?.includes('元美容部員'), message: '「元美容部員」等の虚偽の肩書きは禁止です', type: 'error' },
    ],
    completionCheck: (data) => data?.accountName && data?.fullProfile,
  },
  '1-4': {
    fields: [
      {
        id: 'iconStyle',
        label: 'アイコンスタイル',
        type: 'select',
        question: 'どんなアイコンにしますか？',
        explanation: '顔出しなしでもOK。イラストや商品画像で統一感を出せばOK。Canvaで簡単に作れます。',
        options: [
          { value: 'face', label: '顔出し' },
          { value: 'illustration', label: 'イラスト' },
          { value: 'product', label: '商品・アイテム画像' },
          { value: 'logo', label: 'ロゴ・文字' },
        ]
      },
      {
        id: 'iconCreated',
        label: 'アイコン画像を作成した',
        type: 'checkbox',
        question: 'アイコン画像は準備できましたか？',
        explanation: '正方形で、背景はシンプルに。スマホで見ても分かりやすいものに。'
      },
      {
        id: 'iconSet',
        label: 'Threadsにアイコンを設定した',
        type: 'checkbox',
        question: 'Threadsのプロフィールに設定しましたか？',
        explanation: 'プロフィール編集からアイコンを変更できます。'
      },
    ],
    completionCheck: (data) => data?.iconSet,
  },
  '2-1': {
    fields: [
      {
        id: 'largeAccountsCount',
        label: 'フォローした大手アカウント数',
        type: 'number',
        min: 0,
        max: 20,
        target: 5,
        question: '何件の大手アカウントをフォローしましたか？',
        explanation: '大手をフォローすると、ホーム欄がジャンル関連で埋まってリサーチしやすくなります。バズるパターンも自然と身につきます。'
      },
      {
        id: 'largeAccountsList',
        label: 'フォローしたアカウント',
        type: 'textarea',
        placeholder: '@account1\n@account2\n...',
        question: 'フォローしたアカウントをメモしておきましょう',
        explanation: '後で参考にするためにメモしておくと便利です。'
      },
    ],
    completionCheck: (data) => data?.largeAccountsCount >= 5,
  },
  '2-2': {
    fields: [
      {
        id: 'midAccountsCount',
        label: 'フォローした中規模アカウント数',
        type: 'number',
        min: 0,
        max: 20,
        target: 5,
        question: '何件の中規模アカウントをフォローしましたか？',
        explanation: 'フォロワー500-5,000人は「再現可能な成功例」。完璧じゃなくても伸びてる=自分でも真似できる！'
      },
      {
        id: 'midAccountsList',
        label: 'フォローしたアカウント',
        type: 'textarea',
        placeholder: '@account1\n@account2\n...',
        question: '「自分もできそう」と思ったアカウントは？',
        explanation: 'フォロワーが少ないのにバズってる投稿 = 「商品自体にバズる力がある」証拠です。'
      },
    ],
    completionCheck: (data) => data?.midAccountsCount >= 5,
  },
  '2-3': {
    fields: [
      {
        id: 'buzzPostsCount',
        label: 'ストックしたバズ投稿数',
        type: 'number',
        min: 0,
        max: 50,
        target: 10,
        question: '参考になる投稿を何件保存しましたか？',
        explanation: 'バズ投稿には「型」があります。保存→分析→アレンジで効率的にバズを狙えます。'
      },
      {
        id: 'buzzPostsNotes',
        label: 'バズ投稿の分析メモ',
        type: 'textarea',
        placeholder: '・〇〇の投稿: フック文が良かった\n・△△の投稿: 画像が映えてた',
        question: 'なぜその投稿はバズったと思いますか？',
        explanation: '「フック文が良い」「画像が映えてる」「共感できる」など、理由を書いておくと後で役立ちます。'
      },
    ],
    completionCheck: (data) => data?.buzzPostsCount >= 10,
  },
  '2-4': {
    fields: [
      {
        id: 'productCount',
        label: 'リストアップした商品数',
        type: 'number',
        min: 0,
        max: 50,
        target: 10,
        question: '紹介したい商品を何件見つけましたか？',
        explanation: '事前にストックしておくと、投稿ネタに困りません。楽天で同じ商品を検索してブックマークしておきましょう。'
      },
      {
        id: 'productList',
        label: '商品リスト',
        type: 'textarea',
        placeholder: '1. 商品名 - 楽天URL\n2. 商品名 - 楽天URL\n...',
        question: '見つけた商品をリストアップしましょう',
        explanation: '価格帯は2,000-10,000円がクリックされやすい。「画像映え」する商品を優先！'
      },
    ],
    completionCheck: (data) => data?.productCount >= 10,
  },
  '3-1': {
    fields: [
      {
        id: 'greetingTemplate',
        label: '使用するテンプレート',
        type: 'select',
        question: 'どのテンプレートを使いますか？',
        explanation: 'Threadsでは「はじめまして投稿」がバズりやすい！フォロワー0でも800いいね以上獲得した実例あり。',
        options: [
          { value: 'gather', label: '「〇〇な人、集まれ！」' },
          { value: 'followOnly', label: '「〇〇好きだけフォローして」' },
          { value: 'introduction', label: '「はじめまして！〇〇歳の〇〇です」' },
          { value: 'passion', label: '「〇〇が好きすぎて発信始めました」' },
          { value: 'custom', label: 'オリジナル' },
        ]
      },
      {
        id: 'greetingPost',
        label: '挨拶投稿の本文',
        type: 'textarea',
        placeholder: '投稿本文を入力...',
        rows: 6,
        question: 'テンプレートを参考に、あなたの挨拶投稿を書いてみましょう',
        explanation: 'ターゲットに刺さるフック文 + 自分の属性 + ジャンルのバズワード + CTA（いいね、フォローを促す）の構成で。'
      },
      {
        id: 'greetingReady',
        label: '投稿準備完了',
        type: 'checkbox',
        question: '投稿する準備はできましたか？',
        explanation: 'バズったらコメント欄に「他にもこんな投稿してます！プロフィール見てね」と追加して誘導しましょう。'
      },
    ],
    completionCheck: (data) => data?.greetingPost && data?.greetingReady,
  },
  '3-2': {
    fields: [
      {
        id: 'draftPostsCount',
        label: '準備した投稿数',
        type: 'number',
        min: 0,
        max: 20,
        target: 5,
        question: '何件の投稿を準備しましたか？',
        explanation: '投稿の「弾」を事前に用意しておくと、継続が楽になります。'
      },
      {
        id: 'draftPostsList',
        label: '準備した投稿メモ',
        type: 'textarea',
        placeholder: '1. 〇〇商品の紹介\n2. △△商品の紹介\n...',
        question: 'どんな投稿を準備しましたか？',
        explanation: 'アカウント初期は「すでにバズっている商品」を多めに投稿するのがコツ。'
      },
    ],
    completionCheck: (data) => data?.draftPostsCount >= 5,
  },
  '3-3': {
    fields: [
      {
        id: 'postsPerDay',
        label: '1日の投稿数',
        type: 'select',
        question: '1日に何回投稿しますか？',
        explanation: '最低5投稿が推奨。でも無理のない範囲で継続できる数を選びましょう。',
        options: [
          { value: '1-2', label: '1-2投稿' },
          { value: '3-4', label: '3-4投稿' },
          { value: '5+', label: '5投稿以上（推奨）' },
        ]
      },
      {
        id: 'mainPostTime',
        label: 'メインの投稿時間',
        type: 'select',
        question: 'いつ投稿しますか？',
        explanation: '20-21時が最も伸びやすい「ゴールデンタイム」。推し商品はこの時間に！',
        options: [
          { value: 'morning', label: '7:00-8:00（朝）' },
          { value: 'lunch', label: '12:00-13:00（昼）' },
          { value: 'evening', label: '20:00-21:00（夜・推奨）' },
        ]
      },
      {
        id: 'scheduleNotes',
        label: 'スケジュールメモ',
        type: 'textarea',
        placeholder: '月: アフィ投稿\n火: 有益投稿\n...',
        question: '曜日ごとの投稿タイプを決めましょう',
        explanation: '楽天イベント（5と0のつく日、お買い物マラソン）に合わせて投稿頻度UPがオススメ。'
      },
    ],
    completionCheck: (data) => data?.postsPerDay && data?.mainPostTime,
  },
  '4-1': {
    fields: [
      {
        id: 'day1Posted',
        label: '挨拶投稿を実行した',
        type: 'checkbox',
        question: '挨拶投稿を投稿しましたか？',
        explanation: '19-21時の投稿がオススメ。投稿後のアクション（いいね回り）で初速をブースト！'
      },
      {
        id: 'day1Engagement',
        label: '投稿後、同ジャンルにいいね回りをした',
        type: 'checkbox',
        question: '同ジャンルの投稿にいいねしましたか？',
        explanation: 'いいね回りでジャンル認知を高めます。コメント周りは不自然に見えるので非推奨。'
      },
      {
        id: 'day1Result',
        label: '3時間後の反応',
        type: 'text',
        placeholder: '例: いいね50、コメント5',
        question: '投稿の反応はどうでしたか？',
        explanation: '記録しておくと、後で分析に役立ちます。'
      },
    ],
    completionCheck: (data) => data?.day1Posted,
  },
  '4-2': {
    fields: [
      {
        id: 'day2AffPosted',
        label: 'アフィリエイト投稿を開始した',
        type: 'checkbox',
        question: '商品紹介投稿を始めましたか？',
        explanation: '準備した商品投稿を1-2個投稿してみましょう。'
      },
      {
        id: 'day2PRmarked',
        label: 'PR表記をつけている',
        type: 'checkbox',
        question: 'PR表記は入れていますか？',
        explanation: 'アフィリエイトリンクを貼る投稿には必ずPR表記が必要です。規約違反にならないように！'
      },
      {
        id: 'day2LinkInComment',
        label: 'リンクはコメント欄に貼っている',
        type: 'checkbox',
        question: 'リンクはコメント欄に貼っていますか？',
        explanation: '外部リンクを本文に入れると表示回数が下がる傾向があります。コメント欄がオススメ。'
      },
      {
        id: 'day2Notes',
        label: '反応メモ',
        type: 'textarea',
        placeholder: '投稿ごとの反応を記録',
        question: '投稿の反応はどうでしたか？',
        explanation: 'どの商品が反応良かったかを記録しておきましょう。'
      },
    ],
    warnings: [
      { condition: (data, mode) => mode === 'beginner' && !data?.day2PRmarked, message: '⚠️ PR表記は必須です！忘れると規約違反になります', type: 'error' },
    ],
    completionCheck: (data) => data?.day2AffPosted && data?.day2PRmarked,
  },
  '4-3': {
    fields: [
      {
        id: 'rotationStarted',
        label: '3種類の投稿ローテーションを開始した',
        type: 'checkbox',
        question: '投稿の種類を意識して投稿していますか？',
        explanation: '収益投稿・フォロワー増加投稿・ファン化投稿の3種類をバランスよく。有益投稿がバズると次のアフィ投稿も伸びやすい！'
      },
      {
        id: 'weeklyPlan',
        label: '週間投稿計画',
        type: 'textarea',
        placeholder: '月: 収益投稿\n火: フォロワー増加投稿\n水: ファン化投稿\n...',
        rows: 7,
        question: '1週間の投稿計画を立てましょう',
        explanation: '収益投稿週3-4回、フォロワー増加投稿週2-3回、ファン化投稿週1-2回が目安。'
      },
    ],
    completionCheck: (data) => data?.rotationStarted,
  },
  '5-1': {
    fields: [
      {
        id: 'roomCreated',
        label: '楽天ROOMアカウント作成済み',
        type: 'checkbox',
        question: '楽天ROOMのアカウントは作りましたか？',
        explanation: 'ROOMを活用するとまとめ投稿が楽になり、収益UPが期待できます。'
      },
      {
        id: 'roomLinked',
        label: 'プロフィールにROOMリンク追加済み',
        type: 'checkbox',
        question: 'ThreadsプロフィールにROOMリンクを追加しましたか？',
        explanation: 'プロフィールにROOMリンクを入れておくと、「詳細はROOMで」と誘導できます。'
      },
      {
        id: 'roomUrl',
        label: '楽天ROOM URL',
        type: 'text',
        placeholder: 'https://room.rakuten.co.jp/...',
        question: 'あなたのROOMのURLは？',
        explanation: '後で確認するために記録しておきましょう。'
      },
    ],
    completionCheck: (data) => data?.roomLinked,
  },
  '5-2': {
    fields: [
      {
        id: 'analysisStarted',
        label: '投稿分析を開始した',
        type: 'checkbox',
        question: '投稿の振り返りを始めましたか？',
        explanation: '成果を出す人は「投稿して終わり」ではなく、必ず振り返りをしています。'
      },
      {
        id: 'bestPost',
        label: '最もバズった投稿',
        type: 'textarea',
        placeholder: 'どの投稿がなぜバズったか',
        question: '一番反応が良かった投稿は？なぜだと思いますか？',
        explanation: 'Threadsは一度バズった投稿が何度でも伸びる傾向があります。'
      },
      {
        id: 'improvements',
        label: '改善点（3つ）',
        type: 'textarea',
        placeholder: '1. 〇〇を改善\n2. △△を試す\n3. □□を強化',
        question: '来週試してみたい改善点は？',
        explanation: '投稿→振り返り→改善のシンプルなPDCAをコツコツ回すのが成功の近道。'
      },
    ],
    completionCheck: (data) => data?.analysisStarted,
  },
  '5-3': {
    fields: [
      {
        id: 'ready',
        label: '1つ目のアカウントが軌道に乗った',
        type: 'checkbox',
        question: '1つ目のアカウントは順調ですか？',
        explanation: '目安：フォロワー1000人 or 運用1ヶ月経過。焦らず1つ目を育ててから。'
      },
      {
        id: 'secondGenre',
        label: '2つ目のジャンル',
        type: 'text',
        placeholder: '例: ファッション',
        question: '2つ目はどんなジャンルにしますか？',
        explanation: '1つ目と違うジャンルで横展開すると、収益源が分散できます。'
      },
      {
        id: 'secondAccount',
        label: '2つ目のアカウント作成済み',
        type: 'checkbox',
        question: '2つ目のアカウントは作りましたか？',
        explanation: '同じノウハウで横展開できるのがThreadsの強み！'
      },
    ],
    warnings: [
      { condition: (data, mode) => mode === 'beginner' && !data?.ready, message: '⚠️ 1つ目が軌道に乗るまでは焦らないで！', type: 'warning' },
    ],
    completionCheck: (data) => data?.ready && data?.secondAccount,
  },
};

// フェーズとステップのデータ構造
const initialPhases = [
  {
    id: 0,
    name: '準備',
    icon: Settings,
    color: 'bg-gray-500',
    steps: [
      { id: '0-1', name: '楽天アフィリエイト登録', status: 'pending', description: '楽天アフィリエイトに登録してIDを取得' },
      { id: '0-2', name: 'Threadsアカウント作成', status: 'pending', description: 'Instagramと連携してThreadsアカウントを作成' },
      { id: '0-3', name: 'サイト登録', status: 'pending', description: 'ThreadsのプロフィールURLを楽天に登録' },
    ]
  },
  {
    id: 1,
    name: '設計',
    icon: Target,
    color: 'bg-blue-500',
    steps: [
      { id: '1-1', name: 'ジャンル選定', status: 'locked', description: '発信するジャンルを決定', hasAI: true },
      { id: '1-2', name: 'ターゲット設定', status: 'locked', description: '届けたい層を明確にする', hasAI: true },
      { id: '1-3', name: 'プロフィール作成', status: 'locked', description: '名前・自己紹介文を作成', hasAI: true },
      { id: '1-4', name: 'アイコン準備', status: 'locked', description: 'アイコン画像を用意', hasAI: true },
    ]
  },
  {
    id: 2,
    name: 'リサーチ',
    icon: Search,
    color: 'bg-purple-500',
    steps: [
      { id: '2-1', name: '大手アカウントフォロー', status: 'locked', description: 'フォロワー5千以上を5-10フォロー' },
      { id: '2-2', name: '中規模アカウントフォロー', status: 'locked', description: 'フォロワー500-5千を5フォロー' },
      { id: '2-3', name: 'バズ投稿ストック', status: 'locked', description: '参考になる投稿を保存' },
      { id: '2-4', name: '商品候補リストアップ', status: 'locked', description: '紹介する商品を選定', hasAI: true },
    ]
  },
  {
    id: 3,
    name: '投稿準備',
    icon: FileText,
    color: 'bg-orange-500',
    steps: [
      { id: '3-1', name: '挨拶投稿作成', status: 'locked', description: 'バズを狙う自己紹介投稿', hasAI: true, important: true },
      { id: '3-2', name: '初期投稿セット準備', status: 'locked', description: '5-10投稿を事前に用意', hasAI: true },
      { id: '3-3', name: '投稿スケジュール設計', status: 'locked', description: 'いつ何を投稿するか計画' },
    ]
  },
  {
    id: 4,
    name: '運用開始',
    icon: Play,
    color: 'bg-green-500',
    steps: [
      { id: '4-1', name: 'Day 1: 挨拶投稿', status: 'locked', description: '最初の投稿を実行' },
      { id: '4-2', name: 'Day 2-3: アフィ投稿', status: 'locked', description: '商品紹介投稿を開始' },
      { id: '4-3', name: '6パターン投稿ローテーション', status: 'locked', description: '球種を変えて継続投稿', hasAI: true },
    ]
  },
  {
    id: 5,
    name: '拡大',
    icon: TrendingUp,
    color: 'bg-pink-500',
    steps: [
      { id: '5-1', name: '楽天ROOM連携', status: 'locked', description: 'ROOMも活用して収益UP' },
      { id: '5-2', name: '分析・改善', status: 'locked', description: '投稿パフォーマンスを分析', hasAI: true },
      { id: '5-3', name: '複数アカウント展開', status: 'locked', description: '別ジャンルに横展開' },
    ]
  },
];

// 投稿6パターン
const postPatterns = [
  { id: 1, name: '挨拶投稿', pitch: 'ストレート', description: '自己紹介、ジャンル認知', frequency: '開始時1回' },
  { id: 2, name: '一言＋商品画像', pitch: 'ストレート', description: 'シンプルに商品紹介', frequency: '高め' },
  { id: 3, name: 'バズワード投稿', pitch: 'カーブ', description: 'トレンドワードでリーチ拡大', frequency: '中' },
  { id: 4, name: 'ターゲット刺し', pitch: 'フォーク', description: 'HARM法則で感情訴求', frequency: '中' },
  { id: 5, name: '有益情報', pitch: 'チェンジアップ', description: '価値提供、信頼構築', frequency: '低〜中' },
  { id: 6, name: 'まとめ投稿', pitch: 'スライダー', description: '複数商品をまとめて紹介', frequency: '週1-2回' },
];

// 初心者ブロック（安全装置）
const safetyBlocks = [
  { id: 'saturated', trigger: '飽和ジャンル選択', warning: '競合が多いです', condition: '理解した上で進む', icon: AlertTriangle, color: 'yellow' },
  { id: 'continuous', trigger: '連続リンク投稿', warning: 'BANリスクあり', condition: '時間を空ける', icon: XCircle, color: 'red' },
  { id: 'imbalance', trigger: '球種偏り', warning: '同じタイプ続きすぎ', condition: '別パターン選択', icon: AlertCircle, color: 'orange' },
  { id: 'forbidden', trigger: '禁止ワード使用', warning: 'このワードはNG', condition: 'ワード修正', icon: XCircle, color: 'red' },
  { id: 'overpost', trigger: '1日投稿数超過', warning: '投稿しすぎ', condition: '翌日まで待つ', icon: Clock, color: 'orange' },
];

// 機能モジュール一覧
const featureModules = [
  {
    id: 1,
    name: 'アカウント設計支援',
    icon: Target,
    color: 'bg-blue-500',
    features: [
      { name: 'ジャンル診断', desc: '質問形式で最適ジャンルを提案', level: 'AI支援' },
      { name: '競合分析', desc: '指定ジャンルの大手アカウント自動検索', level: '半自動' },
      { name: 'プロフィール生成', desc: 'テンプレ + AIで文案作成', level: 'AI支援' },
      { name: 'アイコン方針提案', desc: 'ジャンルに合ったアイコンスタイル提案', level: 'AI支援' },
    ]
  },
  {
    id: 2,
    name: 'リサーチ支援',
    icon: Search,
    color: 'bg-purple-500',
    features: [
      { name: '大手アカ発見', desc: 'フォロワー数でフィルタリング', level: '半自動' },
      { name: 'バズ投稿収集', desc: 'いいね数・リポスト数でソート', level: '半自動' },
      { name: '商品発掘（軸1）', desc: '楽天ランキングから候補抽出', level: '自動' },
      { name: '商品発掘（軸2）', desc: '意外性商品の発見支援', level: 'AI支援' },
      { name: '画像判定', desc: '「スクロール止まるか」をAI判定', level: 'AI支援' },
    ]
  },
  {
    id: 3,
    name: '投稿作成支援',
    icon: FileText,
    color: 'bg-orange-500',
    features: [
      { name: '挨拶投稿生成', desc: 'バズ要素を組み込んだ文案', level: 'AI支援' },
      { name: '投稿テンプレ選択', desc: '6パターンから状況に応じて提案', level: 'AI支援' },
      { name: 'フック文生成', desc: 'HARM法則に基づく文章生成', level: 'AI支援' },
      { name: '球種バランス管理', desc: '投稿タイプの偏りを警告', level: '自動' },
      { name: '投稿プレビュー', desc: 'Threads風のプレビュー表示', level: '自動' },
    ]
  },
  {
    id: 4,
    name: 'スケジュール管理',
    icon: Calendar,
    color: 'bg-green-500',
    features: [
      { name: '投稿時間提案', desc: '最適な投稿時間を提案', level: 'AI支援' },
      { name: 'スケジュール可視化', desc: 'カレンダー形式で投稿予定表示', level: '自動' },
      { name: 'リマインダー', desc: '投稿時間を通知', level: '自動' },
      { name: '投稿ストック管理', desc: '下書き投稿の管理', level: '自動' },
    ]
  },
  {
    id: 5,
    name: '分析・改善',
    icon: LineChart,
    color: 'bg-pink-500',
    features: [
      { name: '投稿パフォーマンス分析', desc: '表示回数・いいね数の追跡', level: '手動入力' },
      { name: '成功パターン抽出', desc: 'バズった投稿の共通点分析', level: 'AI支援' },
      { name: '改善提案', desc: '次回投稿へのアドバイス', level: 'AI支援' },
      { name: '週次レポート', desc: '週ごとの成果まとめ', level: '半自動' },
    ]
  },
];

// 各ステップの詳細コンテンツ（note記事のノウハウを組み込み）
const stepDetails = {
  '0-1': {
    title: '楽天アフィリエイト登録',
    why: '楽天アフィリエイトのIDを取得することで、あなた専用のアフィリエイトリンクを生成できるようになります。24時間以内に何か買えば報酬発生！紹介した商品じゃなくてもOKなので、「クリックさせる」が全てです。',
    steps: [
      '楽天会員アカウントでログイン（なければ新規作成）',
      '楽天アフィリエイト公式サイトにアクセス',
      '利用規約に同意して登録完了',
      'アフィリエイトIDをメモしておく',
    ],
    tips: '審査なしで即日利用可能。報酬率は商品により2-8%程度。',
    link: 'https://affiliate.rakuten.co.jp/',
  },
  '0-2': {
    title: 'Threadsアカウント作成',
    why: 'Threadsはテキスト中心で拡散力が高く、動画編集スキル不要。インスタと違い、最短1ヶ月で収益化可能な最も再現性が高いプラットフォームです。',
    steps: [
      'Instagramアカウントを用意（なければ作成）',
      'Threadsアプリをダウンロード',
      'Instagramアカウントでログイン',
      'プロフィールを仮設定（後で変更可）',
    ],
    tips: 'PCでも作業可能（効率UP）。ただしPC初回ログイン時にアカウント停止されるケースあり。まずスマホで数投稿してからPCログインを推奨。',
    warnings: [
      'PC初回ログインでアカウント停止のリスクあり',
      'Instagramも週1でストーリーズ更新推奨（BAN対策）',
    ],
    banRecovery: 'アカウント停止時はInstagramのヘルプ→問題を報告から審査申請',
  },
  '0-3': {
    title: 'サイト登録',
    why: '楽天にThreadsのURLを登録することで、正式にアフィリエイト活動を行えます。',
    steps: [
      'ThreadsのプロフィールURLをコピー',
      '楽天アフィリエイト管理画面へ',
      'サイト情報の登録でURLを追加',
      '審査完了を待つ（通常1-3日）',
    ],
    tips: 'サイト説明は「商品紹介をするSNSアカウント」程度でOK。',
  },
  '1-1': {
    title: 'ジャンル選定',
    why: 'ジャンル選びが最重要。「見た目が映える商品」を選べば、難しい言葉を考えなくても画像だけで興味を引ける！言葉が不要な有形コンテンツから始めるのが最短ルート。',
    steps: [
      '「見た目が大切なモノ」を紹介するジャンルを選ぶ',
      '楽天ランキングで需要を確認',
      '同ジャンルの発信者をリサーチ（伸びてるか確認）',
      '最も「投稿し続けられそう」なものを選択',
    ],
    categories: [
      { name: 'インテリア・雑貨', difficulty: '初心者向け', reason: '画像映え◎ 言葉不要' },
      { name: 'ファッション', difficulty: '初心者向け', reason: '画像映え◎ 言葉不要' },
      { name: 'ガジェット', difficulty: '初心者向け', reason: '画像映え◎ 言葉不要' },
      { name: 'コスメ・美容', difficulty: '中級者向け', reason: '言葉での説得が必要' },
      { name: 'サプリ・健康', difficulty: '上級者向け', reason: '言葉での説得が必須' },
    ],
    tips: '競合が多いジャンル = 需要が高い = 収益も上げやすい。全くビビる必要なし！現在のスレッズは参入者が少ないので、人気ジャンルで広く攻めてOK。',
    hasAI: true,
  },
  '1-2': {
    title: 'コンセプト設計・ターゲット設定',
    why: '「誰に」「どんな商品を」「どんな雰囲気で」届けるかを決めることで、他アカウントとの差別化と発信の一貫性が生まれます。',
    steps: [
      '届けたいターゲット層を決める（年齢・性別・ライフスタイル）',
      '紹介する商品カテゴリを決める',
      'アカウントの雰囲気（キャラ）を決める',
      '「〇〇な人に△△を届けるアカウント」と一文で表現',
    ],
    conceptExample: {
      target: '20-30代の女性',
      product: 'おしゃれな雑貨・インテリア',
      character: '同世代の雑貨好き女子',
      oneLiner: '「20-30代女性に素敵な暮らしアイテムを紹介」',
    },
    tips: '見た目が大切なジャンル（雑貨・ファッション等）は細かい悩み深掘り不要。「2-30代に素敵な雑貨を紹介する！」だけで成立。早く始めることを優先！',
    hasAI: true,
  },
  '1-3': {
    title: 'プロフィール作成',
    why: 'プロフィールは「フォローするかどうか」の判断材料。3秒で価値が伝わる内容に。権威性があると信頼度UP。',
    steps: [
      '名前を決める（覚えやすく、ジャンルが伝わる）',
      '肩書きを1行で（例：「30代｜インテリア好き」）',
      '提供価値を明記（例：「毎日おしゃれアイテム紹介」）',
      'CTAを入れる（例：「フォローで見逃し防止」）',
    ],
    authorityExamples: [
      '一般の人（権威性なし）→ 共感で勝負',
      'インテリアコーディネーター → 権威性あり、信頼度UP',
      '〇〇マニア・〇〇オタク → 軽めの権威性',
    ],
    tips: '絵文字は1-2個まで。権威性がなくても「暮らし系」「ファッション」は投稿内容で勝負できる！美容ジャンルで「元美容部員」等の肩書き使用は禁止。',
    hasAI: true,
  },
  '1-4': {
    title: 'アイコン準備',
    why: 'アイコンは顔。信頼感と親しみやすさのバランスが大切です。',
    steps: [
      'ジャンルに合った雰囲気を決める',
      '顔出しするかどうか決める',
      'AIツールまたはCanvaでアイコン作成',
      '正方形、背景シンプルに調整',
    ],
    tips: '顔出しなしでも、イラストや商品画像で統一感を出せばOK。',
    hasAI: true,
  },
  '2-1': {
    title: '大手アカウントフォロー（ジャンル認知）',
    why: '大手をフォローすることで、①ホーム欄がジャンル関連で埋まりリサーチ効率UP ②バズる投稿パターンが自然と身につく',
    steps: [
      'Threadsでジャンル関連ワードを検索',
      'フォロワー5,000人以上のアカウントを5-10件探す',
      '目標にしたいアカウントをフォロー',
      'そのアカウントのフォロー欄から芋づる式にリサーチ',
    ],
    tips: '同ジャンル以外の発信にはリアクションしない。ホーム欄を「リサーチ専用」に育てよう。',
  },
  '2-2': {
    title: '中規模アカウントフォロー',
    why: 'フォロワー500-5,000人の中規模アカウントは「再現可能な成功例」。完璧すぎない投稿でも伸びてる = 自分でも真似できる！',
    steps: [
      'フォロワー500-5,000人のアカウントを探す',
      '投稿頻度と内容をチェック',
      '5アカウント程度フォロー',
      '「自分もできそう」なポイントをメモ',
    ],
    tips: 'フォロワーが少ないのにバズっている投稿 = 「商品自体にバズる力がある」証拠。大手より参考になる！',
  },
  '2-3': {
    title: 'バズ投稿ストック',
    why: 'バズ投稿には「型」がある。保存→分析→アレンジの流れで効率的にバズを狙えます。',
    steps: [
      '目標アカウントの過去投稿をチェック',
      'いいねが多い投稿を探して保存',
      '「なぜバズったか」を分析（フック文・画像・構成）',
      '10投稿以上ストックする',
    ],
    stockTypes: [
      'バズっている商品投稿（収益目的）',
      '情報・ノウハウ系の投稿（有益目的）',
      '共感・感情に訴える投稿（ファン化目的）',
    ],
    tips: '他SNS（X、Instagram、YouTube）でもリサーチすると差別化できる！Threadsだけでリサーチしてる人が多いので。',
  },
  '2-4': {
    title: '商品候補リストアップ',
    why: 'バズっている商品を事前にストックしておくと、投稿ネタに困らない！',
    steps: [
      '目標アカウントのバズ商品投稿を見つける',
      '楽天で同じ商品を検索してブックマーク',
      '「画像映え」する商品を優先',
      '10-20商品をリストアップ',
    ],
    researchTips: [
      'フォロワー少ない人の投稿がバズ → 商品自体にバズ力あり',
      'フォロワー多い人の投稿がバズ → その人だからバズた可能性',
      '複数のアカウントで紹介されてる → 需要が高い証拠',
    ],
    tips: '価格帯は2,000-10,000円がクリックされやすい。レビュー数が多い商品は信頼度UP。',
    hasAI: true,
  },
  '3-1': {
    title: '挨拶投稿作成（超重要！）',
    why: 'Threadsでは「はじめまして投稿」がバズりやすい！フォロワー0でも800いいね以上獲得した実例あり。最初の投稿で一気にフォロワーを増やすチャンス！',
    steps: [
      'ターゲットに刺さるフック文を考える',
      '自分の属性を入れる（年齢、職業など）',
      'ジャンルのバズワードを含める',
      'CTAで締める（いいね、フォローを促す）',
    ],
    templates: [
      '「〇〇な人、集まれ！」',
      '「〇〇好きだけフォローして」',
      '「はじめまして！〇〇歳の〇〇です」',
      '「〇〇が好きすぎて発信始めました」',
    ],
    afterBuzzAction: 'バズったらコメント欄に「他にもこんな投稿してます！プロフィール見てね」と追加して、プロフィールへ誘導！',
    tips: 'メンション(@ユーザー名)のやりすぎはスパム判定でBANリスク。言い回しを変えて自然に誘導。',
    hasAI: true,
    important: true,
  },
  '3-2': {
    title: '初期投稿セット準備',
    why: '投稿の「弾」を事前に用意しておくことで、継続が楽になります。アカウント初期は「すでにバズっている商品」を多めに投稿！',
    steps: [
      '商品リストから5-10個選ぶ',
      '各商品の紹介文を作成（バズ投稿を参考にアレンジ）',
      '画像を用意（楽天の商品画像でOK）',
      '下書きとして保存',
    ],
    postTypes: [
      { type: '単品投稿', desc: '1商品を画像+紹介文+リンクで紹介', effort: '低' },
      { type: 'まとめ投稿（セット型）', desc: '複数商品を1投稿にまとめて紹介', effort: '中' },
      { type: 'まとめ投稿（ツリー型）', desc: '親投稿+返信で複数商品を紹介', effort: '高' },
      { type: '楽天ROOM誘導', desc: '画像だけ貼ってROOMリンクへ誘導', effort: '低' },
    ],
    tips: '複数アカウントからバズ商品を集めると「丸パクリ」に見えにくい。毎日まとめ投稿は大変なので、単品投稿と混ぜる！',
    hasAI: true,
  },
  '3-3': {
    title: '投稿スケジュール設計',
    why: '計画的な投稿で、無理なく継続できる体制を作ります。伸びやすい時間帯を狙って投稿！',
    steps: [
      '1日の投稿数を決める（最低5投稿推奨）',
      '投稿時間を決める',
      '曜日ごとの投稿タイプを決める',
      'カレンダーに記入',
    ],
    bestTimes: [
      { time: '7:00-8:00', desc: '通勤・通学時間', priority: '中' },
      { time: '12:00-13:00', desc: 'お昼休み', priority: '中' },
      { time: '20:00-21:00', desc: 'ゴールデンタイム（最重要）', priority: '高' },
    ],
    rakutenEvents: [
      { event: 'お買い物マラソン', timing: '月1-2回', tip: '開催前〜開催中に投稿頻度UP' },
      { event: '楽天スーパーSALE', timing: '3月・6月・9月・12月', tip: '最大のチャンス！' },
      { event: '5と0のつく日', timing: '毎月5,10,15,20,25,30日', tip: 'ポイント5倍で購買意欲UP' },
    ],
    tips: 'まとめ投稿は20-21時に投稿。「これは伸びる！」と思う推し商品も伸びやすい時間帯に。',
  },
  '4-1': {
    title: 'Day 1: 挨拶投稿',
    why: '記念すべき最初の投稿。バズを狙いつつ、アカウントの方向性を示します。',
    steps: [
      '準備した挨拶投稿を最終チェック',
      '最適な時間帯に投稿（19-21時推奨）',
      '投稿後、同ジャンルの投稿にいいね（ジャンル認知を高める）',
      '反応をチェック（3時間後、24時間後）',
    ],
    tips: '投稿後のアクション（いいね回り）で初速をブースト。コメント周りは非推奨（一般ユーザーから見ると不自然）。',
  },
  '4-2': {
    title: 'Day 2-3: アフィ投稿開始',
    why: 'アフィリエイト投稿を開始。リンクを貼ると表示回数が下がる傾向があるので、バランスが重要。',
    steps: [
      '準備した商品投稿を1-2個投稿',
      '楽天リンクはコメント欄に（本文ではなく）',
      'PR表記は必ずつける',
      '日常投稿・有益投稿も混ぜる',
    ],
    linkTips: [
      '外部リンクを貼ると表示回数が下がる傾向',
      'リンクはコメント欄に貼る',
      'リンクを貼らない「まとめ投稿」も効果的',
    ],
    tips: 'アフィ投稿ばかりは伸びない！収益投稿・フォロワー増加投稿・ファン化投稿の3種類をバランスよく。',
  },
  '4-3': {
    title: '3種類の投稿ローテーション',
    why: '投稿には3つの目的がある。これを意識してバランスよく投稿することで、収益とフォロワー両方を伸ばせる！',
    steps: [
      '1週間の投稿計画を立てる',
      '3種類の投稿をバランスよく配置',
      '投稿ごとに目的をメモ',
      '週末に振り返り、来週の計画調整',
    ],
    postPurposes: [
      { purpose: '収益を上げる投稿', examples: ['単品商品紹介', 'まとめ投稿'], frequency: '週3-4回' },
      { purpose: 'フォロワーを増やす投稿', examples: ['挨拶投稿', '自己紹介', '有益情報'], frequency: '週2-3回' },
      { purpose: 'ファンを作る投稿', examples: ['日常のつぶやき', '共感投稿'], frequency: '週1-2回' },
    ],
    algorithmTip: '有益・共感投稿がバズる → 次の投稿もバズりやすくなる → アフィ投稿も伸びる！という好循環を作る',
    tips: 'リーチの伸びやすさ: 有益・共感投稿 > 商品紹介投稿。バフをかけてからアフィ投稿する流れが効果的。',
    hasAI: true,
  },
  '5-1': {
    title: '楽天ROOM連携',
    why: 'ROOMを活用することで、まとめ投稿が楽になり、収益の最大化とコンテンツの幅が広がります。',
    steps: [
      '楽天ROOMアカウントを作成',
      'Threadsで紹介した商品をROOMにも登録',
      'ROOMのURLをプロフィールに追加',
      'まとめ投稿でROOMリンクを活用',
    ],
    roomTips: [
      '商品画像を複数貼って「詳細はROOMで」と誘導',
      '同じショップの商品をまとめてショップ誘導も可能',
      '過去の人気商品をROOMにまとめて再活用',
    ],
    tips: 'ROOMは「お気に入りまとめ」として使うと自然。ネタに尽きたらROOMから選んで投稿！',
  },
  '5-2': {
    title: '分析・改善（PDCA）',
    why: '成果を出す人は「投稿して終わり」ではなく、必ず振り返りをしています。リサーチ→投稿→分析の繰り返しが成功の最短ルート！',
    steps: [
      'バズった投稿をメモ（Threadsは一度バズった投稿が何度でも伸びる）',
      'なぜ伸びたかを自分なりに分析',
      '改善点を3つ書き出す',
      '来週の投稿に反映',
    ],
    analysisPoints: [
      'どの構成がウケた？（フック文・画像・CTA）',
      'どんな言葉が刺さった？',
      'どの時間帯が伸びた？',
      'どの投稿タイプが反応良い？',
    ],
    tips: '投稿→振り返り→改善のシンプルなPDCAをコツコツ回せば、Threadsの伸び方が変わる！',
    hasAI: true,
  },
  '5-3': {
    title: '複数アカウント展開',
    why: '成功パターンを横展開することで、収益を倍増できます。',
    steps: [
      '別ジャンルを選定',
      '新しいInstagram/Threadsアカウント作成',
      '1つ目で学んだことを活かして運用',
      '2アカウントの合計で成果を管理',
    ],
    tips: '1アカウント目が軌道に乗ってから（フォロワー1000人 or 1ヶ月後目安）。同じノウハウで横展開できるのがThreadsの強み！',
  },
};

// localStorageキー
const STORAGE_KEYS = {
  USER_DATA: 'threads-affiliate-userData',
  PHASES: 'threads-affiliate-phases',
  ACCOUNTS: 'threads-affiliate-accounts',
  MODE: 'threads-affiliate-mode',
};

export default function Dashboard() {
  const [phases, setPhases] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PHASES);
    return saved ? JSON.parse(saved) : initialPhases;
  });
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MODE);
    return saved || 'beginner';
  });
  const [showPatterns, setShowPatterns] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'accounts'
  const [expandedStepId, setExpandedStepId] = useState(null); // 展開中のステップID
  const [showHints, setShowHints] = useState(() => {
    const saved = localStorage.getItem('threads-affiliate-showHints');
    return saved !== null ? JSON.parse(saved) : true; // デフォルトON
  });
  const [openExplanation, setOpenExplanation] = useState(null); // 開いている説明のfieldId
  const [achievement, setAchievement] = useState(null); // 達成ポップアップ { message, type }
  const [showIntroSection, setShowIntroSection] = useState(true); // 「はじめに」セクションを表示中か

  // ユーザー入力データ
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return saved ? JSON.parse(saved) : {};
  });

  // アカウント情報
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : [];
  });
  const [editingAccount, setEditingAccount] = useState(null);
  const [newAccount, setNewAccount] = useState({ service: '', userId: '', password: '', memo: '' });

  // localStorageに自動保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHASES, JSON.stringify(phases));
  }, [phases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('threads-affiliate-showHints', JSON.stringify(showHints));
  }, [showHints]);

  // ユーザーデータを更新
  const updateUserData = (stepId, fieldId, value) => {
    setUserData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldId]: value,
      }
    }));
  };

  // ステップのデータをリセット（やり直す）
  const resetStepData = (stepId) => {
    setUserData(prev => {
      const newData = { ...prev };
      delete newData[stepId];
      return newData;
    });
    updateStepStatus(stepId, 'pending');
  };

  // 全設定をリセット
  const resetAllSettings = () => {
    if (window.confirm('全ての設定をリセットしますか？入力内容が全て削除されます。')) {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.PHASES);
      localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
      localStorage.removeItem(STORAGE_KEYS.MODE);
      setUserData({});
      setPhases(initialPhases);
      setAccounts([]);
      setMode('beginner');
      setSelectedStep(null);
      setShowIntroSection(true);
    }
  };

  // アカウント追加
  const addAccount = () => {
    if (!newAccount.service) return;
    setAccounts(prev => [...prev, { ...newAccount, id: Date.now() }]);
    setNewAccount({ service: '', userId: '', password: '', memo: '' });
  };

  // アカウント更新
  const updateAccount = (id, updates) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
  };

  // アカウント削除
  const deleteAccount = (id) => {
    if (window.confirm('このアカウント情報を削除しますか？')) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  // ステップの状態を更新
  const updateStepStatus = (stepId, newStatus) => {
    setPhases(prev => prev.map(phase => ({
      ...phase,
      steps: phase.steps.map(step => 
        step.id === stepId ? { ...step, status: newStatus } : step
      )
    })));
  };

  // ステップを完了にする
  const completeStep = (stepId) => {
    updateStepStatus(stepId, 'completed');
    unlockNextStep(stepId);
    setExpandedStepId(null); // パネルを閉じる

    // 達成ポップアップを表示
    const messages = [
      '🎮 QUEST CLEAR!',
      '⭐ LEVEL UP!',
      '🏆 MISSION COMPLETE!',
      '✨ NICE WORK!',
      '🌟 GREAT JOB!',
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setAchievement({ message: randomMessage, type: 'complete' });

    // 2秒後に非表示
    setTimeout(() => setAchievement(null), 2000);
  };

  // ステップをスキップする
  const skipStep = (stepId) => {
    updateStepStatus(stepId, 'skipped');
    unlockNextStep(stepId);
    setExpandedStepId(null); // パネルを閉じる
  };

  // 次のステップをアンロック
  const unlockNextStep = (stepId) => {
    let foundCurrent = false;
    phases.forEach(phase => {
      phase.steps.forEach(step => {
        if (foundCurrent && step.status === 'locked') {
          updateStepStatus(step.id, 'pending');
          foundCurrent = false;
        }
        if (step.id === stepId) foundCurrent = true;
      });
    });
  };

  // 進捗率を計算
  const calculateProgress = () => {
    const allSteps = phases.flatMap(p => p.steps);
    const completed = allSteps.filter(s => s.status === 'completed').length;
    return Math.round((completed / allSteps.length) * 100);
  };

  // ステップのステータスアイコン
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return (
          <div className="relative">
            <Check className="w-5 h-5 text-green-500 check-bounce" />
            <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
          </div>
        );
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-yellow-500" />;
      case 'locked':
        return (
          <div className="relative opacity-50">
            <Lock className="w-5 h-5 text-gray-400" />
            <span className="absolute -top-0.5 -right-0.5 text-[8px]">🔒</span>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
            <span className="text-[8px] text-blue-400">!</span>
          </div>
        );
    }
  };

  // 説明ポップアップコンポーネント
  const ExplanationPopup = ({ field, onClose }) => (
    <div className="mt-2 p-3 bg-blue-900/40 border border-blue-500/50 rounded-lg relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="pr-6">
        <p className="text-blue-200 text-sm leading-relaxed whitespace-pre-line">{field.explanation}</p>
        {/* リンクがある場合は表示 */}
        {field.link && (
          <a
            href={field.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            {field.link.text}
          </a>
        )}
      </div>
    </div>
  );

  // フォームフィールドレンダリング（RPG風：質問形式）
  const FormField = ({ field, stepId, data }) => {
    const value = data?.[field.id] ?? '';
    const fieldKey = `${stepId}-${field.id}`;
    const isExplanationOpen = openExplanation === fieldKey;

    // showIfの条件をチェック
    if (field.showIf && !field.showIf(data)) {
      return null;
    }

    // 質問ラベル（showHintsがONで質問がある場合は質問を表示）
    const QuestionLabel = ({ className = "text-sm text-gray-300 mb-2" }) => (
      <div className={`flex items-start gap-2 ${className}`}>
        <span className="flex-1">
          {showHints && field.question ? (
            <span className="text-yellow-300">💬 {field.question}</span>
          ) : (
            field.label
          )}
        </span>
        {showHints && field.explanation && (
          <button
            onClick={() => setOpenExplanation(isExplanationOpen ? null : fieldKey)}
            className="text-blue-400 hover:text-blue-300 flex-shrink-0"
            title="詳しく見る"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    );

    switch (field.type) {
      case 'checkbox':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-all"
                 onClick={() => updateUserData(stepId, field.id, !value)}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => updateUserData(stepId, field.id, e.target.checked)}
                className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <div className="flex-1">
                {showHints && field.question ? (
                  <span className="text-yellow-300 text-sm">💬 {field.question}</span>
                ) : (
                  <span className={value ? 'text-green-400' : 'text-gray-300'}>{field.label}</span>
                )}
              </div>
              {showHints && field.explanation && (
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenExplanation(isExplanationOpen ? null : fieldKey); }}
                  className="text-blue-400 hover:text-blue-300"
                  title="詳しく見る"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
              {value && <Check className="w-4 h-4 text-green-500" />}
            </div>
            {isExplanationOpen && <ExplanationPopup field={field} onClose={() => setOpenExplanation(null)} />}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && <ExplanationPopup field={field} onClose={() => setOpenExplanation(null)} />}
            <input
              type="text"
              value={value}
              onChange={(e) => updateUserData(stepId, field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && <ExplanationPopup field={field} onClose={() => setOpenExplanation(null)} />}
            <textarea
              value={value}
              onChange={(e) => updateUserData(stepId, field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-1">
            <QuestionLabel />
            {isExplanationOpen && <ExplanationPopup field={field} onClose={() => setOpenExplanation(null)} />}
            <select
              value={value}
              onChange={(e) => updateUserData(stepId, field.id, e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {field.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}{opt.difficulty ? ` (${opt.difficulty})` : ''}
                </option>
              ))}
            </select>
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
            {/* 選択肢に警告がある場合 */}
            {mode === 'beginner' && value && field.options.find(o => o.value === value)?.warning && (
              <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="text-yellow-400 text-sm">{field.options.find(o => o.value === value).warning}</span>
              </div>
            )}
          </div>
        );

      case 'number':
        const progress = field.target ? Math.min((value || 0) / field.target * 100, 100) : 0;
        return (
          <div className="space-y-2">
            <QuestionLabel />
            {isExplanationOpen && <ExplanationPopup field={field} onClose={() => setOpenExplanation(null)} />}
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={value}
                onChange={(e) => updateUserData(stepId, field.id, parseInt(e.target.value) || 0)}
                min={field.min}
                max={field.max}
                className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {field.target && (
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{value || 0} / {field.target}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {!showHints && <div className="text-xs text-gray-500">{field.label}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  // ステップフォームのレンダリング
  const StepForm = ({ stepId }) => {
    const config = stepFormConfigs[stepId];
    const data = userData[stepId] || {};

    if (!config) return null;

    // 警告をチェック
    const activeWarnings = config.warnings?.filter(w => w.condition(data, mode)) || [];

    return (
      <div className="space-y-4 mt-6">
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            入力項目
          </h4>

          {/* 警告表示 */}
          {activeWarnings.map((warning, idx) => (
            <div
              key={idx}
              className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                warning.type === 'error'
                  ? 'bg-red-900/30 border border-red-500/50'
                  : 'bg-yellow-900/30 border border-yellow-500/50'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
              }`} />
              <span className={`text-sm ${warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`}>
                {warning.message}
              </span>
            </div>
          ))}

          <div className="space-y-3">
            {config.fields.map(field => (
              <FormField key={field.id} field={field} stepId={stepId} data={data} />
            ))}
          </div>

          {/* 完了チェック表示 */}
          {config.completionCheck && (
            <div className={`mt-4 p-3 rounded-lg ${
              config.completionCheck(data)
                ? 'bg-green-900/30 border border-green-500/50'
                : 'bg-gray-700/50 border border-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                {config.completionCheck(data) ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-400">入力完了！</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                    <span className="text-gray-400">必要な項目を入力してください</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 達成ポップアップ */}
      {achievement && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="achievement-popup bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 px-8 py-6 rounded-lg shadow-2xl border-4 border-yellow-300">
            <div className="achievement-shine absolute inset-0 rounded-lg" />
            <div className="relative">
              <div className="pixel-font text-white text-2xl text-center drop-shadow-lg">
                {achievement.message}
              </div>
              <div className="flex justify-center mt-2 gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-200 sparkle" style={{ animationDelay: `${i * 0.1}s` }}>✦</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <span className="absolute -top-1 -right-1 text-xs">✨</span>
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="pixel-font text-yellow-400 text-sm">▶</span>
                Threads × 楽天アフィリ
              </h1>
              <p className="text-sm text-gray-400">〜 副業クエスト 〜</p>
            </div>
          </div>
          
          {/* モード切替 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setMode('beginner')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all ${
                  mode === 'beginner' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                初心者
              </button>
              <button
                onClick={() => setMode('expert')}
                className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 transition-all ${
                  mode === 'expert' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                エキスパート
              </button>
            </div>

            {/* ヒント表示ON/OFF */}
            <button
              onClick={() => setShowHints(!showHints)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all border ${
                showHints
                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30 hover:bg-yellow-900/50'
                  : 'bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600'
              }`}
              title={showHints ? 'ヒント表示をOFFにする' : 'ヒント表示をONにする'}
            >
              {showHints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              💬 ヒント{showHints ? 'ON' : 'OFF'}
            </button>

            {/* 設定リセットボタン */}
            <button
              onClick={resetAllSettings}
              className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-500/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              リセット
            </button>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            やることリスト
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
              activeTab === 'accounts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            アカウント情報
          </button>
        </div>
        
        {/* RPG風プログレスバー */}
        <div className="mt-4">
          <div className="flex items-center gap-3">
            {/* レベル表示（クリックで達成演出テスト） */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => {
                const messages = ['🎮 QUEST CLEAR!', '⭐ LEVEL UP!', '🏆 MISSION COMPLETE!', '✨ NICE WORK!', '🌟 GREAT JOB!'];
                setAchievement({ message: messages[Math.floor(Math.random() * messages.length)], type: 'complete' });
                setTimeout(() => setAchievement(null), 2000);
              }}
              title="クリックで達成演出テスト"
            >
              <span className="pixel-font text-yellow-400 text-xs">LV.</span>
              <span className="pixel-font text-yellow-300 text-lg">{Math.floor(calculateProgress() / 10) + 1}</span>
            </div>

            {/* EXPバー */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <span className="text-yellow-500">⚔️</span> EXP
                </span>
                <span className="pixel-font text-yellow-400 text-[10px]">{calculateProgress()}%</span>
              </div>
              <div className="rpg-bar-container h-4">
                <div
                  className="rpg-bar-fill h-full transition-all duration-500"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>

            {/* 次のレベルまで */}
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">NEXT</span>
              <span className="pixel-font text-[10px] text-yellow-500 ml-1">{10 - (calculateProgress() % 10)}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* やることリストタブ */}
      {activeTab === 'tasks' && (
      <div className="flex">
        {/* サイドバー - フェーズ一覧 */}
        <aside className="w-96 bg-gray-800 min-h-screen max-h-screen overflow-y-auto border-r border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            クエスト
          </h2>

          <div className="space-y-2">
            {/* はじめに */}
            <div className="rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setShowIntroSection(true);
                  setExpandedPhase(null);
                  setExpandedStepId(null);
                }}
                className={`w-full flex items-center gap-3 p-3 transition-all ${
                  showIntroSection ? 'bg-yellow-900/50 border border-yellow-500/50' : 'bg-gray-750 hover:bg-gray-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-yellow-400">はじめに</div>
                  <div className="text-xs text-gray-400">冒険の始まり</div>
                </div>
                {showIntroSection && <span className="text-yellow-400">▶</span>}
              </button>
            </div>

            {/* フェーズ一覧 */}
            {phases.map((phase) => {
              const Icon = phase.icon;
              const completedSteps = phase.steps.filter(s => s.status === 'completed').length;
              const isExpanded = expandedPhase === phase.id;
              
              return (
                <div key={phase.id} className="rounded-lg overflow-hidden">
                  {/* フェーズヘッダー */}
                  <button
                    onClick={() => {
                      setExpandedPhase(isExpanded ? null : phase.id);
                      setShowIntroSection(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 transition-all ${
                      isExpanded ? 'bg-gray-700' : 'bg-gray-750 hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${phase.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{phase.name}</div>
                      <div className="text-xs text-gray-400">
                        {completedSteps}/{phase.steps.length} 完了
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {/* ステップ一覧 */}
                  {isExpanded && (
                    <div className="bg-gray-750 py-2">
                      {phase.steps.map((step) => {
                        const isStepExpanded = expandedStepId === step.id;
                        const stepData = userData[step.id] || {};
                        const config = stepFormConfigs[step.id];
                        const isCompleteReady = config?.completionCheck ? config.completionCheck(stepData) : false;

                        return (
                          <div key={step.id}>
                            {/* ステップヘッダー */}
                            <button
                              onClick={() => {
                                if (step.status !== 'locked' || mode === 'expert') {
                                  setExpandedStepId(isStepExpanded ? null : step.id);
                                  setSelectedStep(step);
                                }
                              }}
                              disabled={step.status === 'locked' && mode === 'beginner'}
                              className={`w-full flex items-center gap-3 px-4 py-2 transition-all ${
                                isStepExpanded
                                  ? 'bg-blue-600/20 border-l-2 border-blue-500'
                                  : step.status === 'locked' && mode === 'beginner'
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-gray-700'
                              }`}
                            >
                              <StatusIcon status={step.status} />
                              <div className="flex-1 text-left">
                                <span className={`text-sm ${
                                  step.important ? 'text-yellow-400 font-medium' : ''
                                }`}>
                                  {step.name}
                                  {step.important && ' ⭐'}
                                </span>
                                {/* 達成項目を表示 */}
                                {config && Object.keys(stepData).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {config.fields.filter(f => {
                                      if (f.type === 'checkbox') return stepData[f.id] === true;
                                      return stepData[f.id] && stepData[f.id].toString().trim() !== '';
                                    }).map(f => (
                                      <span key={f.id} className="text-xs bg-green-600/30 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        {f.label.length > 10 ? f.label.substring(0, 10) + '...' : f.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {step.hasAI && (
                                <span className="text-xs bg-purple-600/30 text-purple-400 px-1.5 py-0.5 rounded">
                                  AI
                                </span>
                              )}
                              {isStepExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>

                            {/* 展開パネル */}
                            {isStepExpanded && config && (
                              <div className="bg-gray-800 border-l-2 border-blue-500 px-4 py-3 space-y-3">
                                {/* 警告表示 */}
                                {config.warnings?.filter(w => w.condition(stepData, mode)).map((warning, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg flex items-start gap-2 text-sm ${
                                      warning.type === 'error'
                                        ? 'bg-red-900/30 border border-red-500/50'
                                        : 'bg-yellow-900/30 border border-yellow-500/50'
                                    }`}
                                  >
                                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                      warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                                    }`} />
                                    <span className={warning.type === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                                      {warning.message}
                                    </span>
                                  </div>
                                ))}

                                {/* フォームフィールド */}
                                {config.fields.map(field => (
                                  <FormField key={field.id} field={field} stepId={step.id} data={stepData} />
                                ))}

                                {/* 完了状態 & アクションボタン */}
                                <div className="pt-2 border-t border-gray-700">
                                  {step.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => completeStep(step.id)}
                                        disabled={!isCompleteReady}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${
                                          isCompleteReady
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                      >
                                        <Check className="w-4 h-4" />
                                        完了
                                      </button>
                                      <button
                                        onClick={() => skipStep(step.id)}
                                        className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm flex items-center gap-1 transition-all"
                                      >
                                        <SkipForward className="w-4 h-4" />
                                        スキップ
                                      </button>
                                    </div>
                                  )}

                                  {step.status === 'completed' && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-green-400 text-sm flex items-center gap-1">
                                        <Check className="w-4 h-4" /> 完了済み
                                      </span>
                                      <button
                                        onClick={() => resetStepData(step.id)}
                                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                      >
                                        <RotateCcw className="w-3 h-3" /> やり直す
                                      </button>
                                    </div>
                                  )}

                                  {step.status === 'skipped' && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-yellow-400 text-sm flex items-center gap-1">
                                        <SkipForward className="w-4 h-4" /> スキップ済み
                                      </span>
                                      <button
                                        onClick={() => resetStepData(step.id)}
                                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                      >
                                        <RotateCcw className="w-3 h-3" /> やり直す
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 投稿パターン */}
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
            <button
              onClick={() => { setShowPatterns(!showPatterns); setShowModules(false); setShowSafetyInfo(false); setSelectedStep(null); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${showPatterns ? 'bg-yellow-600/20 border border-yellow-500/50' : 'bg-gray-750 hover:bg-gray-700'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-left font-medium">投稿6パターン</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* 機能モジュール */}
            <button
              onClick={() => { setShowModules(!showModules); setShowPatterns(false); setShowSafetyInfo(false); setSelectedStep(null); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${showModules ? 'bg-cyan-600/20 border border-cyan-500/50' : 'bg-gray-750 hover:bg-gray-700'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-left font-medium">機能モジュール</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* 安全装置（初心者モードのみ表示） */}
            {mode === 'beginner' && (
              <button
                onClick={() => { setShowSafetyInfo(!showSafetyInfo); setShowPatterns(false); setShowModules(false); setSelectedStep(null); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${showSafetyInfo ? 'bg-red-600/20 border border-red-500/50' : 'bg-gray-750 hover:bg-gray-700'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="flex-1 text-left font-medium">安全装置</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-6 overflow-y-auto max-h-screen">
          {showIntroSection ? (
            /* はじめに（イントロ）セクション */
            <div className="max-w-3xl mx-auto">
              {/* RPG風タイトル */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-br from-gray-800 to-gray-900 px-8 py-4 rounded-lg border-4 border-yellow-600 shadow-2xl">
                  <h1 className="pixel-font text-yellow-400 text-xl mb-2">〜 副業クエスト 〜</h1>
                  <p className="text-gray-400 text-sm">Threads × 楽天アフィリエイト</p>
                </div>
              </div>

              {/* メインコンテンツ */}
              <div className="space-y-6">
                {/* 🎮 冒険の始まり */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                  <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <span className="text-2xl">🎮</span>
                    <span className="text-yellow-400">冒険の始まり</span>
                  </h2>
                  <div className="space-y-3 text-gray-300 leading-relaxed">
                    <p>ようこそ、勇者よ。</p>
                    <p>
                      これから<span className="text-yellow-400 font-bold">スレッズ</span>と
                      <span className="text-yellow-400 font-bold">楽天アフィリエイト</span>を使った
                      副業の旅が始まります。
                    </p>
                    <p className="text-gray-400 text-sm">
                      もちろん、いきなり玄人向けの設定から始めることもできます。
                      でも、初めての冒険なら...まずはこのガイドに従ってみてください。
                    </p>
                  </div>
                </div>

                {/* 💡 初心者へのおすすめ */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                  <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <span className="text-2xl">💡</span>
                    <span className="text-blue-400">初心者へのおすすめ</span>
                  </h2>
                  <div className="space-y-3 text-gray-300 leading-relaxed">
                    <p>
                      最初の武器として選ぶべきは、
                      <span className="text-blue-400 font-bold">「見た目で伝わる」</span>ジャンルです。
                    </p>
                    <p>
                      伝えたいことの<span className="text-yellow-400 font-bold">80%が画像で伝わる</span>なら、
                      難しい言葉を考えなくても大丈夫。
                    </p>
                    <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30 mt-4">
                      <p className="text-blue-300 text-sm">
                        📷 インテリア、ファッション、ガジェットなど...<br/>
                        写真を見ただけで「いいな」と思えるものがおすすめです。
                      </p>
                    </div>
                  </div>
                </div>

                {/* ⭐ 強みを活かす */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                  <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <span className="text-2xl">⭐</span>
                    <span className="text-purple-400">強みを活かす</span>
                  </h2>
                  <div className="space-y-3 text-gray-300 leading-relaxed">
                    <p>そしてもう一つ大切なこと。</p>
                    <p>
                      あなたが<span className="text-purple-400 font-bold">好きなこと</span>、
                      <span className="text-purple-400 font-bold">興味があること</span>を選ぶと、
                      自然と強みになります。
                    </p>
                    <p className="text-gray-400 text-sm">
                      毎日投稿するものだから、楽しみながら続けられることが一番の武器です。
                    </p>
                  </div>
                </div>

                {/* 次のステップへ */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => {
                      setShowIntroSection(false);
                      setExpandedPhase(0);
                      // 達成演出
                      setAchievement({ message: '🗡️ 冒険の始まりだ！', type: 'complete' });
                      setTimeout(() => setAchievement(null), 2000);
                    }}
                    className="group relative px-12 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-lg font-bold text-xl shadow-lg transition-all duration-300 hover:scale-105 border-2 border-yellow-400"
                  >
                    <span className="flex items-center gap-3">
                      <span className="pixel-font text-sm">▶</span>
                      準備を始める
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">⚔️</span>
                    </span>
                  </button>
                  <p className="text-gray-500 text-sm mt-4">
                    左のメニューから「Phase 0: 準備」へ進みます
                  </p>
                </div>
              </div>
            </div>
          ) : showPatterns ? (
            /* 投稿パターン表示 */
            <div>
              <h2 className="text-2xl font-bold mb-2">投稿6パターン（野球理論）</h2>
              <p className="text-gray-400 mb-6">球種を変えて「飽きないアカウント」を作る</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {postPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                        {pattern.id}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pattern.name}</h3>
                        <p className="text-xs text-gray-400">⚾ {pattern.pitch}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{pattern.description}</p>
                    <p className="text-xs text-gray-500">頻度: {pattern.frequency}</p>
                  </div>
                ))}
              </div>
              
              {/* HARM法則 */}
              <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  HARM法則（フック文の設計）
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-400 mb-1">H</div>
                    <div className="font-medium">Health</div>
                    <div className="text-xs text-gray-400">健康・美容・容姿</div>
                    <div className="text-xs text-gray-500 mt-2">「痩せたい」「美しくなりたい」</div>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400 mb-1">A</div>
                    <div className="font-medium">Ambition</div>
                    <div className="text-xs text-gray-400">夢・キャリア・将来</div>
                    <div className="text-xs text-gray-500 mt-2">「成長したい」「時短したい」</div>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-pink-400 mb-1">R</div>
                    <div className="font-medium">Relation</div>
                    <div className="text-xs text-gray-400">人間関係・恋愛</div>
                    <div className="text-xs text-gray-500 mt-2">「モテたい」「褒められたい」</div>
                  </div>
                  <div className="bg-gray-750 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400 mb-1">M</div>
                    <div className="font-medium">Money</div>
                    <div className="text-xs text-gray-400">お金・投資・節約</div>
                    <div className="text-xs text-gray-500 mt-2">「お得」「1000円以下」</div>
                  </div>
                </div>
              </div>
            </div>
          ) : showModules ? (
            /* 機能モジュール一覧 */
            <div>
              <h2 className="text-2xl font-bold mb-2">機能モジュール一覧</h2>
              <p className="text-gray-400 mb-6">システムが提供する機能と自動化レベル</p>

              <div className="space-y-6">
                {featureModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <div key={module.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      <div className={`${module.color} px-4 py-3 flex items-center gap-3`}>
                        <Icon className="w-5 h-5 text-white" />
                        <h3 className="font-semibold text-white">{module.name}</h3>
                      </div>
                      <div className="p-4">
                        <div className="grid gap-3">
                          {module.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-750 rounded-lg p-3">
                              <div>
                                <div className="font-medium text-sm">{feature.name}</div>
                                <div className="text-xs text-gray-400">{feature.desc}</div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                feature.level === 'AI支援' ? 'bg-purple-600/30 text-purple-400' :
                                feature.level === '自動' ? 'bg-green-600/30 text-green-400' :
                                feature.level === '半自動' ? 'bg-blue-600/30 text-blue-400' :
                                'bg-gray-600/30 text-gray-400'
                              }`}>
                                {feature.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 凡例 */}
              <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-semibold mb-3">自動化レベル凡例</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-600/30 text-purple-400">AI支援</span>
                    <span className="text-sm text-gray-400">AIが文案生成・判定</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-600/30 text-green-400">自動</span>
                    <span className="text-sm text-gray-400">システムが自動実行</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-600/30 text-blue-400">半自動</span>
                    <span className="text-sm text-gray-400">一部手動操作あり</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-600/30 text-gray-400">手動入力</span>
                    <span className="text-sm text-gray-400">ユーザーが入力</span>
                  </div>
                </div>
              </div>
            </div>
          ) : showSafetyInfo ? (
            /* 安全装置（初心者ブロック） */
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-400" />
                安全装置（初心者ブロック）
              </h2>
              <p className="text-gray-400 mb-6">初心者モードでは、危険な操作を事前に警告・ブロックします</p>

              <div className="space-y-4">
                {safetyBlocks.map((block) => {
                  const Icon = block.icon;
                  const colorClasses = {
                    red: 'bg-red-900/30 border-red-500/50 text-red-400',
                    orange: 'bg-orange-900/30 border-orange-500/50 text-orange-400',
                    yellow: 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400',
                  };
                  return (
                    <div key={block.id} className={`rounded-xl p-5 border ${colorClasses[block.color]}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          block.color === 'red' ? 'bg-red-500' :
                          block.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{block.trigger}</h3>
                          <p className="text-sm mt-1 opacity-80">警告: 「{block.warning}」</p>
                          <p className="text-xs mt-2 text-gray-400">解除条件: {block.condition}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  エキスパートモードについて
                </h4>
                <p className="text-sm text-gray-400">
                  エキスパートモードでは、これらの警告は表示されますが、無視して進行することができます。
                  十分な経験を積んでから切り替えることをおすすめします。
                </p>
              </div>
            </div>
          ) : selectedStep ? (
            /* ステップ詳細（改良版） */
            <div>
              <div className="flex items-center gap-4 mb-6">
                <StatusIcon status={selectedStep.status} />
                <div>
                  <h2 className="text-2xl font-bold">{selectedStep.name}</h2>
                  <p className="text-gray-400">{selectedStep.description}</p>
                </div>
                {stepDetails[selectedStep.id]?.hasAI && (
                  <span className="bg-purple-600/30 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    AI支援あり
                  </span>
                )}
              </div>

              {/* 初心者モードの警告 */}
              {mode === 'beginner' && selectedStep.status === 'locked' && (
                <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-400">このステップはまだロックされています</p>
                    <p className="text-sm text-gray-400 mt-1">前のステップを完了してから進んでください。</p>
                  </div>
                </div>
              )}

              {/* ステップ詳細コンテンツ */}
              {stepDetails[selectedStep.id] && (
                <div className="space-y-4">
                  {/* なぜこのステップが必要か */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      なぜこのステップが必要？
                    </h3>
                    <p className="text-gray-300 text-sm">{stepDetails[selectedStep.id].why}</p>
                  </div>

                  {/* 手順 */}
                  <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <h3 className="font-semibold mb-4">やることリスト</h3>
                    <div className="space-y-3">
                      {stepDetails[selectedStep.id].steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-gray-300 text-sm pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                    <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Tips
                    </h3>
                    <p className="text-gray-300 text-sm">{stepDetails[selectedStep.id].tips}</p>
                  </div>

                  {/* 外部リンク */}
                  {stepDetails[selectedStep.id].link && (
                    <a
                      href={stepDetails[selectedStep.id].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      関連リンクを開く
                    </a>
                  )}
                </div>
              )}

              {/* インタラクティブフォーム */}
              <StepForm stepId={selectedStep.id} />

              {/* アクションボタン */}
              {selectedStep.status === 'pending' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => completeStep(selectedStep.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    完了にする
                  </button>
                  <button
                    onClick={() => skipStep(selectedStep.id)}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  >
                    <SkipForward className="w-4 h-4" />
                    スキップ
                  </button>
                </div>
                )}

              {selectedStep.status === 'completed' && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>このステップは完了しています</span>
                  </div>
                  <button
                    onClick={() => resetStepData(selectedStep.id)}
                    className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    やり直す
                  </button>
                </div>
              )}

              {selectedStep.status === 'skipped' && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <SkipForward className="w-5 h-5" />
                    <span>このステップはスキップしました</span>
                  </div>
                  <button
                    onClick={() => resetStepData(selectedStep.id)}
                    className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    やり直す
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* デフォルト: ダッシュボード概要 */
            <div>
              <h2 className="text-2xl font-bold mb-2">ダッシュボード</h2>
              <p className="text-gray-400 mb-6">左のメニューからフェーズを選んで進めていきましょう</p>
              
              {/* クイックスタート */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30 mb-6">
                <h3 className="text-lg font-semibold mb-2">🚀 クイックスタート</h3>
                <p className="text-gray-300 mb-4">
                  まずは「準備」フェーズから始めましょう。楽天アフィリエイトとThreadsの登録が必要です。
                </p>
                <button
                  onClick={() => {
                    setExpandedPhase(0);
                    setSelectedStep(initialPhases[0].steps[0]);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  始める
                </button>
              </div>
              
              {/* コア哲学 */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">💡 このシステムの考え方</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <div className="text-red-400 font-medium mb-1">❌ 目的：売る</div>
                    <p className="text-sm text-gray-400">商品を売ろうとすると押し売りになりがち</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-green-400 font-medium mb-1">⭕ 目的：クリックさせる</div>
                    <p className="text-sm text-gray-400">24時間以内に何か買えば報酬発生！</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-300">
                  → 紹介した商品じゃなくてもOK。だから「興味を引く」が全て！
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
      )}

      {/* アカウント情報タブ */}
      {activeTab === 'accounts' && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Key className="w-6 h-6 text-blue-400" />
              アカウント情報管理
            </h2>
            <p className="text-gray-400 mb-6">
              楽天、Threads、Instagramなどのアカウント情報を一元管理できます。
              <span className="text-yellow-400 text-sm ml-2">※データはブラウザに保存されます</span>
            </p>

            {/* 新規追加フォーム */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新規アカウント追加
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">サービス名</label>
                  <input
                    type="text"
                    value={newAccount.service}
                    onChange={(e) => setNewAccount({ ...newAccount, service: e.target.value })}
                    placeholder="例: 楽天アフィリエイト"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">ID / メールアドレス</label>
                  <input
                    type="text"
                    value={newAccount.userId}
                    onChange={(e) => setNewAccount({ ...newAccount, userId: e.target.value })}
                    placeholder="例: user@example.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">パスワード</label>
                  <input
                    type="text"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    placeholder="パスワード"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">メモ</label>
                  <input
                    type="text"
                    value={newAccount.memo}
                    onChange={(e) => setNewAccount({ ...newAccount, memo: e.target.value })}
                    placeholder="備考"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                onClick={addAccount}
                disabled={!newAccount.service}
                className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                追加する
              </button>
            </div>

            {/* アカウント一覧 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">登録済みアカウント ({accounts.length}件)</h3>
              </div>

              {accounts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  アカウント情報がありません。上のフォームから追加してください。
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {accounts.map((account) => (
                    <div key={account.id} className="p-4 hover:bg-gray-750 transition-all">
                      {editingAccount === account.id ? (
                        // 編集モード
                        <div className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={account.service}
                              onChange={(e) => updateAccount(account.id, { service: e.target.value })}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                              placeholder="サービス名"
                            />
                            <input
                              type="text"
                              value={account.userId}
                              onChange={(e) => updateAccount(account.id, { userId: e.target.value })}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                              placeholder="ID"
                            />
                            <input
                              type="text"
                              value={account.password}
                              onChange={(e) => updateAccount(account.id, { password: e.target.value })}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                              placeholder="パスワード"
                            />
                            <input
                              type="text"
                              value={account.memo}
                              onChange={(e) => updateAccount(account.id, { memo: e.target.value })}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                              placeholder="メモ"
                            />
                          </div>
                          <button
                            onClick={() => setEditingAccount(null)}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all"
                          >
                            <Save className="w-4 h-4" />
                            保存
                          </button>
                        </div>
                      ) : (
                        // 表示モード
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">サービス</div>
                              <div className="font-medium">{account.service}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">ID</div>
                              <div className="text-gray-300">{account.userId || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">パスワード</div>
                              <div className="text-gray-300 font-mono">{account.password || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">メモ</div>
                              <div className="text-gray-400 text-sm">{account.memo || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => setEditingAccount(account.id)}
                              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAccount(account.id)}
                              className="p-2 rounded-lg hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
