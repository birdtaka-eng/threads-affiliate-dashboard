import { Settings, Target, Search, FileText, Play, TrendingUp, AlertTriangle, XCircle, AlertCircle, Clock } from 'lucide-react';

// 各ステップのフォーム設定（RPG風：説明・質問付き）
export const stepFormConfigs = {
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
        label: 'Instagramアカウントを確認',
        type: 'checkbox',
        question: 'Instagramのアカウントはありますか？',
        explanation: 'ThreadsはInstagramアカウントと連携して作ります。\n\n持っていない場合は、下のリンクからアプリをダウンロードして新規登録してください。\n\n💡 すでにInstagramを使っている人はそのままでOK！',
        link: {
          url: 'https://www.instagram.com/',
          text: '🔗 Instagramを開く'
        }
      },
      {
        id: 'threadsCreated',
        label: 'Threadsアプリでアカウント作成',
        type: 'checkbox',
        question: 'Threadsアプリでアカウントを作成しましたか？',
        explanation: '超カンタン！3ステップで完了します。\n\n📱 作成手順：\n1. Threadsアプリをダウンロード\n2. 「Instagramでログイン」をタップ\n3. プロフィールを設定して完了！\n\n✨ 1分で終わります',
        link: {
          url: 'https://www.threads.net/',
          text: '🔗 Threads公式サイトを開く'
        }
      },
      {
        id: 'threadsUsername',
        label: 'Threadsユーザー名をメモ',
        type: 'text',
        placeholder: '例: @your_username',
        question: 'あなたのThreadsユーザー名は？',
        explanation: 'プロフィール画面で確認できます。\n\n@から始まる名前です。\n後で楽天に登録するときに使うので、ここにメモしておきましょう！'
      },
    ],
    warnings: [
      { condition: (data, mode) => mode === 'beginner', message: '⚠️ PC初回ログインでアカウント停止のリスクあり。まずスマホで数投稿してから！', type: 'warning' },
    ],
    completionCheck: (data) => data?.hasInstagram && data?.threadsCreated && data?.threadsUsername,
  },
  '0-3': {
    fields: [
      {
        id: 'threadsUrl',
        label: 'ThreadsプロフィールURLをコピー',
        type: 'text',
        placeholder: '例: https://www.threads.net/@your_username',
        question: 'ThreadsのプロフィールURLは？',
        explanation: '📱 コピー方法：\n1. Threadsアプリでプロフィール画面を開く\n2. 右上の「シェア」ボタンをタップ\n3. 「リンクをコピー」を選択\n\nここに貼り付けてメモしておきましょう！'
      },
      {
        id: 'siteRegistered',
        label: '楽天にサイト登録申請',
        type: 'checkbox',
        question: '楽天アフィリエイト管理画面でサイト登録しましたか？',
        explanation: '下のリンクから管理画面を開いて登録します。\n\n📝 登録手順：\n1. 管理画面にログイン\n2. 「サイト情報の登録・確認・変更」をクリック\n3. 「新規サイトの追加登録」をクリック\n4. サイト名：Threads、URL：さっきコピーしたURL\n5. 申請ボタンを押して完了！',
        link: {
          url: 'https://affiliate.rakuten.co.jp/site/',
          text: '🔗 楽天アフィリエイト管理画面を開く'
        }
      },
      {
        id: 'approved',
        label: '審査完了（承認済み）',
        type: 'checkbox',
        question: '審査は完了しましたか？',
        explanation: '審査には通常1〜3日かかります。\n\n📧 承認されるとメールが届きます。\n\n⏰ 待っている間に次のステップ（設計フェーズ）を進めてもOK！\n\n💡 承認前でもリンクは作れますが、報酬は承認後から発生します。'
      },
    ],
    completionCheck: (data) => data?.threadsUrl && data?.siteRegistered,
  },
  '1-1': {
    fields: [
      {
        id: 'selectedGenre',
        label: '紹介したい商品ジャンル',
        type: 'text',
        placeholder: '例: インテリア雑貨、ファッション小物',
        question: 'どんな商品を紹介したいですか？',
        explanation: 'あなたが興味を持っている商品ジャンルを入力してください。2つ程度が上限です。'
      },
    ],
    completionCheck: (data) => data?.selectedGenre,
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
    hasAutoGenerate: true,
    fields: [
      // キャラ設定セクション
      {
        id: 'characterName',
        label: '名前',
        type: 'text',
        placeholder: '例: みゆ、ゆうこ、りな',
        question: 'あなたの活動名は？（ひらがな/カタカナ推奨）',
        explanation: '覚えやすい2-4文字がおすすめ。ひらがなかカタカナが親しみやすいです。',
        section: 'character'
      },
      {
        id: 'personality',
        label: '性格',
        type: 'select',
        question: 'どんな性格で発信しますか？',
        explanation: '投稿の雰囲気を決める大切な要素です。自分に近いものを選びましょう。',
        options: [
          { value: 'gentle', label: 'やさしい' },
          { value: 'sharp', label: '毒舌' },
          { value: 'calm', label: '冷静' },
          { value: 'passionate', label: '熱血' },
        ],
        section: 'character'
      },
      {
        id: 'speakingStyle',
        label: '話し方',
        type: 'select',
        question: 'どんな話し方で発信しますか？',
        explanation: '親しみやすさと信頼感のバランスを考えて選びましょう。',
        options: [
          { value: 'polite', label: '敬語' },
          { value: 'casual', label: 'タメ口' },
          { value: 'kansai', label: '関西弁' },
          { value: 'standard', label: '標準語' },
        ],
        section: 'character'
      },
      {
        id: 'empathyPoint',
        label: '共感ポイント',
        type: 'text',
        placeholder: '例: 2児育児中でもキレイでいたい',
        question: 'あなたの共感ポイントは？',
        explanation: 'フォロワーが「私と同じ！」と感じるポイントを入力してください。',
        section: 'character'
      },
      // 生成結果セクション
      {
        id: 'accountName',
        label: 'アカウント名',
        type: 'text',
        placeholder: '例: みゆ｜暮らしの雑貨',
        question: 'アカウント名',
        explanation: '自動生成後に編集できます。',
        section: 'result'
      },
      {
        id: 'userId',
        label: 'ユーザーID',
        type: 'text',
        placeholder: '例: @miyu_zakka',
        question: 'ユーザーID',
        explanation: '自動生成後に編集できます。',
        section: 'result'
      },
      {
        id: 'fullProfile',
        label: 'プロフィール文',
        type: 'textarea',
        placeholder: 'プロフィール文がここに生成されます',
        question: 'プロフィール文',
        explanation: '自動生成後に編集できます。絵文字は1-2個まで。',
        rows: 4,
        section: 'result'
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
export const initialPhases = [
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
export const postPatterns = [
  { id: 1, name: '挨拶投稿', pitch: 'ストレート', description: '自己紹介、ジャンル認知', frequency: '開始時1回' },
  { id: 2, name: '一言＋商品画像', pitch: 'ストレート', description: 'シンプルに商品紹介', frequency: '高め' },
  { id: 3, name: 'バズワード投稿', pitch: 'カーブ', description: 'トレンドワードでリーチ拡大', frequency: '中' },
  { id: 4, name: 'ターゲット刺し', pitch: 'フォーク', description: 'HARM法則で感情訴求', frequency: '中' },
  { id: 5, name: '有益情報', pitch: 'チェンジアップ', description: '価値提供、信頼構築', frequency: '低〜中' },
  { id: 6, name: 'まとめ投稿', pitch: 'スライダー', description: '複数商品をまとめて紹介', frequency: '週1-2回' },
];

// 初心者ブロック（安全装置）
export const safetyBlocks = [
  { id: 'saturated', trigger: '飽和ジャンル選択', warning: '競合が多いです', condition: '理解した上で進む', icon: AlertTriangle, color: 'yellow' },
  { id: 'continuous', trigger: '連続リンク投稿', warning: 'BANリスクあり', condition: '時間を空ける', icon: XCircle, color: 'red' },
  { id: 'imbalance', trigger: '球種偏り', warning: '同じタイプ続きすぎ', condition: '別パターン選択', icon: AlertCircle, color: 'orange' },
  { id: 'forbidden', trigger: '禁止ワード使用', warning: 'このワードはNG', condition: 'ワード修正', icon: XCircle, color: 'red' },
  { id: 'overpost', trigger: '1日投稿数超過', warning: '投稿しすぎ', condition: '翌日まで待つ', icon: Clock, color: 'orange' },
];

// 機能モジュール一覧
export const featureModules = [
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
    icon: FileText,
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
    icon: TrendingUp,
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
export const stepDetails = {
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
    isLargeText: true,
    why: `【自己プロデュースの時間です】

１．この設計は何をするところなのか？
一言で言うなら「自己プロデュース」です。

２．この作業は、テレビ番組で言う所の番組作りであり、あなたはそのプロデューサーです。

３．「番組を作りましょう」となったときに、真っ先に考えるのは「視聴者層」です。
つまり、だれに届けるのか？が分からないと、番組作りがぶれてしまいます。

４．じつは、楽天アフィリにぴったりな「視聴者層」の答えはすでに出ています。
答えは、「２０～３０代の女性、主婦、OLさんが中心です。」

５．では、この「２０～３０代の女性、主婦、OLさん」の関心事や日常的に入ってくると嬉しい情報は？

６．その答えもすでにあります。「王道」はこれ：
・美容
・育児
・ファッション(女性・キッズ・男性）
・暮らし（雑貨、家具、便利グッズ）
・旅行

７．なにからどう進めて行こうか？と悩む場合はこの５個の「自分個人も関心がある」中から選んでください。
自分の関心が無いことを、１から作り上げるのは大変ですよね？
なので、「美容」にさっぱり関心が無いのに、美容ジャンルが稼げそうで進めるのはとてもつらい作業になるので、避けましょう。

また、ジャンル内容は二つ程度を上限にすること。
あまり、発信内容が広範囲になると、特定の情報が欲しいユーザーさんがフォローしてくれません。

８．好きな事も、関心事も無いなーと悩んでしまう人へ。
例えば、「子供さんを立派に育て上げた経験がある」方は実は「育児」系にぴったりなんです。
現在進行形でなくてはダメなんて事はありません。
「すらすらと語れる内容」があなたの強みであり、ジャンルです。`,
    steps: [],
    tips: '',
  },
  '1-2': {
    title: 'コンセプト設計・ターゲット設定',
    isLargeText: true,
    why: `【ターゲット設定の役割】

１．前項で「20〜30代女性、主婦、OL」がターゲットと説明しました。
でも、これはまだ「大きな枠」です。

２．ターゲット設定では、この枠をもっと「具体的な人物像」に絞り込みます。

３．なぜ絞り込むのか？
例えば「主婦さん」と言っても…
・20代で赤ちゃんを育てている新米ママ
・30代で小学生の子供がいるベテランママ
・40代で子育てが落ち着いた主婦さん
全然違いますよね？

４．「共感」がフォローの鍵です。
Threadsを見ている主婦さんは、
「この人、私と同じだ！」と感じた時にフォローします。

５．だから決めるのは…
・どんな属性の人に届けたいか（年代、状況）
・その人が「共感」するポイントは何か
・自分はどんなキャラで発信するか

６．具体例：
✖️「主婦さん向けに発信します」
⭕️「毎日残業で疲れて帰ってきて、ご飯考えるのムリ…という30代ワーママ向けに発信します」

後者の方が「私のことだ！」と刺さりますよね？

７．ただし「20〜30代女性」がおすすめですが、限定する必要はありません。
あなたの目的が自分の、あるいは特定ジャンルの発信が目的の場合（例えば会社の商品を売る目的）であれば、自由に変更可能です。
例えば「男性×美容」で勝負するなど。
※ただし、効率的な収益化からは遠ざかります。

大切なのは…
「一貫性＝ジャンルで統一」ではなく
【届けたい層が喜ぶ内容で統一】すること。`,
    steps: [],
    tips: '',
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
export const STORAGE_KEYS = {
  USER_DATA: 'threads-affiliate-userData',
  PHASES: 'threads-affiliate-phases',
  ACCOUNTS: 'threads-affiliate-accounts',
  MODE: 'threads-affiliate-mode',
};
