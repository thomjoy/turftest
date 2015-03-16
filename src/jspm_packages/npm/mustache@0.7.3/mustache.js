/* */ 
"format cjs";
(function(Buffer) {
  (function(root, factory) {
    if (typeof exports === "object" && exports) {
      factory(exports);
    } else {
      var mustache = {};
      factory(mustache);
      if (typeof define === "function" && define.amd) {
        define(mustache);
      } else {
        root.Mustache = mustache;
      }
    }
  }(this, function(mustache) {
    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var nonSpaceRe = /\S/;
    var eqRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;
    var RegExp_test = RegExp.prototype.test;
    function testRegExp(re, string) {
      return RegExp_test.call(re, string);
    }
    function isWhitespace(string) {
      return !testRegExp(nonSpaceRe, string);
    }
    var Object_toString = Object.prototype.toString;
    var isArray = Array.isArray || function(object) {
      return Object_toString.call(object) === '[object Array]';
    };
    function isFunction(object) {
      return typeof object === 'function';
    }
    function escapeRegExp(string) {
      return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };
    function escapeHtml(string) {
      return String(string).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
      });
    }
    function Scanner(string) {
      this.string = string;
      this.tail = string;
      this.pos = 0;
    }
    Scanner.prototype.eos = function() {
      return this.tail === "";
    };
    Scanner.prototype.scan = function(re) {
      var match = this.tail.match(re);
      if (match && match.index === 0) {
        var string = match[0];
        this.tail = this.tail.substring(string.length);
        this.pos += string.length;
        return string;
      }
      return "";
    };
    Scanner.prototype.scanUntil = function(re) {
      var index = this.tail.search(re),
          match;
      switch (index) {
        case -1:
          match = this.tail;
          this.tail = "";
          break;
        case 0:
          match = "";
          break;
        default:
          match = this.tail.substring(0, index);
          this.tail = this.tail.substring(index);
      }
      this.pos += match.length;
      return match;
    };
    function Context(view, parent) {
      this.view = view == null ? {} : view;
      this.parent = parent;
      this._cache = {'.': this.view};
    }
    Context.make = function(view) {
      return (view instanceof Context) ? view : new Context(view);
    };
    Context.prototype.push = function(view) {
      return new Context(view, this);
    };
    Context.prototype.lookup = function(name) {
      var value;
      if (name in this._cache) {
        value = this._cache[name];
      } else {
        var context = this;
        while (context) {
          if (name.indexOf('.') > 0) {
            value = context.view;
            var names = name.split('.'),
                i = 0;
            while (value != null && i < names.length) {
              value = value[names[i++]];
            }
          } else {
            value = context.view[name];
          }
          if (value != null)
            break;
          context = context.parent;
        }
        this._cache[name] = value;
      }
      if (isFunction(value)) {
        value = value.call(this.view);
      }
      return value;
    };
    function Writer() {
      this.clearCache();
    }
    Writer.prototype.clearCache = function() {
      this._cache = {};
      this._partialCache = {};
    };
    Writer.prototype.compile = function(template, tags) {
      var fn = this._cache[template];
      if (!fn) {
        var tokens = mustache.parse(template, tags);
        fn = this._cache[template] = this.compileTokens(tokens, template);
      }
      return fn;
    };
    Writer.prototype.compilePartial = function(name, template, tags) {
      var fn = this.compile(template, tags);
      this._partialCache[name] = fn;
      return fn;
    };
    Writer.prototype.getPartial = function(name) {
      if (!(name in this._partialCache) && this._loadPartial) {
        this.compilePartial(name, this._loadPartial(name));
      }
      return this._partialCache[name];
    };
    Writer.prototype.compileTokens = function(tokens, template) {
      var self = this;
      return function(view, partials) {
        if (partials) {
          if (isFunction(partials)) {
            self._loadPartial = partials;
          } else {
            for (var name in partials) {
              self.compilePartial(name, partials[name]);
            }
          }
        }
        return renderTokens(tokens, self, Context.make(view), template);
      };
    };
    Writer.prototype.render = function(template, view, partials) {
      return this.compile(template)(view, partials);
    };
    function renderTokens(tokens, writer, context, template) {
      var buffer = '';
      function subRender(template) {
        return writer.render(template, context);
      }
      var token,
          tokenValue,
          value;
      for (var i = 0,
          len = tokens.length; i < len; ++i) {
        token = tokens[i];
        tokenValue = token[1];
        switch (token[0]) {
          case '#':
            value = context.lookup(tokenValue);
            if (typeof value === 'object' || typeof value === 'string') {
              if (isArray(value)) {
                for (var j = 0,
                    jlen = value.length; j < jlen; ++j) {
                  buffer += renderTokens(token[4], writer, context.push(value[j]), template);
                }
              } else if (value) {
                buffer += renderTokens(token[4], writer, context.push(value), template);
              }
            } else if (isFunction(value)) {
              var text = template == null ? null : template.slice(token[3], token[5]);
              value = value.call(context.view, text, subRender);
              if (value != null)
                buffer += value;
            } else if (value) {
              buffer += renderTokens(token[4], writer, context, template);
            }
            break;
          case '^':
            value = context.lookup(tokenValue);
            if (!value || (isArray(value) && value.length === 0)) {
              buffer += renderTokens(token[4], writer, context, template);
            }
            break;
          case '>':
            value = writer.getPartial(tokenValue);
            if (isFunction(value))
              buffer += value(context);
            break;
          case '&':
            value = context.lookup(tokenValue);
            if (value != null)
              buffer += value;
            break;
          case 'name':
            value = context.lookup(tokenValue);
            if (value != null)
              buffer += mustache.escape(value);
            break;
          case 'text':
            buffer += tokenValue;
            break;
        }
      }
      return buffer;
    }
    function nestTokens(tokens) {
      var tree = [];
      var collector = tree;
      var sections = [];
      var token;
      for (var i = 0,
          len = tokens.length; i < len; ++i) {
        token = tokens[i];
        switch (token[0]) {
          case '#':
          case '^':
            sections.push(token);
            collector.push(token);
            collector = token[4] = [];
            break;
          case '/':
            var section = sections.pop();
            section[5] = token[2];
            collector = sections.length > 0 ? sections[sections.length - 1][4] : tree;
            break;
          default:
            collector.push(token);
        }
      }
      return tree;
    }
    function squashTokens(tokens) {
      var squashedTokens = [];
      var token,
          lastToken;
      for (var i = 0,
          len = tokens.length; i < len; ++i) {
        token = tokens[i];
        if (token) {
          if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
            lastToken[1] += token[1];
            lastToken[3] = token[3];
          } else {
            lastToken = token;
            squashedTokens.push(token);
          }
        }
      }
      return squashedTokens;
    }
    function escapeTags(tags) {
      return [new RegExp(escapeRegExp(tags[0]) + "\\s*"), new RegExp("\\s*" + escapeRegExp(tags[1]))];
    }
    function parseTemplate(template, tags) {
      template = template || '';
      tags = tags || mustache.tags;
      if (typeof tags === 'string')
        tags = tags.split(spaceRe);
      if (tags.length !== 2)
        throw new Error('Invalid tags: ' + tags.join(', '));
      var tagRes = escapeTags(tags);
      var scanner = new Scanner(template);
      var sections = [];
      var tokens = [];
      var spaces = [];
      var hasTag = false;
      var nonSpace = false;
      function stripSpace() {
        if (hasTag && !nonSpace) {
          while (spaces.length) {
            delete tokens[spaces.pop()];
          }
        } else {
          spaces = [];
        }
        hasTag = false;
        nonSpace = false;
      }
      var start,
          type,
          value,
          chr,
          token,
          openSection;
      while (!scanner.eos()) {
        start = scanner.pos;
        value = scanner.scanUntil(tagRes[0]);
        if (value) {
          for (var i = 0,
              len = value.length; i < len; ++i) {
            chr = value.charAt(i);
            if (isWhitespace(chr)) {
              spaces.push(tokens.length);
            } else {
              nonSpace = true;
            }
            tokens.push(['text', chr, start, start + 1]);
            start += 1;
            if (chr == '\n')
              stripSpace();
          }
        }
        if (!scanner.scan(tagRes[0]))
          break;
        hasTag = true;
        type = scanner.scan(tagRe) || 'name';
        scanner.scan(whiteRe);
        if (type === '=') {
          value = scanner.scanUntil(eqRe);
          scanner.scan(eqRe);
          scanner.scanUntil(tagRes[1]);
        } else if (type === '{') {
          value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
          scanner.scan(curlyRe);
          scanner.scanUntil(tagRes[1]);
          type = '&';
        } else {
          value = scanner.scanUntil(tagRes[1]);
        }
        if (!scanner.scan(tagRes[1]))
          throw new Error('Unclosed tag at ' + scanner.pos);
        token = [type, value, start, scanner.pos];
        tokens.push(token);
        if (type === '#' || type === '^') {
          sections.push(token);
        } else if (type === '/') {
          openSection = sections.pop();
          if (!openSection) {
            throw new Error('Unopened section "' + value + '" at ' + start);
          }
          if (openSection[1] !== value) {
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
          }
        } else if (type === 'name' || type === '{' || type === '&') {
          nonSpace = true;
        } else if (type === '=') {
          tags = value.split(spaceRe);
          if (tags.length !== 2) {
            throw new Error('Invalid tags at ' + start + ': ' + tags.join(', '));
          }
          tagRes = escapeTags(tags);
        }
      }
      openSection = sections.pop();
      if (openSection) {
        throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
      }
      return nestTokens(squashTokens(tokens));
    }
    mustache.name = "mustache.js";
    mustache.version = "0.7.3";
    mustache.tags = ["{{", "}}"];
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;
    mustache.parse = parseTemplate;
    mustache.escape = escapeHtml;
    var defaultWriter = new Writer();
    mustache.clearCache = function() {
      return defaultWriter.clearCache();
    };
    mustache.compile = function(template, tags) {
      return defaultWriter.compile(template, tags);
    };
    mustache.compilePartial = function(name, template, tags) {
      return defaultWriter.compilePartial(name, template, tags);
    };
    mustache.compileTokens = function(tokens, template) {
      return defaultWriter.compileTokens(tokens, template);
    };
    mustache.render = function(template, view, partials) {
      return defaultWriter.render(template, view, partials);
    };
    mustache.to_html = function(template, view, partials, send) {
      var result = mustache.render(template, view, partials);
      if (isFunction(send)) {
        send(result);
      } else {
        return result;
      }
    };
  }));
})(require("buffer").Buffer);
