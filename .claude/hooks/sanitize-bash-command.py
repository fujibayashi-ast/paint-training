#!/usr/bin/env python3
"""block-credentials.sh 用: Bash コマンドから「ただの文章」と言える部分を取り除く。

標準入力でコマンド全文を受け取り、機密パターンの照合対象にする文字列を標準出力へ書く。
コマンドはシェル構文でトークンに分割し、1 コマンド（; && || | () 改行で区切る）を 1 行にして出力する。

取り除くもの:
  * JS の環境変数アクセサ（import.meta.env / process.env / Bun.env / Deno.env）
  * リテラルなヒアドキュメントの本文
  * git commit / git tag / gh issue|pr の、メッセージ・タイトル・本文を渡すオプションの値

値に `$(` やバッククォートがある場合は、コマンド置換で機密ファイルを読めてしまうので取り除かない。
想定する脅威は「うっかりのアクセス」であり、意図的な回避は防げない。

パースに失敗した場合（引用符の閉じ忘れなど）は非 0 で終了する。呼び出し側はコマンド全文の照合に戻す。
"""

import re
import shlex
import sys

OPERATORS = ";&|()\n"

JS_ENV_ACCESSOR = re.compile(r"(?<![\w./~-])(?:import\.meta|process|Bun|Deno)\.env(?!\w)")
HEREDOC = re.compile(r"(?<!<)<<(?!<)(-?)\s*(['\"]?)([A-Za-z_]\w*)\2")
ASSIGNMENT = re.compile(r"^[A-Za-z_]\w*=")

# (コマンド, サブコマンド...) -> (短いオプションの文字, 長いオプション, 短いオプションを連結できるか)
TEXT_OPTIONS = {
    ("git", "commit"): ("m", {"--message"}, True),
    ("git", "tag"): ("m", {"--message"}, True),
}
for _sub in ("issue", "pr"):
    for _action in ("create", "comment", "edit", "review", "close", "merge"):
        TEXT_OPTIONS[("gh", _sub, _action)] = ("tb", {"--title", "--body"}, False)


def strip_heredocs(command):
    """ヒアドキュメントの本文を取り除く。区切り語の行は残す"""
    lines = command.split("\n")
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        out.append(line)
        i += 1
        m = HEREDOC.search(line)
        if not m:
            continue
        dash, quote, delimiter = m.group(1), m.group(2), m.group(3)
        end = next(
            (
                j
                for j in range(i, len(lines))
                if (lines[j].lstrip("\t") if dash else lines[j]) == delimiter
            ),
            None,
        )
        if end is None:
            continue
        body = lines[i:end]
        # 区切り語が引用符なしの本文はシェルが展開するので、コマンド置換があれば残す
        if quote or not any(has_substitution(b) for b in body):
            i = end
    return "\n".join(out)


def has_substitution(value):
    return "$(" in value or "`" in value


def split_segments(tokens):
    segments = []
    current = []
    for token in tokens:
        if token and all(c in OPERATORS for c in token):
            if current:
                segments.append(current)
            current = []
        else:
            current.append(token)
    if current:
        segments.append(current)
    return segments


def find_text_options(segment):
    start = 0
    while start < len(segment) and ASSIGNMENT.match(segment[start]):
        start += 1
    words = segment[start:]
    for key, rule in TEXT_OPTIONS.items():
        if tuple(words[: len(key)]) == key:
            return rule
    return None


def drop_text_values(segment):
    rule = find_text_options(segment)
    if rule is None:
        return segment
    short_letters, long_options, clusterable = rule
    out = []
    i = 0
    while i < len(segment):
        token = segment[i]
        i += 1
        out.append(token)
        value_attached = None
        takes_next = False
        if token.startswith("--"):
            name, eq, rest = token.partition("=")
            if name in long_options:
                if eq:
                    out[-1] = name + eq
                    value_attached = rest
                else:
                    takes_next = True
        elif token.startswith("-") and len(token) > 1:
            letters = token[1:]
            if clusterable:
                k = next((n for n, c in enumerate(letters) if c in short_letters), None)
                if k is not None and all(c.isalpha() for c in letters[:k]):
                    rest = letters[k + 1 :]
                    if rest:
                        out[-1] = "-" + letters[: k + 1]
                        value_attached = rest
                    else:
                        takes_next = True
            elif letters in short_letters and len(letters) == 1:
                takes_next = True
        if value_attached is not None:
            if has_substitution(value_attached):
                out[-1] = token
        elif takes_next and i < len(segment):
            value = segment[i]
            i += 1
            if has_substitution(value):
                out.append(value)
    return out


def main():
    command = strip_heredocs(sys.stdin.read())
    lexer = shlex.shlex(command, posix=True, punctuation_chars=OPERATORS)
    lexer.whitespace = " \t\r"
    lexer.whitespace_split = True
    lexer.commenters = ""
    segments = split_segments(list(lexer))
    lines = [" ".join(drop_text_values(s)).replace("\n", " ") for s in segments]
    sys.stdout.write(JS_ENV_ACCESSOR.sub("", "\n".join(lines)))


main()
