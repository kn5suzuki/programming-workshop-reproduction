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
```

必要なライブラリのインストール

```
npm install --save blockly phaser
```

## 使い方

開発用

```
npm run dev
```

公開用

```
npm run build
npm run start
```
