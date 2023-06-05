USE webblog;
SET CHARACTER_SET_CLIENT = utf8;
SET CHARACTER_SET_CONNECTION = utf8;
INSERT INTO tag_name(name) VALUES('React'),('Vue'),('Elm');
INSERT INTO post(slug) VALUES('8557AF75A904DEEF4E00'),('DBAE5FBC068F850F4CE5'),('DE9E321CA9C94A18BC0C');
INSERT INTO tag_post VALUES(1,3),(1,1),(2,1),(3,2);
INSERT INTO author(name) VALUES('yuria');
INSERT INTO author_secret VALUES(1,'yuria@sample.local','hashd_password');
INSERT INTO post_revision(title,author_id,post_id,public,post_data) VALUES
('テストデータ',1,1,1,"テストテストテストテスト"),
('テストデータ2',1,2,1,"テスト2テスト2テスト2テスト2");
INSERT INTO post_revision(title,author_id,post_id,public,post_data) VALUES
('テストデータ3',1,1,1,"~~テスト~~ **テスト** \n- テスト\n\n# テスト"),
('Rustで一日でDiscordBotを作る',1,3,1,"この記事は[自分のQiita記事](https://qiita.com/yuriacats/items/b8dd6a43c771dc3ba267)からの一部転載です\n\n今日は（ほぼ）Rust未経験の私が1日でDiscordBotを作ったときに気が付いたことや知っておくと便利な事柄ついて記載していきます。\n作ったものの記事→　[くそアプリアドベントカレンダー](https://qiita.com/yuriacats/items/b3ab150757ed11bce7f7)\n\n## 環境構築って大変→DevConteinerに任せよう  \n\nRust、Python、C#など幅広い言語のサポートがされており、物足りなければDockerConteinerを自前で作ればいい気軽さ。これで環境依存のエラーとはおさらばだ \n\n（中略） \n --- \n参考資料\n[https://dev.classmethod.jp/articles/rust-discordbot](https://dev.classmethod.jp/articles/rust-discordbot)/\n公式のExsamplesも豊富でこちらもぜひ\n[https://github.com/rust-random/rand/tree/master/examples](https://github.com/rust-random/rand/tree/master/examples)\n");

