# ホットフィックス辞書（β運用）

このレポジトリでは、azooKeyの「ホットフィックス」辞書を管理します。ホットフィックス辞書はアプリで自動的にダウンロードされ、ユーザ辞書に統合されます。

## ユーザの方へ
azooKey全体に共有したい辞書情報がある場合、以下のGoogle Formから送信してください。

* [Google Form（リクエスト用）](https://docs.google.com/forms/d/e/1FAIpQLSceGtIHH8P-KbrB2ownprap3cUVVJegbhGekfz1xCiwPxBNfg/viewform)

GitHubアカウントをお持ちの場合は、直接IssueまたはPull Requestを立てていただいても構いません。

## JSONの構造


以下は `data.json` の例と各フィールドの説明です。

```json
{
    "metadata": {
        "status": "active",
        "name": "data.json",
        "description": "A JSON file containing a list of dictionaries.",
        "version": "1.0",
        "last_update": "2025-05-04T12:00:00.00"
    },
    "data": [
        {
            "word": "azooKey",
            "ruby": "あずーきー",
            "word_weight": -15.0,
            "lcid": 1288,
            "rcid": 1288,
            "mid": 501,
            "date": "2025-05-04",
            "author": "@ensan-hcl"
        }
    ]
}
```

### トップレベル構造

| キー | 説明 |
|------|------|
| `metadata` | ファイル自体の情報（状態、バージョン、最終更新日時など） |
| `data` | 辞書エントリの配列。各要素が 1 語彙を表します。 |

#### `metadata` オブジェクト

| フィールド | 意味 |
|-----------|------|
| `status` | 辞書ファイルの状態 (`"active"` 等) |
| `name` | ファイル名 |
| `description` | ファイル内容の説明 |
| `version` | ファイルのバージョン番号 |
| `last_update` | 最終更新日時 (ISO 8601 形式) |

#### `data` のエントリ構造

| フィールド | 意味 |
|-----------|------|
| `word` | 実際に入力・表示される語彙 |
| `ruby` | 読み仮名（ふりがな） |
| `word_weight` | 変換優先度 (値が小さいほど優先度が低い、通常-15~-5程度) |
| `lcid` / `rcid` | 左文脈 / 右文脈 ID。形態素解析エンジンが前後関係を評価する際に使用します。 |
| `mid` | 基本的に501を指定 |
| `date` | エントリ登録日 (YYYY-MM-DD 形式) |
| `author` | 登録者または変更者の識別子 |

---

このように **`metadata`** にファイル全体の管理情報を、**`data`** に実際の辞書レコードを保持することで、ホットフィックス辞書の自動配信とバージョン管理を容易にしています。
