System.config({
  "baseURL": "./src",
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "jquery": "github:components/jquery@2.1.3",
    "jsx": "github:floatdrop/plugin-jsx@1.1.0",
    "mapbox.js": "npm:mapbox.js@2.1.5",
    "pubsub-js": "npm:pubsub-js@1.5.2",
    "react": "npm:react@0.13.0",
    "turf": "npm:turf@2.0.0",
    "underscore": "npm:underscore@1.8.2",
    "github:floatdrop/plugin-jsx@1.1.0": {
      "react-tools": "npm:react-tools@0.13.0"
    },
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.1.1"
    },
    "github:jspm/nodelibs-constants@0.1.0": {
      "constants-browserify": "npm:constants-browserify@0.0.1"
    },
    "github:jspm/nodelibs-crypto@0.1.0": {
      "crypto-browserify": "npm:crypto-browserify@3.9.13"
    },
    "github:jspm/nodelibs-events@0.1.0": {
      "events-browserify": "npm:events-browserify@0.0.1"
    },
    "github:jspm/nodelibs-http@1.7.1": {
      "Base64": "npm:Base64@0.2.1",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "url": "github:jspm/nodelibs-url@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-string_decoder@0.1.0": {
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "github:jspm/nodelibs-url@0.1.0": {
      "url": "npm:url@0.10.3"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:jspm/nodelibs-vm@0.1.0": {
      "vm-browserify": "npm:vm-browserify@0.0.4"
    },
    "github:jspm/nodelibs-zlib@0.1.0": {
      "browserify-zlib": "npm:browserify-zlib@0.1.4"
    },
    "npm:affine-hull@1.0.0": {
      "robust-orientation": "npm:robust-orientation@1.1.3"
    },
    "npm:amdefine@0.1.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "module": "github:jspm/nodelibs-module@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:asn1.js-rfc3280@1.0.0": {
      "asn1.js": "npm:asn1.js@1.0.3"
    },
    "npm:asn1.js@1.0.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "bn.js": "npm:bn.js@1.3.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:ast-types@0.6.16": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:benchmark@1.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:browserify-aes@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:browserify-rsa@1.1.1": {
      "bn.js": "npm:bn.js@1.3.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0"
    },
    "npm:browserify-rsa@2.0.0": {
      "bn.js": "npm:bn.js@1.3.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "randombytes": "npm:randombytes@2.0.1"
    },
    "npm:browserify-sign@2.8.0": {
      "bn.js": "npm:bn.js@1.3.0",
      "browserify-rsa": "npm:browserify-rsa@1.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@1.0.1",
      "inherits": "npm:inherits@2.0.1",
      "parse-asn1": "npm:parse-asn1@2.0.0",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:browserify-zlib@0.1.4": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "pako": "npm:pako@0.2.5",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "readable-stream": "npm:readable-stream@1.1.13",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:buffer@3.1.1": {
      "base64-js": "npm:base64-js@0.0.8",
      "ieee754": "npm:ieee754@1.1.4",
      "is-array": "npm:is-array@1.0.1"
    },
    "npm:clone@0.2.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:commander@2.5.1": {
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:commoner@0.10.1": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "commander": "npm:commander@2.5.1",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "glob": "npm:glob@4.2.2",
      "graceful-fs": "npm:graceful-fs@3.0.6",
      "iconv-lite": "npm:iconv-lite@0.4.7",
      "install": "npm:install@0.1.8",
      "mkdirp": "npm:mkdirp@0.5.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "private": "npm:private@0.1.6",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "q": "npm:q@1.1.2",
      "recast": "npm:recast@0.9.18",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:constants-browserify@0.0.1": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:convex-hull@1.0.3": {
      "affine-hull": "npm:affine-hull@1.0.0",
      "incremental-convex-hull": "npm:incremental-convex-hull@1.0.1",
      "monotone-convex-hull-2d": "npm:monotone-convex-hull-2d@1.0.1"
    },
    "npm:core-util-is@1.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:corslite@0.0.6": {
      "http": "github:jspm/nodelibs-http@1.7.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:create-ecdh@2.0.0": {
      "bn.js": "npm:bn.js@1.3.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "elliptic": "npm:elliptic@1.0.1"
    },
    "npm:create-hash@1.1.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "ripemd160": "npm:ripemd160@1.0.0",
      "sha.js": "npm:sha.js@2.3.6",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:create-hmac@1.1.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:crypto-browserify@3.9.13": {
      "browserify-aes": "npm:browserify-aes@1.0.0",
      "browserify-sign": "npm:browserify-sign@2.8.0",
      "create-ecdh": "npm:create-ecdh@2.0.0",
      "create-hash": "npm:create-hash@1.1.0",
      "create-hmac": "npm:create-hmac@1.1.3",
      "diffie-hellman": "npm:diffie-hellman@3.0.1",
      "inherits": "npm:inherits@2.0.1",
      "pbkdf2-compat": "npm:pbkdf2-compat@3.0.2",
      "public-encrypt": "npm:public-encrypt@2.0.0",
      "randombytes": "npm:randombytes@2.0.1"
    },
    "npm:diffie-hellman@3.0.1": {
      "bn.js": "npm:bn.js@1.3.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "miller-rabin": "npm:miller-rabin@1.1.5",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "randombytes": "npm:randombytes@2.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:elliptic@1.0.1": {
      "bn.js": "npm:bn.js@1.3.0",
      "brorand": "npm:brorand@1.0.5",
      "hash.js": "npm:hash.js@1.0.2",
      "inherits": "npm:inherits@2.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:envify@3.3.0": {
      "jstransform": "npm:jstransform@10.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "through": "npm:through@2.3.6"
    },
    "npm:esprima-fb@10001.1.0-dev-harmony-fb": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:esprima-fb@13001.1001.0-dev-harmony-fb": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:events-browserify@0.0.1": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:geojson-area@0.2.0": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0",
      "wgs84": "npm:wgs84@0.0.0"
    },
    "npm:glob@3.2.11": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "minimatch": "npm:minimatch@0.3.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:glob@4.2.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "inflight": "npm:inflight@1.0.4",
      "inherits": "npm:inherits@2.0.1",
      "minimatch": "npm:minimatch@1.0.0",
      "once": "npm:once@1.3.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:graceful-fs@3.0.6": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "module": "github:jspm/nodelibs-module@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "vm": "github:jspm/nodelibs-vm@0.1.0"
    },
    "npm:hash.js@1.0.2": {
      "inherits": "npm:inherits@2.0.1"
    },
    "npm:iconv-lite@0.4.7": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "string_decoder": "github:jspm/nodelibs-string_decoder@0.1.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:incremental-convex-hull@1.0.1": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "robust-orientation": "npm:robust-orientation@1.1.3",
      "simplicial-complex": "npm:simplicial-complex@1.0.0"
    },
    "npm:inflight@1.0.4": {
      "once": "npm:once@1.3.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "wrappy": "npm:wrappy@1.0.1"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:install@0.1.8": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:jstransform@10.1.0": {
      "base62": "npm:base62@0.1.1",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "esprima-fb": "npm:esprima-fb@13001.1001.0-dev-harmony-fb",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "source-map": "npm:source-map@0.1.31"
    },
    "npm:jsts@0.15.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "javascript.util": "npm:javascript.util@0.12.5",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:leaflet@0.7.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "zlib": "github:jspm/nodelibs-zlib@0.1.0"
    },
    "npm:mapbox.js@2.1.5": {
      "corslite": "npm:corslite@0.0.6",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "leaflet": "npm:leaflet@0.7.3",
      "mustache": "npm:mustache@0.7.3",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "sanitize-caja": "npm:sanitize-caja@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:miller-rabin@1.1.5": {
      "bn.js": "npm:bn.js@1.3.0",
      "brorand": "npm:brorand@1.0.5"
    },
    "npm:minimatch@0.3.0": {
      "lru-cache": "npm:lru-cache@2.5.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "sigmund": "npm:sigmund@1.0.0"
    },
    "npm:minimatch@1.0.0": {
      "lru-cache": "npm:lru-cache@2.5.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "sigmund": "npm:sigmund@1.0.0"
    },
    "npm:mkdirp@0.5.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "minimist": "npm:minimist@0.0.8",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:monotone-convex-hull-2d@1.0.1": {
      "robust-orientation": "npm:robust-orientation@1.1.3"
    },
    "npm:mustache@0.7.3": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:once@1.3.1": {
      "wrappy": "npm:wrappy@1.0.1"
    },
    "npm:pako@0.2.5": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "zlib": "github:jspm/nodelibs-zlib@0.1.0"
    },
    "npm:parse-asn1@2.0.0": {
      "asn1.js": "npm:asn1.js@1.0.3",
      "asn1.js-rfc3280": "npm:asn1.js-rfc3280@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "pemstrip": "npm:pemstrip@0.0.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:parse-asn1@3.0.0": {
      "asn1.js": "npm:asn1.js@1.0.3",
      "browserify-aes": "npm:browserify-aes@1.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.0",
      "pbkdf2-compat": "npm:pbkdf2-compat@3.0.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:pbkdf2-compat@3.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "create-hmac": "npm:create-hmac@1.1.3",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:public-encrypt@2.0.0": {
      "bn.js": "npm:bn.js@1.3.0",
      "browserify-rsa": "npm:browserify-rsa@2.0.0",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "create-hash": "npm:create-hash@1.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "parse-asn1": "npm:parse-asn1@3.0.0",
      "randombytes": "npm:randombytes@2.0.1"
    },
    "npm:pubsub-js@1.5.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:punycode@1.3.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:q@1.1.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:randombytes@2.0.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "crypto": "github:jspm/nodelibs-crypto@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:react-tools@0.13.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "commoner": "npm:commoner@0.10.1",
      "jstransform": "npm:jstransform@10.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:react@0.13.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "envify": "npm:envify@3.3.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:readable-stream@1.1.13": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.1",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "stream": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:recast@0.9.18": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "ast-types": "npm:ast-types@0.6.16",
      "esprima-fb": "npm:esprima-fb@10001.1.0-dev-harmony-fb",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "private": "npm:private@0.1.6",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "source-map": "npm:source-map@0.1.43"
    },
    "npm:resumer@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "through": "npm:through@2.3.6"
    },
    "npm:ripemd160@1.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:robust-orientation@1.1.3": {
      "robust-scale": "npm:robust-scale@1.0.2",
      "robust-subtract": "npm:robust-subtract@1.0.0",
      "robust-sum": "npm:robust-sum@1.0.0",
      "two-product": "npm:two-product@1.0.2"
    },
    "npm:robust-scale@1.0.2": {
      "two-product": "npm:two-product@1.0.2",
      "two-sum": "npm:two-sum@1.0.0"
    },
    "npm:sanitize-caja@0.1.2": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:sha.js@2.3.6": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:sigmund@1.0.0": {
      "http": "github:jspm/nodelibs-http@1.7.1",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:simple-statistics@0.9.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:simplicial-complex@1.0.0": {
      "bit-twiddle": "npm:bit-twiddle@1.0.2",
      "union-find": "npm:union-find@1.0.2"
    },
    "npm:source-map@0.1.31": {
      "amdefine": "npm:amdefine@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:source-map@0.1.43": {
      "amdefine": "npm:amdefine@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.13"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:tape@3.5.0": {
      "deep-equal": "npm:deep-equal@0.2.2",
      "defined": "npm:defined@0.0.0",
      "events": "github:jspm/nodelibs-events@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "glob": "npm:glob@3.2.11",
      "inherits": "npm:inherits@2.0.1",
      "object-inspect": "npm:object-inspect@0.4.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "resumer": "npm:resumer@0.0.0",
      "through": "npm:through@2.3.6"
    },
    "npm:through@2.3.6": {
      "process": "github:jspm/nodelibs-process@0.1.1",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:turf-aggregate@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-average": "npm:turf-average@1.1.1",
      "turf-count": "npm:turf-count@1.0.2",
      "turf-deviation": "npm:turf-deviation@1.0.1",
      "turf-max": "npm:turf-max@1.0.1",
      "turf-median": "npm:turf-median@1.0.2",
      "turf-min": "npm:turf-min@1.0.1",
      "turf-sum": "npm:turf-sum@1.0.1",
      "turf-variance": "npm:turf-variance@1.0.1"
    },
    "npm:turf-along@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-bearing": "npm:turf-bearing@1.0.1",
      "turf-destination": "npm:turf-destination@1.2.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-area@1.1.1": {
      "geojson-area": "npm:geojson-area@0.2.0"
    },
    "npm:turf-average@1.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-bbox-polygon@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-bearing@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-bezier@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-linestring": "npm:turf-linestring@1.0.2"
    },
    "npm:turf-buffer@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "jsts": "npm:jsts@0.15.0",
      "turf-combine": "npm:turf-combine@1.0.2",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-center@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-extent": "npm:turf-extent@1.0.4",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-centroid@1.1.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-meta": "npm:turf-meta@1.0.2",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-combine@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-concave@1.1.3": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-merge": "npm:turf-merge@1.0.2",
      "turf-point": "npm:turf-point@2.0.1",
      "turf-tin": "npm:turf-tin@1.0.6"
    },
    "npm:turf-convex@1.0.1": {
      "convex-hull": "npm:convex-hull@1.0.3",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-meta": "npm:turf-meta@1.0.2",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-count@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-destination@1.2.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-deviation@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "simple-statistics": "npm:simple-statistics@0.9.0",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-distance@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-invariant": "npm:turf-invariant@1.0.3"
    },
    "npm:turf-envelope@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-bbox-polygon": "npm:turf-bbox-polygon@1.0.1",
      "turf-extent": "npm:turf-extent@1.0.4"
    },
    "npm:turf-erase@1.3.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "jsts": "npm:jsts@0.15.0",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1"
    },
    "npm:turf-explode@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-meta": "npm:turf-meta@1.0.2",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-extent@1.0.4": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-meta": "npm:turf-meta@1.0.2"
    },
    "npm:turf-featurecollection@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-filter@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1"
    },
    "npm:turf-flip@1.0.3": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-grid@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-hex-grid@2.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-point": "npm:turf-point@2.0.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-inside@1.1.4": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "minimist": "npm:minimist@1.1.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:turf-intersect@1.4.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "jsts": "npm:jsts@0.15.0",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1"
    },
    "npm:turf-isolines@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "turf-extent": "npm:turf-extent@1.0.4",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-grid": "npm:turf-grid@1.0.1",
      "turf-inside": "npm:turf-inside@1.1.4",
      "turf-linestring": "npm:turf-linestring@1.0.2",
      "turf-planepoint": "npm:turf-planepoint@1.0.1",
      "turf-square": "npm:turf-square@1.0.1",
      "turf-tin": "npm:turf-tin@1.0.6"
    },
    "npm:turf-jenks@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "simple-statistics": "npm:simple-statistics@0.9.0"
    },
    "npm:turf-kinks@1.3.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-point": "npm:turf-point@2.0.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-line-distance@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-line-slice@1.3.4": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-bearing": "npm:turf-bearing@1.0.1",
      "turf-destination": "npm:turf-destination@1.2.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-linestring": "npm:turf-linestring@1.0.2",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-linestring@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-max@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-median@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-merge@1.0.2": {
      "clone": "npm:clone@0.2.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-union": "npm:turf-union@1.0.1"
    },
    "npm:turf-meta@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-midpoint@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-min@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-nearest@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1"
    },
    "npm:turf-planepoint@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-point-grid@2.0.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-point-on-line@1.0.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-bearing": "npm:turf-bearing@1.0.1",
      "turf-destination": "npm:turf-destination@1.2.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-linestring": "npm:turf-linestring@1.0.2",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-point-on-surface@1.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-center": "npm:turf-center@1.0.2",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-explode": "npm:turf-explode@1.0.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-point@2.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "minimist": "npm:minimist@1.1.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:turf-polygon@1.0.3": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-quantile@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "simple-statistics": "npm:simple-statistics@0.9.0"
    },
    "npm:turf-random@1.0.2": {
      "geojson-random": "npm:geojson-random@0.2.2"
    },
    "npm:turf-reclass@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1"
    },
    "npm:turf-remove@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1"
    },
    "npm:turf-sample@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1"
    },
    "npm:turf-simplify@1.0.3": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "simplify-js": "npm:simplify-js@1.2.1"
    },
    "npm:turf-size@1.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1"
    },
    "npm:turf-square-grid@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-point": "npm:turf-point@2.0.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-square@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-midpoint": "npm:turf-midpoint@1.0.1",
      "turf-point": "npm:turf-point@2.0.1"
    },
    "npm:turf-sum@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-tag@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-tin@1.0.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-triangle-grid@1.0.1": {
      "benchmark": "npm:benchmark@1.0.0",
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "tape": "npm:tape@3.5.0",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-point": "npm:turf-point@2.0.1",
      "turf-polygon": "npm:turf-polygon@1.0.3"
    },
    "npm:turf-union@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "jsts": "npm:jsts@0.15.0"
    },
    "npm:turf-variance@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "simple-statistics": "npm:simple-statistics@0.9.0",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf-within@1.0.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.1",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-inside": "npm:turf-inside@1.1.4"
    },
    "npm:turf@2.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "turf-aggregate": "npm:turf-aggregate@1.0.2",
      "turf-along": "npm:turf-along@1.0.2",
      "turf-area": "npm:turf-area@1.1.1",
      "turf-average": "npm:turf-average@1.1.1",
      "turf-bbox-polygon": "npm:turf-bbox-polygon@1.0.1",
      "turf-bearing": "npm:turf-bearing@1.0.1",
      "turf-bezier": "npm:turf-bezier@1.0.2",
      "turf-buffer": "npm:turf-buffer@1.0.1",
      "turf-center": "npm:turf-center@1.0.2",
      "turf-centroid": "npm:turf-centroid@1.1.2",
      "turf-combine": "npm:turf-combine@1.0.2",
      "turf-concave": "npm:turf-concave@1.1.3",
      "turf-convex": "npm:turf-convex@1.0.1",
      "turf-count": "npm:turf-count@1.0.2",
      "turf-destination": "npm:turf-destination@1.2.1",
      "turf-deviation": "npm:turf-deviation@1.0.1",
      "turf-distance": "npm:turf-distance@1.0.1",
      "turf-envelope": "npm:turf-envelope@1.0.2",
      "turf-erase": "npm:turf-erase@1.3.1",
      "turf-explode": "npm:turf-explode@1.0.1",
      "turf-extent": "npm:turf-extent@1.0.4",
      "turf-featurecollection": "npm:turf-featurecollection@1.0.1",
      "turf-filter": "npm:turf-filter@1.0.1",
      "turf-flip": "npm:turf-flip@1.0.3",
      "turf-hex-grid": "npm:turf-hex-grid@2.0.1",
      "turf-inside": "npm:turf-inside@1.1.4",
      "turf-intersect": "npm:turf-intersect@1.4.1",
      "turf-isolines": "npm:turf-isolines@1.0.2",
      "turf-jenks": "npm:turf-jenks@1.0.1",
      "turf-kinks": "npm:turf-kinks@1.3.1",
      "turf-line-distance": "npm:turf-line-distance@1.0.2",
      "turf-line-slice": "npm:turf-line-slice@1.3.4",
      "turf-linestring": "npm:turf-linestring@1.0.2",
      "turf-max": "npm:turf-max@1.0.1",
      "turf-median": "npm:turf-median@1.0.2",
      "turf-merge": "npm:turf-merge@1.0.2",
      "turf-midpoint": "npm:turf-midpoint@1.0.1",
      "turf-min": "npm:turf-min@1.0.1",
      "turf-nearest": "npm:turf-nearest@1.0.2",
      "turf-planepoint": "npm:turf-planepoint@1.0.1",
      "turf-point": "npm:turf-point@2.0.1",
      "turf-point-grid": "npm:turf-point-grid@2.0.0",
      "turf-point-on-line": "npm:turf-point-on-line@1.0.2",
      "turf-point-on-surface": "npm:turf-point-on-surface@1.1.1",
      "turf-polygon": "npm:turf-polygon@1.0.3",
      "turf-quantile": "npm:turf-quantile@1.0.1",
      "turf-random": "npm:turf-random@1.0.2",
      "turf-reclass": "npm:turf-reclass@1.0.1",
      "turf-remove": "npm:turf-remove@1.0.1",
      "turf-sample": "npm:turf-sample@1.0.1",
      "turf-simplify": "npm:turf-simplify@1.0.3",
      "turf-size": "npm:turf-size@1.1.1",
      "turf-square": "npm:turf-square@1.0.1",
      "turf-square-grid": "npm:turf-square-grid@1.0.1",
      "turf-sum": "npm:turf-sum@1.0.1",
      "turf-tag": "npm:turf-tag@1.0.1",
      "turf-tin": "npm:turf-tin@1.0.6",
      "turf-triangle-grid": "npm:turf-triangle-grid@1.0.1",
      "turf-union": "npm:turf-union@1.0.1",
      "turf-variance": "npm:turf-variance@1.0.1",
      "turf-within": "npm:turf-within@1.0.1"
    },
    "npm:url@0.10.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "punycode": "npm:punycode@1.3.2",
      "querystring": "npm:querystring@0.2.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:vm-browserify@0.0.4": {
      "indexof": "npm:indexof@0.0.1"
    }
  }
});

