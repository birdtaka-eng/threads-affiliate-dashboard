import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Lock, Play, Settings, User, Search, FileText, Calendar, BarChart3, Zap, Shield, AlertTriangle, Sparkles, Target, TrendingUp, Box, Clock, LineChart, ExternalLink, AlertCircle, XCircle, SkipForward } from 'lucide-react';

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

export default function Dashboard() {
  const [phases, setPhases] = useState(initialPhases);
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [mode, setMode] = useState('beginner'); // 'beginner' or 'expert'
  const [showPatterns, setShowPatterns] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);

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
  };

  // ステップをスキップする
  const skipStep = (stepId) => {
    updateStepStatus(stepId, 'skipped');
    unlockNextStep(stepId);
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
        return <Check className="w-5 h-5 text-green-500" />;
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-yellow-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold">Threads × 楽天アフィリ</h1>
              <p className="text-sm text-gray-400">自動化システム</p>
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
          </div>
        </div>
        
        {/* プログレスバー */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400">全体進捗</span>
            <span className="text-blue-400 font-medium">{calculateProgress()}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー - フェーズ一覧 */}
        <aside className="w-72 bg-gray-800 min-h-screen border-r border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            フェーズ
          </h2>
          
          <div className="space-y-2">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const completedSteps = phase.steps.filter(s => s.status === 'completed').length;
              const isExpanded = expandedPhase === phase.id;
              
              return (
                <div key={phase.id} className="rounded-lg overflow-hidden">
                  {/* フェーズヘッダー */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
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
                      {phase.steps.map((step) => (
                        <button
                          key={step.id}
                          onClick={() => {
                            if (step.status !== 'locked' || mode === 'expert') {
                              setSelectedStep(step);
                            }
                          }}
                          disabled={step.status === 'locked' && mode === 'beginner'}
                          className={`w-full flex items-center gap-3 px-4 py-2 transition-all ${
                            selectedStep?.id === step.id
                              ? 'bg-blue-600/20 border-l-2 border-blue-500'
                              : step.status === 'locked' && mode === 'beginner'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-700'
                          }`}
                        >
                          <StatusIcon status={step.status} />
                          <span className={`text-sm flex-1 text-left ${
                            step.important ? 'text-yellow-400 font-medium' : ''
                          }`}>
                            {step.name}
                            {step.important && ' ⭐'}
                          </span>
                          {step.hasAI && (
                            <span className="text-xs bg-purple-600/30 text-purple-400 px-1.5 py-0.5 rounded">
                              AI
                            </span>
                          )}
                        </button>
                      ))}
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
        <main className="flex-1 p-6">
          {showPatterns ? (
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
                <div className="mt-6 flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>このステップは完了しています</span>
                </div>
              )}

              {selectedStep.status === 'skipped' && (
                <div className="mt-6 flex items-center gap-2 text-yellow-400">
                  <SkipForward className="w-5 h-5" />
                  <span>このステップはスキップしました</span>
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
    </div>
  );
}
