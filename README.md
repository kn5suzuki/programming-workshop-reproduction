# 近未来体験 2022 のプログラミング教室をリファクタリング

## 動作環境

- node: 16.17.1
- npm: 8.15.0

## 初期セットアップログ

```
npm init
npm install --save express
```

webpack のインストール

```
npm install --save-dev webpack webpack-cli webpack-node-externals webpack-dev-server
```

babel のインストール

```
npm install --save-dev @babel/core @babel/preset-env babel-loader
```

その他ローダーのインストール

```
npm install  --save-dev html-loader html-webpack-plugin
npm install --save-dev css-loader style-loader sass-loader sass
npm install --save-dev json-loader
```

webpack5 以降は crypto がデフォルトで使えないらしい

```
npm install --save-dev assert buffer console-browserify constants-browserify crypto-browserify domain-browser events stream-http https-browserify os-browserify path-browserify punycode process querystring-es3 stream-browserify readable-stream readable-stream readable-stream readable-stream readable-stream string_decoder util timers-browserify tty-browserify url util vm-browserify browserify-zlib
```

必要なライブラリのインストール

```
npm install --save blockly phaser
```

## 使い方

初期化

```
docker-compose run --rm app npm install
```

フロントのテスト

```
docker-compose run --rm app npm run dev
```

ビルド

```
docker-compose run --rm app npm run build
```

サーバの起動

```
docker-compose up
```

アクセス
Nginx が 80 番ポートで静的ファイルを返しているのでホストに直接 HTTP を送る

注意
`webpack.config.json`の`SERVER_URL`は適宜書き換えること
