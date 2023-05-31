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
('テストデータ3',1,1,1,"~~テスト~~ **テスト** \n- テスト\n\n# テスト");

