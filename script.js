/* Tiny, dependency free code-block helper: syntax highlighting,
   line numbers, copy button, and a post table of contents.

   Highlighter:
   Scans every <pre><code> block and wraps comments, strings, numbers,
   keywords, built-in types and call sites in spans. Runs once, on load. */

(function () {
  "use strict";

  var KEYWORDS = [
    "as",
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "finally",
    "for",
    "from",
    "function",
    "get",
    "if",
    "implements",
    "import",
    "in",
    "instanceof",
    "interface",
    "let",
    "new",
    "of",
    "private",
    "protected",
    "public",
    "return",
    "set",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    "def",
    "elif",
    "lambda",
    "self",
    "pass",
    "raise",
    "global",
    "nonlocal",
    "fn",
    "impl",
    "mut",
    "pub",
    "struct",
    "trait",
    "use",
    "mod",
    "match",
    "where",
    "loop",
    "unsafe",
    "dyn",
    "ref",
    "crate",
    "move",
    "sizeof",
    "typedef",
    "union",
    "goto",
    "extern",
    "register",
    "volatile",
    "inline",
    "restrict",
    "auto",
    "echo",
    "fi",
    "then",
    "done",
    "local",
    "esac",
  ];

  var TYPES = [
    "true",
    "false",
    "null",
    "undefined",
    "None",
    "True",
    "False",
    "int",
    "char",
    "float",
    "double",
    "long",
    "short",
    "unsigned",
    "signed",
    "bool",
    "string",
    "object",
    "any",
    "never",
    "unknown",
    "size_t",
    "ssize_t",
    "uint8_t",
    "uint16_t",
    "uint32_t",
    "uint64_t",
    "int8_t",
    "int16_t",
    "int32_t",
    "int64_t",
    "uintptr_t",
    "ptrdiff_t",
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "f32",
    "f64",
    "usize",
    "isize",
    "str",
    "Vec",
    "String",
    "Option",
    "Result",
  ];

  /* Group order matters: comments, then strings, then numbers,
     then keywords, then built-in types, then bare identifiers
     followed by a paren. */
  var TOKEN_RE = new RegExp(
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|^#[^\\n]*)" +
      "|(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)" +
      "|\\b(\\d+(?:\\.\\d+)?)\\b" +
      "|\\b(" +
      KEYWORDS.join("|") +
      ")\\b" +
      "|\\b(" +
      TYPES.join("|") +
      ")\\b" +
      "|\\b([A-Za-z_$][A-Za-z0-9_$]*)(?=\\s*\\()",
    "gm",
  );

  var CLASSES = [
    "tok-comment",
    "tok-string",
    "tok-number",
    "tok-keyword",
    "tok-type",
    "tok-function",
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

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      if (ok) resolve();
      else reject();
    });
  }

  function flash(btn, label) {
    btn.textContent = label;
    btn.setAttribute("data-state", "done");
    setTimeout(function () {
      btn.textContent = "Copy";
      btn.removeAttribute("data-state");
    }, 1600);
  }

  /* Highlight one block, add a line-number gutter when it has more than
     one line, and wrap it with a copy button. The gutter sits outside
     <code>, so copying never includes the numbers. */
  function enhanceBlock(code) {
    var pre = code.parentNode;
    var text = code.textContent;
    code.innerHTML = highlight(text);

    var count = text.replace(/\n$/, "").split("\n").length;
    if (count > 1) {
      var nums = [];
      for (var n = 1; n <= count; n++) nums.push(n);
      var gutter = document.createElement("span");
      gutter.className = "ln";
      gutter.setAttribute("aria-hidden", "true");
      gutter.textContent = nums.join("\n");
      pre.classList.add("has-ln");
      pre.insertBefore(gutter, code);
    }

    var wrap = document.createElement("div");
    wrap.className = "code-block";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      copyText(text).then(
        function () {
          flash(btn, "Copied");
        },
        function () {
          flash(btn, "Failed");
        },
      );
    });
    wrap.appendChild(btn);
  }

  /* Table of contents from the h2s in a post (shown on wide screens). */
  function buildToc() {
    var heads = document.querySelectorAll(".post-body h2[id]");
    if (heads.length < 2) return;
    var nav = document.createElement("nav");
    nav.className = "toc";
    nav.setAttribute("aria-label", "On this page");
    var ul = document.createElement("ul");
    var links = {};
    for (var i = 0; i < heads.length; i++) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + heads[i].id;
      a.textContent = heads[i].textContent.replace(/\s+/g, " ").trim();
      li.appendChild(a);
      ul.appendChild(li);
      links[heads[i].id] = a;
    }
    nav.appendChild(ul);
    document.body.appendChild(nav);

    if (!("IntersectionObserver" in window)) return;
    var current = null;
    var io = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (!entries[j].isIntersecting) continue;
          if (current) current.removeAttribute("aria-current");
          current = links[entries[j].target.id];
          current.setAttribute("aria-current", "true");
        }
      },
      { rootMargin: "0px 0px -75% 0px" },
    );
    for (var k = 0; k < heads.length; k++) io.observe(heads[k]);
  }

  function init() {
    var blocks = document.querySelectorAll("pre code");
    for (var i = 0; i < blocks.length; i++) enhanceBlock(blocks[i]);
    buildToc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
