/* Tiny, dependency free syntax highlighter.
   Scans every <pre><code> block and wraps comments, strings, numbers,
   keywords, built-in types and call sites in spans. Runs once, on load. */

(function () {
  "use strict";

  var KEYWORDS = [
    "as", "async", "await", "break", "case", "catch", "class", "const",
    "continue", "default", "delete", "do", "else", "enum", "export",
    "extends", "finally", "for", "from", "function", "get", "if",
    "implements", "import", "in", "instanceof", "interface", "let", "new",
    "of", "private", "protected", "public", "return", "set",
    "static", "super", "switch", "this", "throw", "try", "typeof",
    "var", "void", "while", "with", "yield",
    "def", "elif", "lambda", "self", "pass", "raise", "global", "nonlocal",
    "fn", "impl", "mut", "pub", "struct", "trait", "use", "mod",
    "match", "where", "loop", "unsafe", "dyn", "ref", "crate", "move",
    "sizeof", "typedef", "union", "goto", "extern", "register", "volatile",
    "inline", "restrict", "auto", "echo", "fi", "then", "done", "local",
    "esac"
  ];

  var TYPES = [
    "true", "false", "null", "undefined", "None", "True", "False",
    "int", "char", "float", "double", "long", "short", "unsigned", "signed",
    "bool", "string", "object", "any", "never", "unknown",
    "size_t", "ssize_t", "uint8_t", "uint16_t", "uint32_t", "uint64_t",
    "int8_t", "int16_t", "int32_t", "int64_t", "uintptr_t", "ptrdiff_t",
    "i8", "i16", "i32", "i64", "i128",
    "u8", "u16", "u32", "u64", "u128",
    "f32", "f64", "usize", "isize",
    "str", "Vec", "String", "Option", "Result"
  ];

  /* Group order matters: comments, then strings, then numbers,
     then keywords, then built-in types, then bare identifiers
     followed by a paren. */
  var TOKEN_RE = new RegExp(
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|^#[^\\n]*)" +
    "|(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)" +
    "|\\b(\\d+(?:\\.\\d+)?)\\b" +
    "|\\b(" + KEYWORDS.join("|") + ")\\b" +
    "|\\b(" + TYPES.join("|") + ")\\b" +
    "|\\b([A-Za-z_$][A-Za-z0-9_$]*)(?=\\s*\\()",
    "gm"
  );

  var CLASSES = [
    "tok-comment",
    "tok-string",
    "tok-number",
    "tok-keyword",
    "tok-type",
    "tok-function"
  ];

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlight(source) {
    return escapeHtml(source).replace(TOKEN_RE, function (match) {
      for (var i = 1; i < arguments.length - 2; i++) {
        if (arguments[i] !== undefined) {
          return '<span class="' + CLASSES[i - 1] + '">' + match + "</span>";
        }
      }
      return match;
    });
  }

  function init() {
    var blocks = document.querySelectorAll("pre code");
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].innerHTML = highlight(blocks[i].textContent);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();