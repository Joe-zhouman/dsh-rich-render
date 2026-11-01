window.__ModuleLoader__.load({
	id: "dsh-rich-render",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __defProp = Object.defineProperty;
		var __exportAll = (all, no_symbols) => {
			let target = {};
			for (var name in all) __defProp(target, name, {
				get: all[name],
				enumerable: true
			});
			if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
			return target;
		};
		//#endregion
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/markdown-fallback.ts
		/** Absolute Windows-style drive path, mirroring util-workspace-path. */
		function isWindowsStylePath(path) {
			return /^[a-zA-Z]:[\\/]/u.test(path);
		}
		function isAbsoluteWorkspacePath(path) {
			return path.startsWith("/") || isWindowsStylePath(path);
		}
		/**
		* Address a decoded absolute file path through the authenticated file route
		* (local restatement of @deepseek-ai/dsh-util-workspace-path fileMediaUrl).
		* @param base - HTTP(S) application base or `dsh-app://app/`.
		* @param path - Native file path; URL escapes already decoded.
		* @returns File URL, or undefined for unsupported transports and non-absolute paths.
		*/
		function fileMediaUrl(base, path) {
			if (!/^https?:/u.test(base) && !base.startsWith("dsh-app://app/") || !isAbsoluteWorkspacePath(path) || /^[/\\]{2}/u.test(path) || /[\u0000-\u001f\u007f]/u.test(path)) return void 0;
			return new URL(`api/file?path=${encodeURIComponent(path)}`, base).href;
		}
		/**
		* Standalone fallback for image destinations (query/fragment suffixes are
		* ignored), mirroring ui-chat AssistantMarkdown.localPathMediaUrl.
		* @param base - canonical `document.baseURI` at render time.
		* @param value - authored Markdown destination; URL escapes are decoded once.
		* @returns an absolute Web or Desktop file-API URL, or undefined.
		*/
		function localPathMediaUrl(base, value) {
			let path;
			try {
				path = decodeURIComponent(value.split(/[?#]/u)[0] ?? "");
			} catch {
				return;
			}
			return fileMediaUrl(base, path);
		}
		/**
		* Build the complete Markdown chrome copy for one locale revision.
		* @param t - this plugin's locale seat.
		* @returns Labels for code fences and footnotes.
		*/
		function markdownLabels(t) {
			return {
				code: {
					copyLabel: t("copy"),
					copiedLabel: t("copied"),
					toolbarLabels: {
						codeLabel: t("codeBlockTitle"),
						wrapLabel: t("codeBlockWrap"),
						unwrapLabel: t("codeBlockUnwrap")
					}
				},
				footnotes: t("footnotes")
			};
		}
		/**
		* The path-image vocabulary this renderer always installs. One module-level
		* constant keeps the identity stable across renders, which MarkdownText's
		* memoization requires (a fresh object discards its streaming cache).
		*/
		const pathImages = { resolve: (value) => localPathMediaUrl(document.baseURI, value) };
		//#endregion
		//#region src/components/ReasoningRow.tsx
		/**
		* Assistant reasoning disclosure, replica of ui-chat's ReasoningRow over the
		* public primitives (DisclosureRow, MarkdownText, the think icon). One
		* deliberate deviation from upstream: the live presentation policy
		* (settledReasoningPreview) is not reachable from a third-party registration,
		* so a collapsed row always keeps its summary preview instead of gating it
		* on the work-details mode.
		*/
		const THINK_ICON = /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconThinkOutlineRegular, { size: 14 });
		function firstLine(text) {
			const newline = text.indexOf("\n");
			return newline === -1 ? text : text.slice(0, newline);
		}
		function latestCompletedParagraphFirstLine(text) {
			let summary = "";
			let paragraphStart = 0;
			const separator = /\r?\n(?:[\t ]*\r?\n)+/g;
			while (true) {
				const nextParagraph = separator.exec(text);
				const paragraphEnd = nextParagraph === null ? text.length : nextParagraph.index + nextParagraph[0].indexOf("\n");
				const newline = text.indexOf("\n", paragraphStart);
				if (newline !== -1 && newline <= paragraphEnd) {
					const candidate = text.slice(paragraphStart, newline).trim();
					if (candidate !== "") summary = candidate;
				}
				if (nextParagraph === null) return summary;
				paragraphStart = nextParagraph.index + nextParagraph[0].length;
			}
		}
		/** Render one assistant reasoning block collapsed until the reader opens it. */
		const ReasoningRow = (0, react.memo)(function ReasoningRow({ text, running, useDisclosure, t }) {
			const { expanded, toggle } = useDisclosure();
			const labels = (0, react.useMemo)(() => markdownLabels(t), [t]);
			const summaryText = running ? latestCompletedParagraphFirstLine(text) : firstLine(text);
			const summary = (0, react.useMemo)(() => summaryText.replaceAll("**", ""), [summaryText]);
			const preview = !expanded && summary !== "";
			const collapsedContent = (0, react.useMemo)(() => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshr-think-separator",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dshr-think-summary",
				"data-streaming": running || void 0,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshr-think-summary-text",
					children: summary
				})
			})] }), [running, summary]);
			const content = (0, react.useMemo)(() => expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-think-body",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text,
					streaming: running,
					labels,
					pathImages,
					variant: "compact"
				})
			}) : void 0, [
				expanded,
				labels,
				running,
				text
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-think-root",
				"data-variant": "think",
				"data-state": running ? "running" : "ok",
				"data-expanded": expanded || void 0,
				"data-preview": preview || void 0,
				children: [running && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshr-visually-hidden",
					children: t("running")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					rowClassName: "dshr-think-row",
					leadingClassName: "dshr-think-leading",
					titleClassName: "dshr-think-title",
					chevronClassName: "dshr-think-chevron",
					icon: THINK_ICON,
					title: t("think"),
					open: expanded,
					expandable: true,
					expandOnRowClick: true,
					onToggle: toggle,
					collapsedContent,
					children: content
				})]
			});
		});
		//#endregion
		//#region node_modules/mdast-util-to-string/lib/index.js
		/**
		* @typedef {import('mdast').Nodes} Nodes
		*
		* @typedef Options
		*   Configuration (optional).
		* @property {boolean | null | undefined} [includeImageAlt=true]
		*   Whether to use `alt` for `image`s (default: `true`).
		* @property {boolean | null | undefined} [includeHtml=true]
		*   Whether to use `value` of HTML (default: `true`).
		*/
		/** @type {Options} */
		const emptyOptions = {};
		/**
		* Get the text content of a node or list of nodes.
		*
		* Prefers the node’s plain-text fields, otherwise serializes its children,
		* and if the given value is an array, serialize the nodes in it.
		*
		* @param {unknown} [value]
		*   Thing to serialize, typically `Node`.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {string}
		*   Serialized `value`.
		*/
		function toString(value, options) {
			const settings = options || emptyOptions;
			return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
		}
		/**
		* One node or several nodes.
		*
		* @param {unknown} value
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized node.
		*/
		function one(value, includeImageAlt, includeHtml) {
			if (node(value)) {
				if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
				if (includeImageAlt && "alt" in value && value.alt) return value.alt;
				if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
			}
			if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
			return "";
		}
		/**
		* Serialize a list of nodes.
		*
		* @param {Array<unknown>} values
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized nodes.
		*/
		function all(values, includeImageAlt, includeHtml) {
			/** @type {Array<string>} */
			const result = [];
			let index = -1;
			while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
			return result.join("");
		}
		/**
		* Check if `value` looks like a node.
		*
		* @param {unknown} value
		*   Thing.
		* @returns {value is Nodes}
		*   Whether `value` is a node.
		*/
		function node(value) {
			return Boolean(value && typeof value === "object");
		}
		//#endregion
		//#region node_modules/micromark-util-chunked/index.js
		/**
		* Like `Array#splice`, but smarter for giant arrays.
		*
		* `Array#splice` takes all items to be inserted as individual argument which
		* causes a stack overflow in V8 when trying to insert 100k items for instance.
		*
		* Otherwise, this does not return the removed items, and takes `items` as an
		* array instead of rest parameters.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {number} start
		*   Index to remove/insert at (can be negative).
		* @param {number} remove
		*   Number of items to remove.
		* @param {Array<T>} items
		*   Items to inject into `list`.
		* @returns {undefined}
		*   Nothing.
		*/
		function splice(list, start, remove, items) {
			const end = list.length;
			let chunkStart = 0;
			/** @type {Array<unknown>} */
			let parameters;
			if (start < 0) start = -start > end ? 0 : end + start;
			else start = start > end ? end : start;
			remove = remove > 0 ? remove : 0;
			if (items.length < 1e4) {
				parameters = Array.from(items);
				parameters.unshift(start, remove);
				list.splice(...parameters);
			} else {
				if (remove) list.splice(start, remove);
				while (chunkStart < items.length) {
					parameters = items.slice(chunkStart, chunkStart + 1e4);
					parameters.unshift(start, 0);
					list.splice(...parameters);
					chunkStart += 1e4;
					start += 1e4;
				}
			}
		}
		/**
		* Append `items` (an array) at the end of `list` (another array).
		* When `list` was empty, returns `items` instead.
		*
		* This prevents a potentially expensive operation when `list` is empty,
		* and adds items in batches to prevent V8 from hanging.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {Array<T>} items
		*   Items to add to `list`.
		* @returns {Array<T>}
		*   Either `list` or `items`.
		*/
		function push(list, items) {
			if (list.length > 0) {
				splice(list, list.length, 0, items);
				return list;
			}
			return items;
		}
		//#endregion
		//#region node_modules/micromark-util-combine-extensions/index.js
		/**
		* @typedef {import('micromark-util-types').Extension} Extension
		* @typedef {import('micromark-util-types').Handles} Handles
		* @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
		* @typedef {import('micromark-util-types').NormalizedExtension} NormalizedExtension
		*/
		const hasOwnProperty = {}.hasOwnProperty;
		/**
		* Combine multiple syntax extensions into one.
		*
		* @param {Array<Extension>} extensions
		*   List of syntax extensions.
		* @returns {NormalizedExtension}
		*   A single combined extension.
		*/
		function combineExtensions(extensions) {
			/** @type {NormalizedExtension} */
			const all = {};
			let index = -1;
			while (++index < extensions.length) syntaxExtension(all, extensions[index]);
			return all;
		}
		/**
		* Merge `extension` into `all`.
		*
		* @param {NormalizedExtension} all
		*   Extension to merge into.
		* @param {Extension} extension
		*   Extension to merge.
		* @returns {undefined}
		*/
		function syntaxExtension(all, extension) {
			/** @type {keyof Extension} */
			let hook;
			for (hook in extension) {
				/** @type {Record<string, unknown>} */
				const left = (hasOwnProperty.call(all, hook) ? all[hook] : void 0) || (all[hook] = {});
				/** @type {Record<string, unknown> | undefined} */
				const right = extension[hook];
				/** @type {string} */
				let code;
				if (right) for (code in right) {
					if (!hasOwnProperty.call(left, code)) left[code] = [];
					const value = right[code];
					constructs(left[code], Array.isArray(value) ? value : value ? [value] : []);
				}
			}
		}
		/**
		* Merge `list` into `existing` (both lists of constructs).
		* Mutates `existing`.
		*
		* @param {Array<unknown>} existing
		* @param {Array<unknown>} list
		* @returns {undefined}
		*/
		function constructs(existing, list) {
			let index = -1;
			/** @type {Array<unknown>} */
			const before = [];
			while (++index < list.length) (list[index].add === "after" ? existing : before).push(list[index]);
			splice(existing, 0, 0, before);
		}
		//#endregion
		//#region node_modules/micromark-util-character/index.js
		/**
		* @typedef {import('micromark-util-types').Code} Code
		*/
		/**
		* Check whether the character code represents an ASCII alpha (`a` through `z`,
		* case insensitive).
		*
		* An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
		*
		* An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
		* to U+005A (`Z`).
		*
		* An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
		* to U+007A (`z`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlpha = regexCheck(/[A-Za-z]/);
		/**
		* Check whether the character code represents an ASCII alphanumeric (`a`
		* through `z`, case insensitive, or `0` through `9`).
		*
		* An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
		* (see `asciiAlpha`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
		/**
		* Check whether the character code represents an ASCII atext.
		*
		* atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
		* the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
		* U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
		* SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
		* CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
		* (`{`) to U+007E TILDE (`~`).
		*
		* See:
		* **\[RFC5322]**:
		* [Internet Message Format](https://tools.ietf.org/html/rfc5322).
		* P. Resnick.
		* IETF.
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
		/**
		* Check whether a character code is an ASCII control character.
		*
		* An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
		* to U+001F (US), or U+007F (DEL).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function asciiControl(code) {
			return code !== null && (code < 32 || code === 127);
		}
		/**
		* Check whether the character code represents an ASCII digit (`0` through `9`).
		*
		* An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
		* U+0039 (`9`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiDigit = regexCheck(/\d/);
		/**
		* Check whether the character code represents an ASCII hex digit (`a` through
		* `f`, case insensitive, or `0` through `9`).
		*
		* An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
		* digit, or an ASCII lower hex digit.
		*
		* An **ASCII upper hex digit** is a character in the inclusive range U+0041
		* (`A`) to U+0046 (`F`).
		*
		* An **ASCII lower hex digit** is a character in the inclusive range U+0061
		* (`a`) to U+0066 (`f`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
		/**
		* Check whether the character code represents ASCII punctuation.
		*
		* An **ASCII punctuation** is a character in the inclusive ranges U+0021
		* EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
		* SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
		* (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
		/**
		* Check whether a character code is a markdown line ending.
		*
		* A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
		* LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
		*
		* In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
		* RETURN (CR) are replaced by these virtual characters depending on whether
		* they occurred together.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEnding(code) {
			return code !== null && code < -2;
		}
		/**
		* Check whether a character code is a markdown line ending (see
		* `markdownLineEnding`) or markdown space (see `markdownSpace`).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEndingOrSpace(code) {
			return code !== null && (code < 0 || code === 32);
		}
		/**
		* Check whether a character code is a markdown space.
		*
		* A **markdown space** is the concrete character U+0020 SPACE (SP) and the
		* virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
		*
		* In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
		* replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
		* SPACE (VS) characters, depending on the column at which the tab occurred.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownSpace(code) {
			return code === -2 || code === -1 || code === 32;
		}
		/**
		* Check whether the character code represents Unicode punctuation.
		*
		* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
		* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
		* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
		* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
		* punctuation (see `asciiPunctuation`).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const unicodePunctuation = regexCheck(/\p{P}/u);
		/**
		* Check whether the character code represents Unicode whitespace.
		*
		* Note that this does handle micromark specific markdown whitespace characters.
		* See `markdownLineEndingOrSpace` to check that.
		*
		* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
		* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
		* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const unicodeWhitespace = regexCheck(/\s/);
		/**
		* Create a code check from a regex.
		*
		* @param {RegExp} regex
		* @returns {(code: Code) => boolean}
		*/
		function regexCheck(regex) {
			return check;
			/**
			* Check whether a code matches the bound regex.
			*
			* @param {Code} code
			*   Character code.
			* @returns {boolean}
			*   Whether the character code matches the bound regex.
			*/
			function check(code) {
				return code !== null && code > -1 && regex.test(String.fromCharCode(code));
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-space/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   spaces in markdown are often optional, in which case this factory can be
		*     used and `ok` will be switched to whether spaces were found or not
		* *   one line ending or space can be detected with `markdownSpace(code)` right
		*     before using `factorySpace`
		*
		* ###### Examples
		*
		* Where `␉` represents a tab (plus how much it expands) and `␠` represents a
		* single space.
		*
		* ```markdown
		* ␉
		* ␠␠␠␠
		* ␉␠
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {TokenType} type
		*   Type of the whole whitespace.
		* @param {number | undefined} [max=Infinity]
		*   Max (exclusive).
		* @returns {State}
		*   Start state.
		*/
		function factorySpace(effects, ok, type, max) {
			const limit = max ? max - 1 : Infinity;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownSpace(code)) {
					effects.enter(type);
					return prefix(code);
				}
				return ok(code);
			}
			/** @type {State} */
			function prefix(code) {
				if (markdownSpace(code) && size++ < limit) {
					effects.consume(code);
					return prefix;
				}
				effects.exit(type);
				return ok(code);
			}
		}
		/**
		* Parse spaces and tabs, with a required minimum and maximum, matching
		* `markdown-rs`’s `space_or_tab_min_max`.
		*
		* Unlike `factorySpace`, this can fail: `nok` is used when fewer than
		* `min` spaces or tabs are found.
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole whitespace.
		* @param {number} min
		*   Minimum allowed characters (inclusive).
		* @param {number} max
		*   Maximum allowed characters (inclusive).
		* @returns {State}
		*   Start state.
		*/
		function factorySpaceMinMax(effects, ok, nok, type, min, max) {
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				if (max > 0 && markdownSpace(code)) {
					effects.enter(type);
					return prefix(code);
				}
				return after(code);
			}
			/** @type {State} */
			function prefix(code) {
				if (markdownSpace(code) && size < max) {
					effects.consume(code);
					size++;
					return prefix;
				}
				effects.exit(type);
				return after(code);
			}
			/** @type {State} */
			function after(code) {
				return size >= min ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/content.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const content$1 = { tokenize: initializeContent };
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Initializer}
		*   Content.
		*/
		function initializeContent(effects) {
			const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
			/** @type {Token} */
			let previous;
			return contentStart;
			/** @type {State} */
			function afterContentStartConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, contentStart, "linePrefix");
			}
			/** @type {State} */
			function paragraphInitial(code) {
				effects.enter("paragraph");
				return lineStart(code);
			}
			/** @type {State} */
			function lineStart(code) {
				const token = effects.enter("chunkText", {
					contentType: "text",
					previous
				});
				if (previous) previous.next = token;
				previous = token;
				return data(code);
			}
			/** @type {State} */
			function data(code) {
				if (code === null) {
					effects.exit("chunkText");
					effects.exit("paragraph");
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					effects.exit("chunkText");
					return lineStart;
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-edit-map/index.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, Array<Event>]} Change
		* @typedef {[number, number, number]} Jump
		*/
		/**
		* Tracks a bunch of edits.
		*
		* Port of `edit_map.rs` from `markdown-rs`:
		* <https://github.com/wooorm/markdown-rs/blob/1506572f/src/util/edit_map.rs>.
		*
		* Deal with several changes in events, batching them together.
		*
		* Preferably, changes should be kept to a minimum.
		* Sometimes, it’s needed to change the list of events, because parsing can be
		* messy, and it helps to expose a cleaner interface of events to the compiler
		* and other users.
		* It can also help to merge many adjacent similar events.
		* And, in other cases, it’s needed to parse subcontent: pass some events
		* through another tokenizer and inject the result.
		*/
		var EditMap$1 = class {
			/**
			* Create a new edit map.
			*
			* @returns
			*   New instance.
			*/
			constructor() {
				/**
				* Changes by index, so `add` does not need to scan `map` (which is
				* quadratic for documents with many edits at different places).
				*
				* @type {Map<number, Change>}
				*/
				this.index = /* @__PURE__ */ new Map();
				/**
				* Record of changes.
				*
				* @type {Array<Change>}
				*/
				this.map = [];
			}
			/**
			* Create an edit: a remove and/or add at a certain place.
			*
			* @param {number} index
			*   Index at which to apply the edit.
			* @param {number} remove
			*   Count of items to remove at the index.
			* @param {Array<Event>} add
			*   Items to add at the index.
			* @returns {undefined}
			*   Nothing.
			*/
			add(index, remove, add) {
				addImplementation$1(this, index, remove, add, false);
			}
			/**
			* Create an edit: but insert `add` before existing additions, instead of
			* after them.
			*
			* @param {number} index
			*   Index at which to apply the edit.
			* @param {number} remove
			*   Count of items to remove at the index.
			* @param {Array<Event>} add
			*   Items to add at the index.
			* @returns {undefined}
			*   Nothing.
			*/
			addBefore(index, remove, add) {
				addImplementation$1(this, index, remove, add, true);
			}
			/**
			* Done, change the events.
			*
			* @param {Array<Event>} events
			*   List of events to apply the edits to.
			* @returns {undefined}
			*   Nothing.
			*/
			consume(events) {
				this.map.sort(function(a, b) {
					return a[0] - b[0];
				});
				if (this.map.length === 0) return;
				let index = this.map.length;
				/** @type {Array<Array<Event>>} */
				const vecs = [];
				while (index > 0) {
					index -= 1;
					vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
					events.length = this.map[index][0];
				}
				vecs.push(events.slice());
				events.length = 0;
				let slice = vecs.pop();
				while (slice) {
					for (const element of slice) events.push(element);
					slice = vecs.pop();
				}
				this.map.length = 0;
				this.index.clear();
			}
		};
		/**
		* Create an edit.
		*
		* @param {EditMap} editMap
		*   Edit map to apply to.
		* @param {number} at
		*   Index at which to apply the edit.
		* @param {number} remove
		*   Count of items to remove at the index.
		* @param {Array<Event>} add
		*   Items to add at the index.
		* @param {boolean} before
		*   Insert `add` before existing additions at `at`, instead of after them.
		* @returns {undefined}
		*   Nothing.
		*/
		function addImplementation$1(editMap, at, remove, add, before) {
			if (remove === 0 && add.length === 0) return;
			const existing = editMap.index.get(at);
			if (existing) {
				existing[1] += remove;
				if (before) {
					add.push(...existing[2]);
					existing[2] = add;
				} else existing[2].push(...add);
				return;
			}
			/** @type {Change} */
			const change = [
				at,
				remove,
				add
			];
			editMap.map.push(change);
			editMap.index.set(at, change);
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/document.js
		/**
		* @import {
		*   Construct,
		*   ContainerState,
		*   InitialConstruct,
		*   Initializer,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @typedef {[Construct, ContainerState]} StackItem
		*   Construct and its state.
		*/
		/** @type {InitialConstruct} */
		const document$2 = { tokenize: initializeDocument };
		/** @type {Construct} */
		const containerConstruct = { tokenize: tokenizeContainer };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeDocument(effects) {
			const self = this;
			/** @type {Array<StackItem>} */
			const stack = [];
			let continued = 0;
			/** @type {TokenizeContext | undefined} */
			let childFlow;
			/** @type {Token | undefined} */
			let childToken;
			/** @type {number} */
			let lineStartOffset;
			return start;
			/** @type {State} */
			function start(code) {
				if (continued < stack.length) {
					const item = stack[continued];
					self.containerState = item[1];
					return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code);
				}
				return checkNewContainers(code);
			}
			/** @type {State} */
			function documentContinue(code) {
				continued++;
				if (self.containerState._closeFlow) {
					self.containerState._closeFlow = void 0;
					if (childFlow) closeFlow();
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						point = self.events[indexBeforeFlow][1].end;
						break;
					}
					exitContainers(continued);
					let index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					const editMap = new EditMap$1();
					editMap.add(indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					editMap.add(indexBeforeExits, index - indexBeforeExits, []);
					editMap.consume(self.events);
					return checkNewContainers(code);
				}
				return start(code);
			}
			/** @type {State} */
			function checkNewContainers(code) {
				if (continued === stack.length) {
					if (!childFlow) return documentContinued(code);
					if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) return flowStart(code);
					self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
				}
				self.containerState = {};
				return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code);
			}
			/** @type {State} */
			function thereIsANewContainer(code) {
				if (childFlow) closeFlow();
				exitContainers(continued);
				return documentContinued(code);
			}
			/** @type {State} */
			function thereIsNoNewContainer(code) {
				self.parser.lazy[self.now().line] = continued !== stack.length;
				lineStartOffset = self.now().offset;
				return flowStart(code);
			}
			/** @type {State} */
			function documentContinued(code) {
				self.containerState = {};
				return effects.attempt(containerConstruct, containerContinue, flowStart)(code);
			}
			/** @type {State} */
			function containerContinue(code) {
				continued++;
				stack.push([self.currentConstruct, self.containerState]);
				return documentContinued(code);
			}
			/** @type {State} */
			function flowStart(code) {
				if (code === null) {
					if (childFlow) closeFlow();
					exitContainers(0);
					effects.consume(code);
					return;
				}
				childFlow = childFlow || self.parser.flow(self.now());
				effects.enter("chunkFlow", {
					_tokenizer: childFlow,
					contentType: "flow",
					previous: childToken
				});
				return flowContinue(code);
			}
			/** @type {State} */
			function flowContinue(code) {
				if (code === null) {
					writeToChild(effects.exit("chunkFlow"), true);
					exitContainers(0);
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					writeToChild(effects.exit("chunkFlow"));
					continued = 0;
					self.interrupt = void 0;
					return start;
				}
				effects.consume(code);
				return flowContinue;
			}
			/**
			* @param {Token} token
			*   Token.
			* @param {boolean | undefined} [endOfFile]
			*   Whether the token is at the end of the file (default: `false`).
			* @returns {undefined}
			*   Nothing.
			*/
			function writeToChild(token, endOfFile) {
				const stream = self.sliceStream(token);
				if (endOfFile) stream.push(null);
				token.previous = childToken;
				if (childToken) childToken.next = token;
				childToken = token;
				childFlow.defineSkip(token.start);
				childFlow.write(stream);
				if (self.parser.lazy[token.start.line]) {
					let index = childFlow.events.length;
					while (index--) if (childFlow.events[index][1].start.offset < lineStartOffset && (!childFlow.events[index][1].end || childFlow.events[index][1].end.offset > lineStartOffset)) return;
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {boolean | undefined} */
					let seen;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						if (seen) {
							point = self.events[indexBeforeFlow][1].end;
							break;
						}
						seen = true;
					}
					exitContainers(continued);
					index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					const editMap = new EditMap$1();
					editMap.add(indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					editMap.add(indexBeforeExits, index - indexBeforeExits, []);
					editMap.consume(self.events);
				}
			}
			/**
			* @param {number} size
			*   Size.
			* @returns {undefined}
			*   Nothing.
			*/
			function exitContainers(size) {
				let index = stack.length;
				while (index-- > size) {
					const entry = stack[index];
					self.containerState = entry[1];
					entry[0].exit.call(self, effects);
				}
				stack.length = size;
			}
			function closeFlow() {
				childFlow.write([null]);
				childToken = void 0;
				childFlow = void 0;
				self.containerState._closeFlow = void 0;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*   Tokenizer.
		*/
		function tokenizeContainer(effects, ok, nok) {
			return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
		}
		//#endregion
		//#region node_modules/micromark-util-classify-character/index.js
		/**
		* @typedef {import('micromark-util-types').Code} Code
		*/
		/**
		* Classify whether a code represents whitespace, punctuation, or something
		* else.
		*
		* Used for attention (emphasis, strong), whose sequences can open or close
		* based on the class of surrounding characters.
		*
		* > 👉 **Note**: eof (`null`) is seen as whitespace.
		*
		* @param {Code} code
		*   Code.
		* @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
		*   Group.
		*/
		function classifyCharacter(code) {
			if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return 1;
			if (unicodePunctuation(code)) return 2;
		}
		//#endregion
		//#region node_modules/micromark-util-resolve-all/index.js
		/**
		* @typedef {import('micromark-util-types').Event} Event
		* @typedef {import('micromark-util-types').Resolver} Resolver
		* @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
		*/
		/**
		* Call all `resolveAll`s.
		*
		* @param {Array<{resolveAll?: Resolver | undefined}>} constructs
		*   List of constructs, optionally with `resolveAll`s.
		* @param {Array<Event>} events
		*   List of events.
		* @param {TokenizeContext} context
		*   Context used by `tokenize`.
		* @returns {Array<Event>}
		*   Changed events.
		*/
		function resolveAll(constructs, events, context) {
			/** @type {Array<Resolver>} */
			const called = [];
			let index = -1;
			while (++index < constructs.length) {
				const resolve = constructs[index].resolveAll;
				if (resolve && !called.includes(resolve)) {
					events = resolve(events, context);
					called.push(resolve);
				}
			}
			return events;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/attention.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Event,
		*   Point,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const attention = {
			name: "attention",
			resolveAll: resolveAllAttention,
			tokenize: tokenizeAttention
		};
		/**
		* Take all events and resolve attention to emphasis or strong.
		*
		* @type {Resolver}
		*/
		function resolveAllAttention(events, context) {
			let index = -1;
			/** @type {Array<Event>} */
			let nextEvents;
			while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
				let open = index;
				while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
					if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) continue;
					const use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
					const start = { ...events[open][1].end };
					const end = { ...events[index][1].start };
					movePoint(start, -use);
					movePoint(end, use);
					const openingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start,
						end: { ...events[open][1].end }
					};
					const closingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start: { ...events[index][1].start },
						end
					};
					const text = {
						type: use > 1 ? "strongText" : "emphasisText",
						start: { ...events[open][1].end },
						end: { ...events[index][1].start }
					};
					const group = {
						type: use > 1 ? "strong" : "emphasis",
						start: { ...openingSequence.start },
						end: { ...closingSequence.end }
					};
					events[open][1].end = { ...openingSequence.start };
					events[index][1].start = { ...closingSequence.end };
					nextEvents = [];
					if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
						"enter",
						events[open][1],
						context
					], [
						"exit",
						events[open][1],
						context
					]]);
					nextEvents = push(nextEvents, [
						[
							"enter",
							group,
							context
						],
						[
							"enter",
							openingSequence,
							context
						],
						[
							"exit",
							openingSequence,
							context
						],
						[
							"enter",
							text,
							context
						]
					]);
					nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
					nextEvents = push(nextEvents, [
						[
							"exit",
							text,
							context
						],
						[
							"enter",
							closingSequence,
							context
						],
						[
							"exit",
							closingSequence,
							context
						],
						[
							"exit",
							group,
							context
						]
					]);
					/** @type {number} */
					let offset = 0;
					if (events[index][1].end.offset - events[index][1].start.offset) {
						offset = 2;
						nextEvents = push(nextEvents, [[
							"enter",
							events[index][1],
							context
						], [
							"exit",
							events[index][1],
							context
						]]);
					}
					splice(events, open - 1, index - open + 3, nextEvents);
					index = open + nextEvents.length - offset - 2;
					break;
				}
			}
			index = -1;
			while (++index < events.length) if (events[index][1].type === "attentionSequence") events[index][1].type = "data";
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAttention(effects, ok) {
			const attentionMarkers = this.parser.constructs.attentionMarkers.null;
			const previous = this.previous;
			const before = classifyCharacter(previous);
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Before a sequence.
			*
			* ```markdown
			* > | **
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				marker = code;
				effects.enter("attentionSequence");
				return inside(code);
			}
			/**
			* In a sequence.
			*
			* ```markdown
			* > | **
			*     ^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				const token = effects.exit("attentionSequence");
				const after = classifyCharacter(code);
				const open = !after || after === 2 && before || attentionMarkers.includes(code) && code !== 42 && code !== 95;
				const close = !before || before === 2 && after || attentionMarkers.includes(previous) && previous !== 42 && previous !== 95;
				token._open = Boolean(marker === 42 ? open : open && (before || !close));
				token._close = Boolean(marker === 42 ? close : close && (after || !open));
				return ok(code);
			}
		}
		/**
		* Move a point a bit.
		*
		* Note: `move` only works inside lines! It’s not possible to move past other
		* chunks (replacement characters, tabs, or line endings).
		*
		* @param {Point} point
		*   Point.
		* @param {number} offset
		*   Amount to move.
		* @returns {undefined}
		*   Nothing.
		*/
		function movePoint(point, offset) {
			point.column += offset;
			point.offset += offset;
			point._bufferIndex += offset;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/autolink.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const autolink = {
			name: "autolink",
			tokenize: tokenizeAutolink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAutolink(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of an autolink.
			*
			* ```markdown
			* > | a<https://example.com>b
			*      ^
			* > | a<user@example.com>b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("autolink");
				effects.enter("autolinkMarker");
				effects.consume(code);
				effects.exit("autolinkMarker");
				effects.enter("autolinkProtocol");
				return open;
			}
			/**
			* After `<`, at protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*       ^
			* > | a<user@example.com>b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return schemeOrEmailAtext;
				}
				if (code === 64) return nok(code);
				return emailAtext(code);
			}
			/**
			* At second byte of protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeOrEmailAtext(code) {
				if (code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) {
					size = 1;
					return schemeInsideOrEmailAtext(code);
				}
				return emailAtext(code);
			}
			/**
			* In ambiguous protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeInsideOrEmailAtext(code) {
				if (code === 58) {
					effects.consume(code);
					size = 0;
					return urlInside;
				}
				if ((code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) && size++ < 32) {
					effects.consume(code);
					return schemeInsideOrEmailAtext;
				}
				size = 0;
				return emailAtext(code);
			}
			/**
			* After protocol, in URL.
			*
			* ```markdown
			* > | a<https://example.com>b
			*             ^
			* ```
			*
			* @type {State}
			*/
			function urlInside(code) {
				if (code === 62) {
					effects.exit("autolinkProtocol");
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				if (code === null || code === 32 || code === 60 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return urlInside;
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*              ^
			* ```
			*
			* @type {State}
			*/
			function emailAtext(code) {
				if (code === 64) {
					effects.consume(code);
					return emailAtSignOrDot;
				}
				if (asciiAtext(code)) {
					effects.consume(code);
					return emailAtext;
				}
				return nok(code);
			}
			/**
			* In label, after at-sign or dot.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                 ^       ^
			* ```
			*
			* @type {State}
			*/
			function emailAtSignOrDot(code) {
				return asciiAlphanumeric(code) ? emailLabel(code) : nok(code);
			}
			/**
			* In label, where `.` and `>` are allowed.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function emailLabel(code) {
				if (code === 46) {
					effects.consume(code);
					size = 0;
					return emailAtSignOrDot;
				}
				if (code === 62) {
					effects.exit("autolinkProtocol").type = "autolinkEmail";
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				return emailValue(code);
			}
			/**
			* In label, where `.` and `>` are *not* allowed.
			*
			* Though, this is also used in `emailLabel` to parse other values.
			*
			* ```markdown
			* > | a<user.name@ex-ample.com>b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function emailValue(code) {
				if ((code === 45 || asciiAlphanumeric(code)) && size++ < 63) {
					const next = code === 45 ? emailValue : emailLabel;
					effects.consume(code);
					return next;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/blank-line.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blankLine = {
			partial: true,
			tokenize: tokenizeBlankLine
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLine(effects, ok, nok) {
			return start;
			/**
			* Start of blank line.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*     ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return markdownSpace(code) ? factorySpace(effects, after, "linePrefix")(code) : after(code);
			}
			/**
			* At eof/eol, after optional whitespace.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*       ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/block-quote.js
		/**
		* @import {
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blockQuote = {
			continuation: { tokenize: tokenizeBlockQuoteContinuation },
			exit: exit$1,
			name: "blockQuote",
			tokenize: tokenizeBlockQuoteStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteStart(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of block quote.
			*
			* ```markdown
			* > | > a
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 62) {
					const state = self.containerState;
					if (!state.open) {
						effects.enter("blockQuote", { _container: true });
						state.open = true;
					}
					effects.enter("blockQuotePrefix");
					effects.enter("blockQuoteMarker");
					effects.consume(code);
					effects.exit("blockQuoteMarker");
					return after;
				}
				return nok(code);
			}
			/**
			* After `>`, before optional whitespace.
			*
			* ```markdown
			* > | > a
			*      ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (markdownSpace(code)) {
					effects.enter("blockQuotePrefixWhitespace");
					effects.consume(code);
					effects.exit("blockQuotePrefixWhitespace");
					effects.exit("blockQuotePrefix");
					return ok;
				}
				effects.exit("blockQuotePrefix");
				return ok(code);
			}
		}
		/**
		* Start of block quote continuation.
		*
		* ```markdown
		*   | > a
		* > | > b
		*     ^
		* ```
		*
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteContinuation(effects, ok, nok) {
			const self = this;
			return contStart;
			/**
			* Start of block quote continuation.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contStart(code) {
				if (markdownSpace(code)) return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return contBefore(code);
			}
			/**
			* At `>`, after optional whitespace.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contBefore(code) {
				return effects.attempt(blockQuote, ok, nok)(code);
			}
		}
		/** @type {Exiter} */
		function exit$1(effects) {
			effects.exit("blockQuote");
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/character-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterEscape = {
			name: "characterEscape",
			tokenize: tokenizeCharacterEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterEscape(effects, ok, nok) {
			return start;
			/**
			* Start of character escape.
			*
			* ```markdown
			* > | a\*b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterEscape");
				effects.enter("escapeMarker");
				effects.consume(code);
				effects.exit("escapeMarker");
				return inside;
			}
			/**
			* After `\`, at punctuation.
			*
			* ```markdown
			* > | a\*b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (asciiPunctuation(code)) {
					effects.enter("characterEscapeValue");
					effects.consume(code);
					effects.exit("characterEscapeValue");
					effects.exit("characterEscape");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/character-entities/index.js
		/**
		* Map of named character references.
		*
		* @type {Record<string, string>}
		*/
		const characterEntities = {
			AElig: "Æ",
			AMP: "&",
			Aacute: "Á",
			Abreve: "Ă",
			Acirc: "Â",
			Acy: "А",
			Afr: "𝔄",
			Agrave: "À",
			Alpha: "Α",
			Amacr: "Ā",
			And: "⩓",
			Aogon: "Ą",
			Aopf: "𝔸",
			ApplyFunction: "⁡",
			Aring: "Å",
			Ascr: "𝒜",
			Assign: "≔",
			Atilde: "Ã",
			Auml: "Ä",
			Backslash: "∖",
			Barv: "⫧",
			Barwed: "⌆",
			Bcy: "Б",
			Because: "∵",
			Bernoullis: "ℬ",
			Beta: "Β",
			Bfr: "𝔅",
			Bopf: "𝔹",
			Breve: "˘",
			Bscr: "ℬ",
			Bumpeq: "≎",
			CHcy: "Ч",
			COPY: "©",
			Cacute: "Ć",
			Cap: "⋒",
			CapitalDifferentialD: "ⅅ",
			Cayleys: "ℭ",
			Ccaron: "Č",
			Ccedil: "Ç",
			Ccirc: "Ĉ",
			Cconint: "∰",
			Cdot: "Ċ",
			Cedilla: "¸",
			CenterDot: "·",
			Cfr: "ℭ",
			Chi: "Χ",
			CircleDot: "⊙",
			CircleMinus: "⊖",
			CirclePlus: "⊕",
			CircleTimes: "⊗",
			ClockwiseContourIntegral: "∲",
			CloseCurlyDoubleQuote: "”",
			CloseCurlyQuote: "’",
			Colon: "∷",
			Colone: "⩴",
			Congruent: "≡",
			Conint: "∯",
			ContourIntegral: "∮",
			Copf: "ℂ",
			Coproduct: "∐",
			CounterClockwiseContourIntegral: "∳",
			Cross: "⨯",
			Cscr: "𝒞",
			Cup: "⋓",
			CupCap: "≍",
			DD: "ⅅ",
			DDotrahd: "⤑",
			DJcy: "Ђ",
			DScy: "Ѕ",
			DZcy: "Џ",
			Dagger: "‡",
			Darr: "↡",
			Dashv: "⫤",
			Dcaron: "Ď",
			Dcy: "Д",
			Del: "∇",
			Delta: "Δ",
			Dfr: "𝔇",
			DiacriticalAcute: "´",
			DiacriticalDot: "˙",
			DiacriticalDoubleAcute: "˝",
			DiacriticalGrave: "`",
			DiacriticalTilde: "˜",
			Diamond: "⋄",
			DifferentialD: "ⅆ",
			Dopf: "𝔻",
			Dot: "¨",
			DotDot: "⃜",
			DotEqual: "≐",
			DoubleContourIntegral: "∯",
			DoubleDot: "¨",
			DoubleDownArrow: "⇓",
			DoubleLeftArrow: "⇐",
			DoubleLeftRightArrow: "⇔",
			DoubleLeftTee: "⫤",
			DoubleLongLeftArrow: "⟸",
			DoubleLongLeftRightArrow: "⟺",
			DoubleLongRightArrow: "⟹",
			DoubleRightArrow: "⇒",
			DoubleRightTee: "⊨",
			DoubleUpArrow: "⇑",
			DoubleUpDownArrow: "⇕",
			DoubleVerticalBar: "∥",
			DownArrow: "↓",
			DownArrowBar: "⤓",
			DownArrowUpArrow: "⇵",
			DownBreve: "̑",
			DownLeftRightVector: "⥐",
			DownLeftTeeVector: "⥞",
			DownLeftVector: "↽",
			DownLeftVectorBar: "⥖",
			DownRightTeeVector: "⥟",
			DownRightVector: "⇁",
			DownRightVectorBar: "⥗",
			DownTee: "⊤",
			DownTeeArrow: "↧",
			Downarrow: "⇓",
			Dscr: "𝒟",
			Dstrok: "Đ",
			ENG: "Ŋ",
			ETH: "Ð",
			Eacute: "É",
			Ecaron: "Ě",
			Ecirc: "Ê",
			Ecy: "Э",
			Edot: "Ė",
			Efr: "𝔈",
			Egrave: "È",
			Element: "∈",
			Emacr: "Ē",
			EmptySmallSquare: "◻",
			EmptyVerySmallSquare: "▫",
			Eogon: "Ę",
			Eopf: "𝔼",
			Epsilon: "Ε",
			Equal: "⩵",
			EqualTilde: "≂",
			Equilibrium: "⇌",
			Escr: "ℰ",
			Esim: "⩳",
			Eta: "Η",
			Euml: "Ë",
			Exists: "∃",
			ExponentialE: "ⅇ",
			Fcy: "Ф",
			Ffr: "𝔉",
			FilledSmallSquare: "◼",
			FilledVerySmallSquare: "▪",
			Fopf: "𝔽",
			ForAll: "∀",
			Fouriertrf: "ℱ",
			Fscr: "ℱ",
			GJcy: "Ѓ",
			GT: ">",
			Gamma: "Γ",
			Gammad: "Ϝ",
			Gbreve: "Ğ",
			Gcedil: "Ģ",
			Gcirc: "Ĝ",
			Gcy: "Г",
			Gdot: "Ġ",
			Gfr: "𝔊",
			Gg: "⋙",
			Gopf: "𝔾",
			GreaterEqual: "≥",
			GreaterEqualLess: "⋛",
			GreaterFullEqual: "≧",
			GreaterGreater: "⪢",
			GreaterLess: "≷",
			GreaterSlantEqual: "⩾",
			GreaterTilde: "≳",
			Gscr: "𝒢",
			Gt: "≫",
			HARDcy: "Ъ",
			Hacek: "ˇ",
			Hat: "^",
			Hcirc: "Ĥ",
			Hfr: "ℌ",
			HilbertSpace: "ℋ",
			Hopf: "ℍ",
			HorizontalLine: "─",
			Hscr: "ℋ",
			Hstrok: "Ħ",
			HumpDownHump: "≎",
			HumpEqual: "≏",
			IEcy: "Е",
			IJlig: "Ĳ",
			IOcy: "Ё",
			Iacute: "Í",
			Icirc: "Î",
			Icy: "И",
			Idot: "İ",
			Ifr: "ℑ",
			Igrave: "Ì",
			Im: "ℑ",
			Imacr: "Ī",
			ImaginaryI: "ⅈ",
			Implies: "⇒",
			Int: "∬",
			Integral: "∫",
			Intersection: "⋂",
			InvisibleComma: "⁣",
			InvisibleTimes: "⁢",
			Iogon: "Į",
			Iopf: "𝕀",
			Iota: "Ι",
			Iscr: "ℐ",
			Itilde: "Ĩ",
			Iukcy: "І",
			Iuml: "Ï",
			Jcirc: "Ĵ",
			Jcy: "Й",
			Jfr: "𝔍",
			Jopf: "𝕁",
			Jscr: "𝒥",
			Jsercy: "Ј",
			Jukcy: "Є",
			KHcy: "Х",
			KJcy: "Ќ",
			Kappa: "Κ",
			Kcedil: "Ķ",
			Kcy: "К",
			Kfr: "𝔎",
			Kopf: "𝕂",
			Kscr: "𝒦",
			LJcy: "Љ",
			LT: "<",
			Lacute: "Ĺ",
			Lambda: "Λ",
			Lang: "⟪",
			Laplacetrf: "ℒ",
			Larr: "↞",
			Lcaron: "Ľ",
			Lcedil: "Ļ",
			Lcy: "Л",
			LeftAngleBracket: "⟨",
			LeftArrow: "←",
			LeftArrowBar: "⇤",
			LeftArrowRightArrow: "⇆",
			LeftCeiling: "⌈",
			LeftDoubleBracket: "⟦",
			LeftDownTeeVector: "⥡",
			LeftDownVector: "⇃",
			LeftDownVectorBar: "⥙",
			LeftFloor: "⌊",
			LeftRightArrow: "↔",
			LeftRightVector: "⥎",
			LeftTee: "⊣",
			LeftTeeArrow: "↤",
			LeftTeeVector: "⥚",
			LeftTriangle: "⊲",
			LeftTriangleBar: "⧏",
			LeftTriangleEqual: "⊴",
			LeftUpDownVector: "⥑",
			LeftUpTeeVector: "⥠",
			LeftUpVector: "↿",
			LeftUpVectorBar: "⥘",
			LeftVector: "↼",
			LeftVectorBar: "⥒",
			Leftarrow: "⇐",
			Leftrightarrow: "⇔",
			LessEqualGreater: "⋚",
			LessFullEqual: "≦",
			LessGreater: "≶",
			LessLess: "⪡",
			LessSlantEqual: "⩽",
			LessTilde: "≲",
			Lfr: "𝔏",
			Ll: "⋘",
			Lleftarrow: "⇚",
			Lmidot: "Ŀ",
			LongLeftArrow: "⟵",
			LongLeftRightArrow: "⟷",
			LongRightArrow: "⟶",
			Longleftarrow: "⟸",
			Longleftrightarrow: "⟺",
			Longrightarrow: "⟹",
			Lopf: "𝕃",
			LowerLeftArrow: "↙",
			LowerRightArrow: "↘",
			Lscr: "ℒ",
			Lsh: "↰",
			Lstrok: "Ł",
			Lt: "≪",
			Map: "⤅",
			Mcy: "М",
			MediumSpace: " ",
			Mellintrf: "ℳ",
			Mfr: "𝔐",
			MinusPlus: "∓",
			Mopf: "𝕄",
			Mscr: "ℳ",
			Mu: "Μ",
			NJcy: "Њ",
			Nacute: "Ń",
			Ncaron: "Ň",
			Ncedil: "Ņ",
			Ncy: "Н",
			NegativeMediumSpace: "​",
			NegativeThickSpace: "​",
			NegativeThinSpace: "​",
			NegativeVeryThinSpace: "​",
			NestedGreaterGreater: "≫",
			NestedLessLess: "≪",
			NewLine: "\n",
			Nfr: "𝔑",
			NoBreak: "⁠",
			NonBreakingSpace: "\xA0",
			Nopf: "ℕ",
			Not: "⫬",
			NotCongruent: "≢",
			NotCupCap: "≭",
			NotDoubleVerticalBar: "∦",
			NotElement: "∉",
			NotEqual: "≠",
			NotEqualTilde: "≂̸",
			NotExists: "∄",
			NotGreater: "≯",
			NotGreaterEqual: "≱",
			NotGreaterFullEqual: "≧̸",
			NotGreaterGreater: "≫̸",
			NotGreaterLess: "≹",
			NotGreaterSlantEqual: "⩾̸",
			NotGreaterTilde: "≵",
			NotHumpDownHump: "≎̸",
			NotHumpEqual: "≏̸",
			NotLeftTriangle: "⋪",
			NotLeftTriangleBar: "⧏̸",
			NotLeftTriangleEqual: "⋬",
			NotLess: "≮",
			NotLessEqual: "≰",
			NotLessGreater: "≸",
			NotLessLess: "≪̸",
			NotLessSlantEqual: "⩽̸",
			NotLessTilde: "≴",
			NotNestedGreaterGreater: "⪢̸",
			NotNestedLessLess: "⪡̸",
			NotPrecedes: "⊀",
			NotPrecedesEqual: "⪯̸",
			NotPrecedesSlantEqual: "⋠",
			NotReverseElement: "∌",
			NotRightTriangle: "⋫",
			NotRightTriangleBar: "⧐̸",
			NotRightTriangleEqual: "⋭",
			NotSquareSubset: "⊏̸",
			NotSquareSubsetEqual: "⋢",
			NotSquareSuperset: "⊐̸",
			NotSquareSupersetEqual: "⋣",
			NotSubset: "⊂⃒",
			NotSubsetEqual: "⊈",
			NotSucceeds: "⊁",
			NotSucceedsEqual: "⪰̸",
			NotSucceedsSlantEqual: "⋡",
			NotSucceedsTilde: "≿̸",
			NotSuperset: "⊃⃒",
			NotSupersetEqual: "⊉",
			NotTilde: "≁",
			NotTildeEqual: "≄",
			NotTildeFullEqual: "≇",
			NotTildeTilde: "≉",
			NotVerticalBar: "∤",
			Nscr: "𝒩",
			Ntilde: "Ñ",
			Nu: "Ν",
			OElig: "Œ",
			Oacute: "Ó",
			Ocirc: "Ô",
			Ocy: "О",
			Odblac: "Ő",
			Ofr: "𝔒",
			Ograve: "Ò",
			Omacr: "Ō",
			Omega: "Ω",
			Omicron: "Ο",
			Oopf: "𝕆",
			OpenCurlyDoubleQuote: "“",
			OpenCurlyQuote: "‘",
			Or: "⩔",
			Oscr: "𝒪",
			Oslash: "Ø",
			Otilde: "Õ",
			Otimes: "⨷",
			Ouml: "Ö",
			OverBar: "‾",
			OverBrace: "⏞",
			OverBracket: "⎴",
			OverParenthesis: "⏜",
			PartialD: "∂",
			Pcy: "П",
			Pfr: "𝔓",
			Phi: "Φ",
			Pi: "Π",
			PlusMinus: "±",
			Poincareplane: "ℌ",
			Popf: "ℙ",
			Pr: "⪻",
			Precedes: "≺",
			PrecedesEqual: "⪯",
			PrecedesSlantEqual: "≼",
			PrecedesTilde: "≾",
			Prime: "″",
			Product: "∏",
			Proportion: "∷",
			Proportional: "∝",
			Pscr: "𝒫",
			Psi: "Ψ",
			QUOT: "\"",
			Qfr: "𝔔",
			Qopf: "ℚ",
			Qscr: "𝒬",
			RBarr: "⤐",
			REG: "®",
			Racute: "Ŕ",
			Rang: "⟫",
			Rarr: "↠",
			Rarrtl: "⤖",
			Rcaron: "Ř",
			Rcedil: "Ŗ",
			Rcy: "Р",
			Re: "ℜ",
			ReverseElement: "∋",
			ReverseEquilibrium: "⇋",
			ReverseUpEquilibrium: "⥯",
			Rfr: "ℜ",
			Rho: "Ρ",
			RightAngleBracket: "⟩",
			RightArrow: "→",
			RightArrowBar: "⇥",
			RightArrowLeftArrow: "⇄",
			RightCeiling: "⌉",
			RightDoubleBracket: "⟧",
			RightDownTeeVector: "⥝",
			RightDownVector: "⇂",
			RightDownVectorBar: "⥕",
			RightFloor: "⌋",
			RightTee: "⊢",
			RightTeeArrow: "↦",
			RightTeeVector: "⥛",
			RightTriangle: "⊳",
			RightTriangleBar: "⧐",
			RightTriangleEqual: "⊵",
			RightUpDownVector: "⥏",
			RightUpTeeVector: "⥜",
			RightUpVector: "↾",
			RightUpVectorBar: "⥔",
			RightVector: "⇀",
			RightVectorBar: "⥓",
			Rightarrow: "⇒",
			Ropf: "ℝ",
			RoundImplies: "⥰",
			Rrightarrow: "⇛",
			Rscr: "ℛ",
			Rsh: "↱",
			RuleDelayed: "⧴",
			SHCHcy: "Щ",
			SHcy: "Ш",
			SOFTcy: "Ь",
			Sacute: "Ś",
			Sc: "⪼",
			Scaron: "Š",
			Scedil: "Ş",
			Scirc: "Ŝ",
			Scy: "С",
			Sfr: "𝔖",
			ShortDownArrow: "↓",
			ShortLeftArrow: "←",
			ShortRightArrow: "→",
			ShortUpArrow: "↑",
			Sigma: "Σ",
			SmallCircle: "∘",
			Sopf: "𝕊",
			Sqrt: "√",
			Square: "□",
			SquareIntersection: "⊓",
			SquareSubset: "⊏",
			SquareSubsetEqual: "⊑",
			SquareSuperset: "⊐",
			SquareSupersetEqual: "⊒",
			SquareUnion: "⊔",
			Sscr: "𝒮",
			Star: "⋆",
			Sub: "⋐",
			Subset: "⋐",
			SubsetEqual: "⊆",
			Succeeds: "≻",
			SucceedsEqual: "⪰",
			SucceedsSlantEqual: "≽",
			SucceedsTilde: "≿",
			SuchThat: "∋",
			Sum: "∑",
			Sup: "⋑",
			Superset: "⊃",
			SupersetEqual: "⊇",
			Supset: "⋑",
			THORN: "Þ",
			TRADE: "™",
			TSHcy: "Ћ",
			TScy: "Ц",
			Tab: "	",
			Tau: "Τ",
			Tcaron: "Ť",
			Tcedil: "Ţ",
			Tcy: "Т",
			Tfr: "𝔗",
			Therefore: "∴",
			Theta: "Θ",
			ThickSpace: "  ",
			ThinSpace: " ",
			Tilde: "∼",
			TildeEqual: "≃",
			TildeFullEqual: "≅",
			TildeTilde: "≈",
			Topf: "𝕋",
			TripleDot: "⃛",
			Tscr: "𝒯",
			Tstrok: "Ŧ",
			Uacute: "Ú",
			Uarr: "↟",
			Uarrocir: "⥉",
			Ubrcy: "Ў",
			Ubreve: "Ŭ",
			Ucirc: "Û",
			Ucy: "У",
			Udblac: "Ű",
			Ufr: "𝔘",
			Ugrave: "Ù",
			Umacr: "Ū",
			UnderBar: "_",
			UnderBrace: "⏟",
			UnderBracket: "⎵",
			UnderParenthesis: "⏝",
			Union: "⋃",
			UnionPlus: "⊎",
			Uogon: "Ų",
			Uopf: "𝕌",
			UpArrow: "↑",
			UpArrowBar: "⤒",
			UpArrowDownArrow: "⇅",
			UpDownArrow: "↕",
			UpEquilibrium: "⥮",
			UpTee: "⊥",
			UpTeeArrow: "↥",
			Uparrow: "⇑",
			Updownarrow: "⇕",
			UpperLeftArrow: "↖",
			UpperRightArrow: "↗",
			Upsi: "ϒ",
			Upsilon: "Υ",
			Uring: "Ů",
			Uscr: "𝒰",
			Utilde: "Ũ",
			Uuml: "Ü",
			VDash: "⊫",
			Vbar: "⫫",
			Vcy: "В",
			Vdash: "⊩",
			Vdashl: "⫦",
			Vee: "⋁",
			Verbar: "‖",
			Vert: "‖",
			VerticalBar: "∣",
			VerticalLine: "|",
			VerticalSeparator: "❘",
			VerticalTilde: "≀",
			VeryThinSpace: " ",
			Vfr: "𝔙",
			Vopf: "𝕍",
			Vscr: "𝒱",
			Vvdash: "⊪",
			Wcirc: "Ŵ",
			Wedge: "⋀",
			Wfr: "𝔚",
			Wopf: "𝕎",
			Wscr: "𝒲",
			Xfr: "𝔛",
			Xi: "Ξ",
			Xopf: "𝕏",
			Xscr: "𝒳",
			YAcy: "Я",
			YIcy: "Ї",
			YUcy: "Ю",
			Yacute: "Ý",
			Ycirc: "Ŷ",
			Ycy: "Ы",
			Yfr: "𝔜",
			Yopf: "𝕐",
			Yscr: "𝒴",
			Yuml: "Ÿ",
			ZHcy: "Ж",
			Zacute: "Ź",
			Zcaron: "Ž",
			Zcy: "З",
			Zdot: "Ż",
			ZeroWidthSpace: "​",
			Zeta: "Ζ",
			Zfr: "ℨ",
			Zopf: "ℤ",
			Zscr: "𝒵",
			aacute: "á",
			abreve: "ă",
			ac: "∾",
			acE: "∾̳",
			acd: "∿",
			acirc: "â",
			acute: "´",
			acy: "а",
			aelig: "æ",
			af: "⁡",
			afr: "𝔞",
			agrave: "à",
			alefsym: "ℵ",
			aleph: "ℵ",
			alpha: "α",
			amacr: "ā",
			amalg: "⨿",
			amp: "&",
			and: "∧",
			andand: "⩕",
			andd: "⩜",
			andslope: "⩘",
			andv: "⩚",
			ang: "∠",
			ange: "⦤",
			angle: "∠",
			angmsd: "∡",
			angmsdaa: "⦨",
			angmsdab: "⦩",
			angmsdac: "⦪",
			angmsdad: "⦫",
			angmsdae: "⦬",
			angmsdaf: "⦭",
			angmsdag: "⦮",
			angmsdah: "⦯",
			angrt: "∟",
			angrtvb: "⊾",
			angrtvbd: "⦝",
			angsph: "∢",
			angst: "Å",
			angzarr: "⍼",
			aogon: "ą",
			aopf: "𝕒",
			ap: "≈",
			apE: "⩰",
			apacir: "⩯",
			ape: "≊",
			apid: "≋",
			apos: "'",
			approx: "≈",
			approxeq: "≊",
			aring: "å",
			ascr: "𝒶",
			ast: "*",
			asymp: "≈",
			asympeq: "≍",
			atilde: "ã",
			auml: "ä",
			awconint: "∳",
			awint: "⨑",
			bNot: "⫭",
			backcong: "≌",
			backepsilon: "϶",
			backprime: "‵",
			backsim: "∽",
			backsimeq: "⋍",
			barvee: "⊽",
			barwed: "⌅",
			barwedge: "⌅",
			bbrk: "⎵",
			bbrktbrk: "⎶",
			bcong: "≌",
			bcy: "б",
			bdquo: "„",
			becaus: "∵",
			because: "∵",
			bemptyv: "⦰",
			bepsi: "϶",
			bernou: "ℬ",
			beta: "β",
			beth: "ℶ",
			between: "≬",
			bfr: "𝔟",
			bigcap: "⋂",
			bigcirc: "◯",
			bigcup: "⋃",
			bigodot: "⨀",
			bigoplus: "⨁",
			bigotimes: "⨂",
			bigsqcup: "⨆",
			bigstar: "★",
			bigtriangledown: "▽",
			bigtriangleup: "△",
			biguplus: "⨄",
			bigvee: "⋁",
			bigwedge: "⋀",
			bkarow: "⤍",
			blacklozenge: "⧫",
			blacksquare: "▪",
			blacktriangle: "▴",
			blacktriangledown: "▾",
			blacktriangleleft: "◂",
			blacktriangleright: "▸",
			blank: "␣",
			blk12: "▒",
			blk14: "░",
			blk34: "▓",
			block: "█",
			bne: "=⃥",
			bnequiv: "≡⃥",
			bnot: "⌐",
			bopf: "𝕓",
			bot: "⊥",
			bottom: "⊥",
			bowtie: "⋈",
			boxDL: "╗",
			boxDR: "╔",
			boxDl: "╖",
			boxDr: "╓",
			boxH: "═",
			boxHD: "╦",
			boxHU: "╩",
			boxHd: "╤",
			boxHu: "╧",
			boxUL: "╝",
			boxUR: "╚",
			boxUl: "╜",
			boxUr: "╙",
			boxV: "║",
			boxVH: "╬",
			boxVL: "╣",
			boxVR: "╠",
			boxVh: "╫",
			boxVl: "╢",
			boxVr: "╟",
			boxbox: "⧉",
			boxdL: "╕",
			boxdR: "╒",
			boxdl: "┐",
			boxdr: "┌",
			boxh: "─",
			boxhD: "╥",
			boxhU: "╨",
			boxhd: "┬",
			boxhu: "┴",
			boxminus: "⊟",
			boxplus: "⊞",
			boxtimes: "⊠",
			boxuL: "╛",
			boxuR: "╘",
			boxul: "┘",
			boxur: "└",
			boxv: "│",
			boxvH: "╪",
			boxvL: "╡",
			boxvR: "╞",
			boxvh: "┼",
			boxvl: "┤",
			boxvr: "├",
			bprime: "‵",
			breve: "˘",
			brvbar: "¦",
			bscr: "𝒷",
			bsemi: "⁏",
			bsim: "∽",
			bsime: "⋍",
			bsol: "\\",
			bsolb: "⧅",
			bsolhsub: "⟈",
			bull: "•",
			bullet: "•",
			bump: "≎",
			bumpE: "⪮",
			bumpe: "≏",
			bumpeq: "≏",
			cacute: "ć",
			cap: "∩",
			capand: "⩄",
			capbrcup: "⩉",
			capcap: "⩋",
			capcup: "⩇",
			capdot: "⩀",
			caps: "∩︀",
			caret: "⁁",
			caron: "ˇ",
			ccaps: "⩍",
			ccaron: "č",
			ccedil: "ç",
			ccirc: "ĉ",
			ccups: "⩌",
			ccupssm: "⩐",
			cdot: "ċ",
			cedil: "¸",
			cemptyv: "⦲",
			cent: "¢",
			centerdot: "·",
			cfr: "𝔠",
			chcy: "ч",
			check: "✓",
			checkmark: "✓",
			chi: "χ",
			cir: "○",
			cirE: "⧃",
			circ: "ˆ",
			circeq: "≗",
			circlearrowleft: "↺",
			circlearrowright: "↻",
			circledR: "®",
			circledS: "Ⓢ",
			circledast: "⊛",
			circledcirc: "⊚",
			circleddash: "⊝",
			cire: "≗",
			cirfnint: "⨐",
			cirmid: "⫯",
			cirscir: "⧂",
			clubs: "♣",
			clubsuit: "♣",
			colon: ":",
			colone: "≔",
			coloneq: "≔",
			comma: ",",
			commat: "@",
			comp: "∁",
			compfn: "∘",
			complement: "∁",
			complexes: "ℂ",
			cong: "≅",
			congdot: "⩭",
			conint: "∮",
			copf: "𝕔",
			coprod: "∐",
			copy: "©",
			copysr: "℗",
			crarr: "↵",
			cross: "✗",
			cscr: "𝒸",
			csub: "⫏",
			csube: "⫑",
			csup: "⫐",
			csupe: "⫒",
			ctdot: "⋯",
			cudarrl: "⤸",
			cudarrr: "⤵",
			cuepr: "⋞",
			cuesc: "⋟",
			cularr: "↶",
			cularrp: "⤽",
			cup: "∪",
			cupbrcap: "⩈",
			cupcap: "⩆",
			cupcup: "⩊",
			cupdot: "⊍",
			cupor: "⩅",
			cups: "∪︀",
			curarr: "↷",
			curarrm: "⤼",
			curlyeqprec: "⋞",
			curlyeqsucc: "⋟",
			curlyvee: "⋎",
			curlywedge: "⋏",
			curren: "¤",
			curvearrowleft: "↶",
			curvearrowright: "↷",
			cuvee: "⋎",
			cuwed: "⋏",
			cwconint: "∲",
			cwint: "∱",
			cylcty: "⌭",
			dArr: "⇓",
			dHar: "⥥",
			dagger: "†",
			daleth: "ℸ",
			darr: "↓",
			dash: "‐",
			dashv: "⊣",
			dbkarow: "⤏",
			dblac: "˝",
			dcaron: "ď",
			dcy: "д",
			dd: "ⅆ",
			ddagger: "‡",
			ddarr: "⇊",
			ddotseq: "⩷",
			deg: "°",
			delta: "δ",
			demptyv: "⦱",
			dfisht: "⥿",
			dfr: "𝔡",
			dharl: "⇃",
			dharr: "⇂",
			diam: "⋄",
			diamond: "⋄",
			diamondsuit: "♦",
			diams: "♦",
			die: "¨",
			digamma: "ϝ",
			disin: "⋲",
			div: "÷",
			divide: "÷",
			divideontimes: "⋇",
			divonx: "⋇",
			djcy: "ђ",
			dlcorn: "⌞",
			dlcrop: "⌍",
			dollar: "$",
			dopf: "𝕕",
			dot: "˙",
			doteq: "≐",
			doteqdot: "≑",
			dotminus: "∸",
			dotplus: "∔",
			dotsquare: "⊡",
			doublebarwedge: "⌆",
			downarrow: "↓",
			downdownarrows: "⇊",
			downharpoonleft: "⇃",
			downharpoonright: "⇂",
			drbkarow: "⤐",
			drcorn: "⌟",
			drcrop: "⌌",
			dscr: "𝒹",
			dscy: "ѕ",
			dsol: "⧶",
			dstrok: "đ",
			dtdot: "⋱",
			dtri: "▿",
			dtrif: "▾",
			duarr: "⇵",
			duhar: "⥯",
			dwangle: "⦦",
			dzcy: "џ",
			dzigrarr: "⟿",
			eDDot: "⩷",
			eDot: "≑",
			eacute: "é",
			easter: "⩮",
			ecaron: "ě",
			ecir: "≖",
			ecirc: "ê",
			ecolon: "≕",
			ecy: "э",
			edot: "ė",
			ee: "ⅇ",
			efDot: "≒",
			efr: "𝔢",
			eg: "⪚",
			egrave: "è",
			egs: "⪖",
			egsdot: "⪘",
			el: "⪙",
			elinters: "⏧",
			ell: "ℓ",
			els: "⪕",
			elsdot: "⪗",
			emacr: "ē",
			empty: "∅",
			emptyset: "∅",
			emptyv: "∅",
			emsp13: " ",
			emsp14: " ",
			emsp: " ",
			eng: "ŋ",
			ensp: " ",
			eogon: "ę",
			eopf: "𝕖",
			epar: "⋕",
			eparsl: "⧣",
			eplus: "⩱",
			epsi: "ε",
			epsilon: "ε",
			epsiv: "ϵ",
			eqcirc: "≖",
			eqcolon: "≕",
			eqsim: "≂",
			eqslantgtr: "⪖",
			eqslantless: "⪕",
			equals: "=",
			equest: "≟",
			equiv: "≡",
			equivDD: "⩸",
			eqvparsl: "⧥",
			erDot: "≓",
			erarr: "⥱",
			escr: "ℯ",
			esdot: "≐",
			esim: "≂",
			eta: "η",
			eth: "ð",
			euml: "ë",
			euro: "€",
			excl: "!",
			exist: "∃",
			expectation: "ℰ",
			exponentiale: "ⅇ",
			fallingdotseq: "≒",
			fcy: "ф",
			female: "♀",
			ffilig: "ﬃ",
			fflig: "ﬀ",
			ffllig: "ﬄ",
			ffr: "𝔣",
			filig: "ﬁ",
			fjlig: "fj",
			flat: "♭",
			fllig: "ﬂ",
			fltns: "▱",
			fnof: "ƒ",
			fopf: "𝕗",
			forall: "∀",
			fork: "⋔",
			forkv: "⫙",
			fpartint: "⨍",
			frac12: "½",
			frac13: "⅓",
			frac14: "¼",
			frac15: "⅕",
			frac16: "⅙",
			frac18: "⅛",
			frac23: "⅔",
			frac25: "⅖",
			frac34: "¾",
			frac35: "⅗",
			frac38: "⅜",
			frac45: "⅘",
			frac56: "⅚",
			frac58: "⅝",
			frac78: "⅞",
			frasl: "⁄",
			frown: "⌢",
			fscr: "𝒻",
			gE: "≧",
			gEl: "⪌",
			gacute: "ǵ",
			gamma: "γ",
			gammad: "ϝ",
			gap: "⪆",
			gbreve: "ğ",
			gcirc: "ĝ",
			gcy: "г",
			gdot: "ġ",
			ge: "≥",
			gel: "⋛",
			geq: "≥",
			geqq: "≧",
			geqslant: "⩾",
			ges: "⩾",
			gescc: "⪩",
			gesdot: "⪀",
			gesdoto: "⪂",
			gesdotol: "⪄",
			gesl: "⋛︀",
			gesles: "⪔",
			gfr: "𝔤",
			gg: "≫",
			ggg: "⋙",
			gimel: "ℷ",
			gjcy: "ѓ",
			gl: "≷",
			glE: "⪒",
			gla: "⪥",
			glj: "⪤",
			gnE: "≩",
			gnap: "⪊",
			gnapprox: "⪊",
			gne: "⪈",
			gneq: "⪈",
			gneqq: "≩",
			gnsim: "⋧",
			gopf: "𝕘",
			grave: "`",
			gscr: "ℊ",
			gsim: "≳",
			gsime: "⪎",
			gsiml: "⪐",
			gt: ">",
			gtcc: "⪧",
			gtcir: "⩺",
			gtdot: "⋗",
			gtlPar: "⦕",
			gtquest: "⩼",
			gtrapprox: "⪆",
			gtrarr: "⥸",
			gtrdot: "⋗",
			gtreqless: "⋛",
			gtreqqless: "⪌",
			gtrless: "≷",
			gtrsim: "≳",
			gvertneqq: "≩︀",
			gvnE: "≩︀",
			hArr: "⇔",
			hairsp: " ",
			half: "½",
			hamilt: "ℋ",
			hardcy: "ъ",
			harr: "↔",
			harrcir: "⥈",
			harrw: "↭",
			hbar: "ℏ",
			hcirc: "ĥ",
			hearts: "♥",
			heartsuit: "♥",
			hellip: "…",
			hercon: "⊹",
			hfr: "𝔥",
			hksearow: "⤥",
			hkswarow: "⤦",
			hoarr: "⇿",
			homtht: "∻",
			hookleftarrow: "↩",
			hookrightarrow: "↪",
			hopf: "𝕙",
			horbar: "―",
			hscr: "𝒽",
			hslash: "ℏ",
			hstrok: "ħ",
			hybull: "⁃",
			hyphen: "‐",
			iacute: "í",
			ic: "⁣",
			icirc: "î",
			icy: "и",
			iecy: "е",
			iexcl: "¡",
			iff: "⇔",
			ifr: "𝔦",
			igrave: "ì",
			ii: "ⅈ",
			iiiint: "⨌",
			iiint: "∭",
			iinfin: "⧜",
			iiota: "℩",
			ijlig: "ĳ",
			imacr: "ī",
			image: "ℑ",
			imagline: "ℐ",
			imagpart: "ℑ",
			imath: "ı",
			imof: "⊷",
			imped: "Ƶ",
			in: "∈",
			incare: "℅",
			infin: "∞",
			infintie: "⧝",
			inodot: "ı",
			int: "∫",
			intcal: "⊺",
			integers: "ℤ",
			intercal: "⊺",
			intlarhk: "⨗",
			intprod: "⨼",
			iocy: "ё",
			iogon: "į",
			iopf: "𝕚",
			iota: "ι",
			iprod: "⨼",
			iquest: "¿",
			iscr: "𝒾",
			isin: "∈",
			isinE: "⋹",
			isindot: "⋵",
			isins: "⋴",
			isinsv: "⋳",
			isinv: "∈",
			it: "⁢",
			itilde: "ĩ",
			iukcy: "і",
			iuml: "ï",
			jcirc: "ĵ",
			jcy: "й",
			jfr: "𝔧",
			jmath: "ȷ",
			jopf: "𝕛",
			jscr: "𝒿",
			jsercy: "ј",
			jukcy: "є",
			kappa: "κ",
			kappav: "ϰ",
			kcedil: "ķ",
			kcy: "к",
			kfr: "𝔨",
			kgreen: "ĸ",
			khcy: "х",
			kjcy: "ќ",
			kopf: "𝕜",
			kscr: "𝓀",
			lAarr: "⇚",
			lArr: "⇐",
			lAtail: "⤛",
			lBarr: "⤎",
			lE: "≦",
			lEg: "⪋",
			lHar: "⥢",
			lacute: "ĺ",
			laemptyv: "⦴",
			lagran: "ℒ",
			lambda: "λ",
			lang: "⟨",
			langd: "⦑",
			langle: "⟨",
			lap: "⪅",
			laquo: "«",
			larr: "←",
			larrb: "⇤",
			larrbfs: "⤟",
			larrfs: "⤝",
			larrhk: "↩",
			larrlp: "↫",
			larrpl: "⤹",
			larrsim: "⥳",
			larrtl: "↢",
			lat: "⪫",
			latail: "⤙",
			late: "⪭",
			lates: "⪭︀",
			lbarr: "⤌",
			lbbrk: "❲",
			lbrace: "{",
			lbrack: "[",
			lbrke: "⦋",
			lbrksld: "⦏",
			lbrkslu: "⦍",
			lcaron: "ľ",
			lcedil: "ļ",
			lceil: "⌈",
			lcub: "{",
			lcy: "л",
			ldca: "⤶",
			ldquo: "“",
			ldquor: "„",
			ldrdhar: "⥧",
			ldrushar: "⥋",
			ldsh: "↲",
			le: "≤",
			leftarrow: "←",
			leftarrowtail: "↢",
			leftharpoondown: "↽",
			leftharpoonup: "↼",
			leftleftarrows: "⇇",
			leftrightarrow: "↔",
			leftrightarrows: "⇆",
			leftrightharpoons: "⇋",
			leftrightsquigarrow: "↭",
			leftthreetimes: "⋋",
			leg: "⋚",
			leq: "≤",
			leqq: "≦",
			leqslant: "⩽",
			les: "⩽",
			lescc: "⪨",
			lesdot: "⩿",
			lesdoto: "⪁",
			lesdotor: "⪃",
			lesg: "⋚︀",
			lesges: "⪓",
			lessapprox: "⪅",
			lessdot: "⋖",
			lesseqgtr: "⋚",
			lesseqqgtr: "⪋",
			lessgtr: "≶",
			lesssim: "≲",
			lfisht: "⥼",
			lfloor: "⌊",
			lfr: "𝔩",
			lg: "≶",
			lgE: "⪑",
			lhard: "↽",
			lharu: "↼",
			lharul: "⥪",
			lhblk: "▄",
			ljcy: "љ",
			ll: "≪",
			llarr: "⇇",
			llcorner: "⌞",
			llhard: "⥫",
			lltri: "◺",
			lmidot: "ŀ",
			lmoust: "⎰",
			lmoustache: "⎰",
			lnE: "≨",
			lnap: "⪉",
			lnapprox: "⪉",
			lne: "⪇",
			lneq: "⪇",
			lneqq: "≨",
			lnsim: "⋦",
			loang: "⟬",
			loarr: "⇽",
			lobrk: "⟦",
			longleftarrow: "⟵",
			longleftrightarrow: "⟷",
			longmapsto: "⟼",
			longrightarrow: "⟶",
			looparrowleft: "↫",
			looparrowright: "↬",
			lopar: "⦅",
			lopf: "𝕝",
			loplus: "⨭",
			lotimes: "⨴",
			lowast: "∗",
			lowbar: "_",
			loz: "◊",
			lozenge: "◊",
			lozf: "⧫",
			lpar: "(",
			lparlt: "⦓",
			lrarr: "⇆",
			lrcorner: "⌟",
			lrhar: "⇋",
			lrhard: "⥭",
			lrm: "‎",
			lrtri: "⊿",
			lsaquo: "‹",
			lscr: "𝓁",
			lsh: "↰",
			lsim: "≲",
			lsime: "⪍",
			lsimg: "⪏",
			lsqb: "[",
			lsquo: "‘",
			lsquor: "‚",
			lstrok: "ł",
			lt: "<",
			ltcc: "⪦",
			ltcir: "⩹",
			ltdot: "⋖",
			lthree: "⋋",
			ltimes: "⋉",
			ltlarr: "⥶",
			ltquest: "⩻",
			ltrPar: "⦖",
			ltri: "◃",
			ltrie: "⊴",
			ltrif: "◂",
			lurdshar: "⥊",
			luruhar: "⥦",
			lvertneqq: "≨︀",
			lvnE: "≨︀",
			mDDot: "∺",
			macr: "¯",
			male: "♂",
			malt: "✠",
			maltese: "✠",
			map: "↦",
			mapsto: "↦",
			mapstodown: "↧",
			mapstoleft: "↤",
			mapstoup: "↥",
			marker: "▮",
			mcomma: "⨩",
			mcy: "м",
			mdash: "—",
			measuredangle: "∡",
			mfr: "𝔪",
			mho: "℧",
			micro: "µ",
			mid: "∣",
			midast: "*",
			midcir: "⫰",
			middot: "·",
			minus: "−",
			minusb: "⊟",
			minusd: "∸",
			minusdu: "⨪",
			mlcp: "⫛",
			mldr: "…",
			mnplus: "∓",
			models: "⊧",
			mopf: "𝕞",
			mp: "∓",
			mscr: "𝓂",
			mstpos: "∾",
			mu: "μ",
			multimap: "⊸",
			mumap: "⊸",
			nGg: "⋙̸",
			nGt: "≫⃒",
			nGtv: "≫̸",
			nLeftarrow: "⇍",
			nLeftrightarrow: "⇎",
			nLl: "⋘̸",
			nLt: "≪⃒",
			nLtv: "≪̸",
			nRightarrow: "⇏",
			nVDash: "⊯",
			nVdash: "⊮",
			nabla: "∇",
			nacute: "ń",
			nang: "∠⃒",
			nap: "≉",
			napE: "⩰̸",
			napid: "≋̸",
			napos: "ŉ",
			napprox: "≉",
			natur: "♮",
			natural: "♮",
			naturals: "ℕ",
			nbsp: "\xA0",
			nbump: "≎̸",
			nbumpe: "≏̸",
			ncap: "⩃",
			ncaron: "ň",
			ncedil: "ņ",
			ncong: "≇",
			ncongdot: "⩭̸",
			ncup: "⩂",
			ncy: "н",
			ndash: "–",
			ne: "≠",
			neArr: "⇗",
			nearhk: "⤤",
			nearr: "↗",
			nearrow: "↗",
			nedot: "≐̸",
			nequiv: "≢",
			nesear: "⤨",
			nesim: "≂̸",
			nexist: "∄",
			nexists: "∄",
			nfr: "𝔫",
			ngE: "≧̸",
			nge: "≱",
			ngeq: "≱",
			ngeqq: "≧̸",
			ngeqslant: "⩾̸",
			nges: "⩾̸",
			ngsim: "≵",
			ngt: "≯",
			ngtr: "≯",
			nhArr: "⇎",
			nharr: "↮",
			nhpar: "⫲",
			ni: "∋",
			nis: "⋼",
			nisd: "⋺",
			niv: "∋",
			njcy: "њ",
			nlArr: "⇍",
			nlE: "≦̸",
			nlarr: "↚",
			nldr: "‥",
			nle: "≰",
			nleftarrow: "↚",
			nleftrightarrow: "↮",
			nleq: "≰",
			nleqq: "≦̸",
			nleqslant: "⩽̸",
			nles: "⩽̸",
			nless: "≮",
			nlsim: "≴",
			nlt: "≮",
			nltri: "⋪",
			nltrie: "⋬",
			nmid: "∤",
			nopf: "𝕟",
			not: "¬",
			notin: "∉",
			notinE: "⋹̸",
			notindot: "⋵̸",
			notinva: "∉",
			notinvb: "⋷",
			notinvc: "⋶",
			notni: "∌",
			notniva: "∌",
			notnivb: "⋾",
			notnivc: "⋽",
			npar: "∦",
			nparallel: "∦",
			nparsl: "⫽⃥",
			npart: "∂̸",
			npolint: "⨔",
			npr: "⊀",
			nprcue: "⋠",
			npre: "⪯̸",
			nprec: "⊀",
			npreceq: "⪯̸",
			nrArr: "⇏",
			nrarr: "↛",
			nrarrc: "⤳̸",
			nrarrw: "↝̸",
			nrightarrow: "↛",
			nrtri: "⋫",
			nrtrie: "⋭",
			nsc: "⊁",
			nsccue: "⋡",
			nsce: "⪰̸",
			nscr: "𝓃",
			nshortmid: "∤",
			nshortparallel: "∦",
			nsim: "≁",
			nsime: "≄",
			nsimeq: "≄",
			nsmid: "∤",
			nspar: "∦",
			nsqsube: "⋢",
			nsqsupe: "⋣",
			nsub: "⊄",
			nsubE: "⫅̸",
			nsube: "⊈",
			nsubset: "⊂⃒",
			nsubseteq: "⊈",
			nsubseteqq: "⫅̸",
			nsucc: "⊁",
			nsucceq: "⪰̸",
			nsup: "⊅",
			nsupE: "⫆̸",
			nsupe: "⊉",
			nsupset: "⊃⃒",
			nsupseteq: "⊉",
			nsupseteqq: "⫆̸",
			ntgl: "≹",
			ntilde: "ñ",
			ntlg: "≸",
			ntriangleleft: "⋪",
			ntrianglelefteq: "⋬",
			ntriangleright: "⋫",
			ntrianglerighteq: "⋭",
			nu: "ν",
			num: "#",
			numero: "№",
			numsp: " ",
			nvDash: "⊭",
			nvHarr: "⤄",
			nvap: "≍⃒",
			nvdash: "⊬",
			nvge: "≥⃒",
			nvgt: ">⃒",
			nvinfin: "⧞",
			nvlArr: "⤂",
			nvle: "≤⃒",
			nvlt: "<⃒",
			nvltrie: "⊴⃒",
			nvrArr: "⤃",
			nvrtrie: "⊵⃒",
			nvsim: "∼⃒",
			nwArr: "⇖",
			nwarhk: "⤣",
			nwarr: "↖",
			nwarrow: "↖",
			nwnear: "⤧",
			oS: "Ⓢ",
			oacute: "ó",
			oast: "⊛",
			ocir: "⊚",
			ocirc: "ô",
			ocy: "о",
			odash: "⊝",
			odblac: "ő",
			odiv: "⨸",
			odot: "⊙",
			odsold: "⦼",
			oelig: "œ",
			ofcir: "⦿",
			ofr: "𝔬",
			ogon: "˛",
			ograve: "ò",
			ogt: "⧁",
			ohbar: "⦵",
			ohm: "Ω",
			oint: "∮",
			olarr: "↺",
			olcir: "⦾",
			olcross: "⦻",
			oline: "‾",
			olt: "⧀",
			omacr: "ō",
			omega: "ω",
			omicron: "ο",
			omid: "⦶",
			ominus: "⊖",
			oopf: "𝕠",
			opar: "⦷",
			operp: "⦹",
			oplus: "⊕",
			or: "∨",
			orarr: "↻",
			ord: "⩝",
			order: "ℴ",
			orderof: "ℴ",
			ordf: "ª",
			ordm: "º",
			origof: "⊶",
			oror: "⩖",
			orslope: "⩗",
			orv: "⩛",
			oscr: "ℴ",
			oslash: "ø",
			osol: "⊘",
			otilde: "õ",
			otimes: "⊗",
			otimesas: "⨶",
			ouml: "ö",
			ovbar: "⌽",
			par: "∥",
			para: "¶",
			parallel: "∥",
			parsim: "⫳",
			parsl: "⫽",
			part: "∂",
			pcy: "п",
			percnt: "%",
			period: ".",
			permil: "‰",
			perp: "⊥",
			pertenk: "‱",
			pfr: "𝔭",
			phi: "φ",
			phiv: "ϕ",
			phmmat: "ℳ",
			phone: "☎",
			pi: "π",
			pitchfork: "⋔",
			piv: "ϖ",
			planck: "ℏ",
			planckh: "ℎ",
			plankv: "ℏ",
			plus: "+",
			plusacir: "⨣",
			plusb: "⊞",
			pluscir: "⨢",
			plusdo: "∔",
			plusdu: "⨥",
			pluse: "⩲",
			plusmn: "±",
			plussim: "⨦",
			plustwo: "⨧",
			pm: "±",
			pointint: "⨕",
			popf: "𝕡",
			pound: "£",
			pr: "≺",
			prE: "⪳",
			prap: "⪷",
			prcue: "≼",
			pre: "⪯",
			prec: "≺",
			precapprox: "⪷",
			preccurlyeq: "≼",
			preceq: "⪯",
			precnapprox: "⪹",
			precneqq: "⪵",
			precnsim: "⋨",
			precsim: "≾",
			prime: "′",
			primes: "ℙ",
			prnE: "⪵",
			prnap: "⪹",
			prnsim: "⋨",
			prod: "∏",
			profalar: "⌮",
			profline: "⌒",
			profsurf: "⌓",
			prop: "∝",
			propto: "∝",
			prsim: "≾",
			prurel: "⊰",
			pscr: "𝓅",
			psi: "ψ",
			puncsp: " ",
			qfr: "𝔮",
			qint: "⨌",
			qopf: "𝕢",
			qprime: "⁗",
			qscr: "𝓆",
			quaternions: "ℍ",
			quatint: "⨖",
			quest: "?",
			questeq: "≟",
			quot: "\"",
			rAarr: "⇛",
			rArr: "⇒",
			rAtail: "⤜",
			rBarr: "⤏",
			rHar: "⥤",
			race: "∽̱",
			racute: "ŕ",
			radic: "√",
			raemptyv: "⦳",
			rang: "⟩",
			rangd: "⦒",
			range: "⦥",
			rangle: "⟩",
			raquo: "»",
			rarr: "→",
			rarrap: "⥵",
			rarrb: "⇥",
			rarrbfs: "⤠",
			rarrc: "⤳",
			rarrfs: "⤞",
			rarrhk: "↪",
			rarrlp: "↬",
			rarrpl: "⥅",
			rarrsim: "⥴",
			rarrtl: "↣",
			rarrw: "↝",
			ratail: "⤚",
			ratio: "∶",
			rationals: "ℚ",
			rbarr: "⤍",
			rbbrk: "❳",
			rbrace: "}",
			rbrack: "]",
			rbrke: "⦌",
			rbrksld: "⦎",
			rbrkslu: "⦐",
			rcaron: "ř",
			rcedil: "ŗ",
			rceil: "⌉",
			rcub: "}",
			rcy: "р",
			rdca: "⤷",
			rdldhar: "⥩",
			rdquo: "”",
			rdquor: "”",
			rdsh: "↳",
			real: "ℜ",
			realine: "ℛ",
			realpart: "ℜ",
			reals: "ℝ",
			rect: "▭",
			reg: "®",
			rfisht: "⥽",
			rfloor: "⌋",
			rfr: "𝔯",
			rhard: "⇁",
			rharu: "⇀",
			rharul: "⥬",
			rho: "ρ",
			rhov: "ϱ",
			rightarrow: "→",
			rightarrowtail: "↣",
			rightharpoondown: "⇁",
			rightharpoonup: "⇀",
			rightleftarrows: "⇄",
			rightleftharpoons: "⇌",
			rightrightarrows: "⇉",
			rightsquigarrow: "↝",
			rightthreetimes: "⋌",
			ring: "˚",
			risingdotseq: "≓",
			rlarr: "⇄",
			rlhar: "⇌",
			rlm: "‏",
			rmoust: "⎱",
			rmoustache: "⎱",
			rnmid: "⫮",
			roang: "⟭",
			roarr: "⇾",
			robrk: "⟧",
			ropar: "⦆",
			ropf: "𝕣",
			roplus: "⨮",
			rotimes: "⨵",
			rpar: ")",
			rpargt: "⦔",
			rppolint: "⨒",
			rrarr: "⇉",
			rsaquo: "›",
			rscr: "𝓇",
			rsh: "↱",
			rsqb: "]",
			rsquo: "’",
			rsquor: "’",
			rthree: "⋌",
			rtimes: "⋊",
			rtri: "▹",
			rtrie: "⊵",
			rtrif: "▸",
			rtriltri: "⧎",
			ruluhar: "⥨",
			rx: "℞",
			sacute: "ś",
			sbquo: "‚",
			sc: "≻",
			scE: "⪴",
			scap: "⪸",
			scaron: "š",
			sccue: "≽",
			sce: "⪰",
			scedil: "ş",
			scirc: "ŝ",
			scnE: "⪶",
			scnap: "⪺",
			scnsim: "⋩",
			scpolint: "⨓",
			scsim: "≿",
			scy: "с",
			sdot: "⋅",
			sdotb: "⊡",
			sdote: "⩦",
			seArr: "⇘",
			searhk: "⤥",
			searr: "↘",
			searrow: "↘",
			sect: "§",
			semi: ";",
			seswar: "⤩",
			setminus: "∖",
			setmn: "∖",
			sext: "✶",
			sfr: "𝔰",
			sfrown: "⌢",
			sharp: "♯",
			shchcy: "щ",
			shcy: "ш",
			shortmid: "∣",
			shortparallel: "∥",
			shy: "­",
			sigma: "σ",
			sigmaf: "ς",
			sigmav: "ς",
			sim: "∼",
			simdot: "⩪",
			sime: "≃",
			simeq: "≃",
			simg: "⪞",
			simgE: "⪠",
			siml: "⪝",
			simlE: "⪟",
			simne: "≆",
			simplus: "⨤",
			simrarr: "⥲",
			slarr: "←",
			smallsetminus: "∖",
			smashp: "⨳",
			smeparsl: "⧤",
			smid: "∣",
			smile: "⌣",
			smt: "⪪",
			smte: "⪬",
			smtes: "⪬︀",
			softcy: "ь",
			sol: "/",
			solb: "⧄",
			solbar: "⌿",
			sopf: "𝕤",
			spades: "♠",
			spadesuit: "♠",
			spar: "∥",
			sqcap: "⊓",
			sqcaps: "⊓︀",
			sqcup: "⊔",
			sqcups: "⊔︀",
			sqsub: "⊏",
			sqsube: "⊑",
			sqsubset: "⊏",
			sqsubseteq: "⊑",
			sqsup: "⊐",
			sqsupe: "⊒",
			sqsupset: "⊐",
			sqsupseteq: "⊒",
			squ: "□",
			square: "□",
			squarf: "▪",
			squf: "▪",
			srarr: "→",
			sscr: "𝓈",
			ssetmn: "∖",
			ssmile: "⌣",
			sstarf: "⋆",
			star: "☆",
			starf: "★",
			straightepsilon: "ϵ",
			straightphi: "ϕ",
			strns: "¯",
			sub: "⊂",
			subE: "⫅",
			subdot: "⪽",
			sube: "⊆",
			subedot: "⫃",
			submult: "⫁",
			subnE: "⫋",
			subne: "⊊",
			subplus: "⪿",
			subrarr: "⥹",
			subset: "⊂",
			subseteq: "⊆",
			subseteqq: "⫅",
			subsetneq: "⊊",
			subsetneqq: "⫋",
			subsim: "⫇",
			subsub: "⫕",
			subsup: "⫓",
			succ: "≻",
			succapprox: "⪸",
			succcurlyeq: "≽",
			succeq: "⪰",
			succnapprox: "⪺",
			succneqq: "⪶",
			succnsim: "⋩",
			succsim: "≿",
			sum: "∑",
			sung: "♪",
			sup1: "¹",
			sup2: "²",
			sup3: "³",
			sup: "⊃",
			supE: "⫆",
			supdot: "⪾",
			supdsub: "⫘",
			supe: "⊇",
			supedot: "⫄",
			suphsol: "⟉",
			suphsub: "⫗",
			suplarr: "⥻",
			supmult: "⫂",
			supnE: "⫌",
			supne: "⊋",
			supplus: "⫀",
			supset: "⊃",
			supseteq: "⊇",
			supseteqq: "⫆",
			supsetneq: "⊋",
			supsetneqq: "⫌",
			supsim: "⫈",
			supsub: "⫔",
			supsup: "⫖",
			swArr: "⇙",
			swarhk: "⤦",
			swarr: "↙",
			swarrow: "↙",
			swnwar: "⤪",
			szlig: "ß",
			target: "⌖",
			tau: "τ",
			tbrk: "⎴",
			tcaron: "ť",
			tcedil: "ţ",
			tcy: "т",
			tdot: "⃛",
			telrec: "⌕",
			tfr: "𝔱",
			there4: "∴",
			therefore: "∴",
			theta: "θ",
			thetasym: "ϑ",
			thetav: "ϑ",
			thickapprox: "≈",
			thicksim: "∼",
			thinsp: " ",
			thkap: "≈",
			thksim: "∼",
			thorn: "þ",
			tilde: "˜",
			times: "×",
			timesb: "⊠",
			timesbar: "⨱",
			timesd: "⨰",
			tint: "∭",
			toea: "⤨",
			top: "⊤",
			topbot: "⌶",
			topcir: "⫱",
			topf: "𝕥",
			topfork: "⫚",
			tosa: "⤩",
			tprime: "‴",
			trade: "™",
			triangle: "▵",
			triangledown: "▿",
			triangleleft: "◃",
			trianglelefteq: "⊴",
			triangleq: "≜",
			triangleright: "▹",
			trianglerighteq: "⊵",
			tridot: "◬",
			trie: "≜",
			triminus: "⨺",
			triplus: "⨹",
			trisb: "⧍",
			tritime: "⨻",
			trpezium: "⏢",
			tscr: "𝓉",
			tscy: "ц",
			tshcy: "ћ",
			tstrok: "ŧ",
			twixt: "≬",
			twoheadleftarrow: "↞",
			twoheadrightarrow: "↠",
			uArr: "⇑",
			uHar: "⥣",
			uacute: "ú",
			uarr: "↑",
			ubrcy: "ў",
			ubreve: "ŭ",
			ucirc: "û",
			ucy: "у",
			udarr: "⇅",
			udblac: "ű",
			udhar: "⥮",
			ufisht: "⥾",
			ufr: "𝔲",
			ugrave: "ù",
			uharl: "↿",
			uharr: "↾",
			uhblk: "▀",
			ulcorn: "⌜",
			ulcorner: "⌜",
			ulcrop: "⌏",
			ultri: "◸",
			umacr: "ū",
			uml: "¨",
			uogon: "ų",
			uopf: "𝕦",
			uparrow: "↑",
			updownarrow: "↕",
			upharpoonleft: "↿",
			upharpoonright: "↾",
			uplus: "⊎",
			upsi: "υ",
			upsih: "ϒ",
			upsilon: "υ",
			upuparrows: "⇈",
			urcorn: "⌝",
			urcorner: "⌝",
			urcrop: "⌎",
			uring: "ů",
			urtri: "◹",
			uscr: "𝓊",
			utdot: "⋰",
			utilde: "ũ",
			utri: "▵",
			utrif: "▴",
			uuarr: "⇈",
			uuml: "ü",
			uwangle: "⦧",
			vArr: "⇕",
			vBar: "⫨",
			vBarv: "⫩",
			vDash: "⊨",
			vangrt: "⦜",
			varepsilon: "ϵ",
			varkappa: "ϰ",
			varnothing: "∅",
			varphi: "ϕ",
			varpi: "ϖ",
			varpropto: "∝",
			varr: "↕",
			varrho: "ϱ",
			varsigma: "ς",
			varsubsetneq: "⊊︀",
			varsubsetneqq: "⫋︀",
			varsupsetneq: "⊋︀",
			varsupsetneqq: "⫌︀",
			vartheta: "ϑ",
			vartriangleleft: "⊲",
			vartriangleright: "⊳",
			vcy: "в",
			vdash: "⊢",
			vee: "∨",
			veebar: "⊻",
			veeeq: "≚",
			vellip: "⋮",
			verbar: "|",
			vert: "|",
			vfr: "𝔳",
			vltri: "⊲",
			vnsub: "⊂⃒",
			vnsup: "⊃⃒",
			vopf: "𝕧",
			vprop: "∝",
			vrtri: "⊳",
			vscr: "𝓋",
			vsubnE: "⫋︀",
			vsubne: "⊊︀",
			vsupnE: "⫌︀",
			vsupne: "⊋︀",
			vzigzag: "⦚",
			wcirc: "ŵ",
			wedbar: "⩟",
			wedge: "∧",
			wedgeq: "≙",
			weierp: "℘",
			wfr: "𝔴",
			wopf: "𝕨",
			wp: "℘",
			wr: "≀",
			wreath: "≀",
			wscr: "𝓌",
			xcap: "⋂",
			xcirc: "◯",
			xcup: "⋃",
			xdtri: "▽",
			xfr: "𝔵",
			xhArr: "⟺",
			xharr: "⟷",
			xi: "ξ",
			xlArr: "⟸",
			xlarr: "⟵",
			xmap: "⟼",
			xnis: "⋻",
			xodot: "⨀",
			xopf: "𝕩",
			xoplus: "⨁",
			xotime: "⨂",
			xrArr: "⟹",
			xrarr: "⟶",
			xscr: "𝓍",
			xsqcup: "⨆",
			xuplus: "⨄",
			xutri: "△",
			xvee: "⋁",
			xwedge: "⋀",
			yacute: "ý",
			yacy: "я",
			ycirc: "ŷ",
			ycy: "ы",
			yen: "¥",
			yfr: "𝔶",
			yicy: "ї",
			yopf: "𝕪",
			yscr: "𝓎",
			yucy: "ю",
			yuml: "ÿ",
			zacute: "ź",
			zcaron: "ž",
			zcy: "з",
			zdot: "ż",
			zeetrf: "ℨ",
			zeta: "ζ",
			zfr: "𝔷",
			zhcy: "ж",
			zigrarr: "⇝",
			zopf: "𝕫",
			zscr: "𝓏",
			zwj: "‍",
			zwnj: "‌"
		};
		//#endregion
		//#region node_modules/decode-named-character-reference/index.js
		const own$1 = {}.hasOwnProperty;
		/**
		* Decode a single character reference (without the `&` or `;`).
		* You probably only need this when you’re building parsers yourself that follow
		* different rules compared to HTML.
		* This is optimized to be tiny in browsers.
		*
		* @param {string} value
		*   `notin` (named), `#123` (deci), `#x123` (hexa).
		* @returns {string|false}
		*   Decoded reference.
		*/
		function decodeNamedCharacterReference(value) {
			return own$1.call(characterEntities, value) ? characterEntities[value] : false;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/character-reference.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterReference = {
			name: "characterReference",
			tokenize: tokenizeCharacterReference
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterReference(effects, ok, nok) {
			const self = this;
			let size = 0;
			/** @type {number} */
			let max;
			/** @type {(code: Code) => boolean} */
			let test;
			return start;
			/**
			* Start of character reference.
			*
			* ```markdown
			* > | a&amp;b
			*      ^
			* > | a&#123;b
			*      ^
			* > | a&#x9;b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterReference");
				effects.enter("characterReferenceMarker");
				effects.consume(code);
				effects.exit("characterReferenceMarker");
				return open;
			}
			/**
			* After `&`, at `#` for numeric references or alphanumeric for named
			* references.
			*
			* ```markdown
			* > | a&amp;b
			*       ^
			* > | a&#123;b
			*       ^
			* > | a&#x9;b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 35) {
					effects.enter("characterReferenceMarkerNumeric");
					effects.consume(code);
					effects.exit("characterReferenceMarkerNumeric");
					return numeric;
				}
				effects.enter("characterReferenceValue");
				max = 31;
				test = asciiAlphanumeric;
				return value(code);
			}
			/**
			* After `#`, at `x` for hexadecimals or digit for decimals.
			*
			* ```markdown
			* > | a&#123;b
			*        ^
			* > | a&#x9;b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function numeric(code) {
				if (code === 88 || code === 120) {
					effects.enter("characterReferenceMarkerHexadecimal");
					effects.consume(code);
					effects.exit("characterReferenceMarkerHexadecimal");
					effects.enter("characterReferenceValue");
					max = 6;
					test = asciiHexDigit;
					return value;
				}
				effects.enter("characterReferenceValue");
				max = 7;
				test = asciiDigit;
				return value(code);
			}
			/**
			* After markers (`&#x`, `&#`, or `&`), in value, before `;`.
			*
			* The character reference kind defines what and how many characters are
			* allowed.
			*
			* ```markdown
			* > | a&amp;b
			*       ^^^
			* > | a&#123;b
			*        ^^^
			* > | a&#x9;b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function value(code) {
				if (code === 59 && size) {
					const token = effects.exit("characterReferenceValue");
					if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) return nok(code);
					effects.enter("characterReferenceMarker");
					effects.consume(code);
					effects.exit("characterReferenceMarker");
					effects.exit("characterReference");
					return ok;
				}
				if (test(code) && size++ < max) {
					effects.consume(code);
					return value;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/partial-non-lazy-continuation.js
		/** @type {Construct} */
		const nonLazyContinuation = {
			partial: true,
			tokenize: tokenizeNonLazyContinuation
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeNonLazyContinuation(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* At eol, before continuation.
			*
			* ```markdown
			* > | * ```js
			*            ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === null) return nok(code);
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return after;
			}
			/**
			* A continuation.
			*
			* ```markdown
			*   | * ```js
			* > | b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-fenced.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeFenced = {
			concrete: true,
			name: "codeFenced",
			tokenize: tokenizeCodeFenced
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeFenced(effects, ok, nok) {
			const self = this;
			/** @type {Construct} */
			const closeStart = {
				partial: true,
				tokenize: tokenizeCloseStart
			};
			let initialPrefix = 0;
			let sizeOpen = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of code.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return beforeSequenceOpen(code);
			}
			/**
			* In opening fence, after prefix, at sequence.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeSequenceOpen(code) {
				const tail = self.events[self.events.length - 1];
				initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
				marker = code;
				effects.enter("codeFenced");
				effects.enter("codeFencedFence");
				effects.enter("codeFencedFenceSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening fence sequence.
			*
			* ```markdown
			* > | ~~~js
			*      ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === marker) {
					sizeOpen++;
					effects.consume(code);
					return sequenceOpen;
				}
				if (sizeOpen < 3) return nok(code);
				effects.exit("codeFencedFenceSequence");
				return markdownSpace(code) ? factorySpace(effects, infoBefore, "whitespace")(code) : infoBefore(code);
			}
			/**
			* In opening fence, after the sequence (and optional whitespace), before info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function infoBefore(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFencedFence");
					return self.interrupt ? ok(code) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				}
				effects.enter("codeFencedFenceInfo");
				effects.enter("chunkString", { contentType: "string" });
				return info(code);
			}
			/**
			* In info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function info(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return infoBefore(code);
				}
				if (markdownSpace(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return factorySpace(effects, metaBefore, "whitespace")(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return info;
			}
			/**
			* In opening fence, after info and whitespace, before meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function metaBefore(code) {
				if (code === null || markdownLineEnding(code)) return infoBefore(code);
				effects.enter("codeFencedFenceMeta");
				effects.enter("chunkString", { contentType: "string" });
				return meta(code);
			}
			/**
			* In meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function meta(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceMeta");
					return infoBefore(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return meta;
			}
			/**
			* At eol/eof in code, before a non-lazy closing fence or content.
			*
			* ```markdown
			* > | ~~~js
			*          ^
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function atNonLazyBreak(code) {
				return effects.attempt(closeStart, after, contentBefore)(code);
			}
			/**
			* Before code content, not a closing fence, at eol.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentBefore(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return contentStart;
			}
			/**
			* Before code content, not a closing fence.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentStart(code) {
				return initialPrefix > 0 && markdownSpace(code) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code) : beforeContentChunk(code);
			}
			/**
			* Before code content, after optional prefix.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeContentChunk(code) {
				if (code === null || markdownLineEnding(code)) return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				effects.enter("codeFlowValue");
				return contentChunk(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^^^^^^^^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentChunk(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return beforeContentChunk(code);
				}
				effects.consume(code);
				return contentChunk;
			}
			/**
			* After code.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*        ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				effects.exit("codeFenced");
				return ok(code);
			}
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Tokenizer}
			*/
			function tokenizeCloseStart(effects, ok, nok) {
				let size = 0;
				return startBefore;
				/**
				*
				*
				* @type {State}
				*/
				function startBefore(code) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return start;
				}
				/**
				* Before closing fence, at optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function start(code) {
					effects.enter("codeFencedFence");
					return markdownSpace(code) ? factorySpace(effects, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : beforeSequenceClose(code);
				}
				/**
				* In closing fence, after optional whitespace, at sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function beforeSequenceClose(code) {
					if (code === marker) {
						effects.enter("codeFencedFenceSequence");
						return sequenceClose(code);
					}
					return nok(code);
				}
				/**
				* In closing fence sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function sequenceClose(code) {
					if (code === marker) {
						size++;
						effects.consume(code);
						return sequenceClose;
					}
					if (size >= sizeOpen) {
						effects.exit("codeFencedFenceSequence");
						return markdownSpace(code) ? factorySpace(effects, sequenceCloseAfter, "whitespace")(code) : sequenceCloseAfter(code);
					}
					return nok(code);
				}
				/**
				* After closing fence sequence, after optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*        ^
				* ```
				*
				* @type {State}
				*/
				function sequenceCloseAfter(code) {
					if (code === null || markdownLineEnding(code)) {
						effects.exit("codeFencedFence");
						return ok(code);
					}
					return nok(code);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-indented.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeIndented = {
			name: "codeIndented",
			tokenize: tokenizeCodeIndented
		};
		/** @type {Construct} */
		const furtherStart = {
			partial: true,
			tokenize: tokenizeFurtherStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeIndented(effects, ok, nok) {
			return start;
			/**
			* Start of code (indented).
			*
			* > **Parsing note**: it is not needed to check if this first line is a
			* > filled line (that it has a non-whitespace character), because blank lines
			* > are parsed already, so we never run into that.
			*
			* ```markdown
			* > |     aaa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeIndented");
				return factorySpaceMinMax(effects, atBreak, nok, "linePrefix", 4, 4)(code);
			}
			/**
			* At a break.
			*
			* ```markdown
			* > |     aaa
			*         ^  ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === null) return after(code);
				if (markdownLineEnding(code)) return effects.attempt(furtherStart, atBreak, after)(code);
				effects.enter("codeFlowValue");
				return inside(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			* > |     aaa
			*         ^^^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return atBreak(code);
				}
				effects.consume(code);
				return inside;
			}
			/** @type {State} */
			function after(code) {
				effects.exit("codeIndented");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeFurtherStart(effects, ok, nok) {
			const self = this;
			return furtherStart;
			/**
			* At eol, trying to parse another indent.
			*
			* ```markdown
			* > |     aaa
			*            ^
			*   |     bbb
			* ```
			*
			* @type {State}
			*/
			function furtherStart(code) {
				if (self.parser.lazy[self.now().line]) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return furtherStart;
				}
				return factorySpaceMinMax(effects, ok, onNotEnoughPrefix, "linePrefix", 4, 4)(code);
			}
			/**
			* After not enough of a prefix.
			*
			* A following line ending is another (potentially blank) line to try,
			* anything else means this isn’t a continuation.
			*
			* ```markdown
			* > |     aaa
			*
			*   |     bbb
			* ```
			*
			* @type {State}
			*/
			function onNotEnoughPrefix(code) {
				return markdownLineEnding(code) ? furtherStart(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-text.js
		/**
		* @import {
		*   Construct,
		*   Previous,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeText = {
			name: "codeText",
			previous: previous$1,
			resolve: resolveCodeText,
			tokenize: tokenizeCodeText
		};
		/** @type {Resolver} */
		function resolveCodeText(events) {
			let tailExitIndex = events.length - 4;
			let headEnterIndex = 3;
			/** @type {number} */
			let index;
			/** @type {number | undefined} */
			let enter;
			if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
				index = headEnterIndex;
				while (++index < tailExitIndex) if (events[index][1].type === "codeTextData") {
					events[headEnterIndex][1].type = "codeTextPadding";
					events[tailExitIndex][1].type = "codeTextPadding";
					headEnterIndex += 2;
					tailExitIndex -= 2;
					break;
				}
			}
			index = headEnterIndex - 1;
			tailExitIndex++;
			while (++index <= tailExitIndex) if (enter === void 0) {
				if (index !== tailExitIndex && events[index][1].type !== "lineEnding") enter = index;
			} else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
				events[enter][1].type = "codeTextData";
				if (index !== enter + 2) {
					events[enter][1].end = events[index - 1][1].end;
					events.splice(enter + 2, index - enter - 2);
					tailExitIndex -= index - enter - 2;
					index = enter + 2;
				}
				enter = void 0;
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Previous}
		*/
		function previous$1(code) {
			return code !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeText(effects, ok, nok) {
			let sizeOpen = 0;
			/** @type {number} */
			let size;
			/** @type {Token} */
			let token;
			return start;
			/**
			* Start of code (text).
			*
			* ```markdown
			* > | `a`
			*     ^
			* > | \`a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeText");
				effects.enter("codeTextSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | `a`
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 96) {
					effects.consume(code);
					sizeOpen++;
					return sequenceOpen;
				}
				effects.exit("codeTextSequence");
				return between(code);
			}
			/**
			* Between something and something else.
			*
			* ```markdown
			* > | `a`
			*      ^^
			* ```
			*
			* @type {State}
			*/
			function between(code) {
				if (code === null) return nok(code);
				if (code === 32) {
					effects.enter("space");
					effects.consume(code);
					effects.exit("space");
					return between;
				}
				if (code === 96) {
					token = effects.enter("codeTextSequence");
					size = 0;
					return sequenceClose(code);
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return between;
				}
				effects.enter("codeTextData");
				return data(code);
			}
			/**
			* In data.
			*
			* ```markdown
			* > | `a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 32 || code === 96 || markdownLineEnding(code)) {
					effects.exit("codeTextData");
					return between(code);
				}
				effects.consume(code);
				return data;
			}
			/**
			* In closing sequence.
			*
			* ```markdown
			* > | `a`
			*       ^
			* ```
			*
			* @type {State}
			*/
			function sequenceClose(code) {
				if (code === 96) {
					effects.consume(code);
					size++;
					return sequenceClose;
				}
				if (size === sizeOpen) {
					effects.exit("codeTextSequence");
					effects.exit("codeText");
					return ok(code);
				}
				token.type = "codeTextData";
				return data(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-util-subtokenize/index.js
		/**
		* @typedef {import('micromark-util-types').Chunk} Chunk
		* @typedef {import('micromark-util-types').Event} Event
		* @typedef {import('micromark-util-types').Token} Token
		*/
		/**
		* Tokenize subcontent.
		*
		* @param {Array<Event>} events
		*   List of events.
		* @returns {boolean}
		*   Whether subtokens were found.
		*/ function subtokenize(events) {
			/** @type {Record<string, number>} */
			const jumps = {};
			let index = -1;
			/** @type {Event} */
			let event;
			/** @type {number | undefined} */
			let lineIndex;
			/** @type {number} */
			let otherIndex;
			/** @type {Event} */
			let otherEvent;
			/** @type {Array<Event>} */
			let parameters;
			/** @type {Array<Event>} */
			let subevents;
			/** @type {boolean | undefined} */
			let more;
			while (++index < events.length) {
				while (index in jumps) index = jumps[index];
				event = events[index];
				if (index && event[1].type === "chunkFlow" && events[index - 1][1].type === "listItemPrefix") {
					subevents = event[1]._tokenizer.events;
					otherIndex = 0;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") otherIndex += 2;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") while (++otherIndex < subevents.length) {
						if (subevents[otherIndex][1].type === "content") break;
						if (subevents[otherIndex][1].type === "chunkText") {
							subevents[otherIndex][1]._isInFirstContentOfListItem = true;
							otherIndex++;
						}
					}
				}
				if (event[0] === "enter") {
					if (event[1].contentType) {
						Object.assign(jumps, subcontent(events, index));
						index = jumps[index];
						more = true;
					}
				} else if (event[1]._container) {
					otherIndex = index;
					lineIndex = void 0;
					while (otherIndex--) {
						otherEvent = events[otherIndex];
						if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
							if (otherEvent[0] === "enter") {
								if (lineIndex) events[lineIndex][1].type = "lineEndingBlank";
								otherEvent[1].type = "lineEnding";
								lineIndex = otherIndex;
							}
						} else break;
					}
					if (lineIndex) {
						event[1].end = Object.assign({}, events[lineIndex][1].start);
						parameters = events.slice(lineIndex, index);
						parameters.unshift(event);
						splice(events, lineIndex, index - lineIndex + 1, parameters);
					}
				}
			}
			return !more;
		}
		/**
		* Tokenize embedded tokens.
		*
		* @param {Array<Event>} events
		* @param {number} eventIndex
		* @returns {Record<string, number>}
		*/
		function subcontent(events, eventIndex) {
			const token = events[eventIndex][1];
			const context = events[eventIndex][2];
			let startPosition = eventIndex - 1;
			/** @type {Array<number>} */
			const startPositions = [];
			const tokenizer = token._tokenizer || context.parser[token.contentType](token.start);
			const childEvents = tokenizer.events;
			/** @type {Array<[number, number]>} */
			const jumps = [];
			/** @type {Record<string, number>} */
			const gaps = {};
			/** @type {Array<Chunk>} */
			let stream;
			/** @type {Token | undefined} */
			let previous;
			let index = -1;
			/** @type {Token | undefined} */
			let current = token;
			let adjust = 0;
			let start = 0;
			const breaks = [start];
			while (current) {
				while (events[++startPosition][1] !== current);
				startPositions.push(startPosition);
				if (!current._tokenizer) {
					stream = context.sliceStream(current);
					if (!current.next) stream.push(null);
					if (previous) tokenizer.defineSkip(current.start);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = true;
					tokenizer.write(stream);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = void 0;
				}
				previous = current;
				current = current.next;
			}
			current = token;
			while (++index < childEvents.length) if (childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line) {
				start = index + 1;
				breaks.push(start);
				current._tokenizer = void 0;
				current.previous = void 0;
				current = current.next;
			}
			tokenizer.events = [];
			if (current) {
				current._tokenizer = void 0;
				current.previous = void 0;
			} else breaks.pop();
			index = breaks.length;
			while (index--) {
				const slice = childEvents.slice(breaks[index], breaks[index + 1]);
				const start = startPositions.pop();
				jumps.unshift([start, start + slice.length - 1]);
				splice(events, start, 2, slice);
			}
			index = -1;
			while (++index < jumps.length) {
				gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
				adjust += jumps[index][1] - jumps[index][0] - 1;
			}
			return gaps;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/content.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* No name because it must not be turned off.
		* @type {Construct}
		*/
		const content = {
			resolve: resolveContent,
			tokenize: tokenizeContent
		};
		/** @type {Construct} */
		const continuationConstruct = {
			partial: true,
			tokenize: tokenizeContinuation
		};
		/**
		* Content is transparent: it’s parsed right now. That way, definitions are also
		* parsed right now: before text in paragraphs (specifically, media) are parsed.
		*
		* @type {Resolver}
		*/
		function resolveContent(events) {
			subtokenize(events);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContent(effects, ok) {
			/** @type {Token | undefined} */
			let previous;
			return chunkStart;
			/**
			* Before a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^
			* ```
			*
			* @type {State}
			*/
			function chunkStart(code) {
				effects.enter("content");
				previous = effects.enter("chunkContent", { contentType: "content" });
				return chunkInside(code);
			}
			/**
			* In a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^^^
			* ```
			*
			* @type {State}
			*/
			function chunkInside(code) {
				if (code === null) return contentEnd(code);
				if (markdownLineEnding(code)) return effects.check(continuationConstruct, contentContinue, contentEnd)(code);
				effects.consume(code);
				return chunkInside;
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentEnd(code) {
				effects.exit("chunkContent");
				effects.exit("content");
				return ok(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentContinue(code) {
				effects.consume(code);
				effects.exit("chunkContent");
				previous.next = effects.enter("chunkContent", {
					contentType: "content",
					previous
				});
				previous = previous.next;
				return chunkInside;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContinuation(effects, ok, nok) {
			const self = this;
			return startLookahead;
			/**
			*
			*
			* @type {State}
			*/
			function startLookahead(code) {
				effects.exit("chunkContent");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, prefixed, "linePrefix");
			}
			/**
			*
			*
			* @type {State}
			*/
			function prefixed(code) {
				if (code === null || markdownLineEnding(code)) return nok(code);
				const tail = self.events[self.events.length - 1];
				if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) return ok(code);
				return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-destination/index.js
		/**
		* @typedef {import('micromark-util-types').Effects} Effects
		* @typedef {import('micromark-util-types').State} State
		* @typedef {import('micromark-util-types').TokenType} TokenType
		*/
		/**
		* Parse destinations.
		*
		* ###### Examples
		*
		* ```markdown
		* <a>
		* <a\>b>
		* <a b>
		* <a)>
		* a
		* a\)b
		* a(b)c
		* a(b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type for whole (`<a>` or `b`).
		* @param {TokenType} literalType
		*   Type when enclosed (`<a>`).
		* @param {TokenType} literalMarkerType
		*   Type for enclosing (`<` and `>`).
		* @param {TokenType} rawType
		*   Type when not enclosed (`b`).
		* @param {TokenType} stringType
		*   Type for the value (`a` or `b`).
		* @param {number | undefined} [max=Infinity]
		*   Depth of nested parens (inclusive).
		* @returns {State}
		*   Start state.
		*/ function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
			const limit = max || Number.POSITIVE_INFINITY;
			let balance = 0;
			return start;
			/**
			* Start of destination.
			*
			* ```markdown
			* > | <aa>
			*     ^
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 60) {
					effects.enter(type);
					effects.enter(literalType);
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					return enclosedBefore;
				}
				if (code === null || code === 32 || code === 41 || asciiControl(code)) return nok(code);
				effects.enter(type);
				effects.enter(rawType);
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return raw(code);
			}
			/**
			* After `<`, at an enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosedBefore(code) {
				if (code === 62) {
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					effects.exit(literalType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return enclosed(code);
			}
			/**
			* In enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosed(code) {
				if (code === 62) {
					effects.exit("chunkString");
					effects.exit(stringType);
					return enclosedBefore(code);
				}
				if (code === null || code === 60 || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? enclosedEscape : enclosed;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | <a\*a>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function enclosedEscape(code) {
				if (code === 60 || code === 62 || code === 92) {
					effects.consume(code);
					return enclosed;
				}
				return enclosed(code);
			}
			/**
			* In raw destination.
			*
			* ```markdown
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function raw(code) {
				if (!balance && (code === null || code === 41 || markdownLineEndingOrSpace(code))) {
					effects.exit("chunkString");
					effects.exit(stringType);
					effects.exit(rawType);
					effects.exit(type);
					return ok(code);
				}
				if (balance < limit && code === 40) {
					effects.consume(code);
					balance++;
					return raw;
				}
				if (code === 41) {
					effects.consume(code);
					balance--;
					return raw;
				}
				if (code === null || code === 32 || code === 40 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? rawEscape : raw;
			}
			/**
			* After `\`, at special character.
			*
			* ```markdown
			* > | a\*a
			*       ^
			* ```
			*
			* @type {State}
			*/
			function rawEscape(code) {
				if (code === 40 || code === 41 || code === 92) {
					effects.consume(code);
					return raw;
				}
				return raw(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-label/index.js
		/**
		* @typedef {import('micromark-util-types').Effects} Effects
		* @typedef {import('micromark-util-types').State} State
		* @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
		* @typedef {import('micromark-util-types').TokenType} TokenType
		*/
		/**
		* Parse labels.
		*
		* > 👉 **Note**: labels in markdown are capped at 999 characters in the string.
		*
		* ###### Examples
		*
		* ```markdown
		* [a]
		* [a
		* b]
		* [a\]b]
		* ```
		*
		* @this {TokenizeContext}
		*   Tokenize context.
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole label (`[a]`).
		* @param {TokenType} markerType
		*   Type for the markers (`[` and `]`).
		* @param {TokenType} stringType
		*   Type for the identifier (`a`).
		* @returns {State}
		*   Start state.
		*/ function factoryLabel(effects, ok, nok, type, markerType, stringType) {
			const self = this;
			let size = 0;
			/** @type {boolean} */
			let seen;
			return start;
			/**
			* Start of label.
			*
			* ```markdown
			* > | [a]
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter(type);
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				effects.enter(stringType);
				return atBreak;
			}
			/**
			* In label, at something, before something else.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (size > 999 || code === null || code === 91 || code === 93 && !seen || code === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				if (code === 93) {
					effects.exit(stringType);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return atBreak;
				}
				effects.enter("chunkString", { contentType: "string" });
				return labelInside(code);
			}
			/**
			* In label, in text.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (code === null || code === 91 || code === 93 || markdownLineEnding(code) || size++ > 999) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				if (!seen) seen = !markdownSpace(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | [a\*a]
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-title/index.js
		/**
		* @typedef {import('micromark-util-types').Code} Code
		* @typedef {import('micromark-util-types').Effects} Effects
		* @typedef {import('micromark-util-types').State} State
		* @typedef {import('micromark-util-types').TokenType} TokenType
		*/
		/**
		* Parse titles.
		*
		* ###### Examples
		*
		* ```markdown
		* "a"
		* 'b'
		* (c)
		* "a
		* b"
		* 'a
		*     b'
		* (a\)b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole title (`"a"`, `'b'`, `(c)`).
		* @param {TokenType} markerType
		*   Type for the markers (`"`, `'`, `(`, and `)`).
		* @param {TokenType} stringType
		*   Type for the value (`a`).
		* @returns {State}
		*   Start state.
		*/ function factoryTitle(effects, ok, nok, type, markerType, stringType) {
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of title.
			*
			* ```markdown
			* > | "a"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 34 || code === 39 || code === 40) {
					effects.enter(type);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					marker = code === 40 ? 41 : code;
					return begin;
				}
				return nok(code);
			}
			/**
			* After opening marker.
			*
			* This is also used at the closing marker.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function begin(code) {
				if (code === marker) {
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				return atBreak(code);
			}
			/**
			* At something, before something else.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.exit(stringType);
					return begin(marker);
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return factorySpace(effects, atBreak, "linePrefix");
				}
				effects.enter("chunkString", { contentType: "string" });
				return inside(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker || code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				return code === 92 ? escape : inside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | "a\*b"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function escape(code) {
				if (code === marker || code === 92) {
					effects.consume(code);
					return inside;
				}
				return inside(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-whitespace/index.js
		/**
		* @typedef {import('micromark-util-types').Effects} Effects
		* @typedef {import('micromark-util-types').State} State
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   line endings or spaces in markdown are often optional, in which case this
		*     factory can be used and `ok` will be switched to whether spaces were found
		*     or not
		* *   one line ending or space can be detected with
		*     `markdownLineEndingOrSpace(code)` right before using `factoryWhitespace`
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @returns {State}
		*   Start state.
		*/
		function factoryWhitespace(effects, ok) {
			/** @type {boolean} */
			let seen;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					seen = true;
					return start;
				}
				if (markdownSpace(code)) return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-util-normalize-identifier/index.js
		/**
		* Normalize an identifier (as found in references, definitions).
		*
		* Collapses markdown whitespace, trim, and then lower- and uppercase.
		*
		* Some characters are considered “uppercase”, such as U+03F4 (`ϴ`), but if their
		* lowercase counterpart (U+03B8 (`θ`)) is uppercased will result in a different
		* uppercase character (U+0398 (`Θ`)).
		* So, to get a canonical form, we perform both lower- and uppercase.
		*
		* Using uppercase last makes sure keys will never interact with default
		* prototypal values (such as `constructor`): nothing in the prototype of
		* `Object` is uppercase.
		*
		* @param {string} value
		*   Identifier to normalize.
		* @returns {string}
		*   Normalized identifier.
		*/
		function normalizeIdentifier(value) {
			return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/definition.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const definition = {
			name: "definition",
			tokenize: tokenizeDefinition
		};
		/** @type {Construct} */
		const titleBefore = {
			partial: true,
			tokenize: tokenizeTitleBefore
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeDefinition(effects, ok, nok) {
			const self = this;
			/** @type {string} */
			let identifier;
			return start;
			/**
			* At start of a definition.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("definition");
				return before(code);
			}
			/**
			* After optional whitespace, at `[`.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				return factoryLabel.call(self, effects, labelAfter, nok, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(code);
			}
			/**
			* After label.
			*
			* ```markdown
			* > | [a]: b "c"
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					return markerAfter;
				}
				return nok(code);
			}
			/**
			* After marker.
			*
			* ```markdown
			* > | [a]: b "c"
			*         ^
			* ```
			*
			* @type {State}
			*/
			function markerAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, destinationBefore)(code) : destinationBefore(code);
			}
			/**
			* Before destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*          ^
			* ```
			*
			* @type {State}
			*/
			function destinationBefore(code) {
				return factoryDestination(effects, destinationAfter, nok, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(code);
			}
			/**
			* After destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function destinationAfter(code) {
				return effects.attempt(titleBefore, after, after)(code);
			}
			/**
			* After definition.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return markdownSpace(code) ? factorySpace(effects, afterWhitespace, "whitespace")(code) : afterWhitespace(code);
			}
			/**
			* After definition, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function afterWhitespace(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("definition");
					self.parser.defined.push(identifier);
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeTitleBefore(effects, ok, nok) {
			return titleBefore;
			/**
			* After destination, at whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function titleBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, beforeMarker)(code) : nok(code);
			}
			/**
			* At title.
			*
			* ```markdown
			*   | [a]: b
			* > | "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function beforeMarker(code) {
				return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code);
			}
			/**
			* After title.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code) : titleAfterOptionalWhitespace(code);
			}
			/**
			* After title, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfterOptionalWhitespace(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/hard-break-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const hardBreakEscape = {
			name: "hardBreakEscape",
			tokenize: tokenizeHardBreakEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHardBreakEscape(effects, ok, nok) {
			return start;
			/**
			* Start of a hard break (escape).
			*
			* ```markdown
			* > | a\
			*      ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("hardBreakEscape");
				effects.consume(code);
				return after;
			}
			/**
			* After `\`, at eol.
			*
			* ```markdown
			* > | a\
			*       ^
			*   | b
			* ```
			*
			*  @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) {
					effects.exit("hardBreakEscape");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/heading-atx.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const headingAtx = {
			name: "headingAtx",
			resolve: resolveHeadingAtx,
			tokenize: tokenizeHeadingAtx
		};
		/** @type {Resolver} */
		function resolveHeadingAtx(events, context) {
			let contentEnd = events.length - 2;
			let contentStart = 3;
			if (events[contentStart][1].type === "whitespace") contentStart += 2;
			if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") contentEnd -= 2;
			if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
			if (contentEnd > contentStart) {
				const content = {
					type: "atxHeadingText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end
				};
				const text = {
					type: "chunkText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end,
					contentType: "text"
				};
				splice(events, contentStart, contentEnd - contentStart + 1, [
					[
						"enter",
						content,
						context
					],
					[
						"enter",
						text,
						context
					],
					[
						"exit",
						text,
						context
					],
					[
						"exit",
						content,
						context
					]
				]);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHeadingAtx(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of a heading (atx).
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("atxHeading");
				return before(code);
			}
			/**
			* After optional whitespace, at `#`.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("atxHeadingSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 35 && size++ < 6) {
					effects.consume(code);
					return sequenceOpen;
				}
				if (code === null || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingSequence");
					return atBreak(code);
				}
				return nok(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ## aa
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === 35) {
					effects.enter("atxHeadingSequence");
					return sequenceFurther(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("atxHeading");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, atBreak, "whitespace")(code);
				effects.enter("atxHeadingText");
				return data(code);
			}
			/**
			* In further sequence (after whitespace).
			*
			* Could be normal “visible” hashes in the heading or a final sequence.
			*
			* ```markdown
			* > | ## aa ##
			*           ^
			* ```
			*
			* @type {State}
			*/
			function sequenceFurther(code) {
				if (code === 35) {
					effects.consume(code);
					return sequenceFurther;
				}
				effects.exit("atxHeadingSequence");
				return atBreak(code);
			}
			/**
			* In text.
			*
			* ```markdown
			* > | ## aa
			*        ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 35 || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingText");
					return atBreak(code);
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-html-tag-name/index.js
		/**
		* List of lowercase HTML “block” tag names.
		*
		* The list, when parsing HTML (flow), results in more relaxed rules (condition
		* 6).
		* Because they are known blocks, the HTML-like syntax doesn’t have to be
		* strictly parsed.
		* For tag names not in this list, a more strict algorithm (condition 7) is used
		* to detect whether the HTML-like syntax is seen as HTML (flow) or not.
		*
		* This is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `search` was added in `CommonMark@0.31`.
		*/
		const htmlBlockNames = [
			"address",
			"article",
			"aside",
			"base",
			"basefont",
			"blockquote",
			"body",
			"caption",
			"center",
			"col",
			"colgroup",
			"dd",
			"details",
			"dialog",
			"dir",
			"div",
			"dl",
			"dt",
			"fieldset",
			"figcaption",
			"figure",
			"footer",
			"form",
			"frame",
			"frameset",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"head",
			"header",
			"hr",
			"html",
			"iframe",
			"legend",
			"li",
			"link",
			"main",
			"menu",
			"menuitem",
			"nav",
			"noframes",
			"ol",
			"optgroup",
			"option",
			"p",
			"param",
			"search",
			"section",
			"summary",
			"table",
			"tbody",
			"td",
			"tfoot",
			"th",
			"thead",
			"title",
			"tr",
			"track",
			"ul"
		];
		/**
		* List of lowercase HTML “raw” tag names.
		*
		* The list, when parsing HTML (flow), results in HTML that can include lines
		* without exiting, until a closing tag also in this list is found (condition
		* 1).
		*
		* This module is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `textarea` was added in `CommonMark@0.30`.
		*/
		const htmlRawNames = [
			"pre",
			"script",
			"style",
			"textarea"
		];
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/html-flow.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlFlow = {
			concrete: true,
			name: "htmlFlow",
			resolveTo: resolveToHtmlFlow,
			tokenize: tokenizeHtmlFlow
		};
		/** @type {Construct} */
		const blankLineBefore = {
			partial: true,
			tokenize: tokenizeBlankLineBefore
		};
		/** @type {Resolver} */
		function resolveToHtmlFlow(events) {
			let index = events.length;
			while (index--) if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") break;
			if (index > 1 && events[index - 2][1].type === "linePrefix") {
				events[index][1].start = events[index - 2][1].start;
				events[index + 1][1].start = events[index - 2][1].start;
				events.splice(index - 2, 2);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlFlow(effects, ok, nok) {
			const self = this;
			/** @type {number} */
			let marker;
			/** @type {boolean} */
			let closingTag;
			/** @type {string} */
			let buffer;
			/** @type {number} */
			let index;
			/** @type {Code} */
			let markerB;
			return start;
			/**
			* Start of HTML (flow).
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return before(code);
			}
			/**
			* At `<`, after optional whitespace.
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("htmlFlow");
				effects.enter("htmlFlowData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | <x />
			*      ^
			* > | <!doctype>
			*      ^
			* > | <!--xxx-->
			*      ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					closingTag = true;
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					marker = 3;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | <!doctype>
			*       ^
			* > | <!--xxx-->
			*       ^
			* > | <![CDATA[>&<]]>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					marker = 2;
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					marker = 5;
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					marker = 4;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<!-`, inside a comment, at another `-`.
			*
			* ```markdown
			* > | <!--xxx-->
			*        ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<![`, inside CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*        ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					if (index === 6) return self.interrupt ? ok : continuation;
					return cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | </x>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* In tag name.
			*
			* ```markdown
			* > | <ab>
			*      ^^
			* > | </ab>
			*       ^^
			* ```
			*
			* @type {State}
			*/
			function tagName(code) {
				if (code === null || code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
					const slash = code === 47;
					const name = buffer.toLowerCase();
					if (!slash && !closingTag && htmlRawNames.includes(name)) {
						marker = 1;
						return self.interrupt ? ok(code) : continuation(code);
					}
					if (htmlBlockNames.includes(buffer.toLowerCase())) {
						marker = 6;
						if (slash) {
							effects.consume(code);
							return basicSelfClosing;
						}
						return self.interrupt ? ok(code) : continuation(code);
					}
					marker = 7;
					return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code) : closingTag ? completeClosingTagAfter(code) : completeAttributeNameBefore(code);
				}
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After closing slash of a basic tag name.
			*
			* ```markdown
			* > | <div/>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function basicSelfClosing(code) {
				if (code === 62) {
					effects.consume(code);
					return self.interrupt ? ok : continuation;
				}
				return nok(code);
			}
			/**
			* After closing slash of a complete tag name.
			*
			* ```markdown
			* > | <x/>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeClosingTagAfter(code) {
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeClosingTagAfter;
				}
				return completeEnd(code);
			}
			/**
			* At an attribute name.
			*
			* At first, this state is used after a complete tag name, after whitespace,
			* where it expects optional attributes or the end of the tag.
			* It is also reused after attributes, when expecting more optional
			* attributes.
			*
			* ```markdown
			* > | <a />
			*        ^
			* > | <a :b>
			*        ^
			* > | <a _b>
			*        ^
			* > | <a b>
			*        ^
			* > | <a >
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameBefore(code) {
				if (code === 47) {
					effects.consume(code);
					return completeEnd;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameBefore;
				}
				return completeEnd(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | <a :b>
			*         ^
			* > | <a _b>
			*         ^
			* > | <a b>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				return completeAttributeNameAfter(code);
			}
			/**
			* After attribute name, at an optional initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | <a b>
			*         ^
			* > | <a b=c>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameAfter;
				}
				return completeAttributeNameBefore(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* > | <a b="c">
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					markerB = code;
					return completeAttributeValueQuoted;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				return completeAttributeValueUnquoted(code);
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | <a b="c">
			*           ^
			* > | <a b='c'>
			*           ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuoted(code) {
				if (code === markerB) {
					effects.consume(code);
					markerB = null;
					return completeAttributeValueQuotedAfter;
				}
				if (code === null || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return completeAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 47 || code === 60 || code === 61 || code === 62 || code === 96 || markdownLineEndingOrSpace(code)) return completeAttributeNameAfter(code);
				effects.consume(code);
				return completeAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the
			* end of the tag.
			*
			* ```markdown
			* > | <a b="c">
			*            ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownSpace(code)) return completeAttributeNameBefore(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a complete tag where only an `>` is allowed.
			*
			* ```markdown
			* > | <a b="c">
			*             ^
			* ```
			*
			* @type {State}
			*/
			function completeEnd(code) {
				if (code === 62) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* After `>` in a complete tag.
			*
			* ```markdown
			* > | <x>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAfter(code) {
				if (code === null || markdownLineEnding(code)) return continuation(code);
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* In continuation of any HTML kind.
			*
			* ```markdown
			* > | <!--xxx-->
			*          ^
			* ```
			*
			* @type {State}
			*/
			function continuation(code) {
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationCommentInside;
				}
				if (code === 60 && marker === 1) {
					effects.consume(code);
					return continuationRawTagOpen;
				}
				if (code === 62 && marker === 4) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 63 && marker === 3) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				if (code === 93 && marker === 5) {
					effects.consume(code);
					return continuationCdataInside;
				}
				if (markdownLineEnding(code) && (marker === 6 || marker === 7)) {
					effects.exit("htmlFlowData");
					return effects.check(blankLineBefore, continuationAfter, continuationStart)(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationStart(code);
				}
				effects.consume(code);
				return continuation;
			}
			/**
			* In continuation, at eol.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStart(code) {
				return effects.check(nonLazyContinuation, continuationStartNonLazy, continuationAfter)(code);
			}
			/**
			* In continuation, at eol, before non-lazy content.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStartNonLazy(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return continuationBefore;
			}
			/**
			* In continuation, before non-lazy content.
			*
			* ```markdown
			*   | <x>
			* > | asd
			*     ^
			* ```
			*
			* @type {State}
			*/
			function continuationBefore(code) {
				if (code === null || markdownLineEnding(code)) return continuationStart(code);
				effects.enter("htmlFlowData");
				return continuation(code);
			}
			/**
			* In comment continuation, after one `-`, expecting another.
			*
			* ```markdown
			* > | <!--xxx-->
			*             ^
			* ```
			*
			* @type {State}
			*/
			function continuationCommentInside(code) {
				if (code === 45) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `<`, at `/`.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                            ^
			* ```
			*
			* @type {State}
			*/
			function continuationRawTagOpen(code) {
				if (code === 47) {
					effects.consume(code);
					buffer = "";
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `</`, in a raw tag name.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                             ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function continuationRawEndTag(code) {
				if (code === 62) {
					const name = buffer.toLowerCase();
					if (htmlRawNames.includes(name)) {
						effects.consume(code);
						return continuationClose;
					}
					return continuation(code);
				}
				if (asciiAlpha(code) && buffer.length < 8) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In cdata continuation, after `]`, expecting `]>`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*                  ^
			* ```
			*
			* @type {State}
			*/
			function continuationCdataInside(code) {
				if (code === 93) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In declaration or instruction continuation, at `>`.
			*
			* ```markdown
			* > | <!-->
			*         ^
			* > | <?>
			*       ^
			* > | <!q>
			*        ^
			* > | <!--ab-->
			*             ^
			* > | <![CDATA[>&<]]>
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function continuationDeclarationInside(code) {
				if (code === 62) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In closed continuation: everything we get until the eol/eof is part of it.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationClose(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationAfter(code);
				}
				effects.consume(code);
				return continuationClose;
			}
			/**
			* Done.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationAfter(code) {
				effects.exit("htmlFlow");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLineBefore(effects, ok, nok) {
			return start;
			/**
			* Before eol, expecting blank line.
			*
			* ```markdown
			* > | <div>
			*          ^
			*   |
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return effects.attempt(blankLine, ok, nok);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/html-text.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlText = {
			name: "htmlText",
			tokenize: tokenizeHtmlText
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlText(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code> | undefined} */
			let marker;
			/** @type {number} */
			let index;
			/** @type {State} */
			let returnState;
			return start;
			/**
			* Start of HTML (text).
			*
			* ```markdown
			* > | a <b> c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("htmlText");
				effects.enter("htmlTextData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | a <b> c
			*        ^
			* > | a <!doctype> c
			*        ^
			* > | a <!--b--> c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					return instruction;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagOpen;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | a <!doctype> c
			*         ^
			* > | a <!--b--> c
			*         ^
			* > | a <![CDATA[>&<]]> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return declaration;
				}
				return nok(code);
			}
			/**
			* In a comment, after `<!-`, at another `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return nok(code);
			}
			/**
			* In comment.
			*
			* ```markdown
			* > | a <!--b--> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function comment(code) {
				if (code === null) return nok(code);
				if (code === 45) {
					effects.consume(code);
					return commentClose;
				}
				if (markdownLineEnding(code)) {
					returnState = comment;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return comment;
			}
			/**
			* In comment, after `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function commentClose(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return comment(code);
			}
			/**
			* In comment, after `--`.
			*
			* ```markdown
			* > | a <!--b--> c
			*              ^
			* ```
			*
			* @type {State}
			*/
			function commentEnd(code) {
				return code === 62 ? end(code) : code === 45 ? commentClose(code) : comment(code);
			}
			/**
			* After `<![`, in CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*          ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					return index === 6 ? cdata : cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* In CDATA.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                ^^^
			* ```
			*
			* @type {State}
			*/
			function cdata(code) {
				if (code === null) return nok(code);
				if (code === 93) {
					effects.consume(code);
					return cdataClose;
				}
				if (markdownLineEnding(code)) {
					returnState = cdata;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return cdata;
			}
			/**
			* In CDATA, after `]`, at another `]`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function cdataClose(code) {
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In CDATA, after `]]`, at `>`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                     ^
			* ```
			*
			* @type {State}
			*/
			function cdataEnd(code) {
				if (code === 62) return end(code);
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In declaration.
			*
			* ```markdown
			* > | a <!b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function declaration(code) {
				if (code === null || code === 62) return end(code);
				if (markdownLineEnding(code)) {
					returnState = declaration;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return declaration;
			}
			/**
			* In instruction.
			*
			* ```markdown
			* > | a <?b?> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function instruction(code) {
				if (code === null) return nok(code);
				if (code === 63) {
					effects.consume(code);
					return instructionClose;
				}
				if (markdownLineEnding(code)) {
					returnState = instruction;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return instruction;
			}
			/**
			* In instruction, after `?`, at `>`.
			*
			* ```markdown
			* > | a <?b?> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function instructionClose(code) {
				return code === 62 ? end(code) : instruction(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | a </b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagClose;
				}
				return nok(code);
			}
			/**
			* After `</x`, in a tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagClose(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagClose;
				}
				return tagCloseBetween(code);
			}
			/**
			* In closing tag, after tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseBetween(code) {
				if (markdownLineEnding(code)) {
					returnState = tagCloseBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagCloseBetween;
				}
				return end(code);
			}
			/**
			* After `<x`, in opening tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpen(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpen;
				}
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In opening tag, after tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenBetween(code) {
				if (code === 47) {
					effects.consume(code);
					return end;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenBetween;
				}
				return end(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | a <b c> d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				return tagOpenAttributeNameAfter(code);
			}
			/**
			* After attribute name, before initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | a <b c> d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeNameAfter;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeNameAfter;
				}
				return tagOpenBetween(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					marker = code;
					return tagOpenAttributeValueQuoted;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueBefore;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | a <b c="d"> e
			*             ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuoted(code) {
				if (code === marker) {
					effects.consume(code);
					marker = void 0;
					return tagOpenAttributeValueQuotedAfter;
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueQuoted;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return tagOpenAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 60 || code === 61 || code === 96) return nok(code);
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the end
			* of the tag.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a tag where only an `>` is allowed.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function end(code) {
				if (code === 62) {
					effects.consume(code);
					effects.exit("htmlTextData");
					effects.exit("htmlText");
					return ok;
				}
				return nok(code);
			}
			/**
			* At eol.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			* > | a <!--a
			*            ^
			*   | b-->
			* ```
			*
			* @type {State}
			*/
			function lineEndingBefore(code) {
				effects.exit("htmlTextData");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return lineEndingAfter;
			}
			/**
			* After eol, at optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : lineEndingAfterPrefix(code);
			}
			/**
			* After eol, after optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfterPrefix(code) {
				effects.enter("htmlTextData");
				return returnState(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-end.js
		/**
		* @import {
		*   Construct,
		*   Event,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelEnd = {
			name: "labelEnd",
			resolveAll: resolveAllLabelEnd,
			resolveTo: resolveToLabelEnd,
			tokenize: tokenizeLabelEnd
		};
		/** @type {Construct} */
		const resourceConstruct = { tokenize: tokenizeResource };
		/** @type {Construct} */
		const referenceFullConstruct = { tokenize: tokenizeReferenceFull };
		/** @type {Construct} */
		const referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
		/** @type {Resolver} */
		function resolveAllLabelEnd(events) {
			let index = -1;
			/** @type {Array<Event>} */
			const newEvents = [];
			while (++index < events.length) {
				const token = events[index][1];
				newEvents.push(events[index]);
				if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
					const offset = token.type === "labelImage" ? 4 : 2;
					token.type = "data";
					index += offset;
				}
			}
			if (events.length !== newEvents.length) splice(events, 0, events.length, newEvents);
			return events;
		}
		/** @type {Resolver} */
		function resolveToLabelEnd(events, context) {
			let index = events.length;
			let offset = 0;
			/** @type {number | undefined} */
			let open;
			/** @type {number | undefined} */
			let close;
			/** @type {Array<Event>} */
			let media;
			while (index--) {
				const token = events[index][1];
				if (open) {
					if (token.type === "link" || token.type === "labelLink" && token._inactive) break;
					if (events[index][0] === "enter" && token.type === "labelLink") token._inactive = true;
				} else if (close) {
					if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
						open = index;
						if (token.type !== "labelLink") {
							offset = 2;
							break;
						}
					}
				} else if (token.type === "labelEnd") close = index;
			}
			const group = {
				type: events[open][1].type === "labelLink" ? "link" : "image",
				start: { ...events[open][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			const label = {
				type: "label",
				start: { ...events[open][1].start },
				end: { ...events[close][1].end }
			};
			const text = {
				type: "labelText",
				start: { ...events[open + offset + 2][1].end },
				end: { ...events[close - 2][1].start }
			};
			media = [[
				"enter",
				group,
				context
			], [
				"enter",
				label,
				context
			]];
			media = push(media, events.slice(open + 1, open + offset + 3));
			media = push(media, [[
				"enter",
				text,
				context
			]]);
			media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
			media = push(media, [
				[
					"exit",
					text,
					context
				],
				events[close - 2],
				events[close - 1],
				[
					"exit",
					label,
					context
				]
			]);
			media = push(media, events.slice(close + 1));
			media = push(media, [[
				"exit",
				group,
				context
			]]);
			splice(events, open, events.length, media);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelEnd(effects, ok, nok) {
			const self = this;
			const labelStarts = self._labelStarts;
			/** @type {Token} */
			let labelStart;
			/** @type {boolean} */
			let defined;
			if (labelStarts) {
				while (labelStarts.length > 0 && labelStarts[labelStarts.length - 1]._balanced) labelStarts.pop();
				labelStart = labelStarts[labelStarts.length - 1];
			}
			return start;
			/**
			* Start of label end.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!labelStart) return nok(code);
				if (labelStart._inactive) return labelEndNok(code);
				defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				})));
				effects.enter("labelEnd");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelEnd");
				return after;
			}
			/**
			* After `]`.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === 40) return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code);
				if (code === 91) return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code);
				return defined ? labelEndOk(code) : labelEndNok(code);
			}
			/**
			* After `]`, at `[`, but not at a full reference.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] b
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceNotFull(code) {
				return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code);
			}
			/**
			* Done, we found something.
			*
			* ```markdown
			* > | [a](b) c
			*           ^
			* > | [a][b] c
			*           ^
			* > | [a][] b
			*          ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndOk(code) {
				labelStarts.pop();
				return ok(code);
			}
			/**
			* Done, it’s nothing.
			*
			* There was an okay opening, but we didn’t match anything.
			*
			* ```markdown
			* > | [a](b c
			*        ^
			* > | [a][b c
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndNok(code) {
				labelStart._balanced = true;
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeResource(effects, ok, nok) {
			return resourceStart;
			/**
			* At a resource.
			*
			* ```markdown
			* > | [a](b) c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function resourceStart(code) {
				effects.enter("resource");
				effects.enter("resourceMarker");
				effects.consume(code);
				effects.exit("resourceMarker");
				return resourceBefore;
			}
			/**
			* In resource, after `(`, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceOpen)(code) : resourceOpen(code);
			}
			/**
			* In resource, after optional whitespace, at `)` or a destination.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceOpen(code) {
				if (code === 41) return resourceEnd(code);
				return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code);
			}
			/**
			* In resource, after destination, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceBetween)(code) : resourceEnd(code);
			}
			/**
			* At invalid destination.
			*
			* ```markdown
			* > | [a](<<) b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationMissing(code) {
				return nok(code);
			}
			/**
			* In resource, after destination and whitespace, at `(` or title.
			*
			* ```markdown
			* > | [a](b ) c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function resourceBetween(code) {
				if (code === 34 || code === 39 || code === 40) return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code);
				return resourceEnd(code);
			}
			/**
			* In resource, after title, at optional whitespace.
			*
			* ```markdown
			* > | [a](b "c") d
			*              ^
			* ```
			*
			* @type {State}
			*/
			function resourceTitleAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceEnd)(code) : resourceEnd(code);
			}
			/**
			* In resource, at `)`.
			*
			* ```markdown
			* > | [a](b) d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceEnd(code) {
				if (code === 41) {
					effects.enter("resourceMarker");
					effects.consume(code);
					effects.exit("resourceMarker");
					effects.exit("resource");
					return ok;
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceFull(effects, ok, nok) {
			const self = this;
			return referenceFull;
			/**
			* In a reference (full), at the `[`.
			*
			* ```markdown
			* > | [a][b] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFull(code) {
				return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code);
			}
			/**
			* In a reference (full), after `]`.
			*
			* ```markdown
			* > | [a][b] d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullAfter(code) {
				return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code) : nok(code);
			}
			/**
			* In reference (full) that was missing.
			*
			* ```markdown
			* > | [a][b d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullMissing(code) {
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceCollapsed(effects, ok, nok) {
			return referenceCollapsedStart;
			/**
			* In reference (collapsed), at `[`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceCollapsedStart(code) {
				effects.enter("reference");
				effects.enter("referenceMarker");
				effects.consume(code);
				effects.exit("referenceMarker");
				return referenceCollapsedOpen;
			}
			/**
			* In reference (collapsed), at `]`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*         ^
			* ```
			*
			*  @type {State}
			*/
			function referenceCollapsedOpen(code) {
				if (code === 93) {
					effects.enter("referenceMarker");
					effects.consume(code);
					effects.exit("referenceMarker");
					effects.exit("reference");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-start-image.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   Token,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartImage = {
			name: "labelStartImage",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartImage
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartImage(effects, ok, nok) {
			const self = this;
			/** @type {Token} */
			let labelImage;
			return start;
			/**
			* Start of label (image) start.
			*
			* ```markdown
			* > | a ![b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelImage");
				effects.enter("labelImageMarker");
				effects.consume(code);
				effects.exit("labelImageMarker");
				return open;
			}
			/**
			* After `!`, at `[`.
			*
			* ```markdown
			* > | a ![b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 91) {
					effects.enter("labelMarker");
					effects.consume(code);
					effects.exit("labelMarker");
					labelImage = effects.exit("labelImage");
					return after;
				}
				return nok(code);
			}
			/**
			* After `![`.
			*
			* ```markdown
			* > | a ![b] c
			*         ^
			* ```
			*
			* This is needed in because, when GFM footnotes are enabled, images never
			* form when started with a `^`.
			* Instead, links form:
			*
			* ```markdown
			* ![^a](b)
			*
			* ![^a][b]
			*
			* [b]: c
			* ```
			*
			* ```html
			* <p>!<a href=\"b\">^a</a></p>
			* <p>!<a href=\"c\">^a</a></p>
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				/* c8 ignore next 6 */
				if (code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				self._labelStarts = self._labelStarts || [];
				self._labelStarts.push(labelImage);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-start-link.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   Token,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartLink = {
			name: "labelStartLink",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartLink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartLink(effects, ok, nok) {
			const self = this;
			/** @type {Token} */
			let labelLink;
			return start;
			/**
			* Start of label (link) start.
			*
			* ```markdown
			* > | a [b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelLink");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				labelLink = effects.exit("labelLink");
				return after;
			}
			/** @type {State} */
			function after(code) {
				/* c8 ignore next 6 */
				if (code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				self._labelStarts = self._labelStarts || [];
				self._labelStarts.push(labelLink);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/line-ending.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const lineEnding = {
			name: "lineEnding",
			tokenize: tokenizeLineEnding
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLineEnding(effects, ok) {
			return start;
			/** @type {State} */
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, ok, "linePrefix");
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/thematic-break.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const thematicBreak = {
			name: "thematicBreak",
			tokenize: tokenizeThematicBreak
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeThematicBreak(effects, ok, nok) {
			let size = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of thematic break.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("thematicBreak");
				return before(code);
			}
			/**
			* After optional whitespace, at marker.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				marker = code;
				return atBreak(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.enter("thematicBreakSequence");
					return sequence(code);
				}
				if (size >= 3 && (code === null || markdownLineEnding(code))) {
					effects.exit("thematicBreak");
					return ok(code);
				}
				return nok(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequence(code) {
				if (code === marker) {
					effects.consume(code);
					size++;
					return sequence;
				}
				effects.exit("thematicBreakSequence");
				return markdownSpace(code) ? factorySpace(effects, atBreak, "whitespace")(code) : atBreak(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/list.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const list = {
			continuation: { tokenize: tokenizeListContinuation },
			exit: tokenizeListEnd,
			name: "list",
			tokenize: tokenizeListStart
		};
		/** @type {Construct} */
		const listItemPrefixWhitespaceConstruct = {
			partial: true,
			tokenize: tokenizeListItemPrefixWhitespace
		};
		/** @type {Construct} */
		const indentConstruct = {
			partial: true,
			tokenize: tokenizeIndent$1
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListStart(effects, ok, nok) {
			const self = this;
			const tail = self.events[self.events.length - 1];
			let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				const kind = self.containerState.type || (code === 42 || code === 43 || code === 45 ? "listUnordered" : "listOrdered");
				if (kind === "listUnordered" ? !self.containerState.marker || code === self.containerState.marker : asciiDigit(code)) {
					if (!self.containerState.type) {
						self.containerState.type = kind;
						effects.enter(kind, { _container: true });
					}
					if (kind === "listUnordered") {
						effects.enter("listItemPrefix");
						return code === 42 || code === 45 ? effects.check(thematicBreak, nok, atMarker)(code) : atMarker(code);
					}
					if (!self.interrupt || code === 49) {
						effects.enter("listItemPrefix");
						effects.enter("listItemValue");
						return inside(code);
					}
				}
				return nok(code);
			}
			/** @type {State} */
			function inside(code) {
				if (asciiDigit(code) && ++size < 10) {
					effects.consume(code);
					return inside;
				}
				if ((!self.interrupt || size < 2) && (self.containerState.marker ? code === self.containerState.marker : code === 41 || code === 46)) {
					effects.exit("listItemValue");
					return atMarker(code);
				}
				return nok(code);
			}
			/**
			* @type {State}
			**/
			function atMarker(code) {
				effects.enter("listItemMarker");
				effects.consume(code);
				effects.exit("listItemMarker");
				self.containerState.marker = self.containerState.marker || code;
				return effects.check(blankLine, self.interrupt ? nok : onBlank, effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix));
			}
			/** @type {State} */
			function onBlank(code) {
				self.containerState.initialBlankLine = true;
				initialSize++;
				return endOfPrefix(code);
			}
			/** @type {State} */
			function otherPrefix(code) {
				if (markdownSpace(code)) {
					effects.enter("listItemPrefixWhitespace");
					effects.consume(code);
					effects.exit("listItemPrefixWhitespace");
					return endOfPrefix;
				}
				return nok(code);
			}
			/** @type {State} */
			function endOfPrefix(code) {
				self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListContinuation(effects, ok, nok) {
			const self = this;
			self.containerState._closeFlow = void 0;
			return effects.check(blankLine, onBlank, notBlank);
			/** @type {State} */
			function onBlank(code) {
				self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
				return factorySpace(effects, ok, "listItemIndent", self.containerState.size + 1)(code);
			}
			/** @type {State} */
			function notBlank(code) {
				if (self.containerState.furtherBlankLines || !markdownSpace(code)) {
					self.containerState.furtherBlankLines = void 0;
					self.containerState.initialBlankLine = void 0;
					return notInCurrentItem(code);
				}
				self.containerState.furtherBlankLines = void 0;
				self.containerState.initialBlankLine = void 0;
				return effects.attempt(indentConstruct, ok, notInCurrentItem)(code);
			}
			/** @type {State} */
			function notInCurrentItem(code) {
				self.containerState._closeFlow = true;
				self.interrupt = void 0;
				return factorySpace(effects, effects.attempt(list, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeIndent$1(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code) : nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Exiter}
		*/
		function tokenizeListEnd(effects) {
			effects.exit(this.containerState.type);
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return !markdownSpace(code) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/setext-underline.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const setextUnderline = {
			name: "setextUnderline",
			resolveTo: resolveToSetextUnderline,
			tokenize: tokenizeSetextUnderline
		};
		/** @type {Resolver} */
		function resolveToSetextUnderline(events, context) {
			const editMap = new EditMap$1();
			let index = events.length;
			/** @type {number | undefined} */
			let content;
			/** @type {number | undefined} */
			let text;
			/** @type {number | undefined} */
			let definition;
			while (index--) if (events[index][0] === "enter") {
				if (events[index][1].type === "content") {
					content = index;
					break;
				}
				if (events[index][1].type === "paragraph") text = index;
			} else {
				if (events[index][1].type === "content") editMap.add(index, 1, []);
				if (!definition && events[index][1].type === "definition") definition = index;
			}
			const heading = {
				type: "setextHeading",
				start: { ...events[content][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			events[text][1].type = "setextHeadingText";
			if (definition) {
				editMap.add(text, 0, [[
					"enter",
					heading,
					context
				]]);
				editMap.add(definition + 1, 0, [[
					"exit",
					events[content][1],
					context
				]]);
				events[content][1].end = { ...events[definition][1].end };
			} else events[content][1] = heading;
			editMap.add(events.length, 0, [[
				"exit",
				heading,
				context
			]]);
			editMap.consume(events);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeSetextUnderline(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* At start of heading (setext) underline.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length;
				/** @type {boolean | undefined} */
				let paragraph;
				while (index--) if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
					paragraph = self.events[index][1].type === "paragraph";
					break;
				}
				if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
					effects.enter("setextHeadingLine");
					marker = code;
					return before(code);
				}
				return nok(code);
			}
			/**
			* After optional whitespace, at `-` or `=`.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("setextHeadingLineSequence");
				return inside(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				effects.exit("setextHeadingLineSequence");
				return markdownSpace(code) ? factorySpace(effects, after, "lineSuffix")(code) : after(code);
			}
			/**
			* After sequence, after optional whitespace.
			*
			* ```markdown
			*   | aa
			* > | ==
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("setextHeadingLine");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/flow.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const flow$1 = { tokenize: initializeFlow };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeFlow(effects) {
			const self = this;
			const initial = effects.attempt(blankLine, atBlankEnding, effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix")));
			return initial;
			/** @type {State} */
			function atBlankEnding(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEndingBlank");
				effects.consume(code);
				effects.exit("lineEndingBlank");
				self.currentConstruct = void 0;
				return initial;
			}
			/** @type {State} */
			function afterConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				self.currentConstruct = void 0;
				return initial;
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/text.js
		/**
		* @import {
		*   Code,
		*   InitialConstruct,
		*   Initializer,
		*   Resolver,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		const resolver = { resolveAll: createResolver() };
		const string$1 = initializeFactory("string");
		const text$2 = initializeFactory("text");
		/**
		* @param {'string' | 'text'} field
		*   Field.
		* @returns {InitialConstruct}
		*   Construct.
		*/
		function initializeFactory(field) {
			return {
				resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
				tokenize: initializeText
			};
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Initializer}
			*/
			function initializeText(effects) {
				const self = this;
				const constructs = this.parser.constructs[field];
				const text = effects.attempt(constructs, start, notText);
				return start;
				/** @type {State} */
				function start(code) {
					return atBreak(code) ? text(code) : notText(code);
				}
				/** @type {State} */
				function notText(code) {
					if (code === null) {
						effects.consume(code);
						return;
					}
					effects.enter("data");
					effects.consume(code);
					return data;
				}
				/** @type {State} */
				function data(code) {
					if (atBreak(code)) {
						effects.exit("data");
						return text(code);
					}
					effects.consume(code);
					return data;
				}
				/**
				* @param {Code} code
				*   Code.
				* @returns {boolean}
				*   Whether the code is a break.
				*/
				function atBreak(code) {
					if (code === null) return true;
					const list = constructs[code];
					let index = -1;
					if (list) while (++index < list.length) {
						const item = list[index];
						if (!item.previous || item.previous.call(self, self.previous)) return true;
					}
					return false;
				}
			}
		}
		/**
		* @param {Resolver | undefined} [extraResolver]
		*   Resolver.
		* @returns {Resolver}
		*   Resolver.
		*/
		function createResolver(extraResolver) {
			return resolveAllText;
			/** @type {Resolver} */
			function resolveAllText(events, context) {
				let index = -1;
				/** @type {number | undefined} */
				let enter;
				while (++index <= events.length) if (enter === void 0) {
					if (events[index] && events[index][1].type === "data") {
						enter = index;
						index++;
					}
				} else if (!events[index] || events[index][1].type !== "data") {
					if (index !== enter + 2) {
						events[enter][1].end = events[index - 1][1].end;
						events.splice(enter + 2, index - enter - 2);
						index = enter + 2;
					}
					enter = void 0;
				}
				return extraResolver ? extraResolver(events, context) : events;
			}
		}
		/**
		* A rather ugly set of instructions which again looks at chunks in the input
		* stream.
		* The reason to do this here is that it is *much* faster to parse in reverse.
		* And that we can’t hook into `null` to split the line suffix before an EOF.
		* To do: figure out if we can make this into a clean utility, or even in core.
		* As it will be useful for GFMs literal autolink extension (and maybe even
		* tables?)
		*
		* @type {Resolver}
		*/
		function resolveAllLineSuffixes(events, context) {
			const editMap = new EditMap$1();
			let eventIndex = 0;
			while (++eventIndex <= events.length) if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
				const data = events[eventIndex - 1][1];
				const chunks = context.sliceStream(data);
				let index = chunks.length;
				let bufferIndex = -1;
				let size = 0;
				/** @type {boolean | undefined} */
				let tabs;
				while (index--) {
					const chunk = chunks[index];
					if (typeof chunk === "string") {
						bufferIndex = chunk.length;
						while (chunk.charCodeAt(bufferIndex - 1) === 32) {
							size++;
							bufferIndex--;
						}
						if (bufferIndex) break;
						bufferIndex = -1;
					} else if (chunk === -2) {
						tabs = true;
						size++;
					} else if (chunk === -1) {} else {
						index++;
						break;
					}
				}
				if (context._contentTypeTextTrailing && eventIndex === events.length) size = 0;
				if (size) {
					const token = {
						type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
						start: {
							_bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
							_index: data.start._index + index,
							line: data.end.line,
							column: data.end.column - size,
							offset: data.end.offset - size
						},
						end: { ...data.end }
					};
					data.end = { ...token.start };
					if (data.start.offset === data.end.offset) Object.assign(data, token);
					else editMap.add(eventIndex, 0, [[
						"enter",
						token,
						context
					], [
						"exit",
						token,
						context
					]]);
				}
				eventIndex++;
			}
			editMap.consume(events);
			return events;
		}
		//#endregion
		//#region node_modules/micromark/lib/constructs.js
		/**
		* @import {Extension} from 'micromark-util-types'
		*/
		var constructs_exports = /* @__PURE__ */ __exportAll({
			attentionMarkers: () => attentionMarkers,
			contentInitial: () => contentInitial,
			disable: () => disable,
			document: () => document$1,
			flow: () => flow,
			flowInitial: () => flowInitial,
			insideSpan: () => insideSpan,
			string: () => string,
			text: () => text$1
		});
		/** @satisfies {Extension['document']} */
		const document$1 = {
			[42]: list,
			[43]: list,
			[45]: list,
			[48]: list,
			[49]: list,
			[50]: list,
			[51]: list,
			[52]: list,
			[53]: list,
			[54]: list,
			[55]: list,
			[56]: list,
			[57]: list,
			[62]: blockQuote
		};
		/** @satisfies {Extension['contentInitial']} */
		const contentInitial = { [91]: definition };
		/** @satisfies {Extension['flowInitial']} */
		const flowInitial = {
			[-2]: codeIndented,
			[-1]: codeIndented,
			[32]: codeIndented
		};
		/** @satisfies {Extension['flow']} */
		const flow = {
			[35]: headingAtx,
			[42]: thematicBreak,
			[45]: [setextUnderline, thematicBreak],
			[60]: htmlFlow,
			[61]: setextUnderline,
			[95]: thematicBreak,
			[96]: codeFenced,
			[126]: codeFenced
		};
		/** @satisfies {Extension['string']} */
		const string = {
			[38]: characterReference,
			[92]: characterEscape
		};
		/** @satisfies {Extension['text']} */
		const text$1 = {
			[-5]: lineEnding,
			[-4]: lineEnding,
			[-3]: lineEnding,
			[33]: labelStartImage,
			[38]: characterReference,
			[42]: attention,
			[60]: [autolink, htmlText],
			[91]: labelStartLink,
			[92]: [hardBreakEscape, characterEscape],
			[93]: labelEnd,
			[95]: attention,
			[96]: codeText
		};
		/** @satisfies {Extension['insideSpan']} */
		const insideSpan = { null: [attention, resolver] };
		/** @satisfies {Extension['attentionMarkers']} */
		const attentionMarkers = { null: [42, 95] };
		/** @satisfies {Extension['disable']} */
		const disable = { null: [] };
		//#endregion
		//#region node_modules/micromark/lib/create-tokenizer.js
		/**
		* @import {
		*   Chunk,
		*   Code,
		*   ConstructRecord,
		*   Construct,
		*   Effects,
		*   InitialConstruct,
		*   ParseContext,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @callback Restore
		*   Restore the state.
		* @returns {undefined}
		*   Nothing.
		*
		* @typedef Info
		*   Info.
		* @property {Restore} restore
		*   Restore.
		* @property {number} from
		*   From.
		*
		* @callback ReturnHandle
		*   Handle a successful run.
		* @param {Construct} construct
		*   Construct.
		* @param {Info} info
		*   Info.
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* Create a tokenizer.
		* Tokenizers deal with one type of data (e.g., containers, flow, text).
		* The parser is the object dealing with it all.
		* `initialize` works like other constructs, except that only its `tokenize`
		* function is used, in which case it doesn’t receive an `ok` or `nok`.
		* `from` can be given to set the point before the first character, although
		* when further lines are indented, they must be set with `defineSkip`.
		*
		* @param {ParseContext} parser
		*   Parser.
		* @param {InitialConstruct} initialize
		*   Construct.
		* @param {Omit<Point, '_bufferIndex' | '_index'> | undefined} [from]
		*   Point (optional).
		* @returns {TokenizeContext}
		*   Context.
		*/
		function createTokenizer(parser, initialize, from) {
			/** @type {Point} */
			let point = {
				_bufferIndex: -1,
				_index: 0,
				line: from && from.line || 1,
				column: from && from.column || 1,
				offset: from && from.offset || 0
			};
			/** @type {Record<string, number>} */
			const columnStart = {};
			/** @type {Array<Construct>} */
			const resolveAllConstructs = [];
			/** @type {Array<Chunk>} */
			let chunks = [];
			/** @type {Array<Token>} */
			let stack = [];
			/**
			* Tools used for tokenizing.
			*
			* @type {Effects}
			*/
			const effects = {
				attempt: constructFactory(onsuccessfulconstruct),
				check: constructFactory(onsuccessfulcheck),
				consume,
				enter,
				exit,
				interrupt: constructFactory(onsuccessfulcheck, { interrupt: true })
			};
			/**
			* State and tools for resolving and serializing.
			*
			* @type {TokenizeContext}
			*/
			const context = {
				code: null,
				containerState: {},
				defineSkip,
				events: [],
				now,
				parser,
				previous: null,
				sliceSerialize,
				sliceStream,
				write
			};
			/**
			* The state function.
			*
			* @type {State | undefined}
			*/
			let state = initialize.tokenize.call(context, effects);
			if (initialize.resolveAll) resolveAllConstructs.push(initialize);
			return context;
			/** @type {TokenizeContext['write']} */
			function write(slice) {
				chunks = push(chunks, slice);
				main();
				if (chunks[chunks.length - 1] !== null) return [];
				addResult(initialize, 0);
				context.events = resolveAll(resolveAllConstructs, context.events, context);
				return context.events;
			}
			/** @type {TokenizeContext['sliceSerialize']} */
			function sliceSerialize(token, expandTabs) {
				return serializeChunks(sliceStream(token), expandTabs);
			}
			/** @type {TokenizeContext['sliceStream']} */
			function sliceStream(token) {
				return sliceChunks(chunks, token);
			}
			/** @type {TokenizeContext['now']} */
			function now() {
				const { _bufferIndex, _index, line, column, offset } = point;
				return {
					_bufferIndex,
					_index,
					line,
					column,
					offset
				};
			}
			/** @type {TokenizeContext['defineSkip']} */
			function defineSkip(value) {
				columnStart[value.line] = value.column;
				accountForPotentialSkip();
			}
			/**
			* Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
			* `consume`).
			* Here is where we walk through the chunks, which either include strings of
			* several characters, or numerical character codes.
			* The reason to do this in a loop instead of a call is so the stack can
			* drain.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function main() {
				while (point._index < chunks.length) {
					const chunk = chunks[point._index];
					if (typeof chunk === "string") {
						const chunkIndex = point._index;
						if (point._bufferIndex < 0) point._bufferIndex = 0;
						while (point._index === chunkIndex && point._bufferIndex < chunk.length) go(chunk.charCodeAt(point._bufferIndex));
					} else go(chunk);
				}
			}
			/**
			* Deal with one code.
			*
			* @param {Code} code
			*   Code.
			* @returns {undefined}
			*   Nothing.
			*/
			function go(code) {
				state = state(code);
			}
			/** @type {Effects['consume']} */
			function consume(code) {
				if (markdownLineEnding(code)) {
					point.line++;
					point.column = 1;
					point.offset += code === -3 ? 2 : 1;
					accountForPotentialSkip();
				} else if (code !== -1) {
					point.column++;
					point.offset++;
				}
				if (point._bufferIndex < 0) point._index++;
				else {
					point._bufferIndex++;
					if (point._bufferIndex === chunks[point._index].length) {
						point._bufferIndex = -1;
						point._index++;
					}
				}
				context.previous = code;
			}
			/** @type {Effects['enter']} */
			function enter(type, fields) {
				/** @type {Token} */
				const token = fields || {};
				token.type = type;
				token.start = now();
				context.events.push([
					"enter",
					token,
					context
				]);
				stack.push(token);
				return token;
			}
			/** @type {Effects['exit']} */
			function exit(type) {
				const token = stack.pop();
				token.end = now();
				context.events.push([
					"exit",
					token,
					context
				]);
				return token;
			}
			/**
			* Use results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulconstruct(construct, info) {
				addResult(construct, info.from);
			}
			/**
			* Discard results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulcheck(_, info) {
				info.restore();
			}
			/**
			* Factory to attempt/check/interrupt.
			*
			* @param {ReturnHandle} onreturn
			*   Callback.
			* @param {{interrupt?: boolean | undefined} | undefined} [fields]
			*   Fields.
			*/
			function constructFactory(onreturn, fields) {
				return hook;
				/**
				* Handle either an object mapping codes to constructs, a list of
				* constructs, or a single construct.
				*
				* @param {Array<Construct> | ConstructRecord | Construct} constructs
				*   Constructs.
				* @param {State} returnState
				*   State.
				* @param {State | undefined} [bogusState]
				*   State.
				* @returns {State}
				*   State.
				*/
				function hook(constructs, returnState, bogusState) {
					/** @type {ReadonlyArray<Construct>} */
					let listOfConstructs;
					/** @type {number} */
					let constructIndex;
					/** @type {Construct} */
					let currentConstruct;
					/** @type {Info} */
					let info;
					return Array.isArray(constructs) ? handleListOfConstructs(constructs) : "tokenize" in constructs ? handleListOfConstructs([constructs]) : handleMapOfConstructs(constructs);
					/**
					* Handle a list of construct.
					*
					* @param {ConstructRecord} map
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleMapOfConstructs(map) {
						return start;
						/** @type {State} */
						function start(code) {
							const left = code !== null && map[code];
							const all = code !== null && map.null;
							return handleListOfConstructs([...Array.isArray(left) ? left : left ? [left] : [], ...Array.isArray(all) ? all : all ? [all] : []])(code);
						}
					}
					/**
					* Handle a list of construct.
					*
					* @param {ReadonlyArray<Construct>} list
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleListOfConstructs(list) {
						listOfConstructs = list;
						constructIndex = 0;
						if (list.length === 0) return bogusState;
						return handleConstruct(list[constructIndex]);
					}
					/**
					* Handle a single construct.
					*
					* @param {Construct} construct
					*   Construct.
					* @returns {State}
					*   State.
					*/
					function handleConstruct(construct) {
						return start;
						/** @type {State} */
						function start(code) {
							info = store();
							currentConstruct = construct;
							if (!construct.partial) context.currentConstruct = construct;
							if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) return nok(code);
							return construct.tokenize.call(fields ? Object.assign(Object.create(context), fields) : context, effects, ok, nok)(code);
						}
					}
					/** @type {State} */
					function ok(code) {
						onreturn(currentConstruct, info);
						return returnState;
					}
					/** @type {State} */
					function nok(code) {
						info.restore();
						if (++constructIndex < listOfConstructs.length) return handleConstruct(listOfConstructs[constructIndex]);
						return bogusState;
					}
				}
			}
			/**
			* @param {Construct} construct
			*   Construct.
			* @param {number} from
			*   From.
			* @returns {undefined}
			*   Nothing.
			*/
			function addResult(construct, from) {
				if (construct.resolveAll && !resolveAllConstructs.includes(construct)) resolveAllConstructs.push(construct);
				if (construct.resolve) splice(context.events, from, context.events.length - from, construct.resolve(context.events.slice(from), context));
				if (construct.resolveTo) context.events = construct.resolveTo(context.events, context);
			}
			/**
			* Store state.
			*
			* @returns {Info}
			*   Info.
			*/
			function store() {
				const startPoint = now();
				const startPrevious = context.previous;
				const startCurrentConstruct = context.currentConstruct;
				const startEventsIndex = context.events.length;
				const startStack = Array.from(stack);
				return {
					from: startEventsIndex,
					restore
				};
				/**
				* Restore state.
				*
				* @returns {undefined}
				*   Nothing.
				*/
				function restore() {
					point = startPoint;
					context.previous = startPrevious;
					context.currentConstruct = startCurrentConstruct;
					context.events.length = startEventsIndex;
					stack = startStack;
					accountForPotentialSkip();
				}
			}
			/**
			* Move the current point a bit forward in the line when it’s on a column
			* skip.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function accountForPotentialSkip() {
				if (point.line in columnStart && point.column < 2) {
					point.column = columnStart[point.line];
					point.offset += columnStart[point.line] - 1;
				}
			}
		}
		/**
		* Get the chunks from a slice of chunks in the range of a token.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {Pick<Token, 'end' | 'start'>} token
		*   Token.
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		function sliceChunks(chunks, token) {
			const startIndex = token.start._index;
			const startBufferIndex = token.start._bufferIndex;
			const endIndex = token.end._index;
			const endBufferIndex = token.end._bufferIndex;
			/** @type {Array<Chunk>} */
			let view;
			if (startIndex === endIndex) view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
			else {
				view = chunks.slice(startIndex, endIndex);
				if (startBufferIndex > -1) {
					const head = view[0];
					if (typeof head === "string") view[0] = head.slice(startBufferIndex);
					else view.shift();
				}
				if (endBufferIndex > 0) view.push(chunks[endIndex].slice(0, endBufferIndex));
			}
			return view;
		}
		/**
		* Get the string value of a slice of chunks.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {boolean | undefined} [expandTabs=false]
		*   Whether to expand tabs (default: `false`).
		* @returns {string}
		*   Result.
		*/
		function serializeChunks(chunks, expandTabs) {
			let index = -1;
			/** @type {Array<string>} */
			const result = [];
			/** @type {boolean | undefined} */
			let atTab;
			while (++index < chunks.length) {
				const chunk = chunks[index];
				/** @type {string} */
				let value;
				if (typeof chunk === "string") value = chunk;
				else switch (chunk) {
					case -5:
						value = "\r";
						break;
					case -4:
						value = "\n";
						break;
					case -3:
						value = "\r\n";
						break;
					case -2:
						value = expandTabs ? " " : "	";
						break;
					case -1:
						if (!expandTabs && atTab) continue;
						value = " ";
						break;
					default: value = String.fromCharCode(chunk);
				}
				atTab = chunk === -2;
				result.push(value);
			}
			return result.join("");
		}
		//#endregion
		//#region node_modules/micromark/lib/parse.js
		/**
		* @import {
		*   Create,
		*   FullNormalizedExtension,
		*   InitialConstruct,
		*   ParseContext,
		*   ParseOptions
		* } from 'micromark-util-types'
		*/
		/**
		* @param {ParseOptions | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ParseContext}
		*   Parser.
		*/
		function parse(options) {
			/** @type {ParseContext} */
			const parser = {
				constructs: combineExtensions([constructs_exports, ...(options || {}).extensions || []]),
				content: create(content$1),
				defined: [],
				document: create(document$2),
				flow: create(flow$1),
				lazy: {},
				string: create(string$1),
				text: create(text$2)
			};
			return parser;
			/**
			* @param {InitialConstruct} initial
			*   Construct to start with.
			* @returns {Create}
			*   Create a tokenizer.
			*/
			function create(initial) {
				return creator;
				/** @type {Create} */
				function creator(from) {
					return createTokenizer(parser, initial, from);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/postprocess.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @param {Array<Event>} events
		*   Events.
		* @returns {Array<Event>}
		*   Events.
		*/
		function postprocess(events) {
			while (!subtokenize(events));
			return events;
		}
		//#endregion
		//#region node_modules/micromark/lib/preprocess.js
		/**
		* @import {Chunk, Code, Encoding, Value} from 'micromark-util-types'
		*/
		/**
		* @callback Preprocessor
		*   Preprocess a value.
		* @param {Value} value
		*   Value.
		* @param {Encoding | null | undefined} [encoding]
		*   Encoding when `value` is a typed array (optional).
		* @param {boolean | null | undefined} [end=false]
		*   Whether this is the last chunk (default: `false`).
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		const search = /[\0\t\n\r]/g;
		/**
		* @returns {Preprocessor}
		*   Preprocess a value.
		*/
		function preprocess() {
			let column = 1;
			let buffer = "";
			/** @type {boolean | undefined} */
			let start = true;
			/** @type {boolean | undefined} */
			let atCarriageReturn;
			return preprocessor;
			/** @type {Preprocessor} */
			function preprocessor(value, encoding, end) {
				value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
				/** @type {Array<Chunk>} */
				const chunks = [];
				let startPosition = 0;
				buffer = "";
				if (start) {
					if (value.charCodeAt(0) === 65279) startPosition++;
					start = void 0;
				}
				while (startPosition < value.length) {
					search.lastIndex = startPosition;
					const match = search.exec(value);
					const endPosition = match && match.index !== void 0 ? match.index : value.length;
					const code = value.charCodeAt(endPosition);
					if (!match) {
						buffer = value.slice(startPosition);
						break;
					}
					if (code === 10 && startPosition === endPosition && atCarriageReturn) {
						chunks.push(-3);
						atCarriageReturn = void 0;
					} else {
						if (atCarriageReturn) {
							chunks.push(-5);
							atCarriageReturn = void 0;
						}
						if (startPosition < endPosition) {
							chunks.push(value.slice(startPosition, endPosition));
							column += endPosition - startPosition;
						}
						switch (code) {
							case 0:
								chunks.push(65533);
								column++;
								break;
							case 9: {
								const next = Math.ceil(column / 4) * 4;
								chunks.push(-2);
								while (column++ < next) chunks.push(-1);
								break;
							}
							case 10:
								chunks.push(-4);
								column = 1;
								break;
							default:
								atCarriageReturn = true;
								column = 1;
						}
					}
					startPosition = endPosition + 1;
				}
				if (end) {
					if (atCarriageReturn) chunks.push(-5);
					if (buffer) chunks.push(buffer);
					chunks.push(null);
				}
				return chunks;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-decode-numeric-character-reference/index.js
		/**
		* Turn the number (in string form as either hexa- or plain decimal) coming from
		* a numeric character reference into a character.
		*
		* Sort of like `String.fromCharCode(Number.parseInt(value, base))`, but makes
		* non-characters and control characters safe.
		*
		* @param {string} value
		*   Value to decode.
		* @param {number} base
		*   Numeric base.
		* @returns {string}
		*   Character.
		*/
		function decodeNumericCharacterReference(value, base) {
			const code = Number.parseInt(value, base);
			if (code < 9 || code === 11 || code > 13 && code < 32 || code > 126 && code < 160 || code > 55295 && code < 57344 || code > 64975 && code < 65008 || (code & 65535) === 65535 || (code & 65535) === 65534 || code > 1114111) return "�";
			return String.fromCharCode(code);
		}
		//#endregion
		//#region node_modules/micromark-util-decode-string/index.js
		const characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
		/**
		* Decode markdown strings (which occur in places such as fenced code info
		* strings, destinations, labels, and titles).
		*
		* The “string” content type allows character escapes and -references.
		* This decodes those.
		*
		* @param {string} value
		*   Value to decode.
		* @returns {string}
		*   Decoded value.
		*/
		function decodeString(value) {
			return value.replace(characterEscapeOrReference, decode);
		}
		/**
		* @param {string} $0
		*   Match.
		* @param {string} $1
		*   Character escape.
		* @param {string} $2
		*   Character reference.
		* @returns {string}
		*   Decoded value
		*/
		function decode($0, $1, $2) {
			if ($1) return $1;
			if ($2.charCodeAt(0) === 35) {
				const head = $2.charCodeAt(1);
				const hex = head === 120 || head === 88;
				return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
			}
			return decodeNamedCharacterReference($2) || $0;
		}
		//#endregion
		//#region node_modules/unist-util-stringify-position/lib/index.js
		/**
		* @typedef {import('unist').Node} Node
		* @typedef {import('unist').Point} Point
		* @typedef {import('unist').Position} Position
		*/
		/**
		* @typedef NodeLike
		* @property {string} type
		* @property {PositionLike | null | undefined} [position]
		*
		* @typedef PointLike
		* @property {number | null | undefined} [line]
		* @property {number | null | undefined} [column]
		* @property {number | null | undefined} [offset]
		*
		* @typedef PositionLike
		* @property {PointLike | null | undefined} [start]
		* @property {PointLike | null | undefined} [end]
		*/
		/**
		* Serialize the positional info of a point, position (start and end points),
		* or node.
		*
		* @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
		*   Node, position, or point.
		* @returns {string}
		*   Pretty printed positional info of a node (`string`).
		*
		*   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
		*   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
		*   column, `s` for `start`, and `e` for end.
		*   An empty string (`''`) is returned if the given value is neither `node`,
		*   `position`, nor `point`.
		*/
		function stringifyPosition(value) {
			if (!value || typeof value !== "object") return "";
			if ("position" in value || "type" in value) return position(value.position);
			if ("start" in value || "end" in value) return position(value);
			if ("line" in value || "column" in value) return point$1(value);
			return "";
		}
		/**
		* @param {Point | PointLike | null | undefined} point
		* @returns {string}
		*/
		function point$1(point) {
			return index(point && point.line) + ":" + index(point && point.column);
		}
		/**
		* @param {Position | PositionLike | null | undefined} pos
		* @returns {string}
		*/
		function position(pos) {
			return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
		}
		/**
		* @param {number | null | undefined} value
		* @returns {number}
		*/
		function index(value) {
			return value && typeof value === "number" ? value : 1;
		}
		//#endregion
		//#region node_modules/mdast-util-from-markdown/lib/index.js
		/**
		* @import {
		*   Break,
		*   Blockquote,
		*   Code,
		*   Definition,
		*   Emphasis,
		*   Heading,
		*   Html,
		*   Image,
		*   InlineCode,
		*   Link,
		*   ListItem,
		*   List,
		*   Nodes,
		*   Paragraph,
		*   PhrasingContent,
		*   ReferenceType,
		*   Root,
		*   Strong,
		*   Text,
		*   ThematicBreak
		* } from 'mdast'
		* @import {
		*   Encoding,
		*   Event,
		*   Token,
		*   Value
		* } from 'micromark-util-types'
		* @import {Point} from 'unist'
		* @import {
		*   CompileContext,
		*   CompileData,
		*   Config,
		*   Extension,
		*   Handle,
		*   OnEnterError,
		*   Options
		* } from './types.js'
		*/
		const own = {}.hasOwnProperty;
		/**
		* Turn markdown into a syntax tree.
		*
		* @overload
		* @param {Value} value
		* @param {Encoding | null | undefined} [encoding]
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @overload
		* @param {Value} value
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @param {Value} value
		*   Markdown to parse.
		* @param {Encoding | Options | null | undefined} [encoding]
		*   Character encoding for when `value` is `Buffer`.
		* @param {Options | null | undefined} [options]
		*   Configuration.
		* @returns {Root}
		*   mdast tree.
		*/
		function fromMarkdown(value, encoding, options) {
			if (encoding && typeof encoding === "object") {
				options = encoding;
				encoding = void 0;
			}
			return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
		}
		/**
		* Note this compiler only understand complete buffering, not streaming.
		*
		* @param {Options | null | undefined} [options]
		*/
		function compiler(options) {
			/** @type {Config} */
			const config = {
				afterExit: [],
				beforeEnter: [],
				transforms: [],
				canContainEols: [
					"emphasis",
					"fragment",
					"heading",
					"paragraph",
					"strong"
				],
				enter: {
					autolink: opener(link),
					autolinkProtocol: onenterdata,
					autolinkEmail: onenterdata,
					atxHeading: opener(heading),
					blockQuote: opener(blockQuote),
					characterEscape: onenterdata,
					characterReference: onenterdata,
					codeFenced: opener(codeFlow),
					codeFencedFenceInfo: buffer,
					codeFencedFenceMeta: buffer,
					codeIndented: opener(codeFlow, buffer),
					codeText: opener(codeText, buffer),
					codeTextData: onenterdata,
					data: onenterdata,
					codeFlowValue: onenterdata,
					definition: opener(definition),
					definitionDestinationString: buffer,
					definitionLabelString: buffer,
					definitionTitleString: buffer,
					emphasis: opener(emphasis),
					hardBreakEscape: opener(hardBreak),
					hardBreakTrailing: opener(hardBreak),
					htmlFlow: opener(html, buffer),
					htmlFlowData: onenterdata,
					htmlText: opener(html, buffer),
					htmlTextData: onenterdata,
					image: opener(image),
					label: buffer,
					link: opener(link),
					listItem: opener(listItem),
					listItemValue: onenterlistitemvalue,
					listOrdered: opener(list, onenterlistordered),
					listUnordered: opener(list),
					paragraph: opener(paragraph),
					reference: onenterreference,
					referenceString: buffer,
					resourceDestinationString: buffer,
					resourceTitleString: buffer,
					setextHeading: opener(heading),
					strong: opener(strong),
					thematicBreak: opener(thematicBreak)
				},
				exit: {
					atxHeading: closer(),
					atxHeadingSequence: onexitatxheadingsequence,
					autolink: closer(),
					autolinkEmail: onexitautolinkemail,
					autolinkProtocol: onexitautolinkprotocol,
					blockQuote: closer(),
					characterEscapeValue: onexitdata,
					characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
					characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
					characterReferenceValue: onexitcharacterreferencevalue,
					characterReference: onexitcharacterreference,
					codeFenced: closer(onexitcodefenced),
					codeFencedFence: onexitcodefencedfence,
					codeFencedFenceInfo: onexitcodefencedfenceinfo,
					codeFencedFenceMeta: onexitcodefencedfencemeta,
					codeFlowValue: onexitdata,
					codeIndented: closer(onexitcodeindented),
					codeText: closer(onexitcodetext),
					codeTextData: onexitdata,
					data: onexitdata,
					definition: closer(),
					definitionDestinationString: onexitdefinitiondestinationstring,
					definitionLabelString: onexitdefinitionlabelstring,
					definitionTitleString: onexitdefinitiontitlestring,
					emphasis: closer(),
					hardBreakEscape: closer(onexithardbreak),
					hardBreakTrailing: closer(onexithardbreak),
					htmlFlow: closer(onexithtmlflow),
					htmlFlowData: onexitdata,
					htmlText: closer(onexithtmltext),
					htmlTextData: onexitdata,
					image: closer(onexitimage),
					label: onexitlabel,
					labelText: onexitlabeltext,
					lineEnding: onexitlineending,
					link: closer(onexitlink),
					listItem: closer(),
					listOrdered: closer(),
					listUnordered: closer(),
					paragraph: closer(),
					referenceString: onexitreferencestring,
					resourceDestinationString: onexitresourcedestinationstring,
					resourceTitleString: onexitresourcetitlestring,
					resource: onexitresource,
					setextHeading: closer(onexitsetextheading),
					setextHeadingLineSequence: onexitsetextheadinglinesequence,
					setextHeadingText: onexitsetextheadingtext,
					strong: closer(),
					thematicBreak: closer()
				}
			};
			configure(config, (options || {}).mdastExtensions || []);
			/** @type {CompileData} */
			const data = {};
			return compile;
			/**
			* Turn micromark events into an mdast tree.
			*
			* @param {Array<Event>} events
			*   Events.
			* @returns {Root}
			*   mdast tree.
			*/
			function compile(events) {
				/** @type {Root} */
				let tree = {
					type: "root",
					children: [],
					position: void 0
				};
				/** @type {Omit<CompileContext, 'sliceSerialize'>} */
				const context = {
					stack: [tree],
					tokenStack: [],
					config,
					enter,
					exit,
					buffer,
					resume,
					data
				};
				/** @type {Array<number>} */
				const listStack = [];
				/** @type {Array<Event>} */
				const prepared = [];
				let index = -1;
				while (++index < events.length) {
					prepared.push(events[index]);
					if (events[index][1].type === "listOrdered" || events[index][1].type === "listUnordered") if (events[index][0] === "enter") listStack.push(prepared.length - 1);
					else prepareList(prepared, listStack.pop());
				}
				events = prepared;
				index = -1;
				while (++index < events.length) {
					const handler = config[events[index][0]];
					if (events[index][0] === "enter" && config.beforeEnter.length > 0) callListeners(config.beforeEnter, {
						...context,
						sliceSerialize: events[index][2].sliceSerialize
					}, events[index][1]);
					if (own.call(handler, events[index][1].type)) handler[events[index][1].type].call({
						...context,
						sliceSerialize: events[index][2].sliceSerialize
					}, events[index][1]);
					if (events[index][0] === "exit" && config.afterExit.length > 0) callListeners(config.afterExit, {
						...context,
						sliceSerialize: events[index][2].sliceSerialize
					}, events[index][1]);
				}
				if (context.tokenStack.length > 0) {
					const tail = context.tokenStack[context.tokenStack.length - 1];
					(tail[1] || defaultOnError).call(context, void 0, tail[0]);
				}
				tree.position = {
					start: point(events.length > 0 ? events[0][1].start : {
						line: 1,
						column: 1,
						offset: 0
					}),
					end: point(events.length > 0 ? events[events.length - 2][1].end : {
						line: 1,
						column: 1,
						offset: 0
					})
				};
				index = -1;
				while (++index < config.transforms.length) tree = config.transforms[index](tree) || tree;
				return tree;
			}
			/**
			* @param {Array<Handle>} listeners
			*   Listeners.
			* @param {CompileContext} context
			*   Context.
			* @param {Token} token
			*   Token.
			* @returns {undefined}
			*   Nothing.
			*/
			function callListeners(listeners, context, token) {
				let index = -1;
				while (++index < listeners.length) listeners[index].call(context, token);
			}
			/**
			* @param {Array<Event>} events
			*   Events, ending with the list to prepare.
			* @param {number} start
			*   Index of the list enter.
			* @returns {undefined}
			*/
			function prepareList(events, start) {
				const end = events.length - 1;
				let index = start - 1;
				let containerBalance = -1;
				let listSpread = false;
				/** @type {Token | undefined} */
				let listItem;
				/** @type {number | undefined} */
				let lineIndex;
				/** @type {number | undefined} */
				let firstBlankLineIndex;
				/** @type {boolean | undefined} */
				let atMarker;
				/**
				* `listItem` events to insert before the event at `at`, in walk order.
				* Merged in after the walk, as inserting while walking would shift the
				* rest of the list once per item.
				* @type {Array<{at: number, event: Event}>}
				*/
				const insertions = [];
				while (++index <= end) {
					const event = events[index];
					switch (event[1].type) {
						case "listUnordered":
						case "listOrdered":
						case "blockQuote":
							if (event[0] === "enter") containerBalance++;
							else containerBalance--;
							atMarker = void 0;
							break;
						case "lineEndingBlank":
							if (event[0] === "enter") {
								if (listItem && !atMarker && !containerBalance && !firstBlankLineIndex) firstBlankLineIndex = index;
								atMarker = void 0;
							}
							break;
						case "linePrefix":
						case "listItemValue":
						case "listItemMarker":
						case "listItemPrefix":
						case "listItemPrefixWhitespace": break;
						default: atMarker = void 0;
					}
					if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
						if (listItem) {
							let tailIndex = index;
							lineIndex = void 0;
							while (tailIndex--) {
								const tailEvent = events[tailIndex];
								if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
									if (tailEvent[0] === "exit") continue;
									if (lineIndex) {
										events[lineIndex][1].type = "lineEndingBlank";
										listSpread = true;
									}
									tailEvent[1].type = "lineEnding";
									lineIndex = tailIndex;
								} else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {} else break;
							}
							if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) listItem._spread = true;
							listItem.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
							insertions.push({
								at: lineIndex || index,
								event: [
									"exit",
									listItem,
									event[2]
								]
							});
						}
						if (event[1].type === "listItemPrefix") {
							/** @type {Token} */
							const item = {
								type: "listItem",
								_spread: false,
								start: Object.assign({}, event[1].start),
								end: void 0
							};
							listItem = item;
							insertions.push({
								at: index,
								event: [
									"enter",
									item,
									event[2]
								]
							});
							firstBlankLineIndex = void 0;
							atMarker = true;
						}
					}
				}
				const listEvents = events.splice(start);
				let insertion = 0;
				index = -1;
				while (++index < listEvents.length) {
					while (insertion < insertions.length && insertions[insertion].at === start + index) events.push(insertions[insertion++].event);
					events.push(listEvents[index]);
				}
				events[start][1]._spread = listSpread;
			}
			/**
			* Create an opener handle.
			*
			* @param {(token: Token) => Nodes} create
			*   Create a node.
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function opener(create, and) {
				return open;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function open(token) {
					enter.call(this, create(token), token);
					if (and) and.call(this, token);
				}
			}
			/**
			* @type {CompileContext['buffer']}
			*/
			function buffer() {
				this.stack.push({
					type: "fragment",
					children: []
				});
			}
			/**
			* @type {CompileContext['enter']}
			*/
			function enter(node, token, errorHandler) {
				this.stack[this.stack.length - 1].children.push(node);
				this.stack.push(node);
				this.tokenStack.push([token, errorHandler || void 0]);
				node.position = {
					start: point(token.start),
					end: void 0
				};
			}
			/**
			* Create a closer handle.
			*
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function closer(and) {
				return close;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function close(token) {
					if (and) and.call(this, token);
					exit.call(this, token);
				}
			}
			/**
			* @type {CompileContext['exit']}
			*/
			function exit(token, onExitError) {
				const node = this.stack.pop();
				const open = this.tokenStack.pop();
				if (!open) throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
					start: token.start,
					end: token.end
				}) + "): it’s not open");
				if (open[0].type !== token.type) if (onExitError) onExitError.call(this, token, open[0]);
				else (open[1] || defaultOnError).call(this, token, open[0]);
				node.position.end = point(token.end);
			}
			/**
			* @type {CompileContext['resume']}
			*/
			function resume() {
				return toString(this.stack.pop());
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistordered() {
				this.data.expectingFirstListItemValue = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistitemvalue(token) {
				if (this.data.expectingFirstListItemValue) {
					const ancestor = this.stack[this.stack.length - 2];
					ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
					this.data.expectingFirstListItemValue = void 0;
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfenceinfo() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.lang = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfencemeta() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.meta = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfence() {
				if (this.data.flowCodeInside) return;
				this.buffer();
				this.data.flowCodeInside = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefenced() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
				this.data.flowCodeInside = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodeindented() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/(\r?\n|\r)$/g, "");
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitionlabelstring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiontitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiondestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitatxheadingsequence(token) {
				const node = this.stack[this.stack.length - 1];
				if (!node.depth) node.depth = this.sliceSerialize(token).length;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadingtext() {
				this.data.setextHeadingSlurpLineEnding = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadinglinesequence(token) {
				const node = this.stack[this.stack.length - 1];
				node.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheading() {
				this.data.setextHeadingSlurpLineEnding = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterdata(token) {
				/** @type {Array<Nodes>} */
				const siblings = this.stack[this.stack.length - 1].children;
				let tail = siblings[siblings.length - 1];
				if (!tail || tail.type !== "text") {
					tail = text();
					tail.position = {
						start: point(token.start),
						end: void 0
					};
					siblings.push(tail);
				}
				this.stack.push(tail);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdata(token) {
				const tail = this.stack.pop();
				tail.value += this.sliceSerialize(token);
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlineending(token) {
				const context = this.stack[this.stack.length - 1];
				if (this.data.atHardBreak) {
					const tail = context.children[context.children.length - 1];
					tail.position.end = point(token.end);
					this.data.atHardBreak = void 0;
					return;
				}
				if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
					onenterdata.call(this, token);
					onexitdata.call(this, token);
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithardbreak() {
				this.data.atHardBreak = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmlflow() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmltext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodetext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlink() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitimage() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabeltext(token) {
				const string = this.sliceSerialize(token);
				const ancestor = this.stack[this.stack.length - 2];
				ancestor.label = decodeString(string);
				ancestor.identifier = normalizeIdentifier(string).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabel() {
				const fragment = this.stack[this.stack.length - 1];
				const value = this.resume();
				const node = this.stack[this.stack.length - 1];
				this.data.inReference = true;
				if (node.type === "link") node.children = fragment.children;
				else node.alt = value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcedestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcetitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresource() {
				this.data.inReference = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterreference() {
				this.data.referenceType = "collapsed";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitreferencestring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
				this.data.referenceType = "full";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencemarker(token) {
				this.data.characterReferenceType = token.type;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencevalue(token) {
				const data = this.sliceSerialize(token);
				const type = this.data.characterReferenceType;
				/** @type {string} */
				let value;
				if (type) {
					value = decodeNumericCharacterReference(data, type === "characterReferenceMarkerNumeric" ? 10 : 16);
					this.data.characterReferenceType = void 0;
				} else value = decodeNamedCharacterReference(data);
				const tail = this.stack[this.stack.length - 1];
				tail.value += value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreference(token) {
				const tail = this.stack.pop();
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkprotocol(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = this.sliceSerialize(token);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkemail(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = "mailto:" + this.sliceSerialize(token);
			}
			/** @returns {Blockquote} */
			function blockQuote() {
				return {
					type: "blockquote",
					children: [],
					position: void 0
				};
			}
			/** @returns {Code} */
			function codeFlow() {
				return {
					type: "code",
					lang: null,
					meta: null,
					value: "",
					position: void 0
				};
			}
			/** @returns {InlineCode} */
			function codeText() {
				return {
					type: "inlineCode",
					value: "",
					position: void 0
				};
			}
			/** @returns {Definition} */
			function definition() {
				return {
					type: "definition",
					identifier: "",
					label: null,
					title: null,
					url: "",
					position: void 0
				};
			}
			/** @returns {Emphasis} */
			function emphasis() {
				return {
					type: "emphasis",
					children: [],
					position: void 0
				};
			}
			/** @returns {Heading} */
			function heading() {
				return {
					type: "heading",
					depth: 0,
					children: [],
					position: void 0
				};
			}
			/** @returns {Break} */
			function hardBreak() {
				return {
					type: "break",
					position: void 0
				};
			}
			/** @returns {Html} */
			function html() {
				return {
					type: "html",
					value: "",
					position: void 0
				};
			}
			/** @returns {Image} */
			function image() {
				return {
					type: "image",
					title: null,
					url: "",
					alt: null,
					position: void 0
				};
			}
			/** @returns {Link} */
			function link() {
				return {
					type: "link",
					title: null,
					url: "",
					children: [],
					position: void 0
				};
			}
			/**
			* @param {Token} token
			* @returns {List}
			*/
			function list(token) {
				return {
					type: "list",
					ordered: token.type === "listOrdered",
					start: null,
					spread: token._spread,
					children: [],
					position: void 0
				};
			}
			/**
			* @param {Token} token
			* @returns {ListItem}
			*/
			function listItem(token) {
				return {
					type: "listItem",
					spread: token._spread,
					checked: null,
					children: [],
					position: void 0
				};
			}
			/** @returns {Paragraph} */
			function paragraph() {
				return {
					type: "paragraph",
					children: [],
					position: void 0
				};
			}
			/** @returns {Strong} */
			function strong() {
				return {
					type: "strong",
					children: [],
					position: void 0
				};
			}
			/** @returns {Text} */
			function text() {
				return {
					type: "text",
					value: "",
					position: void 0
				};
			}
			/** @returns {ThematicBreak} */
			function thematicBreak() {
				return {
					type: "thematicBreak",
					position: void 0
				};
			}
		}
		/**
		* Copy a point-like value.
		*
		* @param {Point} d
		*   Point-like value.
		* @returns {Point}
		*   unist point.
		*/
		function point(d) {
			return {
				line: d.line,
				column: d.column,
				offset: d.offset
			};
		}
		/**
		* @param {Config} combined
		* @param {Array<Array<Extension> | Extension>} extensions
		* @returns {undefined}
		*/
		function configure(combined, extensions) {
			let index = -1;
			while (++index < extensions.length) {
				const value = extensions[index];
				if (Array.isArray(value)) configure(combined, value);
				else extension(combined, value);
			}
		}
		/**
		* @param {Config} combined
		* @param {Extension} extension
		* @returns {undefined}
		*/
		function extension(combined, extension) {
			/** @type {keyof Extension} */
			let key;
			for (key in extension) if (own.call(extension, key)) switch (key) {
				case "canContainEols": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "transforms": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "afterExit":
				case "beforeEnter": {
					const right = extension[key];
					if (right) combined[key].push(right);
					break;
				}
				case "enter":
				case "exit": {
					const right = extension[key];
					if (right) Object.assign(combined[key], right);
					break;
				}
			}
		}
		/** @type {OnEnterError} */
		function defaultOnError(left, right) {
			if (left) throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
				start: left.start,
				end: left.end
			}) + "): a different token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is open");
			throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is still open");
		}
		//#endregion
		//#region node_modules/ccount/index.js
		/**
		* Count how often a character (or substring) is used in a string.
		*
		* @param {string} value
		*   Value to search in.
		* @param {string} character
		*   Character (or substring) to look for.
		* @return {number}
		*   Number of times `character` occurred in `value`.
		*/
		function ccount(value, character) {
			const source = String(value);
			if (typeof character !== "string") throw new TypeError("Expected character");
			let count = 0;
			let index = source.indexOf(character);
			while (index !== -1) {
				count++;
				index = source.indexOf(character, index + character.length);
			}
			return count;
		}
		//#endregion
		//#region node_modules/escape-string-regexp/index.js
		function escapeStringRegexp(string) {
			if (typeof string !== "string") throw new TypeError("Expected a string");
			return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
		}
		//#endregion
		//#region node_modules/unist-util-is/lib/index.js
		/**
		* Generate an assertion from a test.
		*
		* Useful if you’re going to test many nodes, for example when creating a
		* utility where something else passes a compatible test.
		*
		* The created function is a bit faster because it expects valid input only:
		* a `node`, `index`, and `parent`.
		*
		* @param {Test} test
		*   *   when nullish, checks if `node` is a `Node`.
		*   *   when `string`, works like passing `(node) => node.type === test`.
		*   *   when `function` checks if function passed the node is true.
		*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
		*   *   when `array`, checks if any one of the subtests pass.
		* @returns {Check}
		*   An assertion.
		*/
		const convert = (
		/**
		* @param {Test} [test]
		* @returns {Check}
		*/
function(test) {
			if (test === null || test === void 0) return ok;
			if (typeof test === "function") return castFactory(test);
			if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
			if (typeof test === "string") return typeFactory(test);
			throw new Error("Expected function, string, or object as test");
		});
		/**
		* @param {Array<Props | TestFunction | string>} tests
		* @returns {Check}
		*/
		function anyFactory(tests) {
			/** @type {Array<Check>} */
			const checks = [];
			let index = -1;
			while (++index < tests.length) checks[index] = convert(tests[index]);
			return castFactory(any);
			/**
			* @this {unknown}
			* @type {TestFunction}
			*/
			function any(...parameters) {
				let index = -1;
				while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
				return false;
			}
		}
		/**
		* Turn an object into a test for a node with a certain fields.
		*
		* @param {Props} check
		* @returns {Check}
		*/
		function propertiesFactory(check) {
			const checkAsRecord = check;
			return castFactory(all);
			/**
			* @param {Node} node
			* @returns {boolean}
			*/
			function all(node) {
				const nodeAsRecord = node;
				/** @type {string} */
				let key;
				for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
				return true;
			}
		}
		/**
		* Turn a string into a test for a node with a certain type.
		*
		* @param {string} check
		* @returns {Check}
		*/
		function typeFactory(check) {
			return castFactory(type);
			/**
			* @param {Node} node
			*/
			function type(node) {
				return node && node.type === check;
			}
		}
		/**
		* Turn a custom test into a test for a node that passes that test.
		*
		* @param {TestFunction} testFunction
		* @returns {Check}
		*/
		function castFactory(testFunction) {
			return check;
			/**
			* @this {unknown}
			* @type {Check}
			*/
			function check(value, index, parent) {
				return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
			}
		}
		function ok() {
			return true;
		}
		/**
		* @param {unknown} value
		* @returns {value is Node}
		*/
		function looksLikeANode(value) {
			return value !== null && typeof value === "object" && "type" in value;
		}
		//#endregion
		//#region node_modules/unist-util-visit-parents/lib/color.node.js
		/**
		* @param {string} d
		* @returns {string}
		*/
		function color(d) {
			return "\x1B[33m" + d + "\x1B[39m";
		}
		//#endregion
		//#region node_modules/unist-util-visit-parents/lib/index.js
		/**
		* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
		*/
		/**
		* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
		*   Test from `unist-util-is`.
		*
		*   Note: we have remove and add `undefined`, because otherwise when generating
		*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
		*   which doesn’t work when publishing on npm.
		*/
		/**
		* @typedef {(
		*   Fn extends (value: any) => value is infer Thing
		*   ? Thing
		*   : Fallback
		* )} Predicate
		*   Get the value of a type guard `Fn`.
		* @template Fn
		*   Value; typically function that is a type guard (such as `(x): x is Y`).
		* @template Fallback
		*   Value to yield if `Fn` is not a type guard.
		*/
		/**
		* @typedef {(
		*   Check extends null | undefined // No test.
		*   ? Value
		*   : Value extends {type: Check} // String (type) test.
		*   ? Value
		*   : Value extends Check // Partial test.
		*   ? Value
		*   : Check extends Function // Function test.
		*   ? Predicate<Check, Value> extends Value
		*     ? Predicate<Check, Value>
		*     : never
		*   : never // Some other test?
		* )} MatchesOne
		*   Check whether a node matches a primitive check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test, but not arrays.
		*/
		/**
		* @typedef {(
		*   Check extends ReadonlyArray<infer T>
		*   ? MatchesOne<Value, T>
		*   : Check extends Array<infer T>
		*   ? MatchesOne<Value, T>
		*   : MatchesOne<Value, Check>
		* )} Matches
		*   Check whether a node matches a check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test.
		*/
		/**
		* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
		*   Number; capped reasonably.
		*/
		/**
		* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
		*   Increment a number in the type system.
		* @template {Uint} [I=0]
		*   Index.
		*/
		/**
		* @typedef {(
		*   Node extends UnistParent
		*   ? Node extends {children: Array<infer Children>}
		*     ? Child extends Children ? Node : never
		*     : never
		*   : never
		* )} InternalParent
		*   Collect nodes that can be parents of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
		*   Collect nodes in `Tree` that can be parents of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Depth extends Max
		*   ? never
		*   :
		*     | InternalParent<Node, Child>
		*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
		* )} InternalAncestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Tree extends UnistParent
		*     ? Depth extends Max
		*       ? Tree
		*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
		*     : Tree
		* )} InclusiveDescendant
		*   Collect all (inclusive) descendants of `Tree`.
		*
		*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
		*   > recurse without actually running into an infinite loop, which the
		*   > previous version did.
		*   >
		*   > Practically, a max of `2` is typically enough assuming a `Root` is
		*   > passed, but it doesn’t improve performance.
		*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
		*   > Using up to `10` doesn’t hurt or help either.
		* @template {UnistNode} Tree
		*   Tree type.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {'skip' | boolean} Action
		*   Union of the action types.
		*
		* @typedef {number} Index
		*   Move to the sibling at `index` next (after node itself is completely
		*   traversed).
		*
		*   Useful if mutating the tree, such as removing the node the visitor is
		*   currently on, or any of its previous siblings.
		*   Results less than 0 or greater than or equal to `children.length` stop
		*   traversing the parent.
		*
		* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
		*   List with one or two values, the first an action, the second an index.
		*
		* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
		*   Any value that can be returned from a visitor.
		*/
		/**
		* @callback Visitor
		*   Handle a node (matching `test`, if given).
		*
		*   Visitors are free to transform `node`.
		*   They can also transform the parent of node (the last of `ancestors`).
		*
		*   Replacing `node` itself, if `SKIP` is not returned, still causes its
		*   descendants to be walked (which is a bug).
		*
		*   When adding or removing previous siblings of `node` (or next siblings, in
		*   case of reverse), the `Visitor` should return a new `Index` to specify the
		*   sibling to traverse after `node` is traversed.
		*   Adding or removing next siblings of `node` (or previous siblings, in case
		*   of reverse) is handled as expected without needing to return a new `Index`.
		*
		*   Removing the children property of an ancestor still results in them being
		*   traversed.
		* @param {Visited} node
		*   Found node.
		* @param {Array<VisitedParents>} ancestors
		*   Ancestors of `node`.
		* @returns {VisitorResult}
		*   What to do next.
		*
		*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
		*   An `Action` is treated as a tuple of `[Action]`.
		*
		*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
		*   When the `Action` is `EXIT`, that action can be returned.
		*   When the `Action` is `CONTINUE`, `Index` can be returned.
		* @template {UnistNode} [Visited=UnistNode]
		*   Visited node type.
		* @template {UnistParent} [VisitedParents=UnistParent]
		*   Ancestor type.
		*/
		/**
		* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
		*   Build a typed `Visitor` function from a tree and a test.
		*
		*   It will infer which values are passed as `node` and which as `parents`.
		* @template {UnistNode} [Tree=UnistNode]
		*   Tree type.
		* @template {Test} [Check=Test]
		*   Test type.
		*/
		/** @type {Readonly<ActionTuple>} */
		const empty = [];
		/**
		* Visit nodes, with ancestral information.
		*
		* This algorithm performs *depth-first* *tree traversal* in *preorder*
		* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
		*
		* You can choose for which nodes `visitor` is called by passing a `test`.
		* For complex tests, you should test yourself in `visitor`, as it will be
		* faster and will have improved type information.
		*
		* Walking the tree is an intensive task.
		* Make use of the return values of the visitor when possible.
		* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
		* to check if a node matches, and then perform different operations.
		*
		* You can change the tree.
		* See `Visitor` for more info.
		*
		* @overload
		* @param {Tree} tree
		* @param {Check} check
		* @param {BuildVisitor<Tree, Check>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @overload
		* @param {Tree} tree
		* @param {BuildVisitor<Tree>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @param {UnistNode} tree
		*   Tree to traverse.
		* @param {Visitor | Test} test
		*   `unist-util-is`-compatible test
		* @param {Visitor | boolean | null | undefined} [visitor]
		*   Handle each node.
		* @param {boolean | null | undefined} [reverse]
		*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
		* @returns {undefined}
		*   Nothing.
		*
		* @template {UnistNode} Tree
		*   Node type.
		* @template {Test} Check
		*   `unist-util-is`-compatible test.
		*/
		function visitParents(tree, test, visitor, reverse) {
			/** @type {Test} */
			let check;
			if (typeof test === "function" && typeof visitor !== "function") {
				reverse = visitor;
				visitor = test;
			} else check = test;
			const is = convert(check);
			const step = reverse ? -1 : 1;
			factory(tree, void 0, [])();
			/**
			* @param {UnistNode} node
			* @param {number | undefined} index
			* @param {Array<UnistParent>} parents
			*/
			function factory(node, index, parents) {
				const value = node && typeof node === "object" ? node : {};
				if (typeof value.type === "string") {
					const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
					Object.defineProperty(visit, "name", { value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")" });
				}
				return visit;
				function visit() {
					/** @type {Readonly<ActionTuple>} */
					let result = empty;
					/** @type {Readonly<ActionTuple>} */
					let subresult;
					/** @type {number} */
					let offset;
					/** @type {Array<UnistParent>} */
					let grandparents;
					if (!test || is(node, index, parents[parents.length - 1] || void 0)) {
						result = toResult(visitor(node, parents));
						if (result[0] === false) return result;
					}
					if ("children" in node && node.children) {
						const nodeAsParent = node;
						if (nodeAsParent.children && result[0] !== "skip") {
							offset = (reverse ? nodeAsParent.children.length : -1) + step;
							grandparents = parents.concat(nodeAsParent);
							while (offset > -1 && offset < nodeAsParent.children.length) {
								const child = nodeAsParent.children[offset];
								subresult = factory(child, offset, grandparents)();
								if (subresult[0] === false) return subresult;
								offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
							}
						}
					}
					return result;
				}
			}
		}
		/**
		* Turn a return value into a clean result.
		*
		* @param {VisitorResult} value
		*   Valid return values from visitors.
		* @returns {Readonly<ActionTuple>}
		*   Clean result.
		*/
		function toResult(value) {
			if (Array.isArray(value)) return value;
			if (typeof value === "number") return [true, value];
			return value === null || value === void 0 ? empty : [value];
		}
		//#endregion
		//#region node_modules/mdast-util-find-and-replace/lib/index.js
		/**
		* @import {Nodes, Parents, PhrasingContent, Root, Text} from 'mdast'
		* @import {BuildVisitor, Test, VisitorResult} from 'unist-util-visit-parents'
		*/
		/**
		* @typedef RegExpMatchObject
		*   Info on the match.
		* @property {number} index
		*   The index of the search at which the result was found.
		* @property {string} input
		*   A copy of the search string in the text node.
		* @property {[...Array<Parents>, Text]} stack
		*   All ancestors of the text node, where the last node is the text itself.
		*
		* @typedef {RegExp | string} Find
		*   Pattern to find.
		*
		*   Strings are escaped and then turned into global expressions.
		*
		* @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
		*   Several find and replaces, in array form.
		*
		* @typedef {[Find, Replace?]} FindAndReplaceTuple
		*   Find and replace in tuple form.
		*
		* @typedef {ReplaceFunction | string | null | undefined} Replace
		*   Thing to replace with.
		*
		* @callback ReplaceFunction
		*   Callback called when a search matches.
		* @param {...any} parameters
		*   The parameters are the result of corresponding search expression:
		*
		*   * `value` (`string`) — whole match
		*   * `...capture` (`Array<string>`) — matches from regex capture groups
		*   * `match` (`RegExpMatchObject`) — info on the match
		* @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
		*   Thing to replace with.
		*
		*   * when `null`, `undefined`, `''`, remove the match
		*   * …or when `false`, do not replace at all
		*   * …or when `string`, replace with a text node of that value
		*   * …or when `Node` or `Array<Node>`, replace with those nodes
		*
		* @typedef {[RegExp, ReplaceFunction]} Pair
		*   Normalized find and replace.
		*
		* @typedef {Array<Pair>} Pairs
		*   All find and replaced.
		*
		* @typedef Options
		*   Configuration.
		* @property {Test | null | undefined} [ignore]
		*   Test for which nodes to ignore (optional).
		*/
		/**
		* Find patterns in a tree and replace them.
		*
		* The algorithm searches the tree in *preorder* for complete values in `Text`
		* nodes.
		* Partial matches are not supported.
		*
		* @param {Nodes} tree
		*   Tree to change.
		* @param {FindAndReplaceList | FindAndReplaceTuple} list
		*   Patterns to find.
		* @param {Options | null | undefined} [options]
		*   Configuration (when `find` is not `Find`).
		* @returns {undefined}
		*   Nothing.
		*/
		function findAndReplace(tree, list, options) {
			const ignored = convert((options || {}).ignore || []);
			const pairs = toPairs(list);
			let pairIndex = -1;
			while (++pairIndex < pairs.length) visitParents(tree, "text", visitor);
			/**
			* Visit a text node, and handle it if it is not in an ignored parent.
			*
			* @type {BuildVisitor<Root, 'text'>}
			*/
			function visitor(node, parents) {
				let index = -1;
				/** @type {Parents | undefined} */
				let grandparent;
				while (++index < parents.length) {
					const parent = parents[index];
					/** @type {Array<Nodes> | undefined} */
					const siblings = grandparent ? grandparent.children : void 0;
					if (ignored(parent, siblings ? siblings.indexOf(parent) : void 0, grandparent)) return;
					grandparent = parent;
				}
				if (grandparent) return handler(node, parents);
			}
			/**
			* Handle a text node which is not in an ignored parent.
			*
			* @param {Text} node
			*   Text node to search in.
			* @param {Array<Parents>} parents
			*   Ancestors of `node`.
			* @returns {VisitorResult}
			*   Where to continue visiting.
			*/
			function handler(node, parents) {
				const parent = parents[parents.length - 1];
				const find = pairs[pairIndex][0];
				const replace = pairs[pairIndex][1];
				let start = 0;
				const index = parent.children.indexOf(node);
				let change = false;
				/** @type {Array<PhrasingContent>} */
				let nodes = [];
				find.lastIndex = 0;
				let match = find.exec(node.value);
				while (match) {
					const position = match.index;
					/** @type {RegExpMatchObject} */
					const matchObject = {
						index: match.index,
						input: match.input,
						stack: [...parents, node]
					};
					let value = replace(...match, matchObject);
					if (typeof value === "string") value = value.length > 0 ? {
						type: "text",
						value
					} : void 0;
					if (value === false) find.lastIndex = position + 1;
					else {
						if (start !== position) add({
							type: "text",
							value: node.value.slice(start, position)
						});
						if (Array.isArray(value)) for (const child of value) add(child);
						else if (value) add(value);
						start = position + match[0].length;
						change = true;
					}
					if (!find.global) break;
					match = find.exec(node.value);
				}
				if (change) {
					if (start < node.value.length) add({
						type: "text",
						value: node.value.slice(start)
					});
					parent.children.splice(index, 1, ...nodes);
				} else nodes = [node];
				return index + nodes.length;
				/**
				* Add a node.
				*
				* @param {PhrasingContent} child
				*   Node to add.
				* @returns {undefined}
				*   Nothing.
				*/
				function add(child) {
					const previous = nodes[nodes.length - 1];
					if (previous && previous.type === "text" && child.type === "text") previous.value += child.value;
					else nodes.push(child);
				}
			}
		}
		/**
		* Turn a tuple or a list of tuples into pairs.
		*
		* @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
		*   Schema.
		* @returns {Pairs}
		*   Clean pairs.
		*/
		function toPairs(tupleOrList) {
			if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
			/** @type {Pairs} */
			const result = [];
			/** @type {FindAndReplaceList} */
			const list = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
			let index = -1;
			while (++index < list.length) {
				const tuple = list[index];
				result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
			}
			return result;
		}
		/**
		* Turn a find into an expression.
		*
		* @param {Find} find
		*   Pattern to find.
		* @returns {RegExp}
		*   Global expression.
		*/
		function toExpression(find) {
			return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
		}
		/**
		* Turn a replace into a function.
		*
		* @param {Replace} replace
		*   Thing to replace with.
		* @returns {ReplaceFunction}
		*   Function that returns that thing.
		*/
		function toFunction(replace) {
			return typeof replace === "function" ? replace : function() {
				return replace;
			};
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-autolink-literal/lib/index.js
		/**
		* @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
		* @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
		* @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		* @import {Link, PhrasingContent} from 'mdast'
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM autolink
		* literals in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
		*/
		function gfmAutolinkLiteralFromMarkdown() {
			return {
				transforms: [transformGfmAutolinkLiterals],
				enter: {
					literalAutolink: enterLiteralAutolink,
					literalAutolinkEmail: enterLiteralAutolinkValue,
					literalAutolinkHttp: enterLiteralAutolinkValue,
					literalAutolinkWww: enterLiteralAutolinkValue
				},
				exit: {
					literalAutolink: exitLiteralAutolink,
					literalAutolinkEmail: exitLiteralAutolinkEmail,
					literalAutolinkHttp: exitLiteralAutolinkHttp,
					literalAutolinkWww: exitLiteralAutolinkWww
				}
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolink(token) {
			this.enter({
				type: "link",
				title: null,
				url: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolinkValue(token) {
			this.config.enter.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkHttp(token) {
			this.config.exit.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkWww(token) {
			this.config.exit.data.call(this, token);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.url = "http://" + this.sliceSerialize(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkEmail(token) {
			this.config.exit.autolinkEmail.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolink(token) {
			this.exit(token);
		}
		/** @type {FromMarkdownTransform} */
		function transformGfmAutolinkLiterals(tree) {
			findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} protocol
		* @param {string} domain
		* @param {string} path
		* @param {RegExpMatchObject} match
		* @returns {Array<PhrasingContent> | Link | false}
		*/
		function findUrl(_, protocol, domain, path, match) {
			let prefix = "";
			if (!previous(match)) return false;
			if (/^w/i.test(protocol)) {
				domain = protocol + domain;
				protocol = "";
				prefix = "http://";
			}
			if (!isCorrectDomain(domain)) return false;
			const parts = splitUrl(domain + path);
			if (!parts[0]) return false;
			/** @type {Link} */
			const result = {
				type: "link",
				title: null,
				url: prefix + protocol + parts[0],
				children: [{
					type: "text",
					value: protocol + parts[0]
				}]
			};
			if (parts[1]) return [result, {
				type: "text",
				value: parts[1]
			}];
			return result;
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} atext
		* @param {string} label
		* @param {RegExpMatchObject} match
		* @returns {Link | false}
		*/
		function findEmail(_, atext, label, match) {
			if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
			return {
				type: "link",
				title: null,
				url: "mailto:" + atext + "@" + label,
				children: [{
					type: "text",
					value: atext + "@" + label
				}]
			};
		}
		/**
		* @param {string} domain
		* @returns {boolean}
		*/
		function isCorrectDomain(domain) {
			const parts = domain.split(".");
			if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
			return true;
		}
		/**
		* @param {string} url
		* @returns {[string, string | undefined]}
		*/
		function splitUrl(url) {
			const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
			if (!trailExec) return [url, void 0];
			url = url.slice(0, trailExec.index);
			let trail = trailExec[0];
			let closingParenIndex = trail.indexOf(")");
			const openingParens = ccount(url, "(");
			let closingParens = ccount(url, ")");
			while (closingParenIndex !== -1 && openingParens > closingParens) {
				url += trail.slice(0, closingParenIndex + 1);
				trail = trail.slice(closingParenIndex + 1);
				closingParenIndex = trail.indexOf(")");
				closingParens++;
			}
			return [url, trail];
		}
		/**
		* @param {RegExpMatchObject} match
		* @param {boolean | null | undefined} [email=false]
		* @returns {boolean}
		*/
		function previous(match, email) {
			const code = match.input.charCodeAt(match.index - 1);
			return (match.index === 0 || unicodeWhitespace(code) || unicodePunctuation(code)) && (!email || code !== 47);
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-footnote/lib/index.js
		/**
		* @import {
		*   CompileContext,
		*   Extension as FromMarkdownExtension,
		*   Handle as FromMarkdownHandle
		* } from 'mdast-util-from-markdown'
		* @import {ToMarkdownOptions} from 'mdast-util-gfm-footnote'
		* @import {
		*   Handle as ToMarkdownHandle,
		*   Map,
		*   Options as ToMarkdownExtension
		* } from 'mdast-util-to-markdown'
		* @import {FootnoteDefinition, FootnoteReference} from 'mdast'
		*/
		footnoteReference.peek = footnoteReferencePeek;
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCallString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCall(token) {
			this.enter({
				type: "footnoteReference",
				identifier: "",
				label: ""
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinitionLabelString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinition(token) {
			this.enter({
				type: "footnoteDefinition",
				identifier: "",
				label: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCallString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCall(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinitionLabelString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinition(token) {
			this.exit(token);
		}
		/** @type {ToMarkdownHandle} */
		function footnoteReferencePeek() {
			return "[";
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {FootnoteReference} node
		*/
		function footnoteReference(node, _, state, info) {
			const tracker = state.createTracker(info);
			let value = tracker.move("[^");
			const exit = state.enter("footnoteReference");
			const subexit = state.enter("reference");
			value += tracker.move(state.safe(state.associationId(node), {
				after: "]",
				before: value
			}));
			subexit();
			exit();
			value += tracker.move("]");
			return value;
		}
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM footnotes
		* in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown`.
		*/
		function gfmFootnoteFromMarkdown() {
			return {
				enter: {
					gfmFootnoteCallString: enterFootnoteCallString,
					gfmFootnoteCall: enterFootnoteCall,
					gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: enterFootnoteDefinition
				},
				exit: {
					gfmFootnoteCallString: exitFootnoteCallString,
					gfmFootnoteCall: exitFootnoteCall,
					gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: exitFootnoteDefinition
				}
			};
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-strikethrough/lib/index.js
		handleDelete.attention = attentionDelete;
		handleDelete.peek = peekDelete;
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM
		* strikethrough in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
		*/
		function gfmStrikethroughFromMarkdown() {
			return {
				canContainEols: ["delete"],
				enter: { strikethrough: enterStrikethrough },
				exit: { strikethrough: exitStrikethrough }
			};
		}
		/**
		* Enter strikethrough.
		*
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterStrikethrough(token) {
			this.enter({
				type: "delete",
				children: [],
				position: void 0
			}, token);
		}
		/**
		* Exit strikethrough.
		*
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitStrikethrough(token) {
			this.exit(token);
		}
		/**
		* Serialize a delete node.
		*
		* @type {ToMarkdownHandle}
		* @param {Delete} node
		*   Node to serialize.
		*/
		function handleDelete(node, _, state, info) {
			const tracker = state.createTracker(info);
			const sequence = state.stack.includes("strikethrough") ? "~" : "~~";
			const exit = state.enter("strikethrough");
			let value = tracker.move(sequence);
			value += state.containerPhrasing(node, {
				...tracker.current(),
				before: value,
				after: "~"
			});
			value += tracker.move(sequence);
			exit();
			return value;
		}
		/**
		* Serialize a delete node as attention.
		*
		* @type {Attention}
		*/
		function attentionDelete() {
			return {
				construct: "strikethrough",
				markers: ["~"],
				sizes: [2, 1]
			};
		}
		/**
		* Peek the first character of a delete node.
		*
		* @type {ToMarkdownHandle}
		*/
		function peekDelete() {
			return "~";
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-table/lib/index.js
		/**
		* @typedef {import('mdast').InlineCode} InlineCode
		* @typedef {import('mdast').Table} Table
		* @typedef {import('mdast').TableCell} TableCell
		* @typedef {import('mdast').TableRow} TableRow
		*
		* @typedef {import('markdown-table').Options} MarkdownTableOptions
		*
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		*
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').State} State
		* @typedef {import('mdast-util-to-markdown').Info} Info
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {boolean | null | undefined} [tableCellPadding=true]
		*   Whether to add a space of padding between delimiters and cells (default:
		*   `true`).
		* @property {boolean | null | undefined} [tablePipeAlign=true]
		*   Whether to align the delimiters (default: `true`).
		* @property {MarkdownTableOptions['stringLength'] | null | undefined} [stringLength]
		*   Function to detect the length of table cell content, used when aligning
		*   the delimiters between cells (optional).
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM tables in
		* markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM tables.
		*/
		function gfmTableFromMarkdown() {
			return {
				enter: {
					table: enterTable,
					tableData: enterCell,
					tableHeader: enterCell,
					tableRow: enterRow
				},
				exit: {
					codeText: exitCodeText,
					table: exitTable,
					tableData: exit,
					tableHeader: exit,
					tableRow: exit
				}
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterTable(token) {
			const align = token._align;
			this.enter({
				type: "table",
				align: align.map(function(d) {
					return d === "none" ? null : d;
				}),
				children: []
			}, token);
			this.data.inTable = true;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitTable(token) {
			this.exit(token);
			this.data.inTable = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterRow(token) {
			this.enter({
				type: "tableRow",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exit(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterCell(token) {
			this.enter({
				type: "tableCell",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCodeText(token) {
			let value = this.resume();
			if (this.data.inTable) value = value.replace(/\\([\\|])/g, replace);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.value = value;
			this.exit(token);
		}
		/**
		* @param {string} $0
		* @param {string} $1
		* @returns {string}
		*/
		function replace($0, $1) {
			return $1 === "|" ? $1 : $0;
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-task-list-item/lib/index.js
		/**
		* @typedef {import('mdast').ListItem} ListItem
		* @typedef {import('mdast').Paragraph} Paragraph
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM task
		* list items in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM task list items.
		*/
		function gfmTaskListItemFromMarkdown() {
			return { exit: {
				taskListCheckValueChecked: exitCheck,
				taskListCheckValueUnchecked: exitCheck,
				paragraph: exitParagraphWithTaskListItem
			} };
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCheck(token) {
			const node = this.stack[this.stack.length - 2];
			node.type;
			node.checked = token.type === "taskListCheckValueChecked";
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitParagraphWithTaskListItem(token) {
			const parent = this.stack[this.stack.length - 2];
			if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
				const node = this.stack[this.stack.length - 1];
				node.type;
				const head = node.children[0];
				if (head && head.type === "text") {
					const siblings = parent.children;
					let index = -1;
					/** @type {Paragraph | undefined} */
					let firstParaghraph;
					while (++index < siblings.length) {
						const sibling = siblings[index];
						if (sibling.type === "paragraph") {
							firstParaghraph = sibling;
							break;
						}
					}
					if (firstParaghraph === node) {
						head.value = head.value.slice(1);
						if (head.value.length === 0) node.children.shift();
						else if (node.position && head.position && typeof head.position.start.offset === "number") {
							head.position.start.column++;
							head.position.start.offset++;
							node.position.start = Object.assign({}, head.position.start);
						}
					}
				}
			}
			this.exit(token);
		}
		//#endregion
		//#region node_modules/mdast-util-gfm/lib/index.js
		/**
		* @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
		* @import {Options} from 'mdast-util-gfm'
		* @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
		* literals, footnotes, strikethrough, tables, tasklists).
		*
		* @returns {Array<FromMarkdownExtension>}
		*   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
		*   footnotes, strikethrough, tables, tasklists).
		*/
		function gfmFromMarkdown() {
			return [
				gfmAutolinkLiteralFromMarkdown(),
				gfmFootnoteFromMarkdown(),
				gfmStrikethroughFromMarkdown(),
				gfmTableFromMarkdown(),
				gfmTaskListItemFromMarkdown()
			];
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
		/**
		* @import {Code, ConstructRecord, Event, Extension, Previous, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const wwwPrefix = {
			tokenize: tokenizeWwwPrefix,
			partial: true
		};
		const domain = {
			tokenize: tokenizeDomain,
			partial: true
		};
		const path = {
			tokenize: tokenizePath,
			partial: true
		};
		const trail = {
			tokenize: tokenizeTrail,
			partial: true
		};
		const emailDomainDotTrail = {
			tokenize: tokenizeEmailDomainDotTrail,
			partial: true
		};
		const wwwAutolink = {
			name: "wwwAutolink",
			tokenize: tokenizeWwwAutolink,
			previous: previousWww
		};
		const protocolAutolink = {
			name: "protocolAutolink",
			tokenize: tokenizeProtocolAutolink,
			previous: previousProtocol
		};
		const emailAutolink = {
			name: "emailAutolink",
			tokenize: tokenizeEmailAutolink,
			previous: previousEmail
		};
		/** @type {ConstructRecord} */
		const text = {};
		/**
		* Create an extension for `micromark` to support GitHub autolink literal
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   autolink literal syntax.
		*/
		function gfmAutolinkLiteral() {
			return { text };
		}
		/** @type {Code} */
		let code = 48;
		while (code < 123) {
			text[code] = emailAutolink;
			code++;
			if (code === 58) code = 65;
			else if (code === 91) code = 97;
		}
		text[43] = emailAutolink;
		text[45] = emailAutolink;
		text[46] = emailAutolink;
		text[95] = emailAutolink;
		text[72] = [emailAutolink, protocolAutolink];
		text[104] = [emailAutolink, protocolAutolink];
		text[87] = [emailAutolink, wwwAutolink];
		text[119] = [emailAutolink, wwwAutolink];
		/**
		* Email autolink literal.
		*
		* ```markdown
		* > | a contact@example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailAutolink(effects, ok, nok) {
			const self = this;
			/** @type {boolean | undefined} */
			let dot;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of email autolink literal.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!gfmAtext(code) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkEmail");
				return atext(code);
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atext(code) {
				if (gfmAtext(code)) {
					effects.consume(code);
					return atext;
				}
				if (code === 64) {
					effects.consume(code);
					return emailDomain;
				}
				return nok(code);
			}
			/**
			* In email domain.
			*
			* The reference code is a bit overly complex as it handles the `@`, of which
			* there may be just one.
			* Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L318>
			*
			* ```markdown
			* > | a contact@example.org b
			*               ^
			* ```
			*
			* @type {State}
			*/
			function emailDomain(code) {
				if (code === 46) return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code);
				if (code === 45 || code === 95 || asciiAlphanumeric(code)) {
					data = true;
					effects.consume(code);
					return emailDomain;
				}
				return emailDomainAfter(code);
			}
			/**
			* In email domain, on dot that is not a trail.
			*
			* ```markdown
			* > | a contact@example.org b
			*                      ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainDot(code) {
				effects.consume(code);
				dot = true;
				return emailDomain;
			}
			/**
			* After email domain.
			*
			* ```markdown
			* > | a contact@example.org b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainAfter(code) {
				if (data && dot && asciiAlpha(self.previous)) {
					effects.exit("literalAutolinkEmail");
					effects.exit("literalAutolink");
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* `www` autolink literal.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwAutolink(effects, ok, nok) {
			const self = this;
			return wwwStart;
			/**
			* Start of www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function wwwStart(code) {
				if (code !== 87 && code !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkWww");
				return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code);
			}
			/**
			* After a www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function wwwAfter(code) {
				effects.exit("literalAutolinkWww");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* Protocol autolink literal.
		*
		* ```markdown
		* > | a https://example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeProtocolAutolink(effects, ok, nok) {
			const self = this;
			let buffer = "";
			let seen = false;
			return protocolStart;
			/**
			* Start of protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function protocolStart(code) {
				if ((code === 72 || code === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
					effects.enter("literalAutolink");
					effects.enter("literalAutolinkHttp");
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				return nok(code);
			}
			/**
			* In protocol.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^^^^^
			* ```
			*
			* @type {State}
			*/
			function protocolPrefixInside(code) {
				if (asciiAlpha(code) && buffer.length < 5) {
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				if (code === 58) {
					const protocol = buffer.toLowerCase();
					if (protocol === "http" || protocol === "https") {
						effects.consume(code);
						return protocolSlashesInside;
					}
				}
				return nok(code);
			}
			/**
			* In slashes.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*           ^^
			* ```
			*
			* @type {State}
			*/
			function protocolSlashesInside(code) {
				if (code === 47) {
					effects.consume(code);
					if (seen) return afterProtocol;
					seen = true;
					return protocolSlashesInside;
				}
				return nok(code);
			}
			/**
			* After protocol, before domain.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function afterProtocol(code) {
				return code === null || asciiControl(code) || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || unicodePunctuation(code) ? nok(code) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code);
			}
			/**
			* After a protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*                              ^
			* ```
			*
			* @type {State}
			*/
			function protocolAfter(code) {
				effects.exit("literalAutolinkHttp");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* `www` prefix.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwPrefix(effects, ok, nok) {
			let size = 0;
			return wwwPrefixInside;
			/**
			* In www prefix.
			*
			* ```markdown
			* > | www.example.com
			*     ^^^^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixInside(code) {
				if ((code === 87 || code === 119) && size < 3) {
					size++;
					effects.consume(code);
					return wwwPrefixInside;
				}
				if (code === 46 && size === 3) {
					effects.consume(code);
					return wwwPrefixAfter;
				}
				return nok(code);
			}
			/**
			* After www prefix.
			*
			* ```markdown
			* > | www.example.com
			*         ^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixAfter(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		/**
		* Domain.
		*
		* ```markdown
		* > | a https://example.org b
		*               ^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDomain(effects, ok, nok) {
			/** @type {boolean | undefined} */
			let underscoreInLastSegment;
			/** @type {boolean | undefined} */
			let underscoreInLastLastSegment;
			/** @type {boolean | undefined} */
			let seen;
			return domainInside;
			/**
			* In domain.
			*
			* ```markdown
			* > | https://example.com/a
			*             ^^^^^^^^^^^
			* ```
			*
			* @type {State}
			*/
			function domainInside(code) {
				if (code === 46 || code === 95) return effects.check(trail, domainAfter, domainAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || code !== 45 && unicodePunctuation(code)) return domainAfter(code);
				seen = true;
				effects.consume(code);
				return domainInside;
			}
			/**
			* In domain, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function domainAtPunctuation(code) {
				if (code === 95) underscoreInLastSegment = true;
				else {
					underscoreInLastLastSegment = underscoreInLastSegment;
					underscoreInLastSegment = void 0;
				}
				effects.consume(code);
				return domainInside;
			}
			/**
			* After domain.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^
			* ```
			*
			* @type {State} */
			function domainAfter(code) {
				if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) return nok(code);
				return ok(code);
			}
		}
		/**
		* Path.
		*
		* ```markdown
		* > | a https://example.org/stuff b
		*                          ^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePath(effects, ok) {
			let sizeOpen = 0;
			let sizeClose = 0;
			return pathInside;
			/**
			* In path.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^^
			* ```
			*
			* @type {State}
			*/
			function pathInside(code) {
				if (code === 40) {
					sizeOpen++;
					effects.consume(code);
					return pathInside;
				}
				if (code === 41 && sizeClose < sizeOpen) return pathAtPunctuation(code);
				if (code === 33 || code === 34 || code === 38 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 60 || code === 63 || code === 93 || code === 95 || code === 126) return effects.check(trail, ok, pathAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				effects.consume(code);
				return pathInside;
			}
			/**
			* In path, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com/a"b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function pathAtPunctuation(code) {
				if (code === 41) sizeClose++;
				effects.consume(code);
				return pathInside;
			}
		}
		/**
		* Trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the entire trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | https://example.com").
		*                        ^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTrail(effects, ok, nok) {
			return trail;
			/**
			* In trail of domain or path.
			*
			* ```markdown
			* > | https://example.com").
			*                        ^
			* ```
			*
			* @type {State}
			*/
			function trail(code) {
				if (code === 33 || code === 34 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 63 || code === 95 || code === 126) {
					effects.consume(code);
					return trail;
				}
				if (code === 38) {
					effects.consume(code);
					return trailCharacterReferenceStart;
				}
				if (code === 93) {
					effects.consume(code);
					return trailBracketAfter;
				}
				if (code === 60 || code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return nok(code);
			}
			/**
			* In trail, after `]`.
			*
			* > 👉 **Note**: this deviates from `cmark-gfm` to fix a bug.
			* > See end of <https://github.com/github/cmark-gfm/issues/278> for more.
			*
			* ```markdown
			* > | https://example.com](
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailBracketAfter(code) {
				if (code === null || code === 40 || code === 91 || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return trail(code);
			}
			/**
			* In character-reference like trail, after `&`.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceStart(code) {
				return asciiAlpha(code) ? trailCharacterReferenceInside(code) : nok(code);
			}
			/**
			* In character-reference like trail.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceInside(code) {
				if (code === 59) {
					effects.consume(code);
					return trail;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return trailCharacterReferenceInside;
				}
				return nok(code);
			}
		}
		/**
		* Dot in email domain trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | contact@example.org.
		*                        ^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailDomainDotTrail(effects, ok, nok) {
			return start;
			/**
			* Dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                    ^   ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.consume(code);
				return after;
			}
			/**
			* After dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                     ^   ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return asciiAlphanumeric(code) ? nok(code) : ok(code);
			}
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L156>.
		*
		* @type {Previous}
		*/
		function previousWww(code) {
			return code === null || code === 40 || code === 42 || code === 95 || code === 91 || code === 93 || code === 126 || markdownLineEndingOrSpace(code);
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L214>.
		*
		* @type {Previous}
		*/
		function previousProtocol(code) {
			return !asciiAlpha(code);
		}
		/**
		* @this {TokenizeContext}
		* @type {Previous}
		*/
		function previousEmail(code) {
			return !(code === 47 || gfmAtext(code));
		}
		/**
		* @param {Code} code
		* @returns {boolean}
		*/
		function gfmAtext(code) {
			return code === 43 || code === 45 || code === 46 || code === 95 || asciiAlphanumeric(code);
		}
		/**
		* @param {Array<Event>} events
		* @returns {boolean}
		*/
		function previousUnbalanced(events) {
			let index = events.length;
			let result = false;
			while (index--) {
				const token = events[index][1];
				if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
					result = true;
					break;
				}
				if (token._gfmAutolinkLiteralWalkedInto) {
					result = false;
					break;
				}
			}
			if (events.length > 0 && !result) events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
			return result;
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-footnote/lib/syntax.js
		/**
		* @import {Event, Exiter, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const indent = {
			tokenize: tokenizeIndent,
			partial: true
		};
		/**
		* Create an extension for `micromark` to enable GFM footnote syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to
		*   enable GFM footnote syntax.
		*/
		function gfmFootnote() {
			/** @type {Extension} */
			return {
				document: { [91]: {
					name: "gfmFootnoteDefinition",
					tokenize: tokenizeDefinitionStart,
					continuation: { tokenize: tokenizeDefinitionContinuation },
					exit: gfmFootnoteDefinitionEnd
				} },
				text: {
					[91]: {
						name: "gfmFootnoteCall",
						tokenize: tokenizeGfmFootnoteCall
					},
					[93]: {
						name: "gfmPotentialFootnoteCall",
						add: "after",
						tokenize: tokenizePotentialGfmFootnoteCall,
						resolveTo: resolveToPotentialGfmFootnoteCall
					}
				}
			};
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			let index = self.events.length;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {Token} */
			let labelStart;
			while (index--) {
				const token = self.events[index][1];
				if (token.type === "labelImage") {
					labelStart = token;
					break;
				}
				if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") break;
			}
			return start;
			/**
			* @type {State}
			*/
			function start(code) {
				if (!labelStart || !labelStart._balanced) return nok(code);
				const id = normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				}));
				if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) return nok(code);
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return ok(code);
			}
		}
		/** @type {Resolver} */
		function resolveToPotentialGfmFootnoteCall(events, context) {
			let index = events.length;
			while (index--) if (events[index][1].type === "labelImage" && events[index][0] === "enter") {
				events[index][1];
				break;
			}
			events[index + 1][1].type = "data";
			events[index + 3][1].type = "gfmFootnoteCallLabelMarker";
			/** @type {Token} */
			const call = {
				type: "gfmFootnoteCall",
				start: Object.assign({}, events[index + 3][1].start),
				end: Object.assign({}, events[events.length - 1][1].end)
			};
			/** @type {Token} */
			const marker = {
				type: "gfmFootnoteCallMarker",
				start: Object.assign({}, events[index + 3][1].end),
				end: Object.assign({}, events[index + 3][1].end)
			};
			marker.end.column++;
			marker.end.offset++;
			marker.end._bufferIndex++;
			/** @type {Token} */
			const string = {
				type: "gfmFootnoteCallString",
				start: Object.assign({}, marker.end),
				end: Object.assign({}, events[events.length - 1][1].start)
			};
			/** @type {Token} */
			const chunk = {
				type: "chunkString",
				contentType: "string",
				start: Object.assign({}, string.start),
				end: Object.assign({}, string.end)
			};
			/** @type {Array<Event>} */
			const replacement = [
				events[index + 1],
				events[index + 2],
				[
					"enter",
					call,
					context
				],
				events[index + 3],
				events[index + 4],
				[
					"enter",
					marker,
					context
				],
				[
					"exit",
					marker,
					context
				],
				[
					"enter",
					string,
					context
				],
				[
					"enter",
					chunk,
					context
				],
				[
					"exit",
					chunk,
					context
				],
				[
					"exit",
					string,
					context
				],
				events[events.length - 2],
				events[events.length - 1],
				[
					"exit",
					call,
					context
				]
			];
			events.splice(index, events.length - index + 1, ...replacement);
			return events;
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			let size = 0;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of footnote label.
			*
			* ```markdown
			* > | a [^b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteCall");
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return callStart;
			}
			/**
			* After `[`, at `^`.
			*
			* ```markdown
			* > | a [^b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function callStart(code) {
				if (code !== 94) return nok(code);
				effects.enter("gfmFootnoteCallMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallMarker");
				effects.enter("gfmFootnoteCallString");
				effects.enter("chunkString").contentType = "string";
				return callData;
			}
			/**
			* In label.
			*
			* ```markdown
			* > | a [^b] c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function callData(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteCallString");
					if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) return nok(code);
					effects.enter("gfmFootnoteCallLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteCallLabelMarker");
					effects.exit("gfmFootnoteCall");
					return ok;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? callEscape : callData;
			}
			/**
			* On character after escape.
			*
			* ```markdown
			* > | a [^b\c] d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function callEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return callData;
				}
				return callData(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionStart(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {string} */
			let identifier;
			let size = 0;
			/** @type {boolean | undefined} */
			let data;
			return start;
			/**
			* Start of GFM footnote definition.
			*
			* ```markdown
			* > | [^a]: b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteDefinition")._container = true;
				effects.enter("gfmFootnoteDefinitionLabel");
				effects.enter("gfmFootnoteDefinitionLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteDefinitionLabelMarker");
				return labelAtMarker;
			}
			/**
			* In label, at caret.
			*
			* ```markdown
			* > | [^a]: b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelAtMarker(code) {
				if (code === 94) {
					effects.enter("gfmFootnoteDefinitionMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionMarker");
					effects.enter("gfmFootnoteDefinitionLabelString");
					effects.enter("chunkString").contentType = "string";
					return labelInside;
				}
				return nok(code);
			}
			/**
			* In label.
			*
			* > 👉 **Note**: `cmark-gfm` prevents whitespace from occurring in footnote
			* > definition labels.
			*
			* ```markdown
			* > | [^a]: b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteDefinitionLabelString");
					identifier = normalizeIdentifier(self.sliceSerialize(token));
					effects.enter("gfmFootnoteDefinitionLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionLabelMarker");
					effects.exit("gfmFootnoteDefinitionLabel");
					return labelAfter;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* > 👉 **Note**: `cmark-gfm` currently does not support escaped brackets:
			* > <https://github.com/github/cmark-gfm/issues/240>
			*
			* ```markdown
			* > | [^a\*b]: c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
			/**
			* After definition label.
			*
			* ```markdown
			* > | [^a]: b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					if (!defined.includes(identifier)) defined.push(identifier);
					return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
				}
				return nok(code);
			}
			/**
			* After definition prefix.
			*
			* ```markdown
			* > | [^a]: b
			*           ^
			* ```
			*
			* @type {State}
			*/
			function whitespaceAfter(code) {
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionContinuation(effects, ok, nok) {
			return effects.check(blankLine, ok, effects.attempt(indent, ok, nok));
		}
		/** @type {Exiter} */
		function gfmFootnoteDefinitionEnd(effects) {
			effects.exit("gfmFootnoteDefinition");
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeIndent(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 5);
			/**
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js
		/**
		* @import {Options} from 'micromark-extension-gfm-strikethrough'
		* @import {Event, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* Create an extension for `micromark` to enable GFM strikethrough syntax.
		*
		* @param {Options | null | undefined} [options={}]
		*   Configuration.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions`, to
		*   enable GFM strikethrough syntax.
		*/
		function gfmStrikethrough(options) {
			let single = (options || {}).singleTilde;
			const tokenizer = {
				name: "strikethrough",
				tokenize: tokenizeStrikethrough,
				resolveAll: resolveAllStrikethrough
			};
			if (single === null || single === void 0) single = true;
			return {
				text: { [126]: tokenizer },
				insideSpan: { null: [tokenizer] },
				attentionMarkers: { null: [126] }
			};
			/**
			* Take events and resolve strikethrough.
			*
			* @type {Resolver}
			*/
			function resolveAllStrikethrough(events, context) {
				let index = -1;
				while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
					let open = index;
					while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
						events[index][1].type = "strikethroughSequence";
						events[open][1].type = "strikethroughSequence";
						/** @type {Token} */
						const strikethrough = {
							type: "strikethrough",
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[index][1].end)
						};
						/** @type {Token} */
						const text = {
							type: "strikethroughText",
							start: Object.assign({}, events[open][1].end),
							end: Object.assign({}, events[index][1].start)
						};
						/** @type {Array<Event>} */
						const nextEvents = [
							[
								"enter",
								strikethrough,
								context
							],
							[
								"enter",
								events[open][1],
								context
							],
							[
								"exit",
								events[open][1],
								context
							],
							[
								"enter",
								text,
								context
							]
						];
						const insideSpan = context.parser.constructs.insideSpan.null;
						if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
						splice(nextEvents, nextEvents.length, 0, [
							[
								"exit",
								text,
								context
							],
							[
								"enter",
								events[index][1],
								context
							],
							[
								"exit",
								events[index][1],
								context
							],
							[
								"exit",
								strikethrough,
								context
							]
						]);
						splice(events, open - 1, index - open + 3, nextEvents);
						index = open + nextEvents.length - 2;
						break;
					}
				}
				index = -1;
				while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = "data";
				return events;
			}
			/**
			* @this {TokenizeContext}
			* @type {Tokenizer}
			*/
			function tokenizeStrikethrough(effects, ok, nok) {
				const previous = this.previous;
				const events = this.events;
				let size = 0;
				return start;
				/** @type {State} */
				function start(code) {
					if (previous === 126 && events[events.length - 1][1].type !== "characterEscape") return nok(code);
					effects.enter("strikethroughSequenceTemporary");
					return more(code);
				}
				/** @type {State} */
				function more(code) {
					const before = classifyCharacter(previous);
					if (code === 126) {
						if (size > 1) return nok(code);
						effects.consume(code);
						size++;
						return more;
					}
					if (size < 2 && !single) return nok(code);
					const token = effects.exit("strikethroughSequenceTemporary");
					const after = classifyCharacter(code);
					token._open = !after || after === 2 && Boolean(before);
					token._close = !before || before === 2 && Boolean(after);
					return ok(code);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/edit-map.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, Array<Event>]} Change
		* @typedef {[number, number, number]} Jump
		*/
		/**
		* Tracks a bunch of edits.
		*/
		var EditMap = class {
			/**
			* Create a new edit map.
			*/
			constructor() {
				/**
				* Record of changes.
				*
				* @type {Array<Change>}
				*/
				this.map = [];
				/**
				* Changes by index, so `add` does not scan `map` (quadratic on
				* table-heavy documents).
				*
				* @type {Map<number, Change>}
				*/
				this.index = /* @__PURE__ */ new Map();
			}
			/**
			* Create an edit: a remove and/or add at a certain place.
			*
			* @param {number} index
			*   Index at which to apply the edit.
			* @param {number} remove
			*   Count of items to remove at the index.
			* @param {Array<Event>} add
			*   Items to add at the index.
			* @returns {undefined}
			*   Nothing.
			*/
			add(index, remove, add) {
				addImplementation(this, index, remove, add);
			}
			/**
			* Done, change the events.
			*
			* @param {Array<Event>} events
			*   List of events to apply the edits to.
			* @returns {undefined}
			*   Nothing.
			*/
			consume(events) {
				this.map.sort(function(a, b) {
					return a[0] - b[0];
				});
				/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
				if (this.map.length === 0) return;
				let index = this.map.length;
				/** @type {Array<Array<Event>>} */
				const vecs = [];
				while (index > 0) {
					index -= 1;
					vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
					events.length = this.map[index][0];
				}
				vecs.push(events.slice());
				events.length = 0;
				let slice = vecs.pop();
				while (slice) {
					for (const element of slice) events.push(element);
					slice = vecs.pop();
				}
				this.map.length = 0;
				this.index.clear();
			}
		};
		/**
		* Create an edit.
		*
		* @param {EditMap} editMap
		*   Edit map to apply to.
		* @param {number} at
		*   Index at which to apply the edit.
		* @param {number} remove
		*   Count of items to remove at the index.
		* @param {Array<Event>} add
		*   Items to add at the index.
		* @returns {undefined}
		*   Nothing.
		*/
		function addImplementation(editMap, at, remove, add) {
			/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
			if (remove === 0 && add.length === 0) return;
			const existing = editMap.index.get(at);
			if (existing) {
				existing[1] += remove;
				existing[2].push(...add);
				return;
			}
			/** @type {Change} */
			const change = [
				at,
				remove,
				add
			];
			editMap.map.push(change);
			editMap.index.set(at, change);
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/infer.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {'center' | 'left' | 'none' | 'right'} Align
		*/
		/**
		* Figure out the alignment of a GFM table.
		*
		* @param {Readonly<Array<Event>>} events
		*   List of events.
		* @param {number} index
		*   Table enter event.
		* @returns {Array<Align>}
		*   List of aligns.
		*/
		function gfmTableAlign(events, index) {
			let inDelimiterRow = false;
			/** @type {Array<Align>} */
			const align = [];
			while (index < events.length) {
				const event = events[index];
				if (inDelimiterRow) {
					if (event[0] === "enter") {
						if (event[1].type === "tableContent") align.push(events[index + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
					} else if (event[1].type === "tableContent") {
						if (events[index - 1][1].type === "tableDelimiterMarker") {
							const alignIndex = align.length - 1;
							align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
						}
					} else if (event[1].type === "tableDelimiterRow") break;
				} else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") inDelimiterRow = true;
				index += 1;
			}
			return align;
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/syntax.js
		/**
		* @import {Event, Extension, Point, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, number, number]} Range
		*   Cell info.
		*
		* @typedef {0 | 1 | 2 | 3} RowKind
		*   Where we are: `1` for head row, `2` for delimiter row, `3` for body row.
		*/
		/**
		* Create an HTML extension for `micromark` to support GitHub tables syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   table syntax.
		*/
		function gfmTable() {
			return { flow: { null: {
				name: "table",
				tokenize: tokenizeTable,
				resolveAll: resolveTable
			} } };
		}
		/**
		* Tokenizer for GFM tables.
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTable(effects, ok, nok) {
			const self = this;
			let size = 0;
			let sizeB = 0;
			/** @type {boolean | undefined} */
			let seen;
			return start;
			/**
			* Start of a GFM table.
			*
			* If there is a valid table row or table head before, then we try to parse
			* another row.
			* Otherwise, we try to parse a head.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			* > | | b |
			*     ^
			* ```
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length - 1;
				while (index > -1) {
					const { type } = self.events[index][1];
					if (type === "lineEnding" || type === "linePrefix") index--;
					else break;
				}
				const tail = index > -1 ? self.events[index][1].type : null;
				const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
				if (next === bodyRowStart && self.parser.lazy[self.now().line]) return nok(code);
				return next(code);
			}
			/**
			* Before table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBefore(code) {
				effects.enter("tableHead");
				effects.enter("tableRow");
				return headRowStart(code);
			}
			/**
			* Before table head row, after whitespace.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowStart(code) {
				if (code === 124) return headRowBreak(code);
				seen = true;
				sizeB += 1;
				return headRowBreak(code);
			}
			/**
			* At break in table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*       ^
			*         ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBreak(code) {
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					if (sizeB > 1) {
						sizeB = 0;
						self.interrupt = true;
						effects.exit("tableRow");
						effects.enter("lineEnding");
						effects.consume(code);
						effects.exit("lineEnding");
						return headDelimiterStart;
					}
					return nok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, headRowBreak, "whitespace")(code);
				sizeB += 1;
				if (seen) {
					seen = false;
					size += 1;
				}
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					seen = true;
					return headRowBreak;
				}
				effects.enter("data");
				return headRowData(code);
			}
			/**
			* In table head row data.
			*
			* ```markdown
			* > | | a |
			*       ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return headRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? headRowEscape : headRowData;
			}
			/**
			* In table head row escape.
			*
			* ```markdown
			* > | | a\-b |
			*         ^
			*   | | ---- |
			*   | | c    |
			* ```
			*
			* @type {State}
			*/
			function headRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return headRowData;
				}
				return headRowData(code);
			}
			/**
			* Before delimiter row.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterStart(code) {
				self.interrupt = false;
				if (self.parser.lazy[self.now().line]) return nok(code);
				effects.enter("tableDelimiterRow");
				seen = false;
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return headDelimiterBefore(code);
			}
			/**
			* Before delimiter row, after optional whitespace.
			*
			* Reused when a `|` is found later, to parse another cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterBefore(code) {
				if (code === 45 || code === 58) return headDelimiterValueBefore(code);
				if (code === 124) {
					seen = true;
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return headDelimiterCellBefore;
				}
				return headDelimiterNok(code);
			}
			/**
			* After `|`, before delimiter cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*      ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellBefore(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code);
				return headDelimiterValueBefore(code);
			}
			/**
			* Before delimiter cell value.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterValueBefore(code) {
				if (code === 58) {
					sizeB += 1;
					seen = true;
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterLeftAlignmentAfter;
				}
				if (code === 45) {
					sizeB += 1;
					return headDelimiterLeftAlignmentAfter(code);
				}
				if (code === null || markdownLineEnding(code)) return headDelimiterCellAfter(code);
				return headDelimiterNok(code);
			}
			/**
			* After delimiter cell left alignment marker.
			*
			* ```markdown
			*   | | a  |
			* > | | :- |
			*        ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterLeftAlignmentAfter(code) {
				if (code === 45) {
					effects.enter("tableDelimiterFiller");
					return headDelimiterFiller(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter cell filler.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterFiller(code) {
				if (code === 45) {
					effects.consume(code);
					return headDelimiterFiller;
				}
				if (code === 58) {
					seen = true;
					effects.exit("tableDelimiterFiller");
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterRightAlignmentAfter;
				}
				effects.exit("tableDelimiterFiller");
				return headDelimiterRightAlignmentAfter(code);
			}
			/**
			* After delimiter cell right alignment marker.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterRightAlignmentAfter(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code);
				return headDelimiterCellAfter(code);
			}
			/**
			* After delimiter cell.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*          ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellAfter(code) {
				if (code === 124) return headDelimiterBefore(code);
				if (code === null || markdownLineEnding(code)) {
					if (!seen || size !== sizeB) return headDelimiterNok(code);
					effects.exit("tableDelimiterRow");
					effects.exit("tableHead");
					return ok(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter row, at a disallowed byte.
			*
			* ```markdown
			*   | | a |
			* > | | x |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterNok(code) {
				return nok(code);
			}
			/**
			* Before table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowStart(code) {
				effects.enter("tableRow");
				return bodyRowBreak(code);
			}
			/**
			* At break in table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			*       ^
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowBreak(code) {
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return bodyRowBreak;
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("tableRow");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, bodyRowBreak, "whitespace")(code);
				effects.enter("data");
				return bodyRowData(code);
			}
			/**
			* In table body row data.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return bodyRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? bodyRowEscape : bodyRowData;
			}
			/**
			* In table body row escape.
			*
			* ```markdown
			*   | | a    |
			*   | | ---- |
			* > | | b\-c |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return bodyRowData;
				}
				return bodyRowData(code);
			}
		}
		/** @type {Resolver} */
		function resolveTable(events, context) {
			let index = -1;
			let inFirstCellAwaitingPipe = true;
			/** @type {RowKind} */
			let rowKind = 0;
			/** @type {Range} */
			let lastCell = [
				0,
				0,
				0,
				0
			];
			/** @type {Range} */
			let cell = [
				0,
				0,
				0,
				0
			];
			let afterHeadAwaitingFirstBodyRow = false;
			let lastTableEnd = 0;
			/** @type {Token | undefined} */
			let currentTable;
			/** @type {Token | undefined} */
			let currentBody;
			/** @type {Token | undefined} */
			let currentCell;
			const map = new EditMap();
			while (++index < events.length) {
				const event = events[index];
				const token = event[1];
				if (event[0] === "enter") {
					if (token.type === "tableHead") {
						afterHeadAwaitingFirstBodyRow = false;
						if (lastTableEnd !== 0) {
							flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
							currentBody = void 0;
							lastTableEnd = 0;
						}
						currentTable = {
							type: "table",
							start: Object.assign({}, token.start),
							end: Object.assign({}, token.end)
						};
						map.add(index, 0, [[
							"enter",
							currentTable,
							context
						]]);
					} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
						inFirstCellAwaitingPipe = true;
						currentCell = void 0;
						lastCell = [
							0,
							0,
							0,
							0
						];
						cell = [
							0,
							index + 1,
							0,
							0
						];
						if (afterHeadAwaitingFirstBodyRow) {
							afterHeadAwaitingFirstBodyRow = false;
							currentBody = {
								type: "tableBody",
								start: Object.assign({}, token.start),
								end: Object.assign({}, token.end)
							};
							map.add(index, 0, [[
								"enter",
								currentBody,
								context
							]]);
						}
						rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
					} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
						inFirstCellAwaitingPipe = false;
						if (cell[2] === 0) {
							if (lastCell[1] !== 0) {
								cell[0] = cell[1];
								currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
								lastCell = [
									0,
									0,
									0,
									0
								];
							}
							cell[2] = index;
						}
					} else if (token.type === "tableCellDivider") if (inFirstCellAwaitingPipe) inFirstCellAwaitingPipe = false;
					else {
						if (lastCell[1] !== 0) {
							cell[0] = cell[1];
							currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
						}
						lastCell = cell;
						cell = [
							lastCell[1],
							index,
							0,
							0
						];
					}
				} else if (token.type === "tableHead") {
					afterHeadAwaitingFirstBodyRow = true;
					lastTableEnd = index;
				} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
					lastTableEnd = index;
					if (lastCell[1] !== 0) {
						cell[0] = cell[1];
						currentCell = flushCell(map, context, lastCell, rowKind, index, currentCell);
					} else if (cell[1] !== 0) currentCell = flushCell(map, context, cell, rowKind, index, currentCell);
					rowKind = 0;
				} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) cell[3] = index;
			}
			if (lastTableEnd !== 0) flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
			map.consume(context.events);
			index = -1;
			while (++index < context.events.length) {
				const event = context.events[index];
				if (event[0] === "enter" && event[1].type === "table") event[1]._align = gfmTableAlign(context.events, index);
			}
			return events;
		}
		/**
		* Generate a cell.
		*
		* @param {EditMap} map
		*   Edit map to apply to.
		* @param {Readonly<TokenizeContext>} context
		*   Tokenize context.
		* @param {Readonly<Range>} range
		*   Range of the cell within events.
		* @param {RowKind} rowKind
		*   Type of row.
		* @param {number | undefined} rowEnd
		*   Index of the end of the row, if known.
		* @param {Token | undefined} previousCell
		*   Previous cell token, if any.
		* @returns {Token | undefined}
		*   Current cell token after flushing, if any.
		*/
		function flushCell(map, context, range, rowKind, rowEnd, previousCell) {
			const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
			const valueName = "tableContent";
			if (range[0] !== 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
				map.add(range[0], 0, [[
					"exit",
					previousCell,
					context
				]]);
			}
			const now = getPoint(context.events, range[1]);
			previousCell = {
				type: groupName,
				start: Object.assign({}, now),
				end: Object.assign({}, now)
			};
			map.add(range[1], 0, [[
				"enter",
				previousCell,
				context
			]]);
			if (range[2] !== 0) {
				const relatedStart = getPoint(context.events, range[2]);
				const relatedEnd = getPoint(context.events, range[3]);
				/** @type {Token} */
				const valueToken = {
					type: valueName,
					start: Object.assign({}, relatedStart),
					end: Object.assign({}, relatedEnd)
				};
				map.add(range[2], 0, [[
					"enter",
					valueToken,
					context
				]]);
				if (rowKind !== 2) {
					const start = context.events[range[2]];
					const end = context.events[range[3]];
					start[1].end = Object.assign({}, end[1].end);
					start[1].type = "chunkText";
					start[1].contentType = "text";
					if (range[3] > range[2] + 1) {
						const a = range[2] + 1;
						const b = range[3] - range[2] - 1;
						map.add(a, b, []);
					}
				}
				map.add(range[3] + 1, 0, [[
					"exit",
					valueToken,
					context
				]]);
			}
			if (rowEnd !== void 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
				map.add(rowEnd, 0, [[
					"exit",
					previousCell,
					context
				]]);
				previousCell = void 0;
			}
			return previousCell;
		}
		/**
		* Generate table end (and table body end).
		*
		* @param {Readonly<EditMap>} map
		*   Edit map to apply to.
		* @param {Readonly<TokenizeContext>} context
		*   Tokenize context.
		* @param {number} index
		*   Index within the events where the table end should be inserted.
		* @param {Token} table
		*   Table token.
		* @param {Token | undefined} tableBody
		*   Table body token, if any.
		* @returns {undefined}
		*   Nothing.
		*/
		function flushTableEnd(map, context, index, table, tableBody) {
			/** @type {Array<Event>} */
			const exits = [];
			const related = getPoint(context.events, index);
			if (tableBody) {
				tableBody.end = Object.assign({}, related);
				exits.push([
					"exit",
					tableBody,
					context
				]);
			}
			table.end = Object.assign({}, related);
			exits.push([
				"exit",
				table,
				context
			]);
			map.add(index + 1, 0, exits);
		}
		/**
		* Get the point (start or end) for a given event in the list of events.
		*
		* @param {Readonly<Array<Event>>} events
		*   List of events.
		* @param {number} index
		*   Index of the event to get the point for.
		* @returns {Readonly<Point>}
		*   Start point for enter and end point for exit.
		*/
		function getPoint(events, index) {
			const event = events[index];
			const side = event[0] === "enter" ? "start" : "end";
			return event[1][side];
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js
		/**
		* @import {Extension, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const tasklistCheck = {
			name: "tasklistCheck",
			tokenize: tokenizeTasklistCheck
		};
		/**
		* Create an HTML extension for `micromark` to support GFM task list items
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `htmlExtensions` to
		*   support GFM task list items when serializing to HTML.
		*/
		function gfmTaskListItem() {
			return { text: { [91]: tasklistCheck } };
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTasklistCheck(effects, ok, nok) {
			const self = this;
			return open;
			/**
			* At start of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (self.previous !== null || !self._gfmTasklistFirstContentOfListItem) return nok(code);
				effects.enter("taskListCheck");
				effects.enter("taskListCheckMarker");
				effects.consume(code);
				effects.exit("taskListCheckMarker");
				return inside;
			}
			/**
			* In task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*        ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (markdownLineEndingOrSpace(code)) {
					effects.enter("taskListCheckValueUnchecked");
					effects.consume(code);
					effects.exit("taskListCheckValueUnchecked");
					return close;
				}
				if (code === 88 || code === 120) {
					effects.enter("taskListCheckValueChecked");
					effects.consume(code);
					effects.exit("taskListCheckValueChecked");
					return close;
				}
				return nok(code);
			}
			/**
			* At close of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*         ^
			* ```
			*
			* @type {State}
			*/
			function close(code) {
				if (code === 93) {
					effects.enter("taskListCheckMarker");
					effects.consume(code);
					effects.exit("taskListCheckMarker");
					effects.exit("taskListCheck");
					return after;
				}
				return nok(code);
			}
			/**
			* @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) return ok(code);
				if (markdownSpace(code)) return effects.check({ tokenize: spaceThenNonSpace }, ok, nok)(code);
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function spaceThenNonSpace(effects, ok, nok) {
			return factorySpace(effects, after, "whitespace");
			/**
			* After whitespace, after task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*           ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm/index.js
		/**
		* @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
		* @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
		* @typedef {import('micromark-util-types').Extension} Extension
		* @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
		*/
		/**
		* Create an extension for `micromark` to enable GFM syntax.
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		*
		*   Passed to `micromark-extens-gfm-strikethrough`.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   syntax.
		*/
		function gfm(options) {
			return combineExtensions([
				gfmAutolinkLiteral(),
				gfmFootnote(),
				gfmStrikethrough(options),
				gfmTable(),
				gfmTaskListItem()
			]);
		}
		//#endregion
		//#region src/rules/parse.ts
		/** Parse markdown into an mdast root stamped with source positions. */
		function parseBlocks(text) {
			return fromMarkdown(text, {
				extensions: [gfm()],
				mdastExtensions: [gfmFromMarkdown()]
			});
		}
		/**
		* Plain text of one mdast node (inline markup stripped, like mdast toString).
		* @param node - node whose phrasing text is needed.
		* @returns concatenated text content.
		*/
		function plainText(node) {
			if ("value" in node && typeof node.value === "string") return node.value;
			if ("children" in node) {
				let text = "";
				for (const child of node.children) text += plainText(child);
				return text;
			}
			return "";
		}
		/**
		* Source slice one top-level node owns, whitespace trimmed at both ends.
		* @param text - complete document source.
		* @param node - node with stamped positions.
		* @returns exact source slice covering the node.
		*/
		function nodeSource(text, node) {
			const start = node.position?.start.offset;
			const end = node.position?.end.offset;
			if (start === void 0 || end === void 0 || start > end || end > text.length) return "";
			return text.slice(start, end);
		}
		//#endregion
		//#region src/rules/path-images.ts
		/** Drawable extensions the file route can serve and browsers display. */
		const EXT = "png|jpe?g|gif|webp|bmp|svg|ico|avif";
		/** Suffix guard: another letter/digit, or a dot starting one (`.png.tar`), is not the file's end. */
		const NOT_SUFFIX = String.raw`(?![a-z0-9]|\.[a-z0-9])`;
		/** Quick pre-check: no image suffix anywhere means no rewrite work at all. */
		const MENTIONS_IMAGE = new RegExp(`\\.(?:${EXT})(?![a-z0-9]|\\.[a-z0-9])`, "iu");
		/** Path shape that names one image file: absolute, no spaces, image suffix. */
		const BARE_PATH = new RegExp(String.raw`(?<![\w:\\/.-])(?:[a-z]:[\\/]|\/)[^\s` + "`" + String.raw`*<>[\]|]+[\\/][^\s` + "`" + String.raw`*<>[\]|]*\.(?:${EXT})${NOT_SUFFIX}`, "giu");
		/** Characters that would break the generated image alt or destination. */
		const UNSAFE_IN_IMAGE = /[\u0000-\u001f\u007f<>\[\]]/u;
		/**
		* Whether one string is an absolute local path naming an image file.
		* @param value - candidate path, whitespace-trimmed by the caller.
		* @returns true for `C:\dir\pic.png` and `/home/u/pic.png` shapes with a drawable suffix.
		*/
		function isLocalImagePath(value) {
			if (UNSAFE_IN_IMAGE.test(value)) return false;
			return (/^[a-z]:[\\/]/iu.test(value) || /^\/(?!\/)/u.test(value)) && new RegExp(`\\.(?:${EXT})$`, "iu").test(value);
		}
		/**
		* Standard Markdown image for one local path. The alt text carries the
		* original path so a missing file degrades to exactly the authored string;
		* backslashes double because CommonMark consumes `\` + punctuation escapes
		* inside both link text and destinations.
		* @param path - absolute local path to an image file.
		* @returns `![path](<path>)` with backslashes escaped.
		*/
		function markdownImage(path) {
			const escaped = path.replace(/\\/gu, "\\\\");
			return `![${escaped}](<${escaped}>)`;
		}
		/** Node offsets as an editable span, or undefined when positions are unusable. */
		function nodeSpan(text, node) {
			const start = node.position?.start.offset;
			const end = node.position?.end.offset;
			if (start === void 0 || end === void 0 || start > end || end > text.length) return void 0;
			return {
				start,
				end
			};
		}
		/**
		* One paragraph's direct phrasing children: inline-code whose whole value
		* names an image file, bare image paths inside text, and (top level only)
		* authored image nodes splitting off into their own paragraph. A split
		* blanks the side that still carries content, so re-running the pass on its
		* own output adds nothing (the image already sits at a block boundary).
		* @param text - complete document source.
		* @param paragraph - one paragraph node.
		* @param standalone - true in a top-level paragraph: replacements may split into their own blocks.
		* @param edits - collected source edits.
		*/
		function collectEdits(text, paragraph, standalone, edits) {
			const paraSpan = nodeSpan(text, paragraph);
			const split = (start, end, replacement) => {
				if (!standalone || paraSpan === void 0) return replacement;
				return `${text.slice(paraSpan.start, start).trim() === "" ? "" : "\n\n"}${replacement}${text.slice(end, paraSpan.end).trim() === "" ? "" : "\n\n"}`;
			};
			for (const child of paragraph.children) if (child.type === "inlineCode") {
				const value = child.value.trim();
				const span = nodeSpan(text, child);
				if (span === void 0 || !isLocalImagePath(value)) continue;
				edits.push({
					...span,
					replacement: split(span.start, span.end, markdownImage(value))
				});
			} else if (child.type === "text") {
				const span = nodeSpan(text, child);
				if (span === void 0) continue;
				const slice = text.slice(span.start, span.end);
				for (const match of slice.matchAll(BARE_PATH)) {
					const found = match[0];
					const at = match.index ?? -1;
					if (found === void 0 || at < 0 || !isLocalImagePath(found)) continue;
					const start = span.start + at;
					edits.push({
						start,
						end: start + found.length,
						replacement: split(start, start + found.length, markdownImage(found))
					});
				}
			} else if (child.type === "image" && standalone) {
				const span = nodeSpan(text, child);
				const source = span === void 0 ? "" : text.slice(span.start, span.end);
				if (source === "") continue;
				edits.push({
					...span,
					replacement: split(span.start, span.end, source)
				});
			}
		}
		/**
		* Walk the tree collecting paragraph edits: root and blockquote children
		* contribute, list and table subtrees stay literal (splitting inside a list
		* item or a quote breaks the container).
		* @param node - subtree root.
		* @param text - complete document source.
		* @param standalone - whether paragraphs at this depth may split into their own blocks.
		* @param edits - collected source edits.
		*/
		function walkTree(node, text, standalone, edits) {
			if (node.type === "paragraph") {
				collectEdits(text, node, standalone, edits);
				return;
			}
			if (node.type === "list" || node.type === "table" || !("children" in node)) return;
			for (const child of node.children) walkTree(child, text, standalone && node.type === "root", edits);
		}
		/**
		* Rewrite bare and code-wrapped local image paths into standard Markdown
		* images, and split top-level body images (authored or rewritten) into their
		* own paragraphs. Pure and total: any input returns text at least as
		* displayable as it came in — an empty edit set, a parse throw, or a
		* position miss simply keeps the source untouched.
		* @param text - Markdown source of one text block.
		* @returns Source with paths rewritten and images fenced off as paragraphs.
		*/
		function rewritePathImages(text) {
			if (!MENTIONS_IMAGE.test(text)) return text;
			let root;
			try {
				root = parseBlocks(text);
			} catch {
				return text;
			}
			const edits = [];
			try {
				walkTree(root, text, true, edits);
			} catch {
				return text;
			}
			if (edits.length === 0) return text;
			edits.sort((a, b) => b.start - a.start);
			let out = text;
			for (const edit of edits) out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
			return out;
		}
		/** Strip common inline markers so length checks and display see prose, not syntax. */
		function stripInline(src) {
			return src.replace(/`([^`]*)`/gu, "$1").replace(/\*\*([^*]+)\*\*/gu, "$1").replace(/\*([^*]+)\*/gu, "$1").replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1").replace(/\[([^\]]*)\]\([^)]*\)/gu, "$1");
		}
		/**
		* Split a single-line task title at its first full-width colon (`标题：说明`).
		* @param source - one-line item source after the task marker.
		* @returns the two sides, or undefined when the line is not a split pair.
		*/
		function splitChecklistColon(source) {
			const index = source.indexOf("：");
			if (index <= 0) return void 0;
			const title = source.slice(0, index).trim();
			const body = source.slice(index + 1).trim();
			if (title === "" || body === "" || stripInline(title).trim().length > 30) return void 0;
			return {
				title,
				body
			};
		}
		/**
		* Title/body split of one list item, shared by the checklist walk, the `todo`
		* fence, and the `timeline` fence: the first paragraph's first line titles
		* the entry, the rest of that paragraph plus later blocks become the body, a
		* lone `标题：说明` line splits once, nested lists decline the item.
		* @param text - complete document source the item's positions index into.
		* @param item - one list item.
		* @param dropPrefix - marker stripped from the paragraph source before the
		* split (the task checkbox); absent for none.
		* @param keepNested - nested lists are skipped instead of declining the item
		* (the `todo` fence flattens them separately).
		* @returns the entry, or undefined when the item has no usable title.
		*/
		function entryTitleBody(text, item, dropPrefix, keepNested = false) {
			const first = item.children[0];
			if (first === void 0 || first.type !== "paragraph") return void 0;
			const raw = nodeSource(text, first);
			const [firstLine = "", ...restLines] = (dropPrefix === void 0 ? raw : raw.replace(dropPrefix, "")).split("\n");
			const later = [];
			for (const child of item.children.slice(1)) {
				if (child.type === "list") {
					if (!keepNested) return void 0;
					continue;
				}
				const source = nodeSource(text, child).trim();
				if (source !== "") later.push(source);
			}
			let body = [restLines.join("\n").trim(), ...later].filter((part) => part !== "").join("\n\n");
			let titleSource = firstLine.trim();
			if (body === "") {
				const split = splitChecklistColon(titleSource);
				if (split !== void 0) {
					titleSource = split.title;
					body = split.body;
				}
			}
			const title = stripInline(titleSource).trim();
			if (title === "") return void 0;
			return {
				title,
				body
			};
		}
		/**
		* Extract one checklist entry from a task-list item.
		* @param text - complete document source the item's positions index into.
		* @param item - one task-list item.
		* @returns the entry, or undefined when the item has no usable title.
		*/
		function checklistEntry(text, item) {
			const entry = entryTitleBody(text, item, /^\[[ xX]\][ \t]*/u);
			return entry === void 0 ? void 0 : {
				title: entry.title,
				body: entry.body,
				checked: item.checked === true
			};
		}
		//#endregion
		//#region src/rules/chart.ts
		/** Minimum/maximum data rows a chartable table may carry (tolerance above the persona's 500). */
		const MIN_ROWS = 2;
		const MAX_ROWS = 550;
		/** Render-freeze guards (not readability caps; the table tab always stays reachable). */
		const MAX_Y_COLUMNS = 8;
		const MAX_DATA_CELLS = 2e3;
		/** Plain decimal literal: optional sign, digits with optional fraction, optional exponent. */
		const NUMBER_RE = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
		/**
		* Parse one data cell as a plain number. Units, percent signs, thousands
		* separators, and currency symbols are parse failures (v2 removed the
		* percent scaling).
		* @param cell - cell text as extracted from the table.
		* @returns the numeric value, or undefined when the cell is not numeric.
		*/
		function parseNumber(cell) {
			const trimmed = cell.trim();
			if (!NUMBER_RE.test(trimmed)) return void 0;
			const value = Number(trimmed);
			return Number.isFinite(value) ? value : void 0;
		}
		/**
		* Parse one plain-number cell into an exact scaled decimal.
		* @param cell - cell text already covered by parseNumber's grammar.
		* @returns the scaled decimal, or undefined when the cell is malformed.
		*/
		function scaled(cell) {
			const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(cell.trim());
			if (match === null || match[2] === "" && match[3] === void 0) return void 0;
			const exponent = Number(match[4] ?? "0");
			if (!Number.isSafeInteger(exponent) || Math.abs(exponent) > 400) return void 0;
			const digits = (match[2] ?? "") + (match[3] ?? "");
			return {
				digits: (match[1] === "-" ? -1n : 1n) * BigInt(digits === "" ? "0" : digits),
				scale: (match[3] ?? "").length - exponent
			};
		}
		/**
		* Exact sum of plain-number cells, normalized to one common scale.
		* @param cells - data-cell texts of the value column.
		* @returns the sum, or undefined when any cell is not a plain number.
		*/
		function exactSum(cells) {
			const parts = [];
			for (const cell of cells) {
				const part = scaled(cell);
				if (part === void 0) return void 0;
				parts.push(part);
			}
			const scale = Math.max(...parts.map((part) => part.scale));
			if (!Number.isSafeInteger(scale) || Math.abs(scale) > 400) return void 0;
			let digits = 0n;
			for (const part of parts) if (part.scale === scale) digits += part.digits;
			else if (part.scale < scale) digits += part.digits * 10n ** BigInt(scale - part.scale);
			else digits += part.digits / 10n ** BigInt(part.scale - scale);
			if (scale < 0) return {
				digits: digits * 10n ** BigInt(-scale),
				scale: 0
			};
			return {
				digits,
				scale
			};
		}
		/** `1e-9` tolerance at one sum scale, as an exact integer ulp count (0 when one ulp already exceeds it). */
		function epsilonAt(scale) {
			return scale >= 9 ? 10n ** BigInt(scale - 9) : 0n;
		}
		/** Numerical value of a scaled decimal (display only; classification stays exact). */
		function toNumber(value) {
			return Number(value.digits) / 10 ** value.scale;
		}
		/** Column cell values of every data row (headers excluded), missing cells skipped. */
		function columnValues(table, column) {
			const values = [];
			for (const row of table.rows) {
				const cell = row[column];
				if (cell !== void 0) values.push(cell);
			}
			return values;
		}
		/** Whether every data-row cell of one column parses as a number. */
		function columnNumeric(table, column) {
			const values = columnValues(table, column);
			return values.length === table.rows.length && values.every((cell) => parseNumber(cell) !== void 0);
		}
		/** Whether no data-row cell of one column parses as a number (text column). */
		function columnText(table, column) {
			return columnValues(table, column).every((cell) => parseNumber(cell) === void 0);
		}
		/**
		* Run the v2 decision tree over one table.
		* @param table - parsed GFM grid.
		* @returns the chart spec to render, or undefined to stay a table.
		*/
		function decideChart(table) {
			const rows = table.rows.length;
			if (rows < MIN_ROWS || rows > MAX_ROWS) return void 0;
			const columns = table.headers.length;
			if (columns < 2 || columns - 1 > MAX_Y_COLUMNS) return void 0;
			if (rows * columns > MAX_DATA_CELLS) return void 0;
			for (const row of table.rows) {
				if (row.length !== columns) return void 0;
				for (const cell of row) if (cell.trim() === "") return void 0;
			}
			const seriesOf = (from) => {
				const series = [];
				for (let column = from; column < columns; column++) series.push({
					name: table.headers[column] ?? String(column + 1),
					values: table.rows.map((row) => parseNumber(row[column] ?? "") ?? 0)
				});
				return series;
			};
			let allNumeric = true;
			for (let column = 0; column < columns; column++) if (!columnNumeric(table, column)) {
				allNumeric = false;
				break;
			}
			if (allNumeric) return {
				kind: "line",
				labels: table.rows.map((row) => row[0] ?? ""),
				xValues: table.rows.map((row) => parseNumber(row[0] ?? "") ?? 0),
				series: seriesOf(1),
				supplement: void 0
			};
			if (columns !== 2 || !columnText(table, 0) || !columnNumeric(table, 1)) return void 0;
			const valueCells = table.rows.map((row) => row[1] ?? "");
			const values = valueCells.map((cell) => parseNumber(cell) ?? 0);
			const sum = exactSum(valueCells);
			if (sum !== void 0 && values.every((value) => value >= 0) && sum.digits > 0n) {
				const one = 10n ** BigInt(sum.scale);
				const epsilon = epsilonAt(sum.scale);
				if (sum.digits <= one + epsilon) {
					const exactlyOne = sum.digits >= one - epsilon;
					return {
						kind: "pie",
						labels: table.rows.map((row) => row[0] ?? ""),
						xValues: void 0,
						series: [{
							name: table.headers[1] ?? "2",
							values
						}],
						supplement: exactlyOne ? void 0 : { value: 1 - toNumber(sum) }
					};
				}
			}
			return {
				kind: "bar",
				labels: table.rows.map((row) => row[0] ?? ""),
				xValues: void 0,
				series: [{
					name: table.headers[1] ?? "2",
					values
				}],
				supplement: void 0
			};
		}
		//#endregion
		//#region src/rules/stack-colors.ts
		/**
		* Stack fence color table: the CSS named-color palette and matplotlib's tab
		* palette as hex, plus the luminance test that picks readable box text. A
		* fill that resolves through neither table (and is not a hex literal) is a
		* header parse failure, so the whole fence falls back to a code block.
		*/
		/** CSS extended color keywords. */
		const NAMED = {
			aliceblue: "#f0f8ff",
			antiquewhite: "#faebd7",
			aqua: "#00ffff",
			aquamarine: "#7fffd4",
			azure: "#f0ffff",
			beige: "#f5f5dc",
			bisque: "#ffe4c4",
			black: "#000000",
			blanchedalmond: "#ffebcd",
			blue: "#0000ff",
			blueviolet: "#8a2be2",
			brown: "#a52a2a",
			burlywood: "#deb887",
			cadetblue: "#5f9ea0",
			chartreuse: "#7fff00",
			chocolate: "#d2691e",
			coral: "#ff7f50",
			cornflowerblue: "#6495ed",
			cornsilk: "#fff8dc",
			crimson: "#dc143c",
			cyan: "#00ffff",
			darkblue: "#00008b",
			darkcyan: "#008b8b",
			darkgoldenrod: "#b8860b",
			darkgray: "#a9a9a9",
			darkgreen: "#006400",
			darkgrey: "#a9a9a9",
			darkkhaki: "#bdb76b",
			darkmagenta: "#8b008b",
			darkolivegreen: "#556b2f",
			darkorange: "#ff8c00",
			darkorchid: "#9932cc",
			darkred: "#8b0000",
			darksalmon: "#e9967a",
			darkseagreen: "#8fbc8f",
			darkslateblue: "#483d8b",
			darkslategray: "#2f4f4f",
			darkslategrey: "#2f4f4f",
			darkturquoise: "#00ced1",
			darkviolet: "#9400d3",
			deeppink: "#ff1493",
			deepskyblue: "#00bfff",
			dimgray: "#696969",
			dimgrey: "#696969",
			dodgerblue: "#1e90ff",
			firebrick: "#b22222",
			floralwhite: "#fffaf0",
			forestgreen: "#228b22",
			fuchsia: "#ff00ff",
			gainsboro: "#dcdcdc",
			ghostwhite: "#f8f8ff",
			gold: "#ffd700",
			goldenrod: "#daa520",
			gray: "#808080",
			green: "#008000",
			greenyellow: "#adff2f",
			grey: "#808080",
			honeydew: "#f0fff0",
			hotpink: "#ff69b4",
			indianred: "#cd5c5c",
			indigo: "#4b0082",
			ivory: "#fffff0",
			khaki: "#f0e68c",
			lavender: "#e6e6fa",
			lavenderblush: "#fff0f5",
			lawngreen: "#7cfc00",
			lemonchiffon: "#fffacd",
			lightblue: "#add8e6",
			lightcoral: "#f08080",
			lightcyan: "#e0ffff",
			lightgoldenrodyellow: "#fafad2",
			lightgray: "#d3d3d3",
			lightgreen: "#90ee90",
			lightgrey: "#d3d3d3",
			lightpink: "#ffb6c1",
			lightsalmon: "#ffa07a",
			lightseagreen: "#20b2aa",
			lightskyblue: "#87cefa",
			lightslategray: "#778899",
			lightslategrey: "#778899",
			lightsteelblue: "#b0c4de",
			lightyellow: "#ffffe0",
			lime: "#00ff00",
			limegreen: "#32cd32",
			linen: "#faf0e6",
			magenta: "#ff00ff",
			maroon: "#800000",
			mediumaquamarine: "#66cdaa",
			mediumblue: "#0000cd",
			mediumorchid: "#ba55d3",
			mediumpurple: "#9370db",
			mediumseagreen: "#3cb371",
			mediumslateblue: "#7b68ee",
			mediumspringgreen: "#00fa9a",
			mediumturquoise: "#48d1cc",
			mediumvioletred: "#c71585",
			midnightblue: "#191970",
			mintcream: "#f5fffa",
			mistyrose: "#ffe4e1",
			moccasin: "#ffe4b5",
			navajowhite: "#ffdead",
			navy: "#000080",
			oldlace: "#fdf5e6",
			olive: "#808000",
			olivedrab: "#6b8e23",
			orange: "#ffa500",
			orangered: "#ff4500",
			orchid: "#da70d6",
			palegoldenrod: "#eee8aa",
			palegreen: "#98fb98",
			paleturquoise: "#afeeee",
			palevioletred: "#db7093",
			papayawhip: "#ffefd5",
			peachpuff: "#ffdab9",
			peru: "#cd853f",
			pink: "#ffc0cb",
			plum: "#dda0dd",
			powderblue: "#b0e0e6",
			purple: "#800080",
			rebeccapurple: "#663399",
			red: "#ff0000",
			rosybrown: "#bc8f8f",
			royalblue: "#4169e1",
			saddlebrown: "#8b4513",
			salmon: "#fa8072",
			sandybrown: "#f4a460",
			seagreen: "#2e8b57",
			seashell: "#fff5ee",
			sienna: "#a0522d",
			silver: "#c0c0c0",
			skyblue: "#87ceeb",
			slateblue: "#6a5acd",
			slategray: "#708090",
			slategrey: "#708090",
			snow: "#fffafa",
			springgreen: "#00ff7f",
			steelblue: "#4682b4",
			tan: "#d2b48c",
			teal: "#008080",
			thistle: "#d8bfd8",
			tomato: "#ff6347",
			turquoise: "#40e0d0",
			violet: "#ee82ee",
			wheat: "#f5deb3",
			white: "#ffffff",
			whitesmoke: "#f5f5f5",
			yellow: "#ffff00",
			yellowgreen: "#9acd32"
		};
		/** matplotlib `tab:` palette. */
		const TAB = {
			"tab:blue": "#1f77b4",
			"tab:orange": "#ff7f0e",
			"tab:green": "#2ca02c",
			"tab:red": "#d62728",
			"tab:purple": "#9467bd",
			"tab:brown": "#8c564b",
			"tab:pink": "#e377c2",
			"tab:gray": "#7f7f7f",
			"tab:olive": "#bcbd22",
			"tab:cyan": "#17becf"
		};
		/**
		* Normalize one stack fill color to a CSS hex string.
		* @param raw - bracketed header value: a named color, `#rgb`/`#rrggbb`(/aa),
		* or `tab:*`; the leading `#` is optional.
		* @returns normalized `#rrggbb`/`#rrggbbaa`, or undefined when unresolvable.
		*/
		function normalizeFill(raw) {
			const value = raw.trim().toLowerCase();
			if (value === "") return void 0;
			if (Object.hasOwn(TAB, value)) return TAB[value];
			if (Object.hasOwn(NAMED, value)) return NAMED[value];
			if (/^#?[0-9a-f]{3}$/u.test(value)) {
				const digits = value.replace("#", "");
				return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
			}
			if (/^#?[0-9a-f]{6}(?:[0-9a-f]{2})?$/u.test(value)) return `#${value.replace("#", "")}`;
		}
		/**
		* Relative luminance of a `#rrggbb` fill (WCAG formula), for choosing readable text.
		* @param fill - normalized hex fill.
		* @returns luminance in 0..1; 0 for unparseable input.
		*/
		function luminance(fill) {
			const hex = fill.length === 7 || fill.length === 9 ? fill : "";
			if (hex === "") return 0;
			const channel = (at) => {
				const part = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
				return part <= .03928 ? part / 12.92 : ((part + .055) / 1.055) ** 2.4;
			};
			return .2126 * channel(1) + .7152 * channel(3) + .0722 * channel(5);
		}
		/**
		* Readable text color over one fill.
		* @param fill - normalized hex fill.
		* @returns `#000000` or `#ffffff`.
		*/
		function textOn(fill) {
			return luminance(fill) > .45 ? "#000000" : "#ffffff";
		}
		//#endregion
		//#region src/rules/fence.ts
		/** Node cap for one mindmap fence. */
		const MINDMAP_MAX_NODES = 200;
		/** Node and depth caps for one tree fence. */
		const TREE_MAX_NODES = 500;
		const TREE_MAX_DEPTH = 12;
		/** Item cap for one todo fence. */
		const TODO_MAX_ITEMS = 100;
		/** Entry count bounds for one timeline fence. */
		const TIMELINE_MIN_ENTRIES = 2;
		const TIMELINE_MAX_ENTRIES = 100;
		/** Tab count and label caps for one tab fence. */
		const TAB_MIN_TABS = 2;
		const TAB_MAX_TABS = 30;
		const TAB_LABEL_MAX = 60;
		/** Title length cap for a todo/timeline heading/paragraph block. */
		const FENCE_TITLE_MAX = 120;
		/**
		* Body size cap before any fence parse: a legal fence is far smaller (200
		* nodes / 500 entries), and the mdast parse itself is quadratic on hostile
		* inputs, so oversized bodies degrade to native before parsing.
		*/
		const FENCE_BODY_MAX = 1e5;
		/**
		* Unordered-list top level of a fence body; undefined when anything else
		* appears. Tolerated model deviations (never taught): ordered lists parse
		* identically, and task checkboxes are stripped instead of declining.
		* @param body - fence body.
		* @param allowOrdered - ordered-list markers may open items (mindmap/tree).
		*/
		function fenceLists(body, allowOrdered = false) {
			if (body.length > FENCE_BODY_MAX) return void 0;
			let root;
			try {
				root = parseBlocks(body);
			} catch (error) {
				return;
			}
			const lists = [];
			for (const node of root.children) {
				if (node.type !== "list" || node.ordered === true && !allowOrdered) return void 0;
				lists.push(node);
			}
			return lists.length === 0 ? void 0 : lists;
		}
		/** A list item carries a GFM task-list checkbox. */
		function isTaskItem$1(item) {
			return item.checked === true || item.checked === false;
		}
		/** One item's first line as a label, with a task checkbox marker dropped. */
		function itemLabel(item) {
			const first = item.children.find((child) => child.type === "paragraph");
			return (first === void 0 ? "" : plainText(first).trim().split("\n")[0] ?? "").replace(/^\[[ xX]\][ \t]*/u, "");
		}
		/** One branch per list item: label = first paragraph's first line, children = nested list. */
		function itemTrees(list) {
			return list.children.map((item) => {
				const children = [];
				for (const child of item.children) if (child.type === "list") children.push(...itemTrees(child));
				return {
					label: itemLabel(item),
					children
				};
			});
		}
		function countTrees(trees) {
			return trees.reduce((sum, tree) => sum + 1 + countTrees(tree.children), 0);
		}
		/**
		* `mindmap` fence body: nested lists, one tree per top-level item.
		* @param body - code-block content.
		* @returns the trees, or undefined unless every node is list-shaped with a
		* non-empty label, total 2..200 (at least one edge). Tolerated deviations:
		* ordered markers, task checkboxes, and a single leading paragraph that
		* becomes one root over the listed branches.
		*/
		function parseMindmapFence(body) {
			const lists = fenceLists(body, true);
			if (lists !== void 0) {
				const trees = lists.flatMap((list) => itemTrees(list));
				const nodes = countTrees(trees);
				if (nodes < 2 || nodes > MINDMAP_MAX_NODES) return void 0;
				if (trees.some((tree) => tree.label === "")) return void 0;
				return trees;
			}
			return paragraphRootedMindmap(body);
		}
		/** A leading paragraph becomes one root whose children are the listed branches. */
		function paragraphRootedMindmap(body) {
			if (body.length > FENCE_BODY_MAX) return void 0;
			let root;
			try {
				root = parseBlocks(body);
			} catch (error) {
				return;
			}
			const children = root.children;
			const first = children[0];
			if (first?.type !== "paragraph") return void 0;
			const rest = children.slice(1);
			if (rest.length === 0 || rest.some((node) => node.type !== "list")) return void 0;
			const trees = [{
				label: plainText(first).trim().split("\n")[0] ?? "",
				children: rest.flatMap((node) => itemTrees(node))
			}];
			const nodes = countTrees(trees);
			if (nodes < 2 || nodes > MINDMAP_MAX_NODES) return void 0;
			if (trees[0].label === "") return void 0;
			if (trees[0].children.some((child) => child.label === "")) return void 0;
			return trees;
		}
		/** Tree entries with node/depth accounting; undefined exceeds a cap or hits a bad shape. */
		function treeEntries(list, depth, budget) {
			if (depth > TREE_MAX_DEPTH) return void 0;
			const entries = [];
			for (const item of list.children) {
				const name = itemLabel(item);
				const childLists = [];
				for (const child of item.children) if (child.type === "list") childLists.push(child);
				if (name === "") return void 0;
				budget.count += 1;
				if (budget.count > TREE_MAX_NODES) return void 0;
				let children = [];
				if (childLists.length > 0) for (const childList of childLists) {
					const parsed = treeEntries(childList, depth + 1, budget);
					if (parsed === void 0) return void 0;
					children = children.concat(parsed);
				}
				entries.push({
					name,
					folder: name.endsWith("/") || children.length > 0,
					children
				});
			}
			return entries;
		}
		/**
		* `tree` fence body: nested lists as a file forest (multiple roots).
		* @param body - code-block content.
		* @returns the entries, or undefined outside 500 nodes / 12 levels or on any
		* non-list shape. Tolerated deviations: ordered markers and task checkboxes.
		*/
		function parseTreeFence(body) {
			const lists = fenceLists(body, true);
			if (lists === void 0) return void 0;
			const budget = { count: 0 };
			const trees = [];
			for (const list of lists) {
				const parsed = treeEntries(list, 1, budget);
				if (parsed === void 0) return void 0;
				trees.push(...parsed);
			}
			return trees.length === 0 ? void 0 : trees;
		}
		/** Split one titled-list fence body into its optional title block and list. */
		function titledListParts(body) {
			if (body.length > FENCE_BODY_MAX) return void 0;
			let root;
			try {
				root = parseBlocks(body);
			} catch (error) {
				return;
			}
			const children = root.children;
			if (children.length === 0 || children.length > 2) return void 0;
			let title = "";
			let listIndex = 0;
			const first = children[0];
			if (first.type === "heading" || first.type === "paragraph") {
				title = plainText(first).replace(/\s*\n\s*/gu, " ").replace(/[：:]\s*$/u, "").trim();
				if (title.length > FENCE_TITLE_MAX) return void 0;
				listIndex = 1;
			}
			const list = children[listIndex];
			if (list?.type !== "list" || list.children.length === 0) return void 0;
			return {
				title,
				items: list.children
			};
		}
		/**
		* Flatten nested task items into document order (parent, then its children).
		* @param items - one list level's items.
		* @returns the depth-first item sequence, or undefined on a nested non-task item.
		*/
		function flattenTaskItems(items) {
			const out = [];
			for (const item of items) {
				out.push(item);
				for (const child of item.children) if (child.type === "list") {
					const nested = flattenTaskItems(child.children);
					if (nested === void 0) return void 0;
					out.push(...nested);
				}
			}
			return out;
		}
		/**
		* `todo` fence body: optional leading heading/paragraph title, then one flat
		* GFM task list. Item extraction is the shared auto-upgrade rule (colon split
		* included), run against the FULL body so item offsets stay valid.
		* @param body - code-block content.
		* @returns the checklist payload (source = the full fence body; the upgrade
		* walk overwrites it with the fence's own source slice), or undefined on
		* non-task items or > 100 items. Tolerated deviation: nested task lists
		* flatten into the document-order item sequence.
		*/
		function parseTodoFence(body) {
			const parts = titledListParts(body);
			if (parts === void 0) return void 0;
			const nested = flattenTaskItems(parts.items);
			if (nested === void 0) return void 0;
			if (nested.length > TODO_MAX_ITEMS) return void 0;
			if (!nested.every(isTaskItem$1)) return void 0;
			const items = [];
			for (const item of nested) {
				const entry = entryTitleBody(body, item, /^\[[ xX]\][ \t]*/u, true);
				if (entry === void 0) return void 0;
				items.push({
					title: entry.title,
					body: entry.body,
					checked: item.checked === true
				});
			}
			return {
				kind: "checklist",
				source: body,
				title: parts.title,
				items
			};
		}
		/**
		* `timeline` fence body in either form: a flat list whose items title
		* stages, or a same-depth heading run. Both take an optional leading
		* heading/paragraph title; stage numbering comes from the view, not the
		* markers.
		* @param body - code-block content.
		* @returns the timeline payload (source = the full fence body; the upgrade
		* walk overwrites it with the fence's own source slice), or undefined when
		* neither form parses or entries fall outside 2..100.
		*/
		function parseTimelineFence(body) {
			const parts = titledListParts(body);
			if (parts === void 0) return headingTimeline(body);
			if (parts.items.length < TIMELINE_MIN_ENTRIES || parts.items.length > TIMELINE_MAX_ENTRIES) return headingTimeline(body);
			if (parts.items.some(isTaskItem$1)) return headingTimeline(body);
			const entries = [];
			for (const item of parts.items) {
				const entry = entryTitleBody(body, item);
				if (entry === void 0) return headingTimeline(body);
				entries.push(entry);
			}
			return {
				kind: "timeline",
				source: body,
				title: parts.title,
				entries
			};
		}
		/**
		* `timeline` fence body, heading form: >=2 same-depth headings each opening
		* one stage (its title, trailing sentence enders dropped), with the blocks
		* until the next heading as its body. The run is the shallowest depth
		* carrying >=2 headings; deeper headings fold into the stage body, and a
		* paragraph or shallower heading directly above the run is adopted as the
		* timeline title. Any other shape declines the whole fence.
		* @param body - code-block content.
		* @returns the timeline payload, or undefined outside 2..100 entries.
		*/
		function headingTimeline(body) {
			if (body.length > FENCE_BODY_MAX) return void 0;
			let root;
			try {
				root = parseBlocks(body);
			} catch (error) {
				return;
			}
			const children = root.children;
			const headings = children.filter((node) => node.type === "heading");
			if (headings.length < 2) return void 0;
			const counts = /* @__PURE__ */ new Map();
			for (const heading of headings) counts.set(heading.depth, (counts.get(heading.depth) ?? 0) + 1);
			let runDepth = Number.POSITIVE_INFINITY;
			for (const [depth, count] of counts) if (count >= 2 && depth < runDepth) runDepth = depth;
			if (!Number.isFinite(runDepth)) return void 0;
			const runStart = children.findIndex((node) => node.type === "heading" && node.depth === runDepth);
			let title = "";
			if (runStart === 1) {
				const lead = children[0];
				if (lead.type === "paragraph") {
					title = plainText(lead).replace(/\s*\n\s*/gu, " ").replace(/[：:]\s*$/u, "").trim();
					if (title.length > FENCE_TITLE_MAX) return void 0;
				} else if (lead.type === "heading" && lead.depth < runDepth) title = plainText(lead).trim();
				else return;
			} else if (runStart > 1) return;
			const entries = [];
			let stageTitle;
			let bodyParts = [];
			const closeStage = () => {
				if (stageTitle !== void 0) entries.push({
					title: stageTitle,
					body: bodyParts.join("\n\n")
				});
			};
			for (let i = runStart; i < children.length; i++) {
				const node = children[i];
				if (node.type === "heading") {
					const depth = node.depth;
					if (depth === runDepth) {
						closeStage();
						const headingTitle = plainText(node).trim().replace(/[。．！？!?\s]+$/u, "");
						if (headingTitle === "") return void 0;
						stageTitle = headingTitle;
						bodyParts = [];
					} else if (depth > runDepth) {
						if (stageTitle === void 0) return void 0;
						const source = nodeSource(body, node).trim();
						if (source !== "") bodyParts.push(source);
					} else return;
				} else if (stageTitle === void 0) return;
				else {
					const source = nodeSource(body, node).trim();
					if (source !== "") bodyParts.push(source);
				}
			}
			closeStage();
			if (entries.length < TIMELINE_MIN_ENTRIES || entries.length > TIMELINE_MAX_ENTRIES) return void 0;
			return {
				kind: "timeline",
				source: body,
				title,
				entries
			};
		}
		/**
		* `prototype-choices` fence body: the tab grammar (`@` header lines opening
		* option pages, inner code fences kept literal) preceded by an optional
		* single heading/paragraph title block.
		* @param body - code-block content.
		* @returns the payload with title and options, or undefined when the preamble
		* is more than one title block or the tab grammar declines.
		*/
		function parseChoicesFence(body) {
			const lines = body.split("\n");
			let inInnerFence = false;
			let splitAt = -1;
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				if (/^(```|~~~)/u.test(line)) inInnerFence = !inInnerFence;
				if (!inInnerFence && /^@/u.test(line)) {
					splitAt = i;
					break;
				}
			}
			if (splitAt === -1) return void 0;
			const preamble = lines.slice(0, splitAt).join("\n").trim();
			let title = "";
			if (preamble !== "") {
				let root;
				try {
					root = parseBlocks(preamble);
				} catch (error) {
					return;
				}
				const children = root.children;
				const lead = children[0];
				if (children.length !== 1 || lead.type !== "heading" && lead.type !== "paragraph") return void 0;
				title = plainText(lead).replace(/\s*\n\s*/gu, " ").replace(/[：:]\s*$/u, "").trim();
				if (title.length > FENCE_TITLE_MAX) return void 0;
			}
			const choices = parseTabFence(lines.slice(splitAt).join("\n"));
			if (choices === void 0) return void 0;
			return {
				kind: "choices",
				source: body,
				title,
				choices
			};
		}
		/**
		* `tab` fence body: each non-indented `@标签` line outside inner code fences
		* opens one page; everything until the next header is that page's markdown,
		* blank lines included. A non-blank line before the first header declines
		* the whole fence (content is never dropped silently).
		* @param body - code-block content.
		* @returns the pages, or undefined outside 2..30 headers, on an empty or
		* over-long label, or past the body cap.
		*/
		function parseTabFence(body) {
			if (body.length > FENCE_BODY_MAX) return void 0;
			const tabs = [];
			let parts = [];
			let inInnerFence = false;
			const closePage = () => {
				const current = tabs[tabs.length - 1];
				if (current === void 0) return;
				tabs[tabs.length - 1] = {
					label: current.label,
					body: parts.join("\n").replace(/^[ \t]*\n/u, "").replace(/\s+$/u, "")
				};
			};
			for (const line of body.split("\n")) {
				if (/^(```|~~~)/u.test(line)) inInnerFence = !inInnerFence;
				if (!inInnerFence && /^@/u.test(line)) {
					closePage();
					const label = stripInline(line.replace(/^@[ \t]*/u, "")).trim();
					if (label === "" || label.length > TAB_LABEL_MAX) return void 0;
					tabs.push({
						label,
						body: ""
					});
					parts = [];
					continue;
				}
				if (tabs.length === 0 && line.trim() !== "") return void 0;
				parts.push(line);
			}
			closePage();
			if (tabs.length < TAB_MIN_TABS || tabs.length > TAB_MAX_TABS) return void 0;
			return tabs;
		}
		/** Box header: `N.`/`N.M.`/`N`/`N.M` (trailing dot optional) + optional `[fill]` + first-line text. */
		const STACK_HEADER = /^(\d+)(?:\.(\d+))?\.?[ \t]*(?:\[([^\]]*)\][ \t]*)?(.*)$/;
		/** A standalone connector/rule line (arrows, bars, dashes) between boxes. */
		const STACK_CONNECTOR = /^[ \t]*(?:[-–—=─═>→⇒↓⇓|│]+)[ \t]*$/u;
		/**
		* `stack` fence body: numbered boxes; same first number shares one layer row.
		* @param body - code-block content.
		* @returns layers sorted ascending, or undefined when any unindented line is
		* not a box header or connector, a fill does not resolve, or no box parses.
		* Tolerated deviations: connector-only lines are ignored, the box header's
		* trailing dot may be missing, hex fills may omit the leading `#`, and lines
		* inside a flush-left inner code fence stay box content.
		*/
		function parseStackFence(body) {
			const lines = body.split("\n");
			const drafts = [];
			let current;
			let inInnerFence = false;
			for (const line of lines) {
				if (/^(```|~~~)/u.test(line)) {
					if (current === void 0) return void 0;
					inInnerFence = !inInnerFence;
					current.parts.push(line);
					continue;
				}
				if (inInnerFence) {
					current.parts.push(line.replace(/^[ \t]+/u, ""));
					continue;
				}
				if (line.trim() === "") {
					current?.parts.push("");
					continue;
				}
				if (STACK_CONNECTOR.test(line)) continue;
				if (/^[ \t]/u.test(line)) {
					if (current === void 0) return void 0;
					current.parts.push(line.replace(/^[ \t]+/u, ""));
					continue;
				}
				const match = STACK_HEADER.exec(line);
				if (match === null) return void 0;
				const fill = match[3] === void 0 ? void 0 : normalizeFill(match[3]);
				if (match[3] !== void 0 && fill === void 0) return void 0;
				current = {
					layer: Number(match[1]),
					fill,
					parts: [match[4] ?? ""]
				};
				drafts.push(current);
			}
			if (drafts.length === 0) return void 0;
			const byLayer = /* @__PURE__ */ new Map();
			for (const draft of drafts) {
				let content = draft.parts.join("\n").replace(/^[ \t]*\n/u, "").replace(/\s+$/u, "");
				if (content.trim() === "") content = "";
				const boxes = byLayer.get(draft.layer) ?? [];
				boxes.push({
					content,
					fill: draft.fill
				});
				byLayer.set(draft.layer, boxes);
			}
			return [...byLayer.entries()].sort((a, b) => a[0] - b[0]).map(([index, boxes]) => ({
				index,
				boxes
			}));
		}
		//#endregion
		//#region src/rules/upgrade.ts
		/** Sentence enders that split a card entry's heading from its body. */
		const SENTENCE_ENDERS = "。．！？!?";
		/** Index of the first sentence ender standing alone (a `.` counts only before whitespace or end). */
		function sentenceEndIndex(src) {
			for (let i = 0; i < src.length; i++) {
				const char = src[i];
				if (char === void 0) continue;
				if (SENTENCE_ENDERS.includes(char)) return i;
				if (char === ".") {
					const next = src[i + 1];
					if (next === void 0 || next === " " || next === "\n" || next === "	") return i;
				}
			}
			return -1;
		}
		/** Offset span of one top-level node; empty span when positions are missing. */
		function span(text, index, nodes) {
			const node = nodes[index];
			const start = node?.position?.start.offset;
			const end = node?.position?.end.offset;
			if (node === void 0 || start === void 0 || end === void 0 || start > end || end > text.length) return {
				start: -1,
				end: -1
			};
			return {
				start,
				end
			};
		}
		/** Whether one list item carries a GFM task-list checkbox. */
		function isTaskItem(item) {
			return item.checked === true || item.checked === false;
		}
		/** Whether any item of one list carries a task checkbox (mixed lists included). */
		function hasTaskItems(list) {
			return list.children.some(isTaskItem);
		}
		/**
		* Flatten one block's text into the checklist's single title line: line
		* breaks collapse to spaces and a trailing colon is dropped, because the
		* block reads as a lead-in sentence rather than a heading.
		* @param source - plain text of one block.
		* @returns the title line, or undefined when nothing remains.
		*/
		function flattenChecklistTitle(source) {
			const line = source.replace(/\s*\n\s*/gu, " ").replace(/[：:]\s*$/u, "").trim();
			return line === "" ? void 0 : line;
		}
		/**
		* Text of the block immediately above a checklist. A checklist never appears
		* without a lead-in, so any of these block forms supplies the title: a
		* heading at any depth, a paragraph, or a list (flattened with `；`). Task
		* lists and non-text blocks cannot introduce one.
		* @param node - the top-level block preceding the task list.
		* @returns the marker-free title line, or undefined when the block cannot lead.
		*/
		function checklistLeadTitle(node) {
			if (node.type === "heading" || node.type === "paragraph") return flattenChecklistTitle(plainText(node));
			if (node.type !== "list" || hasTaskItems(node)) return void 0;
			const parts = node.children.map((item) => plainText(item).trim()).filter((part) => part !== "");
			if (parts.length === 0) return void 0;
			return flattenChecklistTitle(parts.join("；"));
		}
		/** Explicit fences first: the model chose the structure, so they outrank every heuristic. */
		function matchFence(text, nodes, i) {
			const code = nodes[i];
			if (code?.type !== "code") return void 0;
			const lang = code.lang?.trim().toLowerCase();
			const body = code.value;
			const codeSpan = span(text, i, nodes);
			if (codeSpan.start === -1) return void 0;
			const source = text.slice(codeSpan.start, codeSpan.end);
			const bodyNative = () => ({
				segment: {
					kind: "native",
					text: body,
					source
				},
				start: i,
				consume: 1
			});
			if (lang === "mindmap") {
				const trees = parseMindmapFence(body);
				if (trees === void 0) return bodyNative();
				return {
					segment: {
						kind: "mindmap",
						source,
						trees
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "tree") {
				const trees = parseTreeFence(body);
				if (trees === void 0) return bodyNative();
				return {
					segment: {
						kind: "tree",
						source,
						trees
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "todo") {
				const parsed = parseTodoFence(body);
				if (parsed === void 0) return bodyNative();
				return {
					segment: {
						...parsed,
						source
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "timeline") {
				const parsed = parseTimelineFence(body);
				if (parsed === void 0) return bodyNative();
				return {
					segment: {
						...parsed,
						source
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "stack") {
				const layers = parseStackFence(body);
				if (layers === void 0) return void 0;
				return {
					segment: {
						kind: "stack",
						source,
						layers
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "tab") {
				const tabs = parseTabFence(body);
				if (tabs === void 0) return bodyNative();
				return {
					segment: {
						kind: "tab",
						source,
						tabs
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "prototype-choices") {
				const parsed = parseChoicesFence(body);
				if (parsed === void 0) return bodyNative();
				return {
					segment: {
						...parsed,
						source
					},
					start: i,
					consume: 1
				};
			}
			if (lang === "matplotlib") {
				if (body.trim() === "") return void 0;
				return {
					segment: {
						kind: "matplotlib",
						source,
						code: body
					},
					start: i,
					consume: 1
				};
			}
		}
		/**
		* A flat GFM task list (>=2 items, every item checked or unchecked) upgrades
		* to an interactive checklist. The block immediately above it introduces the
		* card and is consumed with the list; a block already claimed by an earlier
		* upgrade is never adopted a second time.
		*/
		function matchChecklist(text, nodes, i, claimedUntil) {
			const list = nodes[i];
			if (list?.type !== "list" || list.children.length < 2) return void 0;
			if (!list.children.every(isTaskItem)) return void 0;
			const items = [];
			for (const item of list.children) {
				const entry = checklistEntry(text, item);
				if (entry === void 0) return void 0;
				items.push(entry);
			}
			const listSpan = span(text, i, nodes);
			if (listSpan.start === -1) return void 0;
			const previousIndex = i - 1;
			const previous = previousIndex >= claimedUntil ? nodes[previousIndex] : void 0;
			const title = previous === void 0 ? void 0 : checklistLeadTitle(previous);
			const start = title === void 0 ? listSpan.start : span(text, previousIndex, nodes).start;
			if (start === -1) return void 0;
			return {
				segment: {
					kind: "checklist",
					source: text.slice(start, listSpan.end),
					title: title ?? "",
					items
				},
				start: title === void 0 ? i : previousIndex,
				consume: 1
			};
		}
		/** H2/H3 heading directly followed by an ordered list of >=2 titled entries. */
		function matchCards(text, nodes, i) {
			const heading = nodes[i];
			const list = nodes[i + 1];
			if (heading?.type !== "heading" || heading.depth !== 2 && heading.depth !== 3) return void 0;
			if (plainText(heading).trim() === "") return void 0;
			if (list?.type !== "list" || list.ordered !== true || list.children.length < 2) return void 0;
			if (hasTaskItems(list)) return void 0;
			const cards = [];
			for (const item of list.children) {
				const first = item.children[0];
				if (first === void 0 || first.type !== "paragraph") return void 0;
				const paraSource = nodeSource(text, first);
				const end = sentenceEndIndex(paraSource);
				const title = stripInline((end === -1 ? paraSource : paraSource.slice(0, end)).trim()).trim();
				if (title === "" || title.length > 30) return void 0;
				const rest = end === -1 ? "" : paraSource.slice(end + 1).trim();
				const later = [];
				for (const child of item.children.slice(1)) {
					const source = nodeSource(text, child).trim();
					if (source !== "") later.push(source);
				}
				const body = [rest, ...later].filter((part) => part !== "").join("\n\n");
				cards.push({
					title,
					body
				});
			}
			const headSpan = span(text, i, nodes);
			const listSpan = span(text, i + 1, nodes);
			if (headSpan.start === -1 || listSpan.start === -1) return void 0;
			return {
				segment: {
					kind: "cards",
					source: text.slice(headSpan.start, listSpan.end),
					title: plainText(heading).trim(),
					cards
				},
				start: i,
				consume: 2
			};
		}
		/** GitHub alert marker alone on the quote's first line, case-insensitive. */
		const ALERT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/iu;
		/**
		* Drop the blockquote marker each continuation line carries in a raw child
		* slice (mdast paragraph spans keep the later lines' `> ` prefixes).
		* @param source - one child's raw source slice.
		* @returns the same lines without their leading quote markers.
		*/
		function unquoteLines(source) {
			return source.split("\n").map((line) => line.replace(/^>[ \t]?/u, "")).join("\n");
		}
		/**
		* One blockquote per callout. A GitHub alert marker (`[!NOTE]` family) alone
		* on the quote's first line types the callout and is dropped from its body;
		* anything else keeps the plain untyped box.
		*/
		function matchCallout(text, nodes, i) {
			const quote = nodes[i];
			if (quote?.type !== "blockquote") return void 0;
			const parts = [];
			let type;
			for (let index = 0; index < quote.children.length; index++) {
				const child = quote.children[index];
				if (child === void 0) continue;
				let source = nodeSource(text, child).trim();
				if (source === "") continue;
				if (type === void 0 && index === 0 && child.type === "paragraph") {
					const newline = source.indexOf("\n");
					const firstLine = newline === -1 ? source : source.slice(0, newline);
					const marker = ALERT_MARKER.exec(firstLine);
					if (marker !== null) {
						type = marker[1].toLowerCase();
						source = (newline === -1 ? "" : source.slice(newline + 1)).trim();
						if (source === "") continue;
					}
				}
				parts.push(unquoteLines(source));
			}
			const quoteSpan = span(text, i, nodes);
			if (quoteSpan.start === -1) return void 0;
			return {
				segment: {
					kind: "callout",
					source: text.slice(quoteSpan.start, quoteSpan.end),
					type,
					body: parts.join("\n\n")
				},
				start: i,
				consume: 1
			};
		}
		/** One table per styled-table segment (chart decision rides along). */
		function matchTable(text, nodes, i) {
			const table = nodes[i];
			if (table?.type !== "table") return void 0;
			const grid = table.children;
			if (grid.length === 0) return void 0;
			const readRow = (row) => {
				if (row.type !== "tableRow") return void 0;
				const cells = [];
				for (const cell of row.children) {
					if (cell.type !== "tableCell") return void 0;
					cells.push(plainText(cell).trim());
				}
				return cells;
			};
			const headerRow = readRow(grid[0]);
			if (headerRow === void 0 || headerRow.length === 0) return void 0;
			const rows = [];
			for (const row of grid.slice(1)) {
				const cells = readRow(row);
				if (cells === void 0) return void 0;
				rows.push(cells);
			}
			const aligns = [];
			for (const align of table.align ?? []) aligns.push(align ?? null);
			const tableSpan = span(text, i, nodes);
			if (tableSpan.start === -1) return void 0;
			const previous = nodes[i - 1];
			const container = previous !== void 0 && previous.type === "heading" && (previous.depth === 2 || previous.depth === 3) ? previous : void 0;
			const firstIndex = container === void 0 ? i : i - 1;
			const firstSpan = span(text, firstIndex, nodes);
			if (firstSpan.start === -1) return void 0;
			const spec = {
				headers: headerRow,
				rows,
				aligns
			};
			const chart = decideChart(spec);
			return {
				segment: {
					kind: "table",
					source: text.slice(firstSpan.start, tableSpan.end),
					table: spec,
					title: container === void 0 ? "" : plainText(container).trim(),
					chart
				},
				start: firstIndex,
				consume: 1
			};
		}
		/**
		* One standalone image paragraph upgrades to the framed image card. The
		* paragraph pass above fences body images off as their own paragraphs, so
		* any image that sits alone (authored or rewritten) lands here; a paragraph
		* mixing an image with prose stays native. Resolution is the view's concern:
		* an undisplayable destination degrades inside the card.
		*/
		function matchImage(text, nodes, i) {
			const paragraph = nodes[i];
			if (paragraph?.type !== "paragraph") return void 0;
			let image;
			for (const child of paragraph.children) {
				if (child.type === "text") {
					if (child.value.trim() !== "") return void 0;
					continue;
				}
				if (child.type === "image") {
					if (image !== void 0) return void 0;
					image = child;
					continue;
				}
				return;
			}
			if (image === void 0) return void 0;
			const paragraphSpan = span(text, i, nodes);
			if (paragraphSpan.start === -1) return void 0;
			return {
				segment: {
					kind: "image",
					source: text.slice(paragraphSpan.start, paragraphSpan.end),
					url: image.url,
					alt: image.alt ?? ""
				},
				start: i,
				consume: 1
			};
		}
		/** Try every rule at one cursor position; the winner owns its consumed span. */
		function matchAt(text, nodes, i, claimedUntil) {
			return tryMatch(() => matchFence(text, nodes, i)) ?? tryMatch(() => matchImage(text, nodes, i)) ?? tryMatch(() => matchChecklist(text, nodes, i, claimedUntil)) ?? tryMatch(() => matchCards(text, nodes, i)) ?? tryMatch(() => matchTable(text, nodes, i)) ?? tryMatch(() => matchCallout(text, nodes, i));
		}
		/** Run one matcher, converting any throw into a non-match. */
		function tryMatch(match) {
			try {
				const rule = match();
				if (rule === void 0 || rule.segment.source.trim() === "") return void 0;
				return rule;
			} catch {
				return;
			}
		}
		/**
		* Message-size ceiling for the rule walk; beyond it the block stays native.
		* 192KB sits far above any legitimate upgradeable shape (a max-size 550x10
		* table is ~85KB) and bounds this layer's added parse against quadratic
		* hostile inputs the platform renderer itself chokes on.
		*/
		const WALK_TEXT_MAX = 192 * 1024;
		/**
		* Decide the segment layout of one settled assistant text block. Pure and
		* total: any input returns at least one native segment covering the text.
		* Inputs past WALK_TEXT_MAX degrade whole-native BEFORE the mdast parse —
		* the parse itself is quadratic on hostile shapes, and the platform renderer
		* still draws the text exactly as it would without us.
		* @param text - complete markdown source of one text block.
		* @returns consecutive segments; native fallback covers the whole text.
		*/
		function upgradeText(text) {
			if (text.length > WALK_TEXT_MAX) return [{
				kind: "native",
				text,
				source: text
			}];
			let nodes;
			try {
				nodes = asBlockContent(parseBlocks(text));
			} catch {
				return [{
					kind: "native",
					text,
					source: text
				}];
			}
			const out = [];
			let nativeFrom = -1;
			const flushNative = (toExclusive) => {
				if (nativeFrom === -1 || toExclusive <= nativeFrom) {
					nativeFrom = -1;
					return;
				}
				const from = span(text, nativeFrom, nodes);
				const to = span(text, toExclusive - 1, nodes);
				if (from.start === -1 || to.start === -1) {
					out.length = 0;
					out.push({
						kind: "native",
						text,
						source: text
					});
					nativeFrom = -1;
					return;
				}
				const slice = text.slice(from.start, to.end);
				if (slice.trim() !== "") out.push({
					kind: "native",
					text: slice,
					source: slice
				});
				nativeFrom = -1;
			};
			try {
				let i = 0;
				let claimedUntil = 0;
				while (i < nodes.length) {
					const match = matchAt(text, nodes, i, claimedUntil);
					if (match !== void 0) {
						flushNative(match.start);
						out.push(match.segment);
						i += match.consume;
						claimedUntil = i;
					} else {
						if (nativeFrom === -1) nativeFrom = i;
						i++;
					}
				}
				flushNative(nodes.length);
			} catch {
				return [{
					kind: "native",
					text,
					source: text
				}];
			}
			if (out.length === 0) return [{
				kind: "native",
				text,
				source: text
			}];
			return out;
		}
		/** View of the parser's root children the walk indexes over. */
		function asBlockContent(root) {
			return root.children;
		}
		//#endregion
		//#region src/rules/icons.ts
		/** The inline stroke set this renderer ships. */
		const ICON_PATHS = {
			code: { d: ["m16 18 6-6-6-6", "M8 6l-6 6 6 6"] },
			microscope: { d: [
				"M6 18h8",
				"M3 22h18",
				"M14 22a7 7 0 1 0 0-14h-1",
				"M9 14h2",
				"M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z",
				"M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"
			] },
			workflow: { d: [
				"M5 3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z",
				"M15 13a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Z",
				"M7 11v2a2 2 0 0 0 2 2h4"
			] },
			"search-check": { d: [
				"M18 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
				"m14 12-1.2 1.2a1 1 0 0 1-1.4 0L10 12",
				"m21 21-4.3-4.3"
			] },
			lightbulb: { d: [
				"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5",
				"M9 18h6",
				"M10 22h4"
			] },
			info: { d: [
				"M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
				"M12 16v-4",
				"M12 8h.01"
			] },
			"message-circle": { d: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"] },
			"triangle-alert": { d: [
				"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2",
				"M12 9v4",
				"M12 17h.01"
			] },
			"octagon-alert": { d: [
				"M15.73 2H8.27L2 8.27v7.46L8.27 22h7.46L22 15.73V8.27Z",
				"M12 16v-4",
				"M12 8h.01"
			] },
			rocket: { d: [
				"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
				"m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
				"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0",
				"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
			] },
			shield: { d: ["M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"] },
			database: { d: [
				"M12 8c4.97 0 9-1.343 9-3s-4.03-3-9-3-9 1.343-9 3 4.03 3 9 3z",
				"M21 12c0 1.66-4 3-9 3s-9-1.34-9-3",
				"M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"
			] },
			"book-open": { d: ["M12 7v14", "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"] },
			users: { d: [
				"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
				"M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
				"M22 21v-2a4 4 0 0 0-3-3.87",
				"M16 3.13a4 4 0 0 1 0 7.75"
			] },
			target: { d: [
				"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
				"M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z",
				"M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
			] },
			wrench: { d: ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"] },
			"alert-triangle": { d: [
				"M21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
				"M12 9v4",
				"M12 17h.01"
			] },
			calendar: { d: [
				"M8 2v4",
				"M16 2v4",
				"M3 10h18",
				"M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
			] },
			globe: { d: [
				"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
				"M2 12h20",
				"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
			] },
			default: { d: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"] }
		};
		//#endregion
		//#region src/components/Icon.tsx
		/** Inline stroke icon over the shared Lucide-derived path set. */
		/** One 24x24 stroke icon, currentColor, hidden from assistive traffic. */
		function Icon({ name, size = 18 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dshr-icon",
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true,
				children: (ICON_PATHS[name] ?? ICON_PATHS.default).d.map((d, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d }, index))
			});
		}
		//#endregion
		//#region src/components/CalloutView.tsx
		/**
		* Callout: one blockquote restyled as a quiet side-marked box; a GitHub
		* alert marker (`[!NOTE]` family) types it with the marker's color, icon,
		* and localized title. The quote's inner markdown still renders through the
		* platform renderer.
		*/
		/** Icon key per alert flavor (GitHub's alert pairing). */
		const CALLOUT_ICONS = {
			note: "info",
			tip: "lightbulb",
			important: "message-circle",
			warning: "triangle-alert",
			caution: "octagon-alert"
		};
		/** Draw the upgraded callout box. */
		function CalloutView({ segment, labels, titles }) {
			if (segment.type === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
				className: "dshr-callout",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: segment.body,
					labels,
					pathImages,
					variant: "compact"
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: `dshr-callout-alert dshr-callout-${segment.type}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dshr-callout-alert-icon",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, {
						name: CALLOUT_ICONS[segment.type],
						size: 16
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshr-callout-alert-main",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-callout-alert-title",
						children: titles[segment.type]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: segment.body,
						labels,
						pathImages,
						variant: "compact"
					})]
				})]
			});
		}
		//#endregion
		//#region src/components/tex-spans.ts
		/**
		* TeX span locator for model-authored inline text.
		*
		* The rule engine strips inline markup from the fields shown in rich
		* components (stage/card titles, table headers and cells, node labels) and
		* keeps only TeX source. The view layer therefore routes exactly those spans
		* through the platform renderer and leaves everything else literal: feeding a
		* whole title such as `2. 当 $n$ 为奇数时` to the document parser would turn
		* the leading `2. ` into an ordered list.
		*
		* Delimiters mirror the platform grammar: `$$...$$` on one line, `$...$`
		* (content must not start or end with whitespace), `\(...\)`, and `\[...\]`.
		* Escaped opening dollars stay literal.
		*/
		const TEX_SPAN = /(?<!\\)\$\$[^$\n]+?\$\$|(?<!\\)\$[^\s$](?:[^$\n]*[^\s$])?\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/gu;
		/**
		* Locate the TeX spans in one inline field, in source order.
		* @param text - model-authored inline source (heading text or table cell).
		* @returns non-overlapping half-open spans, one per formula.
		*/
		function texSpans(text) {
			const spans = [];
			for (const match of text.matchAll(TEX_SPAN)) {
				const start = match.index;
				spans.push({
					start,
					end: start + match[0].length
				});
			}
			return spans;
		}
		//#endregion
		//#region src/components/InlineMarkdown.tsx
		/**
		* Inline rendering for fields the rule engine stores as plain text (stage and
		* card titles, table headers/cells, node labels).
		*
		* Those fields retain model-authored TeX but no other inline markup: the rule
		* engine's `plainText` and `stripInline` already remove emphasis, links, and
		* code syntax. This component routes each TeX span through the platform
		* renderer and leaves the surrounding prose literal, so a leading `2. ` or
		* `- ` never becomes block structure inside a title or table cell. A field
		* without math renders unchanged.
		*/
		/**
		* Render one inline field with its TeX spans through the platform renderer.
		* @param props - source text and the platform's localized markdown chrome.
		* @returns The text with formulas rendered inline, or the text unchanged.
		*/
		function InlineMarkdown({ text, labels }) {
			const spans = texSpans(text);
			if (spans.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: text });
			const parts = [];
			let last = 0;
			for (const span of spans) {
				if (span.start > last) parts.push(text.slice(last, span.start));
				parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: text.slice(span.start, span.end),
					labels,
					variant: "compact"
				}, span.start));
				last = span.end;
			}
			if (last < text.length) parts.push(text.slice(last));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-inline-md",
				children: parts
			});
		}
		//#endregion
		//#region src/components/CardsView.tsx
		/**
		* Icon-card group: one H2/H3 heading plus its titled ordered list, drawn as
		* a responsive grid of cards (entry heading + markdown body).
		*/
		/** Draw the upgraded card group. */
		function CardsView({ segment, labels }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-cards",
				children: [segment.title !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-cards-title",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
						text: segment.title,
						labels
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-cards-grid",
					children: segment.cards.map((card, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-card",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshr-card-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshr-card-title",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
									text: card.title,
									labels
								})
							}), card.body !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshr-card-body",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
									text: card.body,
									labels,
									pathImages,
									variant: "compact"
								})
							})]
						})
					}, index))
				})]
			});
		}
		//#endregion
		//#region src/rules/strict-lines.ts
		/**
		* Fence bodies are Markdown, but their authors write one thought per line.
		* This turns every soft line break outside code and tables into a CommonMark
		* hard break, so a single newline starts a new line without an empty line
		* between them; a blank line still separates paragraphs.
		*/
		/** Fence opener; the captured marker decides which close line ends the block. */
		const FENCE = /^\s{0,3}(`{3,}|~{3,})/u;
		const FENCE_CLOSE = /^\s{0,3}(`{3,}|~{3,})\s*$/u;
		/** GFM table delimiter row, e.g. `| --- | :---: |`. */
		const TABLE_DELIMITER = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/u;
		const THEMATIC = /^\s{0,3}(?:(?:-{3,})|(?:\*{3,})|(?:_{3,}))\s*$/u;
		const SETEXT = /^\s{0,3}(?:-{2,}|={2,})\s*$/u;
		const ATX_HEADING = /^\s{0,3}#{1,6}\s/u;
		const LIST_ITEM = /^\s{0,3}(?:[-*+]|\d{1,9}[.)])\s/u;
		const BLOCKQUOTE = /^\s{0,3}>/u;
		/** Four spaces or a tab at line start begins an indented code block. */
		const INDENTED_CODE = /^(?: {4}|\t)/u;
		/** A line that already ends in a CommonMark hard break. */
		const HARD_BREAK = /(?: {2,}|\\)$/u;
		/**
		* Give every soft line break in Markdown prose a hard break.
		* @param text - Markdown source taken from a fence body.
		* @returns Source where single newlines render as line breaks.
		*/
		function strictLines(text) {
			if (!text.includes("\n")) return text;
			const lines = text.split("\n");
			const out = [];
			let fence;
			let table = false;
			for (let i = 0; i < lines.length; i += 1) {
				const line = lines[i] ?? "";
				if (fence !== void 0) {
					out.push(line);
					const close = FENCE_CLOSE.exec(line);
					if (close !== null && close[1][0] === fence[0] && close[1].length >= fence.length) fence = void 0;
					continue;
				}
				const open = FENCE.exec(line);
				if (open !== null) {
					fence = open[1];
					out.push(line);
					continue;
				}
				if (table) {
					out.push(line);
					if (line.trim() === "") table = false;
					continue;
				}
				const next = lines[i + 1];
				if (next !== void 0 && line.includes("|") && TABLE_DELIMITER.test(next)) {
					table = true;
					out.push(line);
					continue;
				}
				out.push(needsBreak(line, next) ? `${line}  ` : line);
			}
			return out.join("\n");
		}
		/**
		* Decide whether the newline after one line needs a hard-break marker.
		* @param line - current line.
		* @param next - following line, undefined at end of input.
		* @returns true when a rendered line break is needed.
		*/
		function needsBreak(line, next) {
			if (next === void 0 || next.trim() === "" || line.trim() === "") return false;
			if (INDENTED_CODE.test(line) || INDENTED_CODE.test(next)) return false;
			if (HARD_BREAK.test(line)) return false;
			if (ATX_HEADING.test(line) || THEMATIC.test(line) || TABLE_DELIMITER.test(line)) return false;
			if (/^\s*\|/u.test(line)) return false;
			if (FENCE.test(next) || ATX_HEADING.test(next) || SETEXT.test(next) || THEMATIC.test(next)) return false;
			if (LIST_ITEM.test(next)) return false;
			if (BLOCKQUOTE.test(next) && !BLOCKQUOTE.test(line)) return false;
			return true;
		}
		//#endregion
		//#region src/components/ChecklistView.tsx
		/**
		* Checklist: a flat GFM task list drawn as one bordered card. Each item's box
		* is a native checkbox — the same control the platform's Checkbox primitive
		* uses — so the browser draws the tick and the focus ring. The checked state
		* starts from the markdown markers and then lives in component state, so
		* clicking a box moves the count and the progress bar immediately without
		* touching the transcript or the session log.
		*/
		/** Draw one interactive checklist with live progress. */
		function ChecklistView({ segment, labels, chrome }) {
			const [checked, setChecked] = (0, react.useState)(() => segment.items.map((item) => item.checked));
			const total = segment.items.length;
			const done = checked.filter(Boolean).length;
			const percent = total === 0 ? 0 : done / total * 100;
			const countText = chrome.checklistProgress.replaceAll("{done}", String(done)).replaceAll("{total}", String(total));
			const toggle = (index) => {
				setChecked((previous) => previous.map((value, position) => position === index ? !value : value));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dshr-checklist dshr-fence",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-checklist-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshr-checklist-title",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
								text: segment.title === "" ? chrome.checklistTitle : segment.title,
								labels
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshr-checklist-count",
							children: countText
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-checklist-track",
						role: "progressbar",
						"aria-label": countText,
						"aria-valuemin": 0,
						"aria-valuemax": total,
						"aria-valuenow": done,
						"aria-valuetext": countText,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshr-checklist-fill",
							style: { width: `${percent.toFixed(2)}%` }
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "dshr-checklist-items",
						children: segment.items.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: "dshr-checklist-item",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: "dshr-checklist-check",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "dshr-checklist-input",
									checked: checked[index] === true,
									"aria-label": item.title,
									onChange: () => {
										toggle(index);
									}
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshr-checklist-main",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshr-checklist-item-title",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
										text: item.title,
										labels
									})
								}), item.body !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshr-checklist-item-body",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
										text: strictLines(item.body),
										labels,
										pathImages,
										variant: "compact"
									})
								})]
							})]
						}, index))
					})
				]
			});
		}
		//#endregion
		//#region src/components/ChoicesView.tsx
		/**
		* Prototype choices: the explicit `prototype-choices` fence as a vertical
		* radio list over a showcase panel. Each option is a native radio input — the
		* same control the platform's Checkbox and plugin manager use — so the group
		* keeps the browser's keyboard behavior, focus ring, and accent color instead
		* of a drawn glyph. The selected option's body renders through the full
		* upgrade pipeline, so a prototype can be a live rich fence, a code block, or
		* plain prose. Selection is component-local state (first option by default)
		* and never writes back to the session.
		*/
		/** Draw the radio option list and the selected option's showcase panel. */
		function ChoicesView({ segment, labels, mentions, chrome }) {
			const [active, setActive] = (0, react.useState)(0);
			const group = (0, react.useId)();
			const index = Math.min(active, segment.choices.length - 1);
			const current = segment.choices[index];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-choices dshr-fence",
				children: [
					segment.title !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-cards-title",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
							text: segment.title,
							labels
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-choices-list",
						children: segment.choices.map((choice, choiceIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "dshr-choices-option",
							"data-active": choiceIndex === index || void 0,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "radio",
								className: "dshr-choices-input",
								name: group,
								checked: choiceIndex === index,
								onChange: () => {
									setActive(choiceIndex);
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshr-choices-label",
								children: choice.label
							})]
						}, choiceIndex))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-choices-panel",
						children: current !== void 0 && current.body !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RichMarkdownText, {
							text: strictLines(current.body),
							streaming: false,
							labels,
							mentions,
							chrome
						})
					})
				]
			});
		}
		//#endregion
		//#region src/components/ImageView.tsx
		/**
		* The framed image card: one standalone image paragraph rendered with the
		* shared fence chrome (the same outline as every explicit fence), a
		* top-right copy action that writes the picture to the system clipboard as
		* PNG, and the degradation display — the authored path text — when the
		* destination resolves to nothing or the file fails to load.
		*/
		/**
		* Displayable URL for one authored destination: HTTP(S) as authored,
		* absolute local paths through the authenticated file route.
		* @param destination - authored Markdown image destination.
		* @returns an absolute URL, or undefined when nothing can display it.
		*/
		function displayableUrl(destination) {
			if (/^https?:/iu.test(destination)) return destination;
			return localPathMediaUrl(document.baseURI, destination);
		}
		/**
		* Rasterize one URL to a PNG blob through an img + canvas round-trip, the
		* one clipboard format every host accepts.
		* @param url - displayable image URL (same-origin or CORS-enabled).
		* @returns the PNG blob, or null when drawing is impossible.
		*/
		async function pngBlob(url) {
			const image = new Image();
			image.crossOrigin = "anonymous";
			await new Promise((resolve, reject) => {
				image.onload = () => {
					resolve();
				};
				image.onerror = () => {
					reject(/* @__PURE__ */ new Error("image load failed"));
				};
				image.src = url;
			});
			const canvas = document.createElement("canvas");
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			const context = canvas.getContext("2d");
			if (context === null || canvas.width === 0 || canvas.height === 0) return null;
			context.drawImage(image, 0, 0);
			return await new Promise((resolve) => {
				canvas.toBlob(resolve, "image/png");
			});
		}
		/** One image card with its fence chrome, copy action, and failure display. */
		const ImageView = (0, react.memo)(function ImageView({ segment, chrome }) {
			const [failed, setFailed] = (0, react.useState)(false);
			const [copyState, setCopyState] = (0, react.useState)("idle");
			const url = displayableUrl(segment.url);
			const copy = (0, react.useCallback)(() => {
				if (url === void 0) return;
				(async () => {
					try {
						const blob = await pngBlob(url);
						if (blob === null) throw new Error("raster produced nothing");
						await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
						setCopyState("done");
					} catch {
						setCopyState("error");
					}
				})();
			}, [url]);
			if (url === void 0 || failed) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-fence dshr-image dshr-image-failed",
				children: [
					chrome.imagePreviewFailed,
					" · ",
					segment.alt || segment.url
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-fence dshr-image",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					className: "dshr-image-img",
					src: url,
					alt: segment.alt,
					onError: () => {
						setFailed(true);
					},
					loading: "lazy",
					decoding: "async",
					referrerPolicy: "no-referrer"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dshr-image-copy",
					onClick: copy,
					children: copyState === "done" ? chrome.imageCopied : copyState === "error" ? chrome.imageCopyFailed : chrome.imageCopy
				})]
			});
		});
		//#endregion
		//#region src/matplotlib-bridge.ts
		let rpc;
		/** Per-module memo: one probe per page load, reset when the RPC face changes. */
		let statusPromise;
		/**
		* Whether the matplotlib environment is live.
		* @returns enabled/ready; both false when the bridge or host is unreachable.
		*/
		function probeStatus() {
			statusPromise ??= (async () => {
				if (rpc === void 0) return {
					enabled: false,
					ready: false
				};
				try {
					const result = await rpc.call("/api", "rich-render/status", {});
					if (result.ok !== true) return {
						enabled: false,
						ready: false
					};
					const value = result.value;
					return {
						enabled: value.matplotlib?.enabled === true,
						ready: value.matplotlib?.ready === true
					};
				} catch {
					return {
						enabled: false,
						ready: false
					};
				}
			})();
			return statusPromise;
		}
		/**
		* Install or clear the RPC face; a probe memoized against the previous face
		* must not stick, so the readiness cache resets with it.
		* @param face - the connection RPC face, or undefined on dispose.
		*/
		function setMatplotlibRpc(face) {
			rpc = face;
			statusPromise = void 0;
		}
		/** @returns the live readiness fact (memoized until the face changes). */
		function matplotlibStatus() {
			return probeStatus();
		}
		/**
		* Execute one cell.
		* @param code - Python source from the fence.
		* @returns the settled outcome; transport failures surface as error results.
		*/
		async function matplotlibExec(code) {
			if (rpc === void 0) return {
				status: "error",
				message: "rich-render bridge unavailable"
			};
			try {
				const result = await rpc.call("/api", "rich-render/exec", { code });
				if (result.ok === true) return result.value;
				return {
					status: "error",
					message: result.error.message
				};
			} catch (error) {
				return {
					status: "error",
					message: String(error)
				};
			}
		}
		//#endregion
		//#region src/components/MatplotlibView.tsx
		/**
		* Matplotlib cell: probes readiness once; while off/unreachable the fence
		* renders as the plain code block the model wrote. Live cells auto-execute
		* on mount (the host cache makes re-mounts cheap), open on the chart tab,
		* and a failure reopens on the code tab with the error beside it — no retry
		* button: failed results cache, so a retry would rerun the same fate.
		*/
		/** Draw one cell. */
		function MatplotlibView({ segment, labels, chrome }) {
			const [phase, setPhase] = (0, react.useState)("probe");
			const [result, setResult] = (0, react.useState)();
			const [tab, setTab] = (0, react.useState)("chart");
			(0, react.useEffect)(() => {
				let alive = true;
				matplotlibStatus().then((status) => {
					if (!alive) return;
					if (!status.enabled || !status.ready) {
						setPhase("off");
						return;
					}
					setPhase("running");
					matplotlibExec(segment.code).then((run) => {
						if (!alive) return;
						setResult(run);
						if (run.status === "success") setPhase("done");
						else {
							setPhase("failed");
							setTab("code");
						}
					});
				});
				return () => {
					alive = false;
				};
			}, [segment.code]);
			if (phase === "off" || phase === "probe") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
				text: segment.source,
				labels
			});
			const image = result?.status === "success" ? `data:image/png;base64,${result.image}` : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-mpl dshr-fence",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-mpl-tabs",
						role: "tablist",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === "code",
								className: tab === "code" ? "dshr-mpl-tab active" : "dshr-mpl-tab",
								onClick: () => setTab("code"),
								children: chrome.mplCode
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === "chart",
								className: tab === "chart" ? "dshr-mpl-tab active" : "dshr-mpl-tab",
								onClick: () => setTab("chart"),
								children: chrome.mplChart
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": tab === "download",
								className: tab === "download" ? "dshr-mpl-tab active" : "dshr-mpl-tab",
								onClick: () => setTab("download"),
								children: chrome.mplDownload
							})
						]
					}),
					tab === "code" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: segment.source,
						labels
					}),
					tab === "chart" && (phase === "running" || phase === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mpl-chart",
						children: image !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: image,
							alt: chrome.mplChart
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-mpl-note",
							children: chrome.mplRunning
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-mpl-chart",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-mpl-note dshr-mpl-error",
							children: chrome.mplFailed
						}), result?.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: "dshr-mpl-stderr",
							children: result.message
						})]
					})),
					tab === "download" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mpl-chart",
						children: image !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							className: "dshr-mpl-dl",
							href: image,
							download: "matplotlib.png",
							children: chrome.mplDownloadPng
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-mpl-note",
							children: phase === "running" ? chrome.mplRunning : chrome.mplFailed
						})
					})
				]
			});
		}
		//#endregion
		//#region src/components/MindmapView.tsx
		/**
		* Mindmap: the explicit `mindmap` fence, one left-to-right tree per root,
		* stacked vertically. Horizontal scroll wraps wide trees; the zoom control
		* (−/100%/+, 50%~200%) is component-local state and never writes back.
		*/
		/** One branch: its chip, then its children column. */
		function Branch({ node, level, labels }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-mm-item",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: `dshr-mm-chip dshr-mm-level-${Math.min(level, 3)}`,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
							text: node.label,
							labels
						})
					}),
					node.children.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mm-tail",
						"aria-hidden": true
					}),
					node.children.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mm-children",
						children: node.children.map((child, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshr-mm-child",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Branch, {
								node: child,
								level: level + 1,
								labels
							})
						}, index))
					})
				]
			});
		}
		/** One root tree: root chip plus its branches in a right-hand column. */
		function RootTree({ tree, labels }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-mm-tree",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mm-chip dshr-mm-root",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
							text: tree.label,
							labels
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mm-tail",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mm-children",
						children: tree.children.map((child, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshr-mm-child",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Branch, {
								node: child,
								level: 1,
								labels
							})
						}, index))
					})
				]
			});
		}
		const ZOOM_MIN = .5;
		const ZOOM_MAX = 2;
		const ZOOM_STEP = .25;
		/** Draw the fence's trees with scroll and zoom. */
		function MindmapView({ segment, labels }) {
			const [zoom, setZoom] = (0, react.useState)(1);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-mm dshr-fence",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-mm-scroll",
					style: { maxHeight: `${Math.round(480 * zoom)}px` },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-mm-zoompane",
						style: {
							transform: `scale(${zoom})`,
							transformOrigin: "top left",
							width: `${Math.round(100 / zoom * 100) / 100}%`
						},
						children: segment.trees.map((tree, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RootTree, {
							tree,
							labels
						}, index))
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshr-mm-zoom",
					role: "group",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshr-mm-zoombtn",
							disabled: zoom <= .500000001,
							onClick: () => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP)),
							children: "−"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "dshr-mm-zoomreset",
							onClick: () => setZoom(1),
							children: [Math.round(zoom * 100), "%"]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshr-mm-zoombtn",
							disabled: zoom >= ZOOM_MAX - 1e-9,
							onClick: () => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP)),
							children: "+"
						})
					]
				})]
			});
		}
		/**
		* Pick one box's text alignment.
		* @param content - the box's Markdown body.
		* @returns `center` below ten visible characters, `left` otherwise.
		*/
		function stackAlign(content) {
			return stripInline(content).replace(/\s+/gu, "").length < 10 ? "center" : "left";
		}
		//#endregion
		//#region src/components/StackView.tsx
		/**
		* Stack: the explicit `stack` fence as vertically stacked layer rows. Boxes
		* in one layer share a row at equal heights; a box is a visual container
		* only — its Markdown renders as written (no label/title inference), the
		* fill only paints the background, text color follows fill luminance, and
		* short labels center while longer text stays left (see stack-align).
		* No arrows between layers.
		*/
		/** One box: fill + block Markdown body. */
		function Box({ box, labels }) {
			const textAlign = stackAlign(box.content);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-stack-box",
				style: box.fill === void 0 ? { textAlign } : {
					textAlign,
					background: box.fill,
					color: textOn(box.fill)
				},
				children: box.content === "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: "\xA0"
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: strictLines(box.content),
					labels,
					pathImages,
					variant: "compact"
				})
			});
		}
		/** Draw the layers. */
		function StackView({ segment, labels }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-stack dshr-fence",
				children: segment.layers.map((layer, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-stack-layer",
					children: layer.boxes.map((box, boxIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Box, {
						box,
						labels
					}, boxIndex))
				}, index))
			});
		}
		//#endregion
		//#region src/components/TabView.tsx
		/**
		* Tab: the explicit `tab` fence as a line-tab bar (equal-width segments, an
		* underline on the active label) over labeled pages. Page bodies render as
		* normal body Markdown; the selected page is component-local state (first page
		* by default), only the active page renders, and clicking never writes back to
		* the session.
		*/
		/** Draw the tab bar and the selected page's markdown. */
		function TabView({ segment, labels }) {
			const [active, setActive] = (0, react.useState)(0);
			const index = Math.min(active, segment.tabs.length - 1);
			const current = segment.tabs[index];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-tabs dshr-fence",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-tabs-bar",
					role: "tablist",
					children: segment.tabs.map((tab, tabIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": tabIndex === index,
						className: "dshr-tabs-tab",
						"data-active": tabIndex === index || void 0,
						title: tab.label,
						onClick: () => {
							setActive(tabIndex);
						},
						children: tab.label
					}, tabIndex))
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-tabs-pane",
					role: "tabpanel",
					children: current !== void 0 && current.body !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: strictLines(current.body),
						labels,
						pathImages
					})
				})]
			});
		}
		//#endregion
		//#region src/rules/chart-palette.ts
		/**
		* Categorical chart palette shared by the on-screen SVG and the PNG export.
		* Tableau 10: muted colors readable on both light and dark themes.
		*/
		const PALETTE = [
			"#4e79a7",
			"#f28e2b",
			"#e15759",
			"#76b7b2",
			"#59a14f",
			"#edc948",
			"#b07aa1",
			"#ff9da7"
		];
		/**
		* Color for one series or slice index.
		* @param index - zero-based series/slice position.
		* @returns A hex color; the first palette entry on an empty palette.
		*/
		function seriesColor(index) {
			return PALETTE[index % PALETTE.length] ?? PALETTE[0] ?? "#4e79a7";
		}
		//#endregion
		//#region src/rules/percent.ts
		/**
		* Largest-remainder integer percentages: floor every share, then hand the
		* leftover points to the largest fractional remainders (document order breaks
		* ties), so one pie's displayed percentages always sum to exactly 100.
		*/
		/**
		* @param values - slice values of one pie (supplement included).
		* @param total - their sum; a non-positive total yields zeros.
		* @returns one integer percentage per value.
		*/
		function largestRemainderPercentages(values, total) {
			if (total <= 0) return values.map(() => 0);
			const shares = values.map((value) => value / total * 100);
			const floors = shares.map(Math.floor);
			let left = 100 - floors.reduce((sum, floor) => sum + floor, 0);
			const order = shares.map((share, index) => ({
				index,
				remainder: share - Math.floor(share)
			})).sort((a, b) => b.remainder - a.remainder || a.index - b.index);
			for (let k = 0; left > 0 && k < order.length; k++) {
				floors[order[k].index] += 1;
				left -= 1;
			}
			return floors;
		}
		//#endregion
		//#region src/components/charts.tsx
		/**
		* Hand-drawn SVG charts (zero dependencies): grouped bars, multi-series
		* lines, and a donut pie with the topping-up supplement slice. Fixed
		* geometry in a viewBox keeps text crisp while the container scales;
		* series colors come from one restrained categorical palette.
		*/
		/** Chart geometry: viewBox size everything below is laid out against. */
		const WIDTH = 560;
		const HEIGHT = 260;
		const PAD = {
			top: 16,
			right: 16,
			bottom: 34,
			left: 48
		};
		/** Compact value formatting for axis ticks and legend totals. */
		function fmt(value) {
			if (Math.abs(value) >= 1e3) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
			if (Number.isInteger(value)) return String(value);
			return value.toFixed(Math.abs(value) >= 1 ? 1 : 2).replace(/\.?0+$/u, "");
		}
		/** Nice round y domain from 0 (or the min when values go negative). */
		function yDomain(values) {
			let min = 0;
			let max = 0;
			for (const value of values) {
				if (value < min) min = value;
				if (value > max) max = value;
			}
			if (max === min) max = min + 1;
			const pad = (max - min) * .08;
			return {
				min: min === 0 ? 0 : min - pad,
				max: max + pad
			};
		}
		/** One legend row: color dot, name, value; a click toggles the series. */
		function Legend({ entries, hidden, onToggle }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-chart-legend",
				children: entries.map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dshr-chart-legend-item",
					"data-off": hidden.has(index) || void 0,
					onClick: () => onToggle(index),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-chart-dot",
							style: { background: entry.color }
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-chart-legend-name",
							children: entry.name
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-chart-legend-value",
							children: entry.value
						})
					]
				}, index))
			});
		}
		/** Grouped bar chart with toggleable series. */
		const BarChart = (0, react.memo)(function BarChart({ chart, labels }) {
			const [hidden, setHidden] = (0, react.useState)({ hidden: /* @__PURE__ */ new Set() });
			const visible = chart.series.filter((_series, index) => !hidden.hidden.has(index));
			const all = chart.series.flatMap((series) => series.values);
			const domain = (0, react.useMemo)(() => yDomain(all), [chart]);
			const plotW = WIDTH - PAD.left - PAD.right;
			const plotH = HEIGHT - PAD.top - PAD.bottom;
			const scale = (value) => PAD.top + plotH * (1 - (value - domain.min) / (domain.max - domain.min));
			const groupW = plotW / Math.max(1, chart.labels.length);
			const barW = Math.max(3, groupW * .62 / Math.max(1, visible.length));
			const ticks = 4;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-chart",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					className: "dshr-chart-svg",
					viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
					role: "img",
					children: [
						Array.from({ length: 5 }, (_unused, tick) => {
							const value = domain.min + (domain.max - domain.min) * tick / ticks;
							const y = scale(value);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
								x1: PAD.left,
								x2: WIDTH - PAD.right,
								y1: y,
								y2: y,
								className: "dshr-chart-grid"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
								x: PAD.left - 6,
								y: y + 3.5,
								textAnchor: "end",
								className: "dshr-chart-tick",
								children: fmt(value)
							})] }, tick);
						}),
						chart.labels.map((label, group) => {
							const groupX = PAD.left + groupW * group;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [visible.map((series, seriesIndex) => {
								const value = series.values[group] ?? 0;
								const y = scale(Math.max(value, 0));
								const height = Math.abs(scale(value) - scale(0));
								const color = seriesColor(chart.series.indexOf(series) === -1 ? seriesIndex : chart.series.indexOf(series));
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
									x: groupX + groupW / 2 - barW * visible.length / 2 + barW * seriesIndex,
									y,
									width: barW - 1,
									height: Math.max(1, height),
									rx: Math.min(3, barW / 3),
									fill: color,
									className: "dshr-chart-bar",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `${label} · ${series.name}: ${fmt(value)}` })
								}, seriesIndex);
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
								x: groupX + groupW / 2,
								y: HEIGHT - PAD.bottom + 16,
								textAnchor: "middle",
								className: "dshr-chart-tick",
								children: label.length > 8 ? `${label.slice(0, 7)}…` : label
							})] }, group);
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: PAD.left,
							x2: WIDTH - PAD.right,
							y1: scale(0),
							y2: scale(0),
							className: "dshr-chart-axis"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Legend, {
					entries: chart.series.map((series, index) => ({
						color: seriesColor(index),
						name: series.name,
						value: fmt(series.values.reduce((total, value) => total + value, 0))
					})),
					hidden: hidden.hidden,
					onToggle: (index) => setHidden((prev) => {
						const next = new Set(prev.hidden);
						if (next.has(index)) next.delete(index);
						else if (next.size < chart.series.length - 1) next.add(index);
						return { hidden: next };
					})
				})]
			});
		});
		/** Multi-series line chart; x by index or by the numeric first column. */
		const LineChart = (0, react.memo)(function LineChart({ chart }) {
			const [hidden, setHidden] = (0, react.useState)({ hidden: /* @__PURE__ */ new Set() });
			const visible = chart.series.filter((_series, index) => !hidden.hidden.has(index));
			const all = chart.series.flatMap((series) => series.values).concat(chart.xValues ?? []);
			const domain = (0, react.useMemo)(() => yDomain(all), [chart]);
			const plotW = WIDTH - PAD.left - PAD.right;
			const plotH = HEIGHT - PAD.top - PAD.bottom;
			const xAt = (index) => {
				if (chart.xValues === void 0 || chart.xValues.length < 2) return PAD.left + plotW * index / Math.max(1, chart.labels.length - 1);
				const xs = chart.xValues;
				const min = Math.min(...xs);
				const max = Math.max(...xs);
				const x = xs[index] ?? 0;
				return PAD.left + plotW * (max === min ? .5 : (x - min) / (max - min));
			};
			const scale = (value) => PAD.top + plotH * (1 - (value - domain.min) / (domain.max - domain.min));
			const ticks = 4;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-chart",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					className: "dshr-chart-svg",
					viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
					role: "img",
					children: [
						Array.from({ length: 5 }, (_unused, tick) => {
							const value = domain.min + (domain.max - domain.min) * tick / ticks;
							const y = scale(value);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
								x1: PAD.left,
								x2: WIDTH - PAD.right,
								y1: y,
								y2: y,
								className: "dshr-chart-grid"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
								x: PAD.left - 6,
								y: y + 3.5,
								textAnchor: "end",
								className: "dshr-chart-tick",
								children: fmt(value)
							})] }, tick);
						}),
						visible.map((series) => {
							const seriesIndex = chart.series.indexOf(series);
							const color = seriesColor(seriesIndex);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("polyline", {
								points: series.values.map((value, index) => `${xAt(index)},${scale(value)}`).join(" "),
								fill: "none",
								stroke: color,
								strokeWidth: 2,
								strokeLinejoin: "round",
								strokeLinecap: "round"
							}), series.values.map((value, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: xAt(index),
								cy: scale(value),
								r: 3,
								fill: color,
								className: "dshr-chart-point",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `${chart.labels[index] ?? ""} · ${series.name}: ${fmt(value)}` })
							}, index))] }, seriesIndex);
						}),
						chart.labels.map((label, index) => index % Math.ceil(chart.labels.length / 8) === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
							x: xAt(index),
							y: HEIGHT - PAD.bottom + 16,
							textAnchor: "middle",
							className: "dshr-chart-tick",
							children: label.length > 8 ? `${label.slice(0, 7)}…` : label
						}, index) : null),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
							x1: PAD.left,
							x2: WIDTH - PAD.right,
							y1: HEIGHT - PAD.bottom,
							y2: HEIGHT - PAD.bottom,
							className: "dshr-chart-axis"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Legend, {
					entries: chart.series.map((series, index) => ({
						color: seriesColor(index),
						name: series.name,
						value: ""
					})),
					hidden: hidden.hidden,
					onToggle: (index) => setHidden((prev) => {
						const next = new Set(prev.hidden);
						if (next.has(index)) next.delete(index);
						else if (next.size < chart.series.length - 1) next.add(index);
						return { hidden: next };
					})
				})]
			});
		});
		/** Donut pie; a sub-1 sum renders one dashed muted supplement slice. */
		const PieChart = (0, react.memo)(function PieChart({ chart, labels }) {
			const values = chart.series[0]?.values ?? [];
			const supplement = chart.supplement;
			const total = values.reduce((sum, value) => sum + value, 0) + (supplement?.value ?? 0);
			const radius = 78;
			const circumference = 2 * Math.PI * radius;
			let offset = 0;
			const slices = values.map((value, index) => {
				const fraction = total > 0 ? value / total : 0;
				const slice = {
					value,
					fraction,
					color: seriesColor(index),
					offset
				};
				offset += fraction;
				return slice;
			});
			const supplementSlice = supplement === void 0 ? void 0 : {
				value: supplement.value,
				fraction: total > 0 ? supplement.value / total : 0,
				offset
			};
			const percentOf = largestRemainderPercentages([...values, supplement?.value ?? 0], total);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-chart dshr-chart-pie",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					className: "dshr-chart-svg dshr-chart-svg-pie",
					viewBox: "0 0 200 200",
					role: "img",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
							cx: 100,
							cy: 100,
							r: radius,
							fill: "none",
							stroke: "var(--dsw-alias-border-l1)",
							strokeWidth: 30
						}),
						slices.map((slice, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
							cx: 100,
							cy: 100,
							r: radius,
							fill: "none",
							stroke: slice.color,
							strokeWidth: 28,
							strokeDasharray: `${slice.fraction * circumference} ${circumference}`,
							strokeDashoffset: -slice.offset * circumference,
							transform: "rotate(-90 100 100)",
							className: "dshr-chart-slice",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `${chart.labels[index] ?? ""}: ${fmt(slice.value)} (${percentOf[index]}%)` })
						}, index)),
						supplementSlice !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
							cx: 100,
							cy: 100,
							r: radius,
							fill: "none",
							stroke: "var(--dsw-alias-label-caption)",
							strokeWidth: 28,
							strokeDasharray: `${supplementSlice.fraction * circumference} ${circumference}`,
							strokeDashoffset: -supplementSlice.offset * circumference,
							transform: "rotate(-90 100 100)",
							className: "dshr-chart-slice dshr-chart-slice-supplement",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: `${labels.otherSlice}: ${fmt(supplementSlice.value)} (${percentOf[values.length]}%)` })
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-chart-pie-side",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-chart-legend dshr-chart-legend-column",
						children: [slices.map((slice, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshr-chart-legend-item",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshr-chart-dot",
									style: { background: slice.color }
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshr-chart-legend-name",
									children: chart.labels[index]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dshr-chart-legend-value",
									children: [
										fmt(slice.value),
										" · ",
										percentOf[index],
										"%"
									]
								})
							]
						}, index)), supplementSlice !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshr-chart-legend-item",
							"data-supplement": true,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dshr-chart-dot dshr-chart-dot-supplement" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshr-chart-legend-name",
									children: labels.otherSlice
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dshr-chart-legend-value",
									children: [
										fmt(supplementSlice.value),
										" · ",
										percentOf[values.length],
										"%"
									]
								})
							]
						})]
					})
				})]
			});
		});
		/** Dispatch one chart spec to its drawing. */
		function ChartView({ chart, labels }) {
			switch (chart.kind) {
				case "bar": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BarChart, {
					chart,
					labels
				});
				case "line": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LineChart, {
					chart,
					labels
				});
				case "pie": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PieChart, {
					chart,
					labels
				});
				default: return null;
			}
		}
		//#endregion
		//#region src/components/chart-download.ts
		/**
		* Chart image export: rasterize one of the hand-drawn SVG charts to a PNG,
		* with a legend drawn beside (pie) or below (bar/line) the plot.
		*
		* The chart is a static SVG vocabulary, but its paint and text styles come
		* from the page stylesheet, so those computed values are copied onto a clone
		* before serialization. The clone is loaded as an image and drawn to a 2x
		* canvas over the page's opaque background. Any failure leaves the click
		* inert — the transcript must never throw or show an error for an export.
		*/
		/** Computed style properties the chart stylesheet applies outside attributes. */
		const PAINTED = [
			"fill",
			"fill-opacity",
			"stroke",
			"stroke-width",
			"stroke-opacity",
			"stroke-linecap",
			"stroke-linejoin",
			"stroke-dasharray",
			"opacity",
			"font-family",
			"font-size",
			"font-weight",
			"letter-spacing",
			"text-anchor",
			"dominant-baseline",
			"paint-order"
		];
		/** Rasterization scale: 2x keeps axis text crisp on high-density displays. */
		const SCALE = 2;
		/** Fallback dimensions when the SVG carries no viewBox (charts always do). */
		const FALLBACK_WIDTH = 560;
		const FALLBACK_HEIGHT = 260;
		/** Width reserved for the pie legend column. */
		const PIE_LEGEND_WIDTH = 220;
		/** Height reserved for the bar/line legend strip. */
		const SERIES_LEGEND_HEIGHT = 28;
		/** Fallback color for the muted pie supplement slice. */
		const SUPPLEMENT_COLOR = "#9aa0a6";
		/**
		* Filename stamped in the viewer's local time, filesystem-safe.
		* @param now - injection point for tests; defaults to the current time.
		* @returns `dsh-chart-YYYYMMDD-HHmmss.png`.
		*/
		function chartPngName(now = /* @__PURE__ */ new Date()) {
			const pad = (value) => String(value).padStart(2, "0");
			return `dsh-chart-${`${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`}.png`;
		}
		/**
		* Compact display for legend values.
		* @param value - numeric slice value or series total.
		* @returns An integer as-is, otherwise a trimmed decimal.
		*/
		function formatNumber(value) {
			if (!Number.isFinite(value)) return String(value);
			return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
		}
		/**
		* The first opaque background color behind the host, falling back to white.
		* Chart containers are transparent, and a PNG needs a painted background.
		* @param host - element containing the chart.
		* @returns A CSS color usable as a canvas fill.
		*/
		function pageBackground(host) {
			for (let element = host; element !== null; element = element.parentElement) {
				const color = getComputedStyle(element).backgroundColor;
				const channels = /^rgba?\(([^)]+)\)$/u.exec(color)?.[1]?.split(",").map((part) => Number(part.trim()));
				if (channels === void 0) continue;
				if ((channels[3] ?? 1) > 0) return color;
			}
			return "#ffffff";
		}
		/**
		* Legend entries for the chart, matching the on-screen legend's content.
		* @param chart - chart spec the SVG was drawn from.
		* @param labels - localized supplement name.
		* @param host - chart host, used to read the supplement slice color.
		* @returns Pie labels with values/percentages, or bar/line series names.
		*/
		function legendEntries(chart, labels, host) {
			if (chart.kind !== "pie") return chart.series.map((series, index) => ({
				color: seriesColor(index),
				text: chart.kind === "bar" ? `${series.name}  ${formatNumber(series.values.reduce((total, value) => total + value, 0))}` : series.name
			}));
			const values = chart.series[0]?.values ?? [];
			const total = values.reduce((sum, value) => sum + value, 0) + (chart.supplement?.value ?? 0);
			const pcts = largestRemainderPercentages([...values, chart.supplement?.value ?? 0], total);
			const percent = (index) => pcts[index] ?? 0;
			const entries = chart.labels.map((label, index) => {
				const value = values[index] ?? 0;
				return {
					color: seriesColor(index),
					text: `${label}  ${formatNumber(value)} (${percent(index)}%)`
				};
			});
			if (chart.supplement !== void 0) {
				const slice = host.querySelector(".dshr-chart-slice-supplement");
				const color = slice === null ? SUPPLEMENT_COLOR : getComputedStyle(slice).stroke;
				entries.push({
					color: color === "" || color === "none" ? SUPPLEMENT_COLOR : color,
					text: `${labels.otherSlice}  ${formatNumber(chart.supplement.value)} (${percent(values.length)}%)`
				});
			}
			return entries;
		}
		/**
		* Serialize the host's chart with inline computed styles.
		* @param host - element containing the chart SVG.
		* @returns The SVG clone ready for serialization, or undefined without a chart.
		*/
		function inlineChart(host) {
			const svg = host.querySelector("svg");
			if (svg === null) return void 0;
			const box = svg.viewBox.baseVal;
			const width = box.width > 0 ? box.width : FALLBACK_WIDTH;
			const height = box.height > 0 ? box.height : FALLBACK_HEIGHT;
			const clone = svg.cloneNode(true);
			clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
			clone.setAttribute("width", String(width));
			clone.setAttribute("height", String(height));
			const source = [svg, ...svg.querySelectorAll("*")];
			const target = [clone, ...clone.querySelectorAll("*")];
			for (let index = 0; index < source.length; index++) {
				const from = source[index];
				const to = target[index];
				if (!(from instanceof Element) || !(to instanceof Element)) continue;
				const style = getComputedStyle(from);
				for (const property of PAINTED) {
					const value = style.getPropertyValue(property);
					if (value !== "") to.setAttribute(property, value);
				}
			}
			const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			background.setAttribute("width", "100%");
			background.setAttribute("height", "100%");
			background.setAttribute("fill", pageBackground(host));
			clone.insertBefore(background, clone.firstChild);
			return clone;
		}
		/**
		* Load the serialized SVG as an image element.
		* @param source - serialized SVG markup.
		* @returns The decoded image.
		*/
		function loadImage(source) {
			return new Promise((resolve, reject) => {
				const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
				const image = new Image();
				image.onload = () => {
					URL.revokeObjectURL(url);
					resolve(image);
				};
				image.onerror = () => {
					URL.revokeObjectURL(url);
					reject(/* @__PURE__ */ new Error("chart image failed to decode"));
				};
				image.src = url;
			});
		}
		/**
		* Rasterize one canvas to a PNG blob.
		* @param canvas - painted chart canvas.
		* @returns The PNG blob, or null when the browser cannot encode it.
		*/
		function canvasBlob(canvas) {
			return new Promise((resolve) => {
				canvas.toBlob(resolve, "image/png");
			});
		}
		/**
		* Draw the legend in page coordinates on the scaled canvas context.
		* @param context - canvas context already scaled to CSS pixels.
		* @param entries - legend rows.
		* @param chart - chart spec deciding the legend placement.
		* @param baseWidth - plotted SVG width.
		* @param baseHeight - plotted SVG height.
		* @param ink - text color inherited from the transcript.
		*/
		function drawLegend(context, entries, chart, baseWidth, baseHeight, ink) {
			context.fillStyle = ink;
			if (chart.kind === "pie") {
				for (const [index, entry] of entries.entries()) {
					const y = 24 + index * 24;
					context.beginPath();
					context.arc(baseWidth + 18, y, 4, 0, Math.PI * 2);
					context.fillStyle = entry.color;
					context.fill();
					context.fillStyle = ink;
					context.fillText(entry.text, baseWidth + 30, y);
				}
				return;
			}
			let x = 12;
			const y = baseHeight + SERIES_LEGEND_HEIGHT / 2;
			for (const entry of entries) {
				context.beginPath();
				context.arc(x + 4, y, 4, 0, Math.PI * 2);
				context.fillStyle = entry.color;
				context.fill();
				context.fillStyle = ink;
				context.fillText(entry.text, x + 14, y);
				x += 28 + context.measureText(entry.text).width;
			}
		}
		/**
		* Export the chart inside `host` as a downloaded PNG. Silent on failure.
		* @param host - element containing the chart SVG; null before first paint.
		* @param chart - chart spec the SVG was drawn from.
		* @param labels - localized legend names.
		*/
		async function downloadChartPng(host, chart, labels) {
			try {
				if (host === null) return;
				const clone = inlineChart(host);
				if (clone === void 0) return;
				const baseWidth = Number(clone.getAttribute("width"));
				const baseHeight = Number(clone.getAttribute("height"));
				const entries = legendEntries(chart, labels, host);
				const pie = chart.kind === "pie";
				const width = pie ? baseWidth + PIE_LEGEND_WIDTH : baseWidth;
				const height = pie ? Math.max(baseHeight, entries.length * 24 + 16) : baseHeight + SERIES_LEGEND_HEIGHT;
				const image = await loadImage(new XMLSerializer().serializeToString(clone));
				const background = pageBackground(host);
				const canvas = document.createElement("canvas");
				canvas.width = Math.max(1, Math.round(width * SCALE));
				canvas.height = Math.max(1, Math.round(height * SCALE));
				const context = canvas.getContext("2d");
				if (context === null) return;
				context.scale(SCALE, SCALE);
				context.fillStyle = background;
				context.fillRect(0, 0, width, height);
				context.drawImage(image, 0, 0, baseWidth, baseHeight);
				const style = getComputedStyle(host);
				context.font = `12px ${style.fontFamily === "" ? "sans-serif" : style.fontFamily}`;
				context.textBaseline = "middle";
				context.textAlign = "start";
				drawLegend(context, entries, chart, baseWidth, baseHeight, style.color === "" ? "#333333" : style.color);
				const blob = await canvasBlob(canvas);
				if (blob === null) return;
				const url = URL.createObjectURL(blob);
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = chartPngName();
				anchor.click();
				window.setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 0);
			} catch {}
		}
		//#endregion
		//#region src/components/TableDualView.tsx
		/**
		* Dual-view table presentation: a chartable grid opens on its chart, with
		* table/chart tabs plus an image-export action. The chart pane stays mounted
		* while the table is shown so the export never depends on the active view.
		*/
		function alignStyle(align) {
			if (align === null || align === void 0) return void 0;
			return { textAlign: align };
		}
		/** The styled grid. */
		function Grid({ segment, labels }) {
			const { table } = segment;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-tableblock",
				children: [segment.title !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-cards-title",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
						text: segment.title,
						labels
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-table-wrap",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						className: "dshr-table",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: table.headers.map((header, column) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							style: alignStyle(table.aligns[column]),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
								text: header,
								labels
							})
						}, column)) }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: table.rows.map((row, rowNumber) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: table.headers.map((_header, column) => {
							const value = row[column] ?? "";
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
								style: alignStyle(table.aligns[column]),
								children: value !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
									text: value,
									labels
								})
							}, column);
						}) }, rowNumber)) })]
					})
				})]
			});
		}
		/** Chart-first dual view with a table fallback and PNG export. */
		function TableDualView({ segment, chartLabels, labels }) {
			const [view, setView] = (0, react.useState)(segment.chart === void 0 ? "table" : "chart");
			const chartHost = (0, react.useRef)(null);
			const { chart } = segment;
			if (chart === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Grid, {
				segment,
				labels
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-dual",
				"data-view": view,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-dual-bar",
						role: "group",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshr-dual-tab",
								"data-active": view === "chart" || void 0,
								onClick: () => {
									setView("chart");
								},
								children: chartLabels.chart
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshr-dual-tab",
								"data-active": view === "table" || void 0,
								onClick: () => {
									setView("table");
								},
								children: chartLabels.table
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshr-dual-tab dshr-dual-tab-action",
								onClick: () => {
									downloadChartPng(chartHost.current, chart, chartLabels);
								},
								children: chartLabels.downloadChart
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-dual-pane",
						"data-active": view === "chart" || void 0,
						ref: chartHost,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChartView, {
							chart,
							labels: chartLabels
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-dual-pane",
						"data-active": view === "table" || void 0,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Grid, {
							segment,
							labels
						})
					})
				]
			});
		}
		//#endregion
		//#region src/components/TimelineView.tsx
		/**
		* Timeline: the stages of an explicit `timeline` fence drawn as a vertical
		* rail with numbered dots, the stage title, and its markdown body indented
		* beside it.
		*/
		/** Draw the upgraded timeline. */
		function TimelineView({ segment, labels }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-timelinewrap dshr-fence",
				children: [segment.title !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshr-cards-title",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
						text: segment.title,
						labels
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
					className: "dshr-timeline",
					children: segment.entries.map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: "dshr-timeline-item",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-timeline-dot",
							"aria-hidden": true,
							children: index + 1
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshr-timeline-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshr-timeline-title",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InlineMarkdown, {
									text: entry.title,
									labels
								})
							}), entry.body !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dshr-timeline-body",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
									text: strictLines(entry.body),
									labels,
									pathImages,
									variant: "compact"
								})
							})]
						})]
					}, index))
				})]
			});
		}
		//#endregion
		//#region src/rules/material-icons.generated.ts
		/** All inlined icons, keyed by material icon name. */
		const MATERIAL_PATHS = {
			"file": [{
				"fill": "#90a4ae",
				"d": "m8.668 6h3.6641l-3.6641-3.668v3.668m-4.668-4.668h5.332l4 4v8c0 0.73828-0.59375 1.3359-1.332 1.3359h-8c-0.73828 0-1.332-0.59766-1.332-1.3359v-10.664c0-0.74219 0.59375-1.3359 1.332-1.3359m3.332 1.3359h-3.332v10.664h8v-6h-4.668z"
			}],
			"folder": [{
				"fill": "#90a4ae",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}],
			"folder-open": [{
				"fill": "#90a4ae",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}],
			"angular": [{
				"fill": "#e53935",
				"d": "M9.87 2.5 3.022 5.666l.645 10.178zm4.26 0 6.202 13.344.645-10.178zM12 7.563l-2.451 5.964h4.906zm-3.73 8.959-.954 2.308L12 21.5l4.683-2.67-.953-2.308z"
			}],
			"asciidoc": [{
				"fill": "#0097a7",
				"d": "M4 18V8l5.39 10Zm0 4v3.67A2.33 2.33 0 0 0 6.33 28h8.9l-3.496-6Zm12.444 0 3.177 5.444A11.88 11.88 0 0 0 26.448 22Zm11.419-4A15 15 0 0 0 28 16 12 12 0 0 0 16 4L6 3.995q-.08 0-.158.005L14 18Z"
			}],
			"astro": [{
				"fill": "#7c4dff",
				"d": "M12.106 25.849c-1.262-1.156-1.63-3.586-1.105-5.346a5.18 5.18 0 0 0 3.484 1.66 9.68 9.68 0 0 0 5.882-.734c.215-.106.413-.247.648-.39a3.5 3.5 0 0 1 .16 1.555 4.26 4.26 0 0 1-1.798 3.021c-.404.3-.832.569-1.25.852a2.613 2.613 0 0 0-1.15 3.372l.048.161a3.4 3.4 0 0 1-1.5-1.285 3.6 3.6 0 0 1-.578-1.962 9 9 0 0 0-.05-1.037c-.114-.831-.504-1.204-1.238-1.225a1.45 1.45 0 0 0-1.507 1.18c-.012.056-.028.112-.046.178M4.901 20a17.75 17.75 0 0 1 7.4-2l2.913-8.38a.765.765 0 0 1 1.527 0L19.7 18a14.24 14.24 0 0 1 7.399 2S20.704 2.877 20.692 2.842C20.51 2.33 20.202 2 19.787 2h-7.619c-.415 0-.71.33-.904.842z"
			}],
			"astro-config": [{
				"fill": "#757575",
				"d": "M15 2H6a2.006 2.006 0 0 0-2 2v22a2.006 2.006 0 0 0 2 2h6v-4H6v-2h6v-2H6v-2h6v-2H6v-2h6v-2h2V4l8 8h2v-1Z"
			}, {
				"fill": "#7c4dff",
				"d": "M12 12v18h18V12Zm10 16c-.9 0-2.025-1.267-2.025-3.005-.914 0-.975.464-.975 1.005-.881-.213-1-1.15-1-2h6c0 1.919-2 1.787-2 4m2.542-6a2.5 2.5 0 0 1-2.308-1.641l-.946-2.42a.305.305 0 0 0-.576 0l-.946 2.42A2.5 2.5 0 0 1 17.458 22H16l2.965-7.59a.63.63 0 0 1 .577-.41h2.916a.63.63 0 0 1 .577.41L26 22Z"
			}],
			"audio": [{
				"fill": "#ef5350",
				"d": "M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2m6 10h-4v8a4 4 0 1 1-4-4 3.96 3.96 0 0 1 2 .555V8h6Z"
			}],
			"azure-pipelines": [
				{
					"fill": "#64b5f6",
					"d": "M3.98 22.01h1.803v4.208H9.99v1.803H3.98Z"
				},
				{
					"fill": "#1565c0",
					"d": "M3.98 10.991v5.51l3.505 3.61 1.503-1.606 4.508 4.508-1.502 1.502 3.506 3.506h5.51a1 1 0 0 0 1.001-1.002v-8.014L12.995 9.99H4.982a1 1 0 0 0-1.003 1.001Z"
				},
				{
					"fill": "#1e88e5",
					"d": "M8.317 18.44a1 1 0 0 1-.125-1.265L16.407 4.87a2 2 0 0 1 1.666-.891h8.946A1 1 0 0 1 28.02 4.98v8.946a2 2 0 0 1-.891 1.667l-12.305 8.215a1 1 0 0 1-1.265-.126Z"
				},
				{
					"fill": "#64b5f6",
					"d": "m8.976 21.542 7.648-7.648 1.48 1.481-7.647 7.648Z"
				},
				{
					"fill": "#42a5f5",
					"d": "m11.68 21.801-1.481-1.48 6.426-6.427 1.48 1.481Z"
				},
				{
					"fill": "#90caf9",
					"d": "M22.011 12.995a3.006 3.006 0 0 0 .096-6.011h-.096a3.006 3.006 0 0 0 0 6.01Z"
				}
			],
			"babel": [{
				"fill": "#fdd835",
				"d": "M18.23 11.21q-.045-.24-1.32-1.65c-.02-.19.29-.45.9-.8l1.74-1.55c.39-.5.62-1.28.69-2.38l-.02-.26c-.07-.78-.63-1.4-1.69-1.89-.63-.42-1.76-.65-3.38-.68-1.35.11-3.11.59-5.28 1.43-.6.43-1.28.86-2.04 1.28l.01.14.21-.08c.08-.01.13.03.14.11l.13-.07.07-.01.01.06c0 .07-.47.44-1.76 1.35l-.06.12c-.31.02-.61.25-.91.67l.08.12.25-.09.18.24c.32-.33.66-.62 1.03-.87.19.05.29.11.44.16 1.02-.75 2.03-1.3 3.04-1.64l.01.14c-.2.27-.32.42-.38.42l.1.23c.01.19-2.55 7-6.66 14.44l.08.19c.35-.08.58-.17.75-.26l.01.13.4-.03-.67 1.76.14.06c.57-.64 1-1.29 1.3-1.88 1.67-.49 2.94-.97 3.82-1.44.88-.08 1.56-.31 2.02-.7l.92-.47c1.27-.98 2.22-1.67 2.87-2.08 1.33-.98 2.2-1.93 2.6-2.85zm-3.46 2.31L13 14.91c-1.29.85-2 1.3-2.09 1.3-2.07 1.13-3.36 1.72-3.86 1.76l-.05.01c.04-.23.96-2.12 2.75-5.67.78-.06 2.02-.43 3.71-1.1l.41-.03c.85-.08 1.49.09 1.91.49l.03.26c-.31.9-.67 1.44-1.04 1.59m1.09-5.78q-.27.33-1.5 1.11c-.27.03-1.27.42-3.01 1.18l-.28-.05-.01-.12c-.02-.25.09-.57.34-.95.13-.7.28-1.12.44-1.2l1.45-3.28c-.02-.22.29-.35.93-.46l.21-.02.01.18 1.16-.16c1.15-.1 1.75.14 1.8.7l.13-.02-.03-.32.15-.02c.35.19.52.4.54.68.02.18-.08.41-.29.68-.09.01-.14-.06-.15-.18l-.14.01-.03.4c-.58.87-1.01 1.31-1.27 1.34z"
			}],
			"bibliography": [
				{
					"fill": "#795548",
					"d": "M96 832h832c17.728 0 32 14.272 32 32v64c0 17.728-14.272 32-32 32H96c-17.728 0-32-14.272-32-32v-64c0-17.728 14.272-32 32-32"
				},
				{
					"fill": "#4caf50",
					"d": "M160 192h64c17.728 0 32 14.272 32 32v512c0 17.728-14.272 32-32 32h-64c-17.728 0-32-14.272-32-32V224c0-17.728 14.272-32 32-32"
				},
				{
					"fill": "#f44336",
					"d": "M512 96c0-17.728-14.272-32-32-32H352c-17.728 0-32 14.272-32 32v640c0 17.728 14.272 32 32 32h128c17.728 0 32-14.272 32-32z"
				},
				{
					"fill": "#2196f3",
					"d": "m530.161 158.902 57.333-27.693a31.804 31.804 0 0 1 42.634 14.936l262.693 548.17c7.66 15.984.977 35.057-14.982 42.766l-57.333 27.693a31.804 31.804 0 0 1-42.634-14.936L515.18 201.668c-7.66-15.983-.977-35.057 14.982-42.766z"
				},
				{
					"fill": "#ffeb3b",
					"d": "M320 192v64h192v-64zm0 384v64h192v-64z"
				}
			],
			"c": [{
				"fill": "#0288d1",
				"d": "M19.563 22A5.57 5.57 0 0 1 14 16.437v-2.873A5.57 5.57 0 0 1 19.563 8H24V2h-4.437A11.563 11.563 0 0 0 8 13.563v2.873A11.564 11.564 0 0 0 19.563 28H24v-6Z"
			}],
			"changelog": [{
				"fill": "#90a4ae",
				"d": "M0 0h24v24H0z"
			}, {
				"fill": "#8bc34a",
				"d": "M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.95 8.95 0 0 0 13 21a9 9 0 0 0 0-18m-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z"
			}],
			"clojure": [
				{
					"fill": "#64dd17",
					"d": "M123.456 129.975a507 507 0 0 0-3.54 7.846c-4.406 9.981-9.284 22.127-11.066 29.908-.64 2.77-1.037 6.205-1.03 10.013 0 1.506.081 3.09.21 4.702a58.1 58.1 0 0 0 19.98 3.559 58.2 58.2 0 0 0 18.29-2.98c-1.352-1.237-2.642-2.554-3.816-4.038-7.796-9.942-12.146-24.512-19.028-49.01m-28.784-49.39C79.782 91.08 70.039 108.387 70.002 128c.037 19.32 9.487 36.403 24.002 46.94 3.56-14.83 12.485-28.41 25.868-55.63a219 219 0 0 0-2.714-7.083c-3.708-9.3-9.059-20.102-13.834-24.993-2.435-2.555-5.389-4.763-8.652-6.648"
				},
				{
					"fill": "#7cb342",
					"d": "M178.532 194.535c-7.683-.963-14.023-2.124-19.57-4.081a69.4 69.4 0 0 1-30.958 7.249c-38.491 0-69.693-31.198-69.698-69.7 0-20.891 9.203-39.62 23.764-52.392-3.895-.94-7.956-1.49-12.104-1.482-20.45.193-42.037 11.51-51.025 42.075-.84 4.45-.64 7.813-.64 11.8 0 60.591 49.12 109.715 109.705 109.715 37.104 0 69.882-18.437 89.732-46.633-10.736 2.675-21.06 3.955-29.902 3.982-3.314 0-6.425-.177-9.305-.53"
				},
				{
					"fill": "#29b6f6",
					"d": "M157.922 173.271c.678.336 2.213.884 4.35 1.49 14.375-10.553 23.717-27.552 23.754-46.764h-.005c-.055-32.03-25.974-57.945-58.011-58.009a58.2 58.2 0 0 0-18.213 2.961c11.779 13.426 17.443 32.613 22.922 53.6l.01.025c.01.017 1.752 5.828 4.743 13.538 2.97 7.7 7.203 17.231 11.818 24.178 3.03 4.655 6.363 8 8.632 8.981"
				},
				{
					"fill": "#1e88e5",
					"d": "M128.009 18.29c-36.746 0-69.25 18.089-89.16 45.826 10.361-6.49 20.941-8.83 30.174-8.747 12.753.037 22.779 3.991 27.589 6.696a51 51 0 0 1 3.345 2.131 69.4 69.4 0 0 1 28.049-5.894c38.496.004 69.703 31.202 69.709 69.698h-.006c0 19.409-7.938 36.957-20.736 49.594 3.142.352 6.492.571 9.912.554 12.15.006 25.284-2.675 35.13-10.956 6.42-5.408 11.798-13.327 14.78-25.199.584-4.586.92-9.247.92-13.991 0-60.588-49.116-109.715-109.705-109.715"
				}
			],
			"conduct": [{
				"fill": "#cddc39",
				"d": "m10 17-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9m-6-6a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m7 0h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
			}],
			"console": [{
				"fill": "#ff7043",
				"d": "M2 2a1 1 0 0 0-1 1v10c0 .554.446 1 1 1h12c.554 0 1-.446 1-1V3a1 1 0 0 0-1-1zm0 3h12v8H2zm1 2 2 2-2 2 1 1 3-3-3-3zm5 3.5V12h5v-1.5z"
			}],
			"contributing": [{
				"fill": "#ffca28",
				"d": "M17 9H7V7h10m0 6H7v-2h10m-3 6H7v-2h7M12 3a1 1 0 0 1 1 1 1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 1-1m7 0h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
			}],
			"cpp": [{
				"fill": "#0288d1",
				"d": "M28 14v-4h-2v4h-6v-4h-2v4h-4v2h4v4h2v-4h6v4h2v-4h4v-2z"
			}, {
				"fill": "#0288d1",
				"d": "M13.563 22A5.57 5.57 0 0 1 8 16.437v-2.873A5.57 5.57 0 0 1 13.563 8H18V2h-4.437A11.563 11.563 0 0 0 2 13.563v2.873A11.564 11.564 0 0 0 13.563 28H18v-6Z"
			}],
			"csharp": [{
				"fill": "#0288d1",
				"d": "M30 14v-2h-2V8h-2v4h-2V8h-2v4h-2v2h2v2h-2v2h2v4h2v-4h2v4h2v-4h2v-2h-2v-2Zm-4 2h-2v-2h2Zm-12.437 6A5.57 5.57 0 0 1 8 16.437v-2.873A5.57 5.57 0 0 1 13.563 8H18V2h-4.437A11.563 11.563 0 0 0 2 13.563v2.873A11.564 11.564 0 0 0 13.563 28H18v-6Z"
			}],
			"css": [{
				"fill": "#7e57c2",
				"d": "M20 18h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 20 22h2v2h2v-2c0-.388-.562-.851-1.254-1.034C20.356 20.34 20 18.84 20 18m-3.254 2.966C14.356 20.34 14 18.84 14 18h-2v-2h-2v8h2v-2h4v2h2v-2c0-.388-.562-.851-1.254-1.034"
			}, {
				"fill": "#7e57c2",
				"d": "M24 4H4v20a4 4 0 0 0 4 4h16.16A3.84 3.84 0 0 0 28 24.16V8a4 4 0 0 0-4-4m2 14h-2v-2h-2v2c0 .193 0 .703 1.254 1.033A3.345 3.345 0 0 1 26 22v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1 2-2h2a2 2 0 0 1 2 2Z"
			}],
			"dart": [
				{
					"fill": "#4fc3f7",
					"d": "M16.83 2a1.3 1.3 0 0 0-.916.377l-.013.01L7.323 7.34l8.556 8.55v.005l10.283 10.277 1.96-3.529-7.068-16.96-3.299-3.297A1.3 1.3 0 0 0 16.828 2Z"
				},
				{
					"fill": "#01579b",
					"d": "m7.343 7.32-4.955 8.565-.01.013a1.297 1.297 0 0 0 .004 1.835l.005.005 4.106 4.107 16.064 6.314 3.632-2.015-.098-.098-.025.002L15.995 15.97h-.012z"
				},
				{
					"fill": "#01579b",
					"d": "m7.321 7.324 8.753 8.755h.013L26.16 26.156l3.835-.73L30 14.089l-4.049-3.965a6.5 6.5 0 0 0-3.618-1.612l.002-.043L7.323 7.325Z"
				},
				{
					"fill": "#64b5f6",
					"d": "m7.332 7.335 8.758 8.75v.013l10.079 10.071L25.436 30H14.09l-3.967-4.048a6.5 6.5 0 0 1-1.611-3.618l-.045.004Z"
				}
			],
			"database": [{
				"fill": "#ffca28",
				"d": "M16 24c-5.525 0-10-.9-10-2v4c0 1.1 4.475 2 10 2s10-.9 10-2v-4c0 1.1-4.475 2-10 2m0-8c-5.525 0-10-.9-10-2v4c0 1.1 4.475 2 10 2s10-.9 10-2v-4c0 1.1-4.475 2-10 2m0-12C10.477 4 6 4.895 6 6v4c0 1.1 4.475 2 10 2s10-.9 10-2V6c0-1.105-4.477-2-10-2"
			}],
			"diff": [{
				"fill": "#90a4ae",
				"d": "M0 0h24v24H0z"
			}, {
				"fill": "#42a5f5",
				"d": "M18 23H4c-1.1 0-2-.9-2-2V7h2v14h14zM14.5 7V5h-2v2h-2v2h2v2h2V9h2V7zm2 6h-6v2h6zM15 1H8c-1.1 0-1.99.9-1.99 2L6 17c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V7zm4 16H8V3h6.17L19 7.83z"
			}],
			"docker": [{
				"fill": "#0288d1",
				"d": "M21.81 10.25c-.06-.04-.56-.43-1.64-.43-.28 0-.56.03-.84.08-.21-1.4-1.38-2.11-1.43-2.14l-.29-.17-.18.27c-.24.36-.43.77-.51 1.19-.2.8-.08 1.56.33 2.21-.49.28-1.29.35-1.46.35H2.62c-.34 0-.62.28-.62.63 0 1.15.18 2.3.58 3.38.45 1.19 1.13 2.07 2 2.61.98.6 2.59.94 4.42.94.79 0 1.61-.07 2.42-.22 1.12-.2 2.2-.59 3.19-1.16A8.3 8.3 0 0 0 16.78 16c1.05-1.17 1.67-2.5 2.12-3.65h.19c1.14 0 1.85-.46 2.24-.85.26-.24.45-.53.59-.87l.08-.24zm-17.96.99h1.76c.08 0 .16-.07.16-.16V9.5c0-.08-.07-.16-.16-.16H3.85c-.09 0-.16.07-.16.16v1.58c.01.09.07.16.16.16m2.43 0h1.76c.08 0 .16-.07.16-.16V9.5c0-.08-.07-.16-.16-.16H6.28c-.09 0-.16.07-.16.16v1.58c.01.09.07.16.16.16m2.47 0h1.75c.1 0 .17-.07.17-.16V9.5c0-.08-.06-.16-.17-.16H8.75c-.08 0-.15.07-.15.16v1.58c0 .09.06.16.15.16m2.44 0h1.77c.08 0 .15-.07.15-.16V9.5c0-.08-.06-.16-.15-.16h-1.77c-.08 0-.15.07-.15.16v1.58c0 .09.07.16.15.16M6.28 9h1.76c.08 0 .16-.09.16-.18V7.25c0-.09-.07-.16-.16-.16H6.28c-.09 0-.16.06-.16.16v1.57c.01.09.07.18.16.18m2.47 0h1.75c.1 0 .17-.09.17-.18V7.25c0-.09-.06-.16-.17-.16H8.75c-.08 0-.15.06-.15.16v1.57c0 .09.06.18.15.18m2.44 0h1.77c.08 0 .15-.09.15-.18V7.25c0-.09-.07-.16-.15-.16h-1.77c-.08 0-.15.06-.15.16v1.57c0 .09.07.18.15.18m0-2.28h1.77c.08 0 .15-.07.15-.16V5c0-.1-.07-.17-.15-.17h-1.77c-.08 0-.15.06-.15.17v1.56c0 .08.07.16.15.16m2.46 4.52h1.76c.09 0 .16-.07.16-.16V9.5c0-.08-.07-.16-.16-.16h-1.76c-.08 0-.15.07-.15.16v1.58c0 .09.07.16.15.16"
			}],
			"document": [{
				"fill": "#90a4ae",
				"d": "M0 0h24v24H0z"
			}, {
				"fill": "#42a5f5",
				"d": "M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5z"
			}],
			"editorconfig": [
				{
					"fill": "#ede7f6",
					"d": "M989.342 1977.409c41.146-26.835 75.137-93.922 54.564-141.33-56.353 24.151-53.67 79.61-54.564 141.33m636.877 153.851c44.724-14.311 87.66-64.402 63.509-116.283-34.886 24.151-57.248 57.247-63.51 116.284z"
				},
				{
					"fill": "#90a4ae",
					"d": "M374.827 2871.899c0 56.352 14.312 117.178 53.67 138.645 144.907 81.4 652.977 17.89 825.614-20.573 90.343-20.573 163.692-87.66 248.668-124.334 191.421-83.187 330.067-150.274 483.025-262.085 110.916-81.399 287.131-310.388 305.915-447.245l-151.169-33.991c-3.578 153.852-38.463 188.737-175.32 224.517-92.132 25.046-271.925 30.413-365.846 14.312-124.334-20.574-180.687-85.871-237.04-160.114-109.128-144.907 24.151-245.985-148.485-255.824-181.582 222.728-501.81 62.614-642.244 40.252-59.93 86.765-200.366 650.294-198.577 779.1 86.766-29.517 141.33 2.684 219.15 33.097 275.503 106.444 34.885 200.366-75.137 172.636-75.137-17.89-98.394-67.086-142.224-98.393m360.48-1285.383c111.81 21.468 211.1 67.982 305.915 115.39 154.747 76.926 182.476 66.192 196.788 173.53 1.789 19.68-1.789 30.413 54.564 48.303 94.816 29.518-54.564-23.257 199.471-22.362 151.169.894 497.337 61.72 609.148 132.384 46.513 29.519 37.568 67.087 194.999 62.615-1.79-185.16-50.986-461.557-123.44-631.51-88.554-205.733-205.733-237.04-444.561-313.966-139.54-44.725-549.217-93.922-676.235-15.207-118.967 74.243-141.33 162.798-252.246 318.439-32.202 45.619-43.83 80.504-64.403 132.384"
				},
				{
					"fill": "#90a4ae",
					"d": "M1720.14 1966.675c89.45 36.674-4.472 273.714-128.806 216.466-40.252-113.6 55.458-178.003 81.398-228.99-53.67-8.05-206.627-32.2-252.246-15.206-59.036 22.363-72.454 148.486-42.041 207.522 143.118 280.87 775.523 220.94 708.436 2.684-26.835-88.555-51.88-102.867-142.224-133.28-72.454-24.15-144.907-49.196-224.517-49.196m-1124.374-31.307c71.56 68.875 233.462 79.61 338.117 84.976 13.418-138.646 25.046-242.407 135.963-234.356 54.564 74.242 25.94 161.902-31.307 218.255 97.5-.894 153.852-74.242 139.54-180.687-82.293-59.036-331.856-177.109-457.084-194.104-34.885 37.569-120.756 243.301-125.229 305.916"
				},
				{
					"fill": "#90a4ae",
					"d": "M427.602 2820.913c59.036-5.367 212.889 39.357 225.412 89.449-95.71 11.628-217.361 2.683-225.412-89.45zm-52.775 50.986c43.83 31.307 67.087 80.504 142.224 98.393 110.022 27.73 350.64-66.192 75.137-172.636-77.82-30.413-132.384-62.614-219.15-33.096-1.789-128.807 138.646-692.336 198.577-779.101 140.435 22.362 460.662 182.476 642.244-40.252 172.636 9.84 39.357 110.917 148.485 255.824 56.353 74.243 112.706 139.54 237.04 160.114 93.921 16.1 273.714 10.734 365.846-14.312 136.857-35.78 171.742-70.665 175.32-224.517l151.17 33.99c-18.785 136.858-195 365.847-305.916 447.246-152.958 111.81-291.604 178.898-483.025 262.085-84.976 36.674-158.325 103.761-248.668 124.334-172.637 38.463-680.707 101.972-825.614 20.574-39.358-21.468-53.67-82.294-53.67-138.646M1626.22 2131.26c6.261-59.037 28.623-92.133 63.508-116.284 24.152 51.88-18.784 101.972-63.508 116.284m93.921-164.586c79.61 0 152.063 25.045 224.517 49.197 90.344 30.412 115.39 44.724 142.224 133.279 67.087 218.255-565.318 278.186-708.436-2.684-30.413-59.036-16.995-185.16 42.041-207.522 45.619-16.995 198.577 7.156 252.246 15.207-25.94 50.986-121.65 115.389-81.398 228.99 124.334 57.247 218.255-179.793 128.806-216.467m-730.798 10.734c.894-61.72-1.79-117.179 54.564-141.33 20.573 47.408-13.418 114.495-54.564 141.33m-393.576-42.041c4.473-62.615 90.344-268.347 125.229-305.916 125.228 16.995 374.791 135.068 457.084 194.104 14.312 106.445-42.04 179.793-139.54 180.687 57.247-56.353 85.87-144.013 31.307-218.255-110.917-8.05-122.545 95.71-135.963 234.356-104.655-5.367-266.558-16.1-338.117-84.976m-89.449-71.56c-33.096-91.238-33.096-233.462 107.339-245.09l-71.56 199.471c-18.783 42.936-18.783 33.096-35.779 45.62zm228.99-277.292c20.573-51.88 32.201-86.765 64.403-132.384 110.917-155.641 133.279-244.196 252.246-318.439 127.018-78.715 536.694-29.518 676.235 15.207 238.828 76.926 356.007 108.233 444.561 313.966 72.454 169.953 121.65 446.35 123.44 631.51-157.43 4.472-148.486-33.096-195-62.615-111.81-70.664-457.978-131.49-609.147-132.384-254.035-.895-104.655 51.88-199.471 22.362-56.353-17.89-52.775-28.624-54.564-48.302-14.312-107.34-42.041-96.605-196.788-173.531-94.816-47.408-194.104-93.922-305.915-115.39m1583.247-43.83c-16.995-56.352 14.312-52.775 68.876-91.238 31.307-22.362 56.353-45.619 94.816-67.086 144.013-80.504 412.36-93.922 526.854 1.789 46.514 38.463 122.545 113.6 110.917 211.994-24.151 195.893-158.325 303.232-268.347 392.68-111.811 91.239-297.865 185.16-490.18 122.546-16.101-39.358-3.578-288.92-22.363-381.053-16.995-82.293-8.05-91.238 39.358-140.435 139.54-144.907 441.878-250.457 613.62-126.123 72.454 53.67 51.88 74.243 89.449 115.39 46.513-50.092-40.252-218.256-360.48-207.522-217.36 7.156-311.282 177.109-402.52 169.058m-1302.377-508.964c4.472-124.335 118.967-381.948 233.461-471.397 138.646-107.338 283.554-208.416 496.442-87.66 52.775 29.519 50.092 44.725 55.459 118.073 4.472 70.665-1.79 96.605-19.679 153.852-141.33 456.19-259.402 194.105-712.014 302.338 16.995-148.485 145.802-280.87 217.361-349.746 122.545-118.967 211.1-195.893 395.365-170.847 50.986 84.976 56.352 138.646-5.367 237.934-82.293 132.385-102.867 124.334-90.344 214.678 64.403-16.101 84.082-78.715 113.6-141.33 179.793-375.686-81.398-421.305-241.512-352.429-107.339 45.62-298.76 256.719-361.374 383.736-12.523 25.046-25.94 57.248-37.568 84.977zm708.436 18.784c18.784-111.811 129.7-139.54 129.7-483.92 0-148.485-182.475-281.764-421.304-182.475-204.838 84.082-236.145 148.485-345.273 313.071-102.867 155.642-99.289 326.49-187.843 470.502-25.94 41.147-49.197 55.458-77.82 96.605-20.574 30.413-35.78 68.876-56.354 104.655-42.04 68.876-84.976 118.968-118.967 201.26-107.339 2.684-197.682 4.473-208.416 115.39-14.312 152.063 57.247 189.632 57.247 246.879-.894 61.72-251.351 684.285-181.581 1055.498 19.679 101.972 86.765 102.867 194.104 115.39 258.508 31.307 593.942 20.573 825.614-72.454l420.41-201.26c106.445-59.931 285.343-173.532 364.953-256.72 56.353-58.141 85.87-107.338 134.173-176.214 66.192-96.605 67.981-94.816 82.293-226.306 87.66 16.101 251.352 54.564 305.916 101.972-6.262 61.72-36.674 32.202-36.674 87.66 34.885.895 93.027-42.935 107.339-91.238-36.675-53.67-75.138-44.724-127.913-87.66 42.042-33.096 118.073-48.302 176.215-72.453 125.229-51.88 339.012-209.311 391.787-352.43 42.04-115.389 10.734-307.704-57.248-382.841-71.559-78.715-237.934-118.967-373.897-118.967-161.902 0-329.172 116.283-459.767 166.375-50.092-43.83-53.67-93.922-90.344-142.224-42.04-57.248-315.755-200.366-446.35-228.095"
				},
				{
					"fill": "#efebe9",
					"d": "M2318.554 1542.686c91.238 8.05 185.16-161.902 402.52-169.058 320.228-10.734 406.993 157.43 360.48 207.521-37.569-41.146-16.995-61.72-89.45-115.389-171.741-124.334-474.079-18.784-613.62 126.123-47.407 49.197-56.352 58.142-39.357 140.435 18.785 92.133 6.262 341.695 22.362 381.053 192.316 62.614 378.37-31.307 490.181-122.545 110.022-89.45 244.196-196.788 268.347-392.681 11.628-98.394-64.403-173.531-110.917-211.994-114.494-95.71-382.841-82.293-526.854-1.79-38.463 21.468-63.51 44.725-94.816 67.087-54.564 38.464-85.871 34.886-68.876 91.238m-1302.377-508.964 43.83-77.821c11.628-27.73 25.045-59.93 37.568-84.977 62.614-127.017 254.035-338.117 361.374-383.736 160.114-68.876 421.305-23.257 241.512 352.43-29.518 62.614-49.197 125.228-113.6 141.329-12.523-90.344 8.05-82.293 90.344-214.678 61.72-99.288 56.353-152.958 5.367-237.934-184.265-25.046-272.82 51.88-395.365 170.847-71.56 68.876-200.366 201.26-217.361 349.746 452.612-108.233 570.685 153.852 712.014-302.338 17.89-57.247 24.151-83.187 19.679-153.852-5.367-73.348-2.684-88.554-55.459-118.073-212.888-120.756-357.796-19.678-496.442 87.66-114.494 89.45-228.989 347.062-233.461 471.397"
				},
				{
					"fill": "#eee",
					"d": "M506.317 1863.808c16.996-12.523 16.996-2.683 35.78-45.619l71.559-199.47c-140.435 11.627-140.435 153.851-107.339 245.09z"
				},
				{
					"fill": "#efebe9",
					"d": "M653.014 2910.362c-12.523-50.092-166.376-94.816-225.412-89.45 8.05 92.133 129.701 101.078 225.412 89.45"
				}
			],
			"elixir": [{
				"fill": "#9575cd",
				"d": "M12.173 22.681c-3.86 0-6.99-3.64-6.99-8.13 0-3.678 2.773-8.172 4.916-10.91 1.014-1.296 2.93-2.322 2.93-2.322s-.982 5.239 1.683 7.319c2.366 1.847 4.106 4.25 4.106 6.363 0 4.232-2.784 7.68-6.645 7.68"
			}],
			"elm": [
				{
					"fill": "#ffb300",
					"d": "m106.716 99.763 54.785 54.782 54.779-54.782z"
				},
				{
					"fill": "#64dd17",
					"d": "M96.881 89.93H216.83l-55.18-55.184H41.7zm131.546 11.593 59.705 59.704L228.16 221.2l-59.705-59.704z"
				},
				{
					"fill": "#00b8d4",
					"d": "m175.552 34.746 112.703 112.695V34.746z"
				},
				{
					"fill": "#455a64",
					"d": "m34.746 281.3 119.8-119.8-119.8-119.8z"
				},
				{
					"fill": "#ffb300",
					"d": "m288.255 175.01-53.148 53.149 53.148 53.14z"
				},
				{
					"fill": "#00b8d4",
					"d": "M281.3 288.254 161.5 168.455l-119.8 119.8z"
				}
			],
			"eslint": [{
				"fill": "#3f51b5",
				"d": "M22.713 4H9.287a.5.5 0 0 0-.432.248l-6.708 11.5a.5.5 0 0 0 0 .504l6.708 11.5a.5.5 0 0 0 .432.248h13.426a.5.5 0 0 0 .432-.248l6.708-11.5a.5.5 0 0 0 0-.504l-6.708-11.5A.5.5 0 0 0 22.713 4m-6.937 20.888-7.5-3.75A.5.5 0 0 1 8 20.691v-9.382a.5.5 0 0 1 .276-.447l7.5-3.75a.5.5 0 0 1 .448 0l7.5 3.75a.5.5 0 0 1 .276.447v9.382a.5.5 0 0 1-.276.447l-7.5 3.75a.5.5 0 0 1-.448 0"
			}, {
				"fill": "#7986cb",
				"d": "M22 19.441v-6.882a.5.5 0 0 0-.276-.447l-5.5-2.75a.5.5 0 0 0-.448 0l-5.5 2.75a.5.5 0 0 0-.276.447v6.882a.5.5 0 0 0 .276.447l5.5 2.75a.5.5 0 0 0 .448 0l5.5-2.75a.5.5 0 0 0 .276-.447"
			}],
			"folder-api": [{
				"fill": "#fbc02d",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#fffde7",
				"d": "M10 9H8v1h3V7h-1zm4 0V7h-1v3h3V9Zm-6 4h2v2h1v-3H8Zm5 0v2h1v-2h2v-1h-3z"
			}],
			"folder-app": [{
				"fill": "#ef5350",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffcdd2",
				"d": "M8 6h2v2H8Zm3 0h2v2h-2zm3 0h2v2h-2ZM8 9h2v2H8Zm3 0h2v2h-2zm3 0h2v2h-2zm-6 3h2v2H8Zm3 0h2v2h-2zm3 0h2v2h-2z"
			}],
			"folder-audio": [{
				"fill": "#ef5350",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffcdd2",
				"d": "M15.75 6h-2.5a.25.25 0 0 0-.25.25v4.027a1.95 1.95 0 0 0-1.615-.179 2 2 0 0 0 .928 3.877A2.05 2.05 0 0 0 14 11.923V8h1.75a.25.25 0 0 0 .25-.25v-1.5a.25.25 0 0 0-.25-.25"
			}],
			"folder-class": [{
				"fill": "#ef5350",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffcdd2",
				"d": "M8 6v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1m7 7H9v-2h6zm0-3H9V8h6z"
			}],
			"folder-config": [{
				"fill": "#00acc1",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#80deea",
				"d": "M11.5 12.075A1.6 1.6 0 0 1 9.882 10.5a1.62 1.62 0 1 1 1.62 1.575m3.437-1.138a4 4 0 0 0 .032-.438 4 4 0 0 0-.032-.45l.976-.733a.223.223 0 0 0 .056-.288l-.926-1.556a.23.23 0 0 0-.283-.1l-1.15.45a3.4 3.4 0 0 0-.783-.44l-.171-1.193A.23.23 0 0 0 12.425 6h-1.85a.23.23 0 0 0-.231.189l-.171 1.193a3.4 3.4 0 0 0-.781.44l-1.152-.45a.23.23 0 0 0-.282.1l-.926 1.556a.22.22 0 0 0 .056.288l.975.734a4 4 0 0 0-.032.45 4 4 0 0 0 .032.437l-.975.746a.22.22 0 0 0-.056.288l.925 1.558a.235.235 0 0 0 .283.099l1.152-.455a3.2 3.2 0 0 0 .781.446l.171 1.192a.23.23 0 0 0 .232.189h1.85a.23.23 0 0 0 .232-.189l.17-1.192a3.4 3.4 0 0 0 .783-.446l1.15.455a.24.24 0 0 0 .284-.1l.924-1.557a.223.223 0 0 0-.055-.288Z"
			}],
			"folder-controller": [{
				"fill": "#ffc107",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#fff9c4",
				"d": "M11.5 12.075A1.6 1.6 0 0 1 9.88 10.5a1.62 1.62 0 1 1 1.62 1.575m3.438-1.138a4 4 0 0 0 .032-.437 4 4 0 0 0-.032-.45l.976-.734a.223.223 0 0 0 .056-.288l-.927-1.556a.23.23 0 0 0-.282-.1l-1.15.45a3.4 3.4 0 0 0-.783-.44l-.171-1.193A.23.23 0 0 0 12.425 6h-1.85a.23.23 0 0 0-.232.189l-.17 1.193a3.4 3.4 0 0 0-.782.44l-1.152-.45a.23.23 0 0 0-.282.1l-.925 1.556a.22.22 0 0 0 .056.288l.975.734a4 4 0 0 0-.032.45 4 4 0 0 0 .032.437l-.975.746a.22.22 0 0 0-.056.288l.925 1.558a.235.235 0 0 0 .282.099l1.152-.455a3.2 3.2 0 0 0 .782.446l.17 1.192a.23.23 0 0 0 .232.189h1.85a.23.23 0 0 0 .232-.189l.17-1.192a3.4 3.4 0 0 0 .783-.446l1.151.455a.24.24 0 0 0 .283-.1l.926-1.557a.223.223 0 0 0-.056-.288z"
			}],
			"folder-coverage": [{
				"fill": "#26a69a",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#b2dfdb",
				"d": "m11.722 11.633-1.555-1.578.548-.556 1.007 1.017 2.563-2.6.548.56M12.5 5 9 7v2.265A4.9 4.9 0 0 0 12.5 14 4.9 4.9 0 0 0 16 9.265V7Z"
			}],
			"folder-database": [{
				"fill": "#ffca28",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffecb3",
				"d": "M12 5a4 2 0 0 0-4 2 4 2 0 0 0 4 2 4 2 0 0 0 4-2 4 2 0 0 0-4-2M8 8v2c0 1.105 1.791 2 4 2s4-.895 4-2V8c0 1.105-1.791 2-4 2s-4-.895-4-2m0 3v2c0 1.105 1.791 2 4 2s4-.895 4-2v-2c0 1.105-1.791 2-4 2s-4-.895-4-2"
			}],
			"folder-dist": [{
				"fill": "#e57373",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffcdd2",
				"d": "M15 7h-2V6l-1-1h-2L9 6v1H7a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1m-5 0V6h2v1z"
			}],
			"folder-docs": [{
				"fill": "#0277bd",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#b3e5fc",
				"d": "M12 5H8.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8Zm0 8H9v-1h3zm2-2H9v-1h5zm-2.414-2.586V6L14 8.414Z"
			}],
			"folder-examples": [{
				"fill": "#009688",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#b2dfdb",
				"d": "M8 7v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1m1 0h1a1 1 0 0 1-1 1Zm0 2a2 2 0 0 0 2-2h1a3.003 3.003 0 0 1-3 3zm0 4 2-2 .8.8L13 10l2 3z"
			}],
			"folder-font": [{
				"fill": "#ff5252",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffcdd2",
				"d": "M12.039 6h-1.077L8 14h1.211L10 12h3l.789 2H15Zm-1.82 5L11.5 7.382 12.776 11Z"
			}],
			"folder-images": [{
				"fill": "#009688",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#b2dfdb",
				"d": "M12 5H8.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8Zm-2 3a1 1 0 1 1-1 1 1.005 1.005 0 0 1 1-1m4 5H9l2-2 1 1 2-2zm-2.414-4.586V6L14 8.414Z"
			}],
			"folder-lib": [{
				"fill": "#c0ca33",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#f0f4c3",
				"d": "M11.5 8a1.5 1.5 0 0 0 .002-3H11.5A1.5 1.5 0 0 0 10 6.5 1.5 1.5 0 0 0 11.5 8m0 1.987C10.387 8.947 8.523 7.996 7 8v5c1.595 0 3.425 1.002 4.5 2 1.113-1.039 2.978-2.002 4.5-2V8c-1.522-.003-3.387.947-4.5 1.986"
			}],
			"folder-middleware": [{
				"fill": "#5c6bc0",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#c5cae9",
				"d": "M15.054 10H16V8a1 1 0 0 0-1-1h-2V6a1 1 0 0 0-2 0v1H9a1 1 0 0 0-1 1v2H7a1 1 0 0 0 0 2h1v2a1 1 0 0 0 1 1h2v-.946a1.04 1.04 0 0 1 .832-1.04A1 1 0 0 1 13 14v1h2a1 1 0 0 0 1-1v-2h-1a1 1 0 0 1-.986-1.168 1.04 1.04 0 0 1 1.04-.832"
			}],
			"folder-migrations": [{
				"fill": "#ec407a",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#f8bbd0",
				"d": "M12 5c-1.705 0-3.155.535-3.73 1.285l2.625 2.625c.355.055.715.09 1.105.09 2.21 0 4-.895 4-2s-1.79-2-4-2M8 7v2H6v1h2v2l2.42-2.5M16 8c0 1.105-1.79 2-4 2-.33 0-.65-.025-.955-.065L9.81 11.17c.63.205 1.38.33 2.19.33 2.21 0 4-.895 4-2m0 1c0 1.105-1.79 2-4 2-1.14 0-2.165-.25-2.895-.625l-.84.84C8.84 13.465 10.295 14 12 14c2.21 0 4-.895 4-2"
			}],
			"folder-node": [{
				"fill": "#8bc34a",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#dcedc8",
				"d": "M12.5 6 9 8.036v3.927L12.5 14l3.5-2.037V8.036Z"
			}],
			"folder-plugin": [{
				"fill": "#0288d1",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#b3e5fc",
				"d": "M15.054 10H16V8a1 1 0 0 0-1-1h-2V6a1 1 0 0 0-2 0v1H9a1 1 0 0 0-1 1v2H7a1 1 0 0 0 0 2h1v2a1 1 0 0 0 1 1h2v-.946a1.04 1.04 0 0 1 .832-1.04A1 1 0 0 1 13 14v1h2a1 1 0 0 0 1-1v-2h-1a1 1 0 0 1-.986-1.168 1.04 1.04 0 0 1 1.04-.832"
			}],
			"folder-public": [{
				"fill": "#039be5",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#b3e5fc",
				"d": "M11 5a5 5 0 1 0 5 5 5 5 0 0 0-5-5m3.459 3H12.98a8 8 0 0 0-.671-1.77A4.02 4.02 0 0 1 14.459 8M11 6a7 7 0 0 1 .945 2h-1.89A7 7 0 0 1 11 6m-1.309.23A8 8 0 0 0 9.02 8H7.541a4.02 4.02 0 0 1 2.15-1.77M7.131 11a3.85 3.85 0 0 1 0-2h1.704a7.8 7.8 0 0 0 0 2zm.41 1H9.02a8 8 0 0 0 .671 1.77A4.02 4.02 0 0 1 7.541 12M11 14a7 7 0 0 1-.945-2h1.89A7 7 0 0 1 11 14m1.155-3h-2.31a6.7 6.7 0 0 1 0-2h2.31a6.7 6.7 0 0 1 0 2m.154 2.77A8 8 0 0 0 12.98 12h1.479a4.02 4.02 0 0 1-2.15 1.77m2.56-2.77h-1.704a7.8 7.8 0 0 0 0-2h1.704a3.85 3.85 0 0 1 0 2"
			}],
			"folder-resource": [{
				"fill": "#fbc02d",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#fff9c4",
				"d": "M9.5 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5zm.5 1h5v1h-5zM7 8v6.5a.5.5 0 0 0 .5.5H14v-1H8V8zm3 1h5v1h-5zm0 2h3v1h-3z"
			}],
			"folder-routes": [{
				"fill": "#43a047",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#c8e6c9",
				"d": "M8.707 7.293 10 6H6v4l1.293-1.293 2.455 2.455a.85.85 0 0 1 .252.608V14h2v-2.23a2.84 2.84 0 0 0-.838-2.022ZM14.68 6l-2.805 2.465.285.285a2.8 2.8 0 0 1 .78 1.445L16 7.505Z"
			}],
			"folder-scripts": [{
				"fill": "#546e7a",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#cfd8dc",
				"d": "M14 6h-3a2 2 0 0 0-2 2v4h1V8h4v4.947a1.04 1.04 0 0 1-.832 1.04A1 1 0 0 1 12 13H8a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V8h1a2 2 0 0 0-2-2"
			}],
			"folder-src": [{
				"fill": "#4caf50",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#c8e6c9",
				"d": "M9.225 15a.5.5 0 0 1-.12-.014.57.568 0 0 1-.414-.661l1.549-7.872a.566.565 0 0 1 .254-.372.53.53 0 0 1 .4-.067.57.57 0 0 1 .415.662l-1.552 7.872a.56.56 0 0 1-.253.371.53.53 0 0 1-.28.081m3.105-1h-.038a.54.54 0 0 1-.382-.206.583.582 0 0 1 .057-.774l2.664-2.483-2.653-2.312a.583.582 0 0 1-.08-.772.54.54 0 0 1 .377-.218.53.53 0 0 1 .406.129l3.126 2.727a.579.578 0 0 1 .002.862l-3.114 2.904a.536.535 0 0 1-.365.144zm-4.661 0a.536.535 0 0 1-.365-.146L4.186 10.95a.58.58 0 0 1-.005-.846l.01-.01 3.128-2.726a.516.515 0 0 1 .4-.13.54.54 0 0 1 .38.218.583.582 0 0 1-.08.773l-2.65 2.31 2.663 2.482a.579.578 0 0 1 .056.774.536.535 0 0 1-.381.206z"
			}],
			"folder-target": [{
				"fill": "#546e7a",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#cfd8dc",
				"d": "M14.576 5 12.44 7.137l-.355 1.066-.81.812a1 1 0 0 0-.499-.005l-.037.011a1 1 0 0 0-.183.073l-.055.029a1.007 1.007 0 1 0 1.377 1.377q.015-.027.027-.055a1 1 0 0 0 .075-.184l.011-.037a1 1 0 0 0-.006-.498l.81-.81 1.07-.356L16 6.424h-1.424zm-3.806.006a5 5 0 1 0 4.884 3.168l-.79.79a4 4 0 1 1-2.83-2.827l.792-.791a5 5 0 0 0-2.056-.34m.138 1.996a3 3 0 1 0 3.074 2.668l-.994.109a2 2 0 1 1-1.767-1.767l.11-.995a3 3 0 0 0-.423-.015"
			}],
			"folder-test": [{
				"fill": "#00bfa5",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#a7ffeb",
				"d": "M8 6v1h1v6a2 2 0 0 0 4 0V7h1V6Zm2.5 7a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5m1-2a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5m.5-2h-2V7h2z"
			}],
			"folder-theme": [{
				"fill": "#1e88e5",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#bbdefb",
				"d": "M10.999 5C8 5 6 7 6 10a5 5 0 0 0 5 5c.46 0 1 0 1-1 0-.218-.284-.392-.482-.59A1.19 1.19 0 0 1 11 12.5c0-.5.5-.5 1-.5h2c2 0 2-2 2-3 0-2-2-4-5.001-4M8 10a1 1 0 1 1 1-1 1 1 0 0 1-1 1m3-2a1 1 0 1 1 1-1 1 1 0 0 1-1 1m3 2a1 1 0 1 1 1-1 1 1 0 0 1-1 1"
			}],
			"folder-tools": [{
				"fill": "#1e88e5",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#bbdefb",
				"d": "M12.182 9.506 6.682 15 6 14.319l5.494-5.5Zm2.182-1.408.287-.288-.385-.384.312-.312-.692-.691-.311.311-.385-.385-.287.288A10.3 10.3 0 0 0 10.078 5l-.405.872a12.3 12.3 0 0 1 2.368 1.627l-.244.244 1.461 1.461.244-.244a12.3 12.3 0 0 1 1.626 2.368l.872-.404a10.3 10.3 0 0 0-1.636-2.825"
			}],
			"folder-typescript": [{
				"fill": "#0288d1",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#90caf9",
				"d": "M12 9.535a.665.664 0 0 0 .15.52 1.25 1.248 0 0 0 .305.14c.27.09.665.184 1.045.309 1.32.44 1.48 1.159 1.495 1.743q.006.119.005.23v.024c0 .53-.23 1.394-1.72 1.489q-.096.006-.185.005A.5.5 0 0 1 13 14h-2v-.88l.12-.12H13a1 .999 0 0 0 .125-.004h.085c.09-.005.165-.015.235-.02a1 .999 0 0 0 .135-.03q.051-.015.095-.03a.02.02 0 0 0 .015-.005c.245-.09.295-.225.305-.33l.005-.08c0-.16-.34-.614-1.5-.998-1.37-.455-1.49-1.209-1.495-1.803A.3.3 0 0 1 11 9.635v-.13a1.425 1.423 0 0 1 .225-.794c.02-.03.035-.055.055-.08.005-.005.005-.01.01-.015a.5.5 0 0 1 .09-.1 2.15 2.147 0 0 1 1.575-.509H15v.999h-2q-.098-.001-.195.005c-.59.03-.745.2-.79.35a.1.1 0 0 0-.005.03.5.5 0 0 0-.01.114zM9 14H8V9.006H6v-.999h5v.999H9Z"
			}],
			"folder-utils": [{
				"fill": "#7cb342",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#dcedc8",
				"d": "M9.5 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5zM12 7h1v2h2v1h-2v2h-1v-2h-2V9h2zM7 8v6.5a.5.5 0 0 0 .5.5H14v-1H8V8z"
			}],
			"folder-video": [{
				"fill": "#ff9800",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffe0b2",
				"d": "m14 7 1 2h-1l-1-2h-1l1 2h-1l-1-2h-1l1 2h-1L9 7H8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7.25a.25.25 0 0 0-.25-.25Z"
			}],
			"folder-views": [{
				"fill": "#ff7043",
				"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
			}, {
				"fill": "#ffccbc",
				"d": "m7 6 1 8 3.5 1 3.5-1 1-8zm4 2.95L9.33 10 11 11.051V12l-2.617-1.693v-.614L11 8Zm3.618 1.364L12 12v-.949L13.681 10 12 8.95V8l2.618 1.687z"
			}],
			"folder-vue": [
				{
					"fill": "#009688",
					"d": "m6.922 3.768-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232"
				},
				{
					"fill": "#41b883",
					"d": "m6 6 5 8 5-7.961V6h-1.944l-3.027 4.82L8.016 6Z"
				},
				{
					"fill": "#35495e",
					"d": "m8.015 6 3.014 4.821L14.055 6h-1.823L11.04 7.898 9.854 6Z"
				}
			],
			"font": [{
				"fill": "#f44336",
				"d": "M24 28h4L18 4h-4L4 28h4l8-19.422"
			}, {
				"fill": "#f44336",
				"d": "M8 20h16v4H8z"
			}],
			"gemfile": [{
				"fill": "#e53935",
				"d": "M21.184 10.016V10H10.881l.016.033-.016-.017L8 14l8.032 10L24 14z"
			}, {
				"fill": "#e53935",
				"d": "m16 3.455 11 6.286v12.518l-11 6.286-11-6.286V9.741zM16 0 2 8v16l14 8 14-8V8z"
			}],
			"git": [{
				"fill": "#e64a19",
				"d": "M13.172 2.828 11.78 4.22l1.91 1.91 2 2A2.986 2.986 0 0 1 20 10.81a3.25 3.25 0 0 1-.31 1.31l2.06 2a2.68 2.68 0 0 1 3.37.57 2.86 2.86 0 0 1 .88 2.117 3.02 3.02 0 0 1-.856 2.109A2.9 2.9 0 0 1 23 19.81a2.93 2.93 0 0 1-2.13-.87 2.694 2.694 0 0 1-.56-3.38l-2-2.06a3 3 0 0 1-.31.12V20a3 3 0 0 1 1.44 1.09 2.92 2.92 0 0 1 .56 1.72 2.88 2.88 0 0 1-.878 2.128 2.98 2.98 0 0 1-2.048.871 2.981 2.981 0 0 1-2.514-4.719A3 3 0 0 1 16 20v-6.38a2.96 2.96 0 0 1-1.44-1.09 2.9 2.9 0 0 1-.56-1.72 2.9 2.9 0 0 1 .31-1.31l-3.9-3.9-7.579 7.572a4 4 0 0 0-.001 5.658l10.342 10.342a4 4 0 0 0 5.656 0l10.344-10.344a4 4 0 0 0 0-5.656L18.828 2.828a4 4 0 0 0-5.656 0"
			}],
			"go": [{
				"fill": "#00acc1",
				"d": "M2 12h4v2H2zm-2 4h6v2H0zm4 4h2v2H4zm16.954-5H14v3h3.239a4.42 4.42 0 0 1-3.531 2 2.65 2.65 0 0 1-2.053-.858 2.86 2.86 0 0 1-.628-2.28A4.515 4.515 0 0 1 15.292 13a2.73 2.73 0 0 1 1.749.584l2.962-1.185A5.6 5.6 0 0 0 15.292 10a7.526 7.526 0 0 0-7.243 6.5 5.614 5.614 0 0 0 5.659 6.5 7.526 7.526 0 0 0 7.243-6.5 6.4 6.4 0 0 0 .003-1.5"
			}, {
				"fill": "#00acc1",
				"d": "M26.292 10a7.526 7.526 0 0 0-7.243 6.5 5.614 5.614 0 0 0 5.659 6.5 7.526 7.526 0 0 0 7.243-6.5 5.614 5.614 0 0 0-5.659-6.5m2.681 6.137A4.515 4.515 0 0 1 24.708 20a2.65 2.65 0 0 1-2.053-.858 2.86 2.86 0 0 1-.628-2.28A4.515 4.515 0 0 1 26.292 13a2.65 2.65 0 0 1 2.053.858 2.86 2.86 0 0 1 .628 2.28Z"
			}],
			"go-mod": [{
				"fill": "#ec407a",
				"d": "M2 12h4v2H2zm-2 4h6v2H0zm4 4h2v2H4zm16.954-5H14v3h3.239a4.42 4.42 0 0 1-3.531 2 2.65 2.65 0 0 1-2.053-.858 2.86 2.86 0 0 1-.628-2.28A4.515 4.515 0 0 1 15.292 13a2.73 2.73 0 0 1 1.749.584l2.962-1.185A5.6 5.6 0 0 0 15.292 10a7.526 7.526 0 0 0-7.243 6.5 5.614 5.614 0 0 0 5.659 6.5 7.526 7.526 0 0 0 7.243-6.5 6.4 6.4 0 0 0 .003-1.5"
			}, {
				"fill": "#ec407a",
				"d": "M26.292 10a7.526 7.526 0 0 0-7.243 6.5 5.614 5.614 0 0 0 5.659 6.5 7.526 7.526 0 0 0 7.243-6.5 5.614 5.614 0 0 0-5.659-6.5m2.681 6.137A4.515 4.515 0 0 1 24.708 20a2.65 2.65 0 0 1-2.053-.858 2.86 2.86 0 0 1-.628-2.28A4.515 4.515 0 0 1 26.292 13a2.65 2.65 0 0 1 2.053.858 2.86 2.86 0 0 1 .628 2.28Z"
			}],
			"gradle": [{
				"fill": "#0097a7",
				"d": "M16 10v2h6c-2 0-3-2-6-2"
			}, {
				"fill": "#0097a7",
				"d": "M26 4h-2a4 4 0 0 0-4 4h4a1 1 0 0 1 2 0v4H16v-2h-5.317A2.683 2.683 0 0 0 8 12.683v2.634A2.683 2.683 0 0 0 10.683 18H16v2h-5.98A4.02 4.02 0 0 1 6 16v-2c-2 0-4 4-4 8 0 5 1 6 2 6h4v-4h4v4h4v-4h4v4h4v-6a2 2 0 0 0 2-2v-2a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4m-4 12h-2a2 2 0 0 1-2-2h6a2 2 0 0 1-2 2"
			}],
			"h": [{
				"fill": "#0288d1",
				"d": "M18.5 11a5.49 5.49 0 0 0-4.5 2.344V4H8v24h6V17a2 2 0 0 1 4 0v11h6V16.5a5.5 5.5 0 0 0-5.5-5.5"
			}],
			"haskell": [
				{
					"fill": "#ef5350",
					"d": "m23.928 240.5 59.94-89.852-59.94-89.855h44.955l59.94 89.855-59.94 89.852z"
				},
				{
					"fill": "#ffa726",
					"d": "m83.869 240.5 59.94-89.852-59.94-89.855h44.955l119.88 179.71h-44.95l-37.46-56.156-37.468 56.156z"
				},
				{
					"fill": "#ffee58",
					"d": "m228.72 188.08-19.98-29.953h69.93v29.956h-49.95zm-29.97-44.924-19.98-29.953h99.901v29.953z"
				}
			],
			"hpp": [{
				"fill": "#0288d1",
				"d": "M28 6V2h-2v4h-6V2h-2v4h-4v2h4v4h2V8h6v4h2V8h4V6zm-15.5 5A5.49 5.49 0 0 0 8 13.344V4H2v24h6V17a2 2 0 0 1 4 0v11h6V16.5a5.5 5.5 0 0 0-5.5-5.5"
			}],
			"html": [{
				"fill": "#e65100",
				"d": "m4 4 2 22 10 2 10-2 2-22Zm19.72 7H11.28l.29 3h11.86l-.802 9.335L15.99 25l-6.635-1.646L8.93 19h3.02l.19 2 3.86.77 3.84-.77.29-4H8.84L8 8h16Z"
			}],
			"image": [{
				"fill": "#26a69a",
				"d": "M8.5 6h4l-4-4zM3.875 1H9.5l4 4v8.6c0 .773-.616 1.4-1.375 1.4h-8.25c-.76 0-1.375-.627-1.375-1.4V2.4c0-.777.612-1.4 1.375-1.4M4 13.6h8V8l-2.625 2.8L8 9.4zm1.25-7.7c-.76 0-1.375.627-1.375 1.4s.616 1.4 1.375 1.4c.76 0 1.375-.627 1.375-1.4S6.009 5.9 5.25 5.9"
			}],
			"java": [{
				"fill": "#f44336",
				"d": "M4 26h24v2H4zM28 4H7a1 1 0 0 0-1 1v13a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-4h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 8h-4V6h4Z"
			}],
			"javascript": [{
				"fill": "#ffca28",
				"d": "M2 2v12h12V2zm6 6h1v4a1.003 1.003 0 0 1-1 1H7a1.003 1.003 0 0 1-1-1v-1h1v1h1zm3 0h2v1h-2v1h1a1.003 1.003 0 0 1 1 1v1a1.003 1.003 0 0 1-1 1h-2v-1h2v-1h-1a1.003 1.003 0 0 1-1-1V9a1.003 1.003 0 0 1 1-1"
			}],
			"jsconfig": [{
				"fill": "#757575",
				"d": "M15 2H6a2.006 2.006 0 0 0-2 2v22a2.006 2.006 0 0 0 2 2h6v-4H6v-2h6v-2H6v-2h6v-2H6v-2h6v-2h2V4l8 8h2v-1Z"
			}, {
				"fill": "#ffca28",
				"d": "M12 12v18h18V12zm8 12a2.006 2.006 0 0 1-2 2h-2a2.006 2.006 0 0 1-2-2v-2h2v2h2v-8h2zm8-6h-4v2h2a2.006 2.006 0 0 1 2 2v2a2.006 2.006 0 0 1-2 2h-4v-2h4v-2h-2a2.006 2.006 0 0 1-2-2v-2a2.006 2.006 0 0 1 2-2h4z"
			}],
			"json": [{
				"fill": "#f9a825",
				"d": "M560-160v-80h120q17 0 28.5-11.5T720-280v-80q0-38 22-69t58-44v-14q-36-13-58-44t-22-69v-80q0-17-11.5-28.5T680-720H560v-80h120q50 0 85 35t35 85v80q0 17 11.5 28.5T840-560h40v160h-40q-17 0-28.5 11.5T800-360v80q0 50-35 85t-85 35zm-280 0q-50 0-85-35t-35-85v-80q0-17-11.5-28.5T120-400H80v-160h40q17 0 28.5-11.5T160-600v-80q0-50 35-85t85-35h120v80H280q-17 0-28.5 11.5T240-680v80q0 38-22 69t-58 44v14q36 13 58 44t22 69v80q0 17 11.5 28.5T280-240h120v80z"
			}],
			"just": [{
				"fill": "#ef5350",
				"d": "M8 1a7 7 0 0 0-7 7 7 7 0 0 0 7 7 7 7 0 0 0 7-7 7 7 0 0 0-7-7m0 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2m0 8a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2"
			}],
			"less": [{
				"fill": "#0277bd",
				"d": "M8 3a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H3v2h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2v-2H8v-5a2 2 0 0 0-2-2 2 2 0 0 0 2-2V5h2V3m6 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5h-2V3z"
			}],
			"license": [{
				"fill": "#ff5722",
				"d": "M8 1a5.5 5.5 0 0 0-4 9.26V15l4-1.5 4 1.5v-4.74A5.49 5.49 0 0 0 8 1m0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
			}],
			"lock": [{
				"fill": "#ffd54f",
				"d": "M25 12h-3V8a6 6 0 0 0-12 0v4H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V13a1 1 0 0 0-1-1M14 8a2 2 0 0 1 4 0v4h-4Zm2 17a4 4 0 1 1 4-4 4 4 0 0 1-4 4"
			}],
			"log": [{
				"fill": "#90a4ae",
				"d": "M0 0h24v24H0z"
			}, {
				"fill": "#afb42b",
				"d": "M19 5v9h-5v5H5V5zm0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10l6-6V5c0-1.1-.9-2-2-2m-7 11H7v-2h5zm5-4H7V8h10z"
			}],
			"lua": [{
				"fill": "#42a5f5",
				"d": "M30 6a3.86 3.86 0 0 1-1.167 2.833 4.024 4.024 0 0 1-5.666 0A3.86 3.86 0 0 1 22 6a3.86 3.86 0 0 1 1.167-2.833 4.024 4.024 0 0 1 5.666 0A3.86 3.86 0 0 1 30 6m-9.208 5.208A10.6 10.6 0 0 0 13 8a10.6 10.6 0 0 0-7.792 3.208A10.6 10.6 0 0 0 2 19a10.6 10.6 0 0 0 3.208 7.792A10.6 10.6 0 0 0 13 30a10.6 10.6 0 0 0 7.792-3.208A10.6 10.6 0 0 0 24 19a10.6 10.6 0 0 0-3.208-7.792m-1.959 7.625a4.024 4.024 0 0 1-5.666 0 4.024 4.024 0 0 1 0-5.666 4.024 4.024 0 0 1 5.666 0 4.024 4.024 0 0 1 0 5.666"
			}],
			"makefile": [{
				"fill": "#ef5350",
				"d": "m29.5 24.02-1.6-.92a4.4 4.4 0 0 0 .09-.9A1.3 1.3 0 0 0 28 22a5.6 5.6 0 0 0-.1-1.1l1.6-.92a.493.493 0 0 0 .18-.68l-1.5-2.6a.45.45 0 0 0-.18-.18V6.01a2.006 2.006 0 0 0-2-2H4a2.006 2.006 0 0 0-2 2V22a2.006 2.006 0 0 0 2 2h10.53l-.03.02a.493.493 0 0 0-.18.68l1.5 2.6a.493.493 0 0 0 .68.18l1.6-.92a5.9 5.9 0 0 0 1.9 1.09v1.85a.495.495 0 0 0 .5.5h3a.495.495 0 0 0 .5-.5v-1.85a5.9 5.9 0 0 0 1.9-1.09l1.6.92a.493.493 0 0 0 .68-.18l1.5-2.6a.493.493 0 0 0-.18-.68M24 22.01a1.99 1.99 0 0 1-.88 1.65l-.18.11a2.04 2.04 0 0 1-1.88 0l-.18-.11a1.99 1.99 0 0 1-.88-1.65V22a2 2 0 0 1 .88-1.66l.18-.11a2.04 2.04 0 0 1 1.88 0l.18.11A2 2 0 0 1 24 22Zm2-4.63-.1.06a5.9 5.9 0 0 0-1.9-1.09V14.5a.495.495 0 0 0-.5-.5h-3a.495.495 0 0 0-.5.5v1.85a5.9 5.9 0 0 0-1.9 1.09l-1.6-.92a.493.493 0 0 0-.68.18l-1.5 2.6a.493.493 0 0 0 .18.68l1.6.92A5.6 5.6 0 0 0 16 22v.01L4 22V10.01h22Z"
			}],
			"markdown": [{
				"fill": "#42a5f5",
				"d": "m14 10-4 3.5L6 10H4v12h4v-6l2 2 2-2v6h4V10zm12 6v-6h-4v6h-4l6 8 6-8z"
			}],
			"mdx": [{
				"fill": "#ffca28",
				"d": "m14 10-4 3.5L6 10H4v12h4v-6l2 2 2-2v6h4V10zm12 6v-6h-4v6h-4l6 8 6-8z"
			}],
			"meson": [{
				"fill": "#3f51b5",
				"d": "M9.06 1.534c-4.627 2.64-7.5 7.588-7.526 12.962 4.84 2.668 10.525 2.577 14.93.028q0-.02.002-.039C16.46 9.14 13.637 4.203 9.06 1.533zm2.49 5.722c.687.47.585 1.605.474 2.382-.14.856-.952 2.262-2.006 3.18.136.198.216.442.215.701-.654.334-1.302-.042-2.086-.721s-1.63-2.039-1.91-3.437a1.12 1.12 0 0 1-.723-.169c.057-.783.88-1.249 1.61-1.524.728-.275 2.607-.368 3.932.108.104-.219.275-.403.495-.52z"
			}],
			"next": [{
				"fill": "#cfd8dc",
				"d": "M16 2a14 14 0 1 0 5.816 26.723L12 14v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2.434a1 1 0 0 1 .857.486l11.491 19.15A14 14 0 0 0 16 2m8 16h-4V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1Z"
			}],
			"nim": [{
				"fill": "#ffca28",
				"d": "M6 24h20v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM30 6l-9 9-5-11-5 11-9-9 4 14h20z"
			}],
			"nodejs": [{
				"fill": "#8bc34a",
				"d": "M16 20.003v2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2v-2h4v-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v2Z"
			}, {
				"fill": "#8bc34a",
				"d": "m16 3.003-12 7v14l4 2h6v-13.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v11.5H8l-2-1.034V11.15l10-5.833 10 5.833v11.703l-10 5.833-1.745-1.022L13 29.253l3 1.75 12-7v-14Z"
			}],
			"npm": [{
				"fill": "#e53935",
				"d": "M4 4v24h24V4Zm20 20h-4V12h-4v12H8V8h16Z"
			}],
			"nuxt": [{
				"fill": "#00e676",
				"d": "m30.27 23-6.93-12a1.98 1.98 0 0 0-1.73-1 1.96 1.96 0 0 0-1.73 1l-2.27 3.93-3.88-6.71a1.996 1.996 0 0 0-3.46 0L1.73 23a2 2 0 0 0 1.73 3h8.915a6 6 0 0 0 5.197-3.001L21.61 16l3.46 6h-2.31l-2.31 4h8.09a2 2 0 0 0 1.73-3m-17.896-1H6.93L12 13.22l3.3 5.71-1.193 2.069A2 2 0 0 1 12.374 22"
			}],
			"pdf": [{
				"fill": "#ef5350",
				"d": "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m4.93 10.44c.41.9.93 1.64 1.53 2.15l.41.32c-.87.16-2.07.44-3.34.93l-.11.04.5-1.04c.45-.87.78-1.66 1.01-2.4m6.48 3.81c.18-.18.27-.41.28-.66.03-.2-.02-.39-.12-.55-.29-.47-1.04-.69-2.28-.69l-1.29.07-.87-.58c-.63-.52-1.2-1.43-1.6-2.56l.04-.14c.33-1.33.64-2.94-.02-3.6a.85.85 0 0 0-.61-.24h-.24c-.37 0-.7.39-.79.77-.37 1.33-.15 2.06.22 3.27v.01c-.25.88-.57 1.9-1.08 2.93l-.96 1.8-.89.49c-1.2.75-1.77 1.59-1.88 2.12-.04.19-.02.36.05.54l.03.05.48.31.44.11c.81 0 1.73-.95 2.97-3.07l.18-.07c1.03-.33 2.31-.56 4.03-.75 1.03.51 2.24.74 3 .74.44 0 .74-.11.91-.3m-.41-.71.09.11c-.01.1-.04.11-.09.13h-.04l-.19.02c-.46 0-1.17-.19-1.9-.51.09-.1.13-.1.23-.1 1.4 0 1.8.25 1.9.35M7.83 17c-.65 1.19-1.24 1.85-1.69 2 .05-.38.5-1.04 1.21-1.69zm3.02-6.91c-.23-.9-.24-1.63-.07-2.05l.07-.12.15.05c.17.24.19.56.09 1.1l-.03.16-.16.82z"
			}],
			"perl": [{
				"fill": "#ba68c8",
				"d": "M11.057 2.981c.537.735.028 1.653.141 2.472a3.42 3.42 0 0 1-1.03 2.415c-1.414 1.625-3.165 3.038-4.097 5.03a5.28 5.28 0 0 0 1.412 5.847c.706.735 1.54 1.342 2.472 1.738.17.805-1.088.184-1.455 0A6.7 6.7 0 0 1 4.361 16.4a5.44 5.44 0 0 1 .904-5.368c1.272-1.61 3.136-2.543 4.662-3.857.565-.55 1.003-1.3.932-2.119.156-.678-.254-1.469.212-2.09zm-.07 18.929c-.17.198-.467.325-.495.24-.042-.085.212-.127.381-.325.17-.183.127-.522.24-.522.1 0 .043.395-.14.607zm2.16 0c.17.198.453.31.495.24.028-.085-.212-.141-.395-.339-.156-.184-.113-.523-.24-.523-.085 0-.029.41.14.608zm-1.03.48c-.1 0-.071-.296-.071-.65 0-.367-.028-.663.07-.663.085 0 .057.296.057.663 0 .354.014.65-.057.65m-.495-20.765c.34.24.254 2.077.254 3.136 0 1.653.184 3.376-.805 4.916-.96 1.497-2.048 3.108-1.95 4.972.1 1.837.99 3.504 2.148 5.043.664.876-.353.509-.876.085a7.2 7.2 0 0 1-2.755-5.664c.142-1.907 1.597-3.348 2.628-4.803.805-1.13 1.186-1.879 1.215-3.645.028-1.412-.142-3.531.042-3.983.014-.043.07-.1.099-.057m.537 2.232c-.085 0-.043.396.028.72.424 2.26-.198 4.52-.749 6.682a12.77 12.77 0 0 0 .283 7.826c.607 1.568 1.71.791 2.161 1.568.34.593 1.272.198 1.978-.141 2.232-1.102 4.012-3.108 4.11-5.566.029-.494 0-.989-.07-1.497-.283-1.837-1.78-3.065-3.15-4.083-1.215-.89-2.74-1.483-3.659-2.613-.523-.65-.297-1.638-.381-2.458-.043-.452-.255-.042-.382-.268-.084-.127-.14-.17-.17-.17zm.72 3.616c.057 0 .17.071.325.226a20 20 0 0 0 2.161 1.921c1.272.961 2.43 2.091 2.967 3.504.339.875.339 1.836.226 2.74-.184 1.384-1.187 2.444-2.119 3.404-.339.354-1.06.791-1.074.678-.084-.367.763-1.172 1.159-1.695A5.93 5.93 0 0 0 16 10.962c-1.102-1.214-2.317-1.907-2.995-3.08-.14-.253-.183-.409-.113-.409z"
			}],
			"php": [{
				"fill": "#1e88e5",
				"d": "M12 18.08c-6.63 0-12-2.72-12-6.08s5.37-6.08 12-6.08S24 8.64 24 12s-5.37 6.08-12 6.08m-5.19-7.95c.54 0 .91.1 1.09.31.18.2.22.56.13 1.03-.1.53-.29.87-.58 1.09q-.42.33-1.29.33h-.87l.53-2.76zm-3.5 5.55h1.44l.34-1.75h1.23c.54 0 .98-.06 1.33-.17.35-.12.67-.31.96-.58.24-.22.43-.46.58-.73.15-.26.26-.56.31-.88.16-.78.05-1.39-.33-1.82-.39-.44-.99-.65-1.82-.65H4.59zm7.25-8.33-1.28 6.58h1.42l.74-3.77h1.14c.36 0 .6.06.71.18s.13.34.07.66l-.57 2.93h1.45l.59-3.07c.13-.62.03-1.07-.27-1.36-.3-.27-.85-.4-1.65-.4h-1.27L12 7.35zM18 10.13c.55 0 .91.1 1.09.31.18.2.22.56.13 1.03-.1.53-.29.87-.57 1.09-.29.22-.72.33-1.3.33h-.85l.5-2.76zm-3.5 5.55h1.44l.34-1.75h1.22c.55 0 1-.06 1.35-.17.35-.12.65-.31.95-.58.24-.22.44-.46.58-.73.15-.26.26-.56.32-.88.15-.78.04-1.39-.34-1.82-.36-.44-.99-.65-1.82-.65h-2.75z"
			}],
			"pnpm": [{
				"fill": "#e0e0e0",
				"d": "M2 22h8v8H2zm10 0h8v8h-8zm10 0h8v8h-8zM12 12h8v8h-8z"
			}, {
				"fill": "#ffb300",
				"d": "M2 2h8v8H2zm10 0h8v8h-8zm10 0h8v8h-8zm0 10h8v8h-8z"
			}],
			"poetry": [
				{
					"fill": "#3f51b5",
					"d": "M20.137 17.834A18.52 18.52 0 0 1 6 24l5 6a25.1 25.1 0 0 0 13-8Z"
				},
				{
					"fill": "#1976d2",
					"d": "M6 2v22a18.52 18.52 0 0 0 14.137-6.166Z"
				},
				{
					"fill": "#29b6f6",
					"d": "m6 2 14.137 15.834A23.7 23.7 0 0 0 26 2Z"
				}
			],
			"powerpoint": [{
				"fill": "#e64a19",
				"d": "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V9h5.5zM8 11v2h1v6H8v1h4v-1h-1v-2h2a3 3 0 0 0 3-3 3 3 0 0 0-3-3zm5 2a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-2v-2z"
			}],
			"powershell": [{
				"fill": "#03a9f4",
				"d": "M29.07 6H7.677A1.535 1.535 0 0 0 6.24 7.113l-4.2 17.774A.852.852 0 0 0 2.93 26h21.393a1.535 1.535 0 0 0 1.436-1.113L29.96 7.112A.852.852 0 0 0 29.07 6M8.626 23.797a1.4 1.4 0 0 1-1.814-.31l-.007-.009a1.075 1.075 0 0 1 .315-1.599l9.6-6.061-6.102-5.852-.01-.01a1.068 1.068 0 0 1 .084-1.625l.037-.03a1.38 1.38 0 0 1 1.8.07l7.233 6.957a1.1 1.1 0 0 1 .236.739 1.08 1.08 0 0 1-.412.79c-.074.04-.146.119-10.951 6.935ZM24 22.94A1.135 1.135 0 0 1 22.803 24h-5.634a1.061 1.061 0 1 1 .001-2.112h5.633A1.134 1.134 0 0 1 24 22.938Z"
			}],
			"prettier": [
				{
					"fill": "#f44336",
					"d": "M2 8h4v1H2zm0 6h4v1H2zm9-10h3v1h-3zM2 2h3v1H2z"
				},
				{
					"fill": "#f9a825",
					"d": "M9 2h3v1H9zm1 4h4v1h-4zm-5 6h1v1H5zm-3-2h6v1H2z"
				},
				{
					"fill": "#26a69a",
					"d": "M2 12h3v1H2zm7-4h5v1H9zM2 4h4v1H2zm3-2h4v1H5z"
				},
				{
					"fill": "#ba68c8",
					"d": "M2 6h3v1H2zm7-2h2v1H9zm-1 6h4v1H8z"
				}
			],
			"prisma": [{
				"fill": "#00bfa5",
				"d": "m27.777 22.617-.459-.946L18.43 3.26a2.25 2.25 0 0 0-1.914-1.256A2 2 0 0 0 16.379 2a2.23 2.23 0 0 0-1.891 1.042L4.348 19.056a2.2 2.2 0 0 0 .025 2.417l4.957 7.488A2.34 2.34 0 0 0 11.29 30a2.4 2.4 0 0 0 .655-.092l14.387-4.149a2.32 2.32 0 0 0 1.458-1.234 2.21 2.21 0 0 0-.013-1.908m-3.538.604-11.268 3.25 4.075-19.033 7.568 15.671-.376.098Z"
			}],
			"prolog": [{
				"fill": "#ef5350",
				"d": "M12 15.385a5.1 5.1 0 0 0 1.862 1.693L12 18.94l-1.862-1.862A5.04 5.04 0 0 0 12 15.385m4.232-4.063a1.693 1.693 0 0 0-1.693 1.693 1.693 1.693 0 0 0 1.693 1.693 1.693 1.693 0 0 0 1.693-1.693c0-.94-.762-1.693-1.693-1.693m-8.464 0a1.693 1.693 0 0 0-1.693 1.693 1.693 1.693 0 0 0 1.693 1.693 1.693 1.693 0 0 0 1.693-1.693c0-.94-.762-1.693-1.693-1.693m8.464-2.116a3.385 3.385 0 0 1 3.385 3.386 3.385 3.385 0 0 1-3.385 3.385 3.385 3.385 0 0 1-3.386-3.385 3.385 3.385 0 0 1 3.386-3.386m-8.464 0a3.385 3.385 0 0 1 3.386 3.386 3.385 3.385 0 0 1-3.386 3.385 3.385 3.385 0 0 1-3.385-3.385 3.385 3.385 0 0 1 3.385-3.386M3.74 2.69c1.49 3.132.415 5.468-.584 7.787a5.1 5.1 0 0 0-.465 2.116 5.08 5.08 0 0 0 5.078 5.078 6 6 0 0 0 .533-.042l2.506 2.505L12 21.31l1.194-1.177 2.505-2.505c.178.025.355.034.533.042a5.08 5.08 0 0 0 5.078-5.078 5.1 5.1 0 0 0-.465-2.116c-.999-2.319-2.074-4.655-.584-7.787-2.235 1.744-5.417 3.123-8.26 3.132-2.845-.008-6.027-1.388-8.261-3.132z"
			}],
			"python": [{
				"fill": "#0288d1",
				"d": "M9.86 2A2.86 2.86 0 0 0 7 4.86v1.68h4.29c.39 0 .71.57.71.96H4.86A2.86 2.86 0 0 0 2 10.36v3.781a2.86 2.86 0 0 0 2.86 2.86h1.18v-2.68a2.85 2.85 0 0 1 2.85-2.86h5.25c1.58 0 2.86-1.271 2.86-2.851V4.86A2.86 2.86 0 0 0 14.14 2zm-.72 1.61c.4 0 .72.12.72.71s-.32.891-.72.891c-.39 0-.71-.3-.71-.89s.32-.711.71-.711"
			}, {
				"fill": "#fdd835",
				"d": "M17.959 7v2.68a2.85 2.85 0 0 1-2.85 2.859H9.86A2.85 2.85 0 0 0 7 15.389v3.75a2.86 2.86 0 0 0 2.86 2.86h4.28A2.86 2.86 0 0 0 17 19.14v-1.68h-4.291c-.39 0-.709-.57-.709-.96h7.14A2.86 2.86 0 0 0 22 13.64V9.86A2.86 2.86 0 0 0 19.14 7zM8.32 11.513l-.004.004.038-.004zm6.54 7.276c.39 0 .71.3.71.89a.71.71 0 0 1-.71.71c-.4 0-.72-.12-.72-.71s.32-.89.72-.89"
			}],
			"python-misc": [
				{
					"fill": "#757575",
					"d": "M15 2H6a2.006 2.006 0 0 0-2 2v22a2.006 2.006 0 0 0 2 2h16a2 2 0 0 0 2-2V11Zm3 22H6v-2h12Zm0-4H6v-2h12Zm0-4H6v-2h12Zm-4-4V4l8 8Z"
				},
				{
					"fill": "#fbc02d",
					"d": "M30.714 16H28v5h-9v7.714A1.286 1.286 0 0 0 20.286 30h6.428A1.286 1.286 0 0 0 28 28.714V26h-6v-1h8.714A1.286 1.286 0 0 0 32 23.714v-6.428A1.286 1.286 0 0 0 30.714 16M24 28h3v1h-3Z"
				},
				{
					"fill": "#0288d1",
					"d": "M25.714 12h-6.428A1.286 1.286 0 0 0 18 13.286V16h6v1h-8.714A1.286 1.286 0 0 0 14 18.286v6.428A1.286 1.286 0 0 0 15.286 26H18v-6h9v-6.714A1.286 1.286 0 0 0 25.714 12M22 14h-3v-1h3Z"
				}
			],
			"qwik": [
				{
					"fill": "#29b6f6",
					"d": "m19.26 22.182-3.657-3.636-.056.008v-.04l-7.776-7.678 1.916-1.85-1.126-6.46-5.341 6.62c-.91.917-1.078 2.408-.423 3.508l3.337 5.534a2.8 2.8 0 0 0 2.435 1.356l1.653-.016z"
				},
				{
					"fill": "#b388ff",
					"d": "m21.255 9.018-.734-1.356-.383-.693-.152-.272-.016.016-2.012-3.484a2.82 2.82 0 0 0-2.467-1.411l-1.765.047-5.261.016A2.82 2.82 0 0 0 6.054 3.27L2.852 9.616 8.577 2.51l7.505 8.245-1.334 1.347.799 6.451.008-.016v.016h-.016l.016.016.623.606 3.025 2.958c.128.12.336-.024.248-.175l-1.868-3.676 3.257-6.02.104-.12c.04-.048.08-.096.112-.143.638-.87.726-2.034.2-2.983z"
				},
				{
					"fill": "#eceff1",
					"d": "M16.106 10.724 8.576 2.52l1.07 6.427-1.916 1.858 7.8 7.742-.702-6.426z"
				}
			],
			"r": [{
				"fill": "#1976d2",
				"d": "M11.956 4.05c-5.694 0-10.354 3.106-10.354 6.947 0 3.396 3.686 6.212 8.531 6.813v2.205h3.53V17.82c.88-.093 1.699-.259 2.475-.497l1.43 2.692h3.996l-2.402-4.048c1.936-1.263 3.147-3.034 3.147-4.97 0-3.841-4.659-6.947-10.354-6.947m1.584 2.712c4.349 0 7.558 1.45 7.558 4.753 0 1.77-.952 3.013-2.505 3.779a1 1 0 0 1-.228-.156c-.373-.165-.994-.352-.994-.352s3.085-.227 3.085-3.302-3.23-3.127-3.23-3.127h-7.092v7.413c-2.64-.766-4.462-2.392-4.462-4.255 0-2.63 3.52-4.753 7.868-4.753m.156 4.12h2.143s.983-.05.983.974c0 1.004-.983 1.004-.983 1.004h-2.143v-1.977m-.031 4.566h.952c.186 0 .28.052.445.207.135.103.28.3.404.476-.57.073-1.17.104-1.801.104z"
			}],
			"react": [
				{
					"fill": "#00bcd4",
					"d": "M16 12c7.444 0 12 2.59 12 4s-4.556 4-12 4-12-2.59-12-4 4.556-4 12-4m0-2c-7.732 0-14 2.686-14 6s6.268 6 14 6 14-2.686 14-6-6.268-6-14-6"
				},
				{
					"fill": "#00bcd4",
					"d": "M16 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2"
				},
				{
					"fill": "#00bcd4",
					"d": "M10.458 5.507c2.017 0 5.937 3.177 9.006 8.493 3.722 6.447 3.757 11.687 2.536 12.392a.9.9 0 0 1-.457.1c-2.017 0-5.938-3.176-9.007-8.492C8.814 11.553 8.779 6.313 10 5.608a.9.9 0 0 1 .458-.1m-.001-2A2.87 2.87 0 0 0 9 3.875C6.13 5.532 6.938 12.304 10.804 19c3.284 5.69 7.72 9.493 10.74 9.493A2.87 2.87 0 0 0 23 28.124c2.87-1.656 2.062-8.428-1.804-15.124-3.284-5.69-7.72-9.493-10.74-9.493Z"
				},
				{
					"fill": "#00bcd4",
					"d": "M21.543 5.507a.9.9 0 0 1 .457.1c1.221.706 1.186 5.946-2.536 12.393-3.07 5.316-6.99 8.493-9.007 8.493a.9.9 0 0 1-.457-.1C8.779 25.686 8.814 20.446 12.536 14c3.07-5.316 6.99-8.493 9.007-8.493m0-2c-3.02 0-7.455 3.804-10.74 9.493C6.939 19.696 6.13 26.468 9 28.124a2.87 2.87 0 0 0 1.457.369c3.02 0 7.455-3.804 10.74-9.493C25.061 12.304 25.87 5.532 23 3.876a2.87 2.87 0 0 0-1.457-.369"
				}
			],
			"readme": [{
				"fill": "#90a4ae",
				"d": "M0 0h24v24H0z"
			}, {
				"fill": "#42a5f5",
				"d": "M8 1C4.136 1 1 4.136 1 8s3.136 7 7 7 7-3.136 7-7-3.136-7-7-7m1 11H7V7.5h2zm0-6H7V4h2z"
			}],
			"rollup": [{
				"fill": "#f44336",
				"d": "M733.79 394.71c0 77.407-42.308 144.79-104.67 180.51-3.76 3.134-5.954 8.148-3.76 12.849l106.87 211.22c2.82 6.581-1.568 14.103-8.776 14.103h-408.35l2.194-1.254c15.356-8.774 121.91-219.06 225.95-318.72 104.05-99.658 117.21-66.439 59.857-174.87 0 0 44.188 86.182 6.581 92.763-29.459 5.328-97.15-60.17-72.08-119.09 25.071-57.664 123.79-46.695 169.23.314 17.236 30.085 26.952 64.872 26.952 102.17m-385.47 140.71c-41.367 76.154-67.692 131.62-82.108 170.48v-509.57c0-5.328 4.388-9.715 9.715-9.715h252.91c73.333 1.253 137.58 40.114 173.62 98.718-26.325-32.906-67.692-51.71-108.43-51.71-77.407 0-96.837 28.206-245.7 301.79z"
			}],
			"ruby": [{
				"fill": "#f44336",
				"d": "M18.041 3.177c2.24.382 2.879 1.919 2.843 3.527V6.67l-1.013 13.266-13.132.897h.008c-1.093-.044-3.518-.151-3.634-3.545l1.217-2.222 2.462 5.74 2.097-6.77-.045.009.018-.018 6.85 2.186L13.945 9.3l6.53-.409-5.144-4.212 2.71-1.51v.009M3.113 17.252v.017zM6.916 6.874c2.63-2.622 6.033-4.168 7.34-2.844 1.297 1.306-.072 4.523-2.702 7.135-2.666 2.613-6.015 4.248-7.322 2.933-1.306-1.324.036-4.612 2.675-7.224z"
			}],
			"rust": [{
				"fill": "#ff7043",
				"d": "m30 12-4-2V6h-4l-2-4-4 2-4-2-2 4H6v4l-4 2 2 4-2 4 4 2v4h4l2 4 4-2 4 2 2-4h4v-4l4-2-2-4ZM6 16a9.9 9.9 0 0 1 .842-4H10v8H6.842A9.9 9.9 0 0 1 6 16m10 10a9.98 9.98 0 0 1-7.978-4H16v-2h-2v-2h4c.819.819.297 2.308 1.179 3.37a1.89 1.89 0 0 0 1.46.63h3.34A9.98 9.98 0 0 1 16 26m-2-12v-2h4a1 1 0 0 1 0 2Zm11.158 6H24a2.006 2.006 0 0 1-2-2 2 2 0 0 0-2-2 3 3 0 0 0 3-3q0-.08-.004-.161A3.115 3.115 0 0 0 19.83 10H8.022a9.986 9.986 0 0 1 17.136 10"
			}],
			"sass": [{
				"fill": "#ec407a",
				"d": "M27.837 5.673a4.33 4.33 0 0 0-2.293-2.701c-2.362-1.261-6.11-1.298-9.548-.092a26.3 26.3 0 0 0-8.76 4.966c-2.752 2.542-3.438 4.925-3.189 6.194.523 2.668 3.274 4.539 5.485 6.042.418.284.822.559 1.175.816-1.429.76-4.261 2.444-5.088 4.248a3.88 3.88 0 0 0-.118 3.332A2.37 2.37 0 0 0 6.869 29.8a5.6 5.6 0 0 0 1.49.2 6.35 6.35 0 0 0 5.19-2.856 6.74 6.74 0 0 0 .864-5.382 7.3 7.3 0 0 1 2.044-.03 3.92 3.92 0 0 1 2.816 1.311 1.82 1.82 0 0 1 .423 1.262 1.55 1.55 0 0 1-.772 1.05c-.234.14-.586.355-.504.803.036.194.198.633.894.512a2.93 2.93 0 0 0 2.145-2.651 4 4 0 0 0-1.197-2.904 5.94 5.94 0 0 0-4.396-1.626 10.6 10.6 0 0 0-2.672.304 20 20 0 0 0-2.203-1.846c-1.712-1.3-3.33-2.529-3.235-4.26.125-2.263 2.468-4.532 6.964-6.744 4.016-1.976 7.254-2.037 8.944-1.438a2 2 0 0 1 1.204.883 2.77 2.77 0 0 1-.36 2.47 9.71 9.71 0 0 1-7.425 4.304 3.86 3.86 0 0 1-3.238-.757c-.278-.302-.593-.645-1.074-.383q-.565.31-.225 1.189a3.9 3.9 0 0 0 2.407 1.92 11.7 11.7 0 0 0 7.128-.671c3.527-1.35 6.681-5.202 5.756-8.787M11.895 24.475a4 4 0 0 1-.192.468 4.5 4.5 0 0 1-.753 1.081 2.83 2.83 0 0 1-2.533 1.107c-.056-.032-.078-.146-.085-.193a3.28 3.28 0 0 1 1.076-2.284 11.3 11.3 0 0 1 2.644-1.933 3.85 3.85 0 0 1-.157 1.754"
			}],
			"scala": [{
				"fill": "#f44336",
				"d": "m6.457 9.894 12.523 5.163-.456 1.211L6 11.105Zm7.02-3.091L26 11.966l-.457 1.21L13.02 8.015ZM6.465 18.885l12.524 5.163-.457 1.21L6.01 20.097Zm7.007-3.086 12.524 5.163-.456 1.21-12.524-5.162Z"
			}, {
				"fill": "#f44336",
				"d": "M6 24.07V30l19.997-3.106V20.96zM6 5.11v5.99l20-3.11V2zm0 9.96v5.03l20-3.11v-5.03z"
			}],
			"settings": [{
				"fill": "#90a4ae",
				"d": "M0 0h24v24H0z"
			}, {
				"fill": "#42a5f5",
				"d": "M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.49.49 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.6.6 0 0 0-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 0 0 .61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1q.09.03.18.03c.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64zm-1.98-1.71c.04.31.05.52.05.73s-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2"
			}],
			"svelte": [{
				"fill": "#ff5722",
				"d": "M175.94 24.328c-13.037.252-26.009 3.872-37.471 11.174L79.912 72.818a67.13 67.13 0 0 0-30.355 44.906 70.8 70.8 0 0 0 6.959 45.445 67.2 67.2 0 0 0-10.035 25.102 71.54 71.54 0 0 0 12.236 54.156c23.351 33.41 69.468 43.311 102.81 22.07l58.559-37.158a67.36 67.36 0 0 0 30.355-44.906 70.77 70.77 0 0 0-6.982-45.422 67.65 67.65 0 0 0 10.059-25.102 71.63 71.63 0 0 0-12.236-54.156v-.18c-15.324-21.925-40.453-33.727-65.342-33.246zm5.137 28.68a46.5 46.5 0 0 1 36.09 19.969 42.98 42.98 0 0 1 7.365 32.557 45 45 0 0 1-1.393 5.455l-1.123 3.37-2.986-2.247a75.9 75.9 0 0 0-22.902-11.45l-2.244-.651.201-2.246a13.16 13.16 0 0 0-2.379-8.711 13.99 13.99 0 0 0-14.953-5.412 12.8 12.8 0 0 0-3.594 1.572l-58.578 37.25a12.24 12.24 0 0 0-5.502 8.15 13.1 13.1 0 0 0 2.246 9.834 14.03 14.03 0 0 0 14.93 5.569 13.5 13.5 0 0 0 3.594-1.573l22.453-14.234a41.8 41.8 0 0 1 11.898-5.232 46.48 46.48 0 0 1 49.914 18.502 43.02 43.02 0 0 1 7.363 32.557 40.42 40.42 0 0 1-18.254 27.078l-58.58 37.316a43 43 0 0 1-11.898 5.23A46.545 46.545 0 0 1 82.81 227.14a42.98 42.98 0 0 1-7.341-32.557 38 38 0 0 1 1.39-5.41l1.102-3.37 3.008 2.246a75.9 75.9 0 0 0 22.836 11.361l2.244.65-.201 2.247a13.25 13.25 0 0 0 2.447 8.644 14.03 14.03 0 0 0 15.043 5.569 13.1 13.1 0 0 0 3.592-1.573l58.467-37.316a12.17 12.17 0 0 0 5.502-8.173 12.96 12.96 0 0 0-2.246-9.811 14.03 14.03 0 0 0-15.043-5.568 12.8 12.8 0 0 0-3.592 1.57l-22.453 14.258a42.9 42.9 0 0 1-11.877 5.209 46.52 46.52 0 0 1-49.846-18.5 43.02 43.02 0 0 1-7.297-32.557A40.42 40.42 0 0 1 96.798 96.98l58.646-37.316a42.8 42.8 0 0 1 11.811-5.21 46.5 46.5 0 0 1 13.822-1.444z"
			}],
			"svg": [{
				"fill": "#ffb300",
				"d": "M29.168 14.03a2.7 2.7 0 0 0-1.968-.83 2.51 2.51 0 0 0-1.929.8h-4.443l3.078-3.078a2.835 2.835 0 0 0 2.857-2.842 2.6 2.6 0 0 0-.831-1.969 2.82 2.82 0 0 0-2.014-.788 2.67 2.67 0 0 0-1.968.788 2.36 2.36 0 0 0-.812 1.922L18 11.17V6.726a2.51 2.51 0 0 0 .8-1.929 2.7 2.7 0 0 0-.832-1.968 2.745 2.745 0 0 0-3.936 0 2.7 2.7 0 0 0-.832 1.968 2.51 2.51 0 0 0 .8 1.93v4.443l-3.138-3.138a2.36 2.36 0 0 0-.812-1.922 2.66 2.66 0 0 0-1.968-.788 2.83 2.83 0 0 0-2.014.788 2.6 2.6 0 0 0-.831 1.969 2.74 2.74 0 0 0 .831 2.013 2.8 2.8 0 0 0 2.026.829l3.078 3.078H6.729a2.51 2.51 0 0 0-1.929-.8 2.7 2.7 0 0 0-1.968.831 2.745 2.745 0 0 0 0 3.937 2.7 2.7 0 0 0 1.968.832 2.51 2.51 0 0 0 1.929-.8h4.443l-3.078 3.077a2.835 2.835 0 0 0-2.857 2.842 2.6 2.6 0 0 0 .831 1.969 2.82 2.82 0 0 0 2.014.788 2.67 2.67 0 0 0 1.968-.788 2.36 2.36 0 0 0 .812-1.922L14 20.827v4.444a2.51 2.51 0 0 0-.8 1.929 2.784 2.784 0 0 0 4.768 1.968A2.7 2.7 0 0 0 18.8 27.2a2.51 2.51 0 0 0-.8-1.929v-4.444l3.138 3.138a2.36 2.36 0 0 0 .812 1.922 2.66 2.66 0 0 0 1.968.788 2.83 2.83 0 0 0 2.014-.788 2.6 2.6 0 0 0 .831-1.969 2.74 2.74 0 0 0-.831-2.013 2.8 2.8 0 0 0-2.026-.829L20.828 18h4.443a2.51 2.51 0 0 0 1.93.8 2.784 2.784 0 0 0 1.967-4.769Z"
			}],
			"swift": [{
				"fill": "#ff6e40",
				"d": "M17.087 19.721c-2.36 1.36-5.59 1.5-8.86.1a13.8 13.8 0 0 1-6.23-5.32c.67.55 1.46 1 2.3 1.4 3.37 1.57 6.73 1.46 9.1 0-3.37-2.59-6.24-5.96-8.37-8.71-.45-.45-.78-1.01-1.12-1.51 8.28 6.05 7.92 7.59 2.41-1.01 4.89 4.94 9.43 7.74 9.43 7.74.16.09.25.16.36.22.1-.25.19-.51.26-.78.79-2.85-.11-6.12-2.08-8.81 4.55 2.75 7.25 7.91 6.12 12.24-.03.11-.06.22-.05.39 2.24 2.83 1.64 5.78 1.35 5.22-1.21-2.39-3.48-1.65-4.62-1.17"
			}],
			"table": [{
				"fill": "#8bc34a",
				"d": "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V9h5.5zm4 7.5h-4v2h1l-2 1.67L10 13h1v-2H7v2h1l3 2.5L8 18H7v2h4v-2h-1l2-1.67L14 18h-1v2h4v-2h-1l-3-2.5 3-2.5h1z"
			}],
			"tailwindcss": [{
				"fill": "#4db6ac",
				"d": "M23.5 12H8c.89-2.3 4.02-4 7.75-4s6.86 1.7 7.75 4M14 12h15.5c-.89 2.3-4.02 4-7.75 4s-6.86-1.7-7.75-4m3.5 8H2c.89-2.3 4.02-4 7.75-4s6.86 1.7 7.75 4M8 20h15.5c-.89 2.3-4.02 4-7.75 4S8.89 22.3 8 20"
			}],
			"tex": [{
				"fill": "#2196f3",
				"d": "M80 192 64 320h32c16-80 16-96 63.242-96H176c8.837 0 16 7.163 16 16v352c0 8.837 0 16-32 16h-32v32h192v-32h-32c-32 0-32-7.163-32-16V240c0-8.837 7.163-16 16-16h16c48 0 48 16 64 96h32l-16-128zm560 0v32c16 0 45.713 0 52.57 16L776 434.666 708.57 592c-6.857 16-52.57 16-68.57 16v32h128v-32s-34.285 0-27.428-16L792 472l51.428 120c3.103 7.24-1.52 16-11.428 16v32h128v-32c-16 0-45.713 0-52.57-16L824 397.334 891.43 240c6.857-16 52.57-16 68.57-16v-32H832v32s34.285 0 27.428 16L808 360l-51.428-120c-3.103-7.24 1.52-16 11.428-16v-32zM320 384v32h32c32 0 32 7.163 32 16v352c0 8.837 0 16-32 16h-32v32h304l16-128h-32c-16 80-16 96-64 96h-64c-32 0-32-7.163-32-16V624h80c8.837 0 16 0 16 32v16h32V544h-32v16c0 32-7.163 32-16 32h-80V432c0-8.837 0-16 32-16h64c48 0 48 16 64 96h32l-16-128z"
			}],
			"toml": [{
				"fill": "#cfd8dc",
				"d": "M4 6V4h8v2H9v7H7V6z"
			}, {
				"fill": "#ef5350",
				"d": "M4 1v1H2v12h2v1H1V1zm8 0v1h2v12h-2v1h3V1z"
			}],
			"tsconfig": [{
				"fill": "#757575",
				"d": "M15 2H6a2.006 2.006 0 0 0-2 2v22a2.006 2.006 0 0 0 2 2h6v-4H6v-2h6v-2H6v-2h6v-2H6v-2h6v-2h2V4l8 8h2v-1Z"
			}, {
				"fill": "#0288d1",
				"d": "M12 12v18h18V12Zm8 6h-2v8h-2v-8h-2v-2h6Zm8 0h-4v2h2a2.006 2.006 0 0 1 2 2v2a2.006 2.006 0 0 1-2 2h-4v-2h4v-2h-2a2.006 2.006 0 0 1-2-2v-2a2.006 2.006 0 0 1 2-2h4Z"
			}],
			"tune": [
				{
					"fill": "#fbc02d",
					"d": "M12 10h10v2H12z"
				},
				{
					"fill": "#fbc02d",
					"d": "M16 4h2v8h-2zm4 18h10v2H20zm4 2h2v4h-2zm0-20h2v14h-2zM2 18h10v2H2z"
				},
				{
					"fill": "#fbc02d",
					"d": "M6 18h2v10H6zM6 4h2v10H6zm10 12h2v12h-2z"
				}
			],
			"typescript": [{
				"fill": "#0288d1",
				"d": "M2 2v12h12V2zm4 6h3v1H8v4H7V9H6zm5 0h2v1h-2v1h1a1.003 1.003 0 0 1 1 1v1a1.003 1.003 0 0 1-1 1h-2v-1h2v-1h-1a1.003 1.003 0 0 1-1-1V9a1.003 1.003 0 0 1 1-1"
			}],
			"video": [{
				"fill": "#ff9800",
				"d": "m24 6 2 6h-4l-2-6h-3l2 6h-4l-2-6h-3l2 6H8L6 6H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V6Z"
			}],
			"vim": [{
				"fill": "#43a047",
				"d": "M22.19 4H16v4h2.19L12 14.19V8h2V4H2v4h2v20h4v-.01l.01.01L28 8V4z"
			}],
			"vite": [{
				"fill": "#a0f",
				"d": "M29.313 12h-6.664a1.427 1.427 0 0 1-1.1-2.24l4.398-6.676A.703.703 0 0 0 25.397 2H8.428a.62.62 0 0 0-.55.289l-5.77 8.627A.703.703 0 0 0 2.658 12h8.175a1.427 1.427 0 0 1 1.099 2.24l-4.48 6.676A.702.702 0 0 0 8 22l6.695.002A1.34 1.34 0 0 1 16 23.375v5.934a.652.652 0 0 0 1.168.433l12.694-16.586a.725.725 0 0 0-.55-1.156"
			}],
			"vitest": [{
				"fill": "#00e676",
				"d": "M15.438 29.636a.685.685 0 0 1-1.029.213L2.274 20.755A.65.65 0 0 1 2 20.187V9.175a.715.715 0 0 1 1.166-.568l7.404 5.612a1.47 1.47 0 0 0 2.125-.497l6.102-11.367A.72.72 0 0 1 19.414 2h9.872a.76.76 0 0 1 .617 1.137l-14.465 26.57Z"
			}],
			"vue": [{
				"fill": "#41b883",
				"d": "M1.791 3.851 12 21.471 22.209 3.936V3.85H18.24l-6.18 10.616L5.906 3.851z"
			}, {
				"fill": "#35495e",
				"d": "m5.907 3.851 6.152 10.617L18.24 3.851h-3.723L12.084 8.03 9.66 3.85z"
			}],
			"webpack": [
				{
					"fill": "#fafafa",
					"d": "m19.376 15.988-7.708 4.45-7.709-4.45v-8.9l7.709-4.451 7.708 4.45z"
				},
				{
					"fill": "#90caf9",
					"d": "M12.286 1.98c-.21 0-.41.059-.57.179l-7.9 4.44c-.32.17-.53.5-.53.88v9c0 .38.21.711.53.881l7.9 4.44c.16.12.36.18.57.18s.41-.06.57-.18l7.9-4.44c.32-.17.53-.5.53-.88v-9c0-.38-.21-.712-.53-.882l-7.9-4.44a.95.95 0 0 0-.57-.179zm0 2.15 7 3.94v2.103h-.016v5.177h.016v.54l-7 3.939-7-3.94V8.07zm0 2.08-4.9 2.83 4.9 2.83 4.9-2.83zm-5 5.08v3.58l4 2.309v-3.58l-4-2.31zm10 0-4 2.308v3.58l4-2.308z"
				},
				{
					"fill": "#0277bd",
					"d": "m12.286 6.21-4.9 2.83 4.9 2.83 4.9-2.83zm-5 5.08v3.58l4 2.309v-3.58l-4-2.31zm10 0-4 2.308v3.58l4-2.308z"
				}
			],
			"word": [{
				"fill": "#01579b",
				"d": "M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m7 1.5V9h5.5zM7 13l1.5 7h2l1.5-3 1.5 3h2l1.5-7h1v-2h-4v2h1l-.9 4.2L13 15h-2l-1.1 2.2L9 13h1v-2H6v2z"
			}],
			"xml": [{
				"fill": "#8bc34a",
				"d": "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m.12 13.5 3.74 3.74 1.42-1.41-2.33-2.33 2.33-2.33-1.42-1.41zm11.16 0-3.74-3.74-1.42 1.41 2.33 2.33-2.33 2.33 1.42 1.41z"
			}],
			"yaml": [{
				"fill": "#ff5252",
				"d": "M13 9h5.5L13 3.5zM6 2h8l6 6v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2m12 16v-2H9v2zm-4-4v-2H6v2z"
			}],
			"yarn": [{
				"fill": "#0288d1",
				"d": "M27.575 23.967a9.9 9.9 0 0 0-3.751 1.726 22.6 22.6 0 0 1-5.537 2.504 1.55 1.55 0 0 1-.931.52 59 59 0 0 1-6.11.548c-1.102.008-1.777-.282-1.965-.735a1.49 1.49 0 0 1 .82-1.965 3.6 3.6 0 0 1-.486-.359c-.163-.162-.334-.487-.385-.367-.213.52-.324 1.794-.897 2.366-.786.795-2.273.53-3.153.069-.965-.513.069-1.718.069-1.718a.69.69 0 0 1-.94-.324 4.6 4.6 0 0 1-.632-2.794 5.2 5.2 0 0 1 1.674-2.76 8.84 8.84 0 0 1 .624-4.17 9.9 9.9 0 0 1 3-3.469S7.136 11.015 7.82 9.177c.444-1.196.623-1.187.769-1.239a3.44 3.44 0 0 0 1.375-.811 4.99 4.99 0 0 1 4.178-1.607s1.094-3.357 2.12-2.7a17.4 17.4 0 0 1 1.452 2.735s1.213-.71 1.35-.445a10.74 10.74 0 0 1 .495 5.81 13.3 13.3 0 0 1-2.46 5.127c-.129.214 1.47.889 2.477 3.683.932 2.554.103 4.699.248 4.938.026.043.034.06.034.06s1.068.085 3.213-1.24a8.05 8.05 0 0 1 4.05-1.52 1.026 1.026 0 0 1 .453 2Z"
			}],
			"zig": [{
				"fill": "#f9a825",
				"d": "M2 8h6v4H2zm8 0h12v4H10zm0 12h12v4H10zm14 0h2v4h-2zM8 20l-3 4H2V12h4v8zm14-8h-6l-6 8h6z"
			}, {
				"fill": "#f9a825",
				"d": "M16 20h-6l-6 8m12-16h6l6-8m2 4v16h-4V12h-2l3-4z"
			}],
			"zip": [{
				"fill": "#afb42b",
				"d": "M14 17h-2v-2h-2v-2h2v2h2m0-6h-2v2h2v2h-2v-2h-2V9h2V7h-2V5h2v2h2m5-4H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"
			}],
			"folder-src-open": [{
				"fill": "#4caf50",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#c8e6c9",
				"d": "M9.225 15a.5.5 0 0 1-.12-.014.57.568 0 0 1-.414-.661l1.549-7.872a.566.565 0 0 1 .254-.372.53.53 0 0 1 .4-.067.57.57 0 0 1 .415.662l-1.552 7.872a.56.56 0 0 1-.253.371.53.53 0 0 1-.28.081m3.105-1h-.038a.54.54 0 0 1-.382-.206.583.582 0 0 1 .057-.774l2.664-2.483-2.653-2.312a.583.582 0 0 1-.08-.772.54.54 0 0 1 .377-.218.53.53 0 0 1 .406.129l3.126 2.727a.579.578 0 0 1 .002.862l-3.114 2.904a.536.535 0 0 1-.365.144zm-4.661 0a.536.535 0 0 1-.365-.146L4.186 10.95a.58.58 0 0 1-.005-.846l.01-.01 3.128-2.726a.516.515 0 0 1 .4-.13.54.54 0 0 1 .38.218.583.582 0 0 1-.08.773l-2.65 2.31 2.663 2.482a.579.578 0 0 1 .056.774.536.535 0 0 1-.381.206z"
			}],
			"folder-lib-open": [{
				"fill": "#c0ca33",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#f0f4c3",
				"d": "M11.5 8a1.5 1.5 0 0 0 .002-3H11.5A1.5 1.5 0 0 0 10 6.5 1.5 1.5 0 0 0 11.5 8m0 1.987C10.387 8.947 8.523 7.996 7 8v5c1.595 0 3.425 1.002 4.5 2 1.113-1.039 2.978-2.002 4.5-2V8c-1.522-.003-3.387.947-4.5 1.986"
			}],
			"folder-app-open": [{
				"fill": "#ef5350",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffcdd2",
				"d": "M8 6h2v2H8Zm3 0h2v2h-2zm3 0h2v2h-2ZM8 9h2v2H8Zm3 0h2v2h-2zm3 0h2v2h-2zm-6 3h2v2H8Zm3 0h2v2h-2zm3 0h2v2h-2z"
			}],
			"folder-vue-open": [
				{
					"fill": "#009688",
					"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
				},
				{
					"fill": "#41b883",
					"d": "m6 6 5 8 5-7.961V6h-1.944l-3.027 4.82L8.016 6Z"
				},
				{
					"fill": "#35495e",
					"d": "m8.015 6 3.014 4.821L14.055 6h-1.823L11.04 7.898 9.854 6Z"
				}
			],
			"folder-public-open": [{
				"fill": "#039be5",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#b3e5fc",
				"d": "M11 5a5 5 0 1 0 5 5 5 5 0 0 0-5-5m3.459 3H12.98a8 8 0 0 0-.671-1.77A4.02 4.02 0 0 1 14.459 8M11 6a7 7 0 0 1 .945 2h-1.89A7 7 0 0 1 11 6m-1.309.23A8 8 0 0 0 9.02 8H7.541a4.02 4.02 0 0 1 2.15-1.77M7.131 11a3.85 3.85 0 0 1 0-2h1.704a7.8 7.8 0 0 0 0 2zm.41 1H9.02a8 8 0 0 0 .671 1.77A4.02 4.02 0 0 1 7.541 12M11 14a7 7 0 0 1-.945-2h1.89A7 7 0 0 1 11 14m1.155-3h-2.31a6.7 6.7 0 0 1 0-2h2.31a6.7 6.7 0 0 1 0 2m.154 2.77A8 8 0 0 0 12.98 12h1.479a4.02 4.02 0 0 1-2.15 1.77m2.56-2.77h-1.704a7.8 7.8 0 0 0 0-2h1.704a3.85 3.85 0 0 1 0 2"
			}],
			"folder-resource-open": [{
				"fill": "#fbc02d",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#fff9c4",
				"d": "M9.5 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5zm.5 1h5v1h-5zM7 8v6.5a.5.5 0 0 0 .5.5H14v-1H8V8zm3 1h5v1h-5zm0 2h3v1h-3z"
			}],
			"folder-docs-open": [{
				"fill": "#0277bd",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#b3e5fc",
				"d": "M12 5H8.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8Zm0 8H9v-1h3zm2-2H9v-1h5zm-2.414-2.586V6L14 8.414Z"
			}],
			"folder-scripts-open": [{
				"fill": "#546e7a",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#cfd8dc",
				"d": "M14 6h-3a2 2 0 0 0-2 2v4h1V8h4v4.947a1.04 1.04 0 0 1-.832 1.04A1 1 0 0 1 12 13H8a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V8h1a2 2 0 0 0-2-2"
			}],
			"folder-config-open": [{
				"fill": "#00acc1",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#80deea",
				"d": "M11.5 12.075A1.6 1.6 0 0 1 9.882 10.5a1.62 1.62 0 1 1 1.62 1.575m3.437-1.138a4 4 0 0 0 .032-.438 4 4 0 0 0-.032-.45l.976-.733a.223.223 0 0 0 .056-.288l-.926-1.556a.23.23 0 0 0-.283-.1l-1.15.45a3.4 3.4 0 0 0-.783-.44l-.171-1.193A.23.23 0 0 0 12.425 6h-1.85a.23.23 0 0 0-.231.189l-.171 1.193a3.4 3.4 0 0 0-.781.44l-1.152-.45a.23.23 0 0 0-.282.1l-.926 1.556a.22.22 0 0 0 .056.288l.975.734a4 4 0 0 0-.032.45 4 4 0 0 0 .032.437l-.975.746a.22.22 0 0 0-.056.288l.925 1.558a.235.235 0 0 0 .283.099l1.152-.455a3.2 3.2 0 0 0 .781.446l.171 1.192a.23.23 0 0 0 .232.189h1.85a.23.23 0 0 0 .232-.189l.17-1.192a3.4 3.4 0 0 0 .783-.446l1.15.455a.24.24 0 0 0 .284-.1l.924-1.557a.223.223 0 0 0-.055-.288Z"
			}],
			"folder-test-open": [{
				"fill": "#00bfa5",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#a7ffeb",
				"d": "M8 6v1h1v6a2 2 0 0 0 4 0V7h1V6Zm2.5 7a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5m1-2a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5m.5-2h-2V7h2z"
			}],
			"folder-coverage-open": [{
				"fill": "#26a69a",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#b2dfdb",
				"d": "m11.722 11.633-1.555-1.578.548-.556 1.007 1.017 2.563-2.6.548.56M12.5 5 9 7v2.265A4.9 4.9 0 0 0 12.5 14 4.9 4.9 0 0 0 16 9.265V7Z"
			}],
			"folder-dist-open": [{
				"fill": "#e57373",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffcdd2",
				"d": "M15 7h-2V6l-1-1h-2L9 6v1H7a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1m-5 0V6h2v1z"
			}],
			"folder-node-open": [{
				"fill": "#8bc34a",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#dcedc8",
				"d": "M12.5 6 9 8.036v3.927L12.5 14l3.5-2.037V8.036Z"
			}],
			"folder-target-open": [{
				"fill": "#546e7a",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#cfd8dc",
				"d": "M14.576 5 12.44 7.137l-.355 1.066-.81.812a1 1 0 0 0-.499-.005l-.037.011a1 1 0 0 0-.183.073l-.055.029a1.007 1.007 0 1 0 1.377 1.377q.015-.027.027-.055a1 1 0 0 0 .075-.184l.011-.037a1 1 0 0 0-.006-.498l.81-.81 1.07-.356L16 6.424h-1.424zm-3.806.006a5 5 0 1 0 4.884 3.168l-.79.79a4 4 0 1 1-2.83-2.827l.792-.791a5 5 0 0 0-2.056-.34m.138 1.996a3 3 0 1 0 3.074 2.668l-.994.109a2 2 0 1 1-1.767-1.767l.11-.995a3 3 0 0 0-.423-.015"
			}],
			"folder-theme-open": [{
				"fill": "#1e88e5",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#bbdefb",
				"d": "M10.999 5C8 5 6 7 6 10a5 5 0 0 0 5 5c.46 0 1 0 1-1 0-.218-.284-.392-.482-.59A1.19 1.19 0 0 1 11 12.5c0-.5.5-.5 1-.5h2c2 0 2-2 2-3 0-2-2-4-5.001-4M8 10a1 1 0 1 1 1-1 1 1 0 0 1-1 1m3-2a1 1 0 1 1 1-1 1 1 0 0 1-1 1m3 2a1 1 0 1 1 1-1 1 1 0 0 1-1 1"
			}],
			"folder-typescript-open": [{
				"fill": "#0288d1",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#90caf9",
				"d": "M12 9.535a.665.664 0 0 0 .15.52 1.25 1.248 0 0 0 .305.14c.27.09.665.184 1.045.309 1.32.44 1.48 1.159 1.495 1.743q.006.119.005.23v.024c0 .53-.23 1.394-1.72 1.489q-.096.006-.185.005A.5.5 0 0 1 13 14h-2v-.88l.12-.12H13a1 .999 0 0 0 .125-.004h.085c.09-.005.165-.015.235-.02a1 .999 0 0 0 .135-.03q.051-.015.095-.03a.02.02 0 0 0 .015-.005c.245-.09.295-.225.305-.33l.005-.08c0-.16-.34-.614-1.5-.998-1.37-.455-1.49-1.209-1.495-1.803A.3.3 0 0 1 11 9.635v-.13a1.425 1.423 0 0 1 .225-.794c.02-.03.035-.055.055-.08.005-.005.005-.01.01-.015a.5.5 0 0 1 .09-.1 2.15 2.147 0 0 1 1.575-.509H15v.999h-2q-.098-.001-.195.005c-.59.03-.745.2-.79.35a.1.1 0 0 0-.005.03.5.5 0 0 0-.01.114zM9 14H8V9.006H6v-.999h5v.999H9Z"
			}],
			"folder-tools-open": [{
				"fill": "#1e88e5",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#bbdefb",
				"d": "M12.182 9.506 6.682 15 6 14.319l5.494-5.5Zm2.182-1.408.287-.288-.385-.384.312-.312-.692-.691-.311.311-.385-.385-.287.288A10.3 10.3 0 0 0 10.078 5l-.405.872a12.3 12.3 0 0 1 2.368 1.627l-.244.244 1.461 1.461.244-.244a12.3 12.3 0 0 1 1.626 2.368l.872-.404a10.3 10.3 0 0 0-1.636-2.825"
			}],
			"folder-utils-open": [{
				"fill": "#7cb342",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#dcedc8",
				"d": "M9.5 6a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5zM12 7h1v2h2v1h-2v2h-1v-2h-2V9h2zM7 8v6.5a.5.5 0 0 0 .5.5H14v-1H8V8z"
			}],
			"folder-examples-open": [{
				"fill": "#009688",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#b2dfdb",
				"d": "M8 7v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1m1 0h1a1 1 0 0 1-1 1Zm0 2a2 2 0 0 0 2-2h1a3.003 3.003 0 0 1-3 3zm0 4 2-2 .8.8L13 10l2 3z"
			}],
			"folder-migrations-open": [{
				"fill": "#ec407a",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#f8bbd0",
				"d": "M12 5c-1.705 0-3.155.535-3.73 1.285l2.625 2.625c.355.055.715.09 1.105.09 2.21 0 4-.895 4-2s-1.79-2-4-2M8 7v2H6v1h2v2l2.42-2.5M16 8c0 1.105-1.79 2-4 2-.33 0-.65-.025-.955-.065L9.81 11.17c.63.205 1.38.33 2.19.33 2.21 0 4-.895 4-2m0 1c0 1.105-1.79 2-4 2-1.14 0-2.165-.25-2.895-.625l-.84.84C8.84 13.465 10.295 14 12 14c2.21 0 4-.895 4-2"
			}],
			"folder-database-open": [{
				"fill": "#ffca28",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffecb3",
				"d": "M12 5a4 2 0 0 0-4 2 4 2 0 0 0 4 2 4 2 0 0 0 4-2 4 2 0 0 0-4-2M8 8v2c0 1.105 1.791 2 4 2s4-.895 4-2V8c0 1.105-1.791 2-4 2s-4-.895-4-2m0 3v2c0 1.105 1.791 2 4 2s4-.895 4-2v-2c0 1.105-1.791 2-4 2s-4-.895-4-2"
			}],
			"folder-images-open": [{
				"fill": "#009688",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#b2dfdb",
				"d": "M12 5H8.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V8Zm-2 3a1 1 0 1 1-1 1 1.005 1.005 0 0 1 1-1m4 5H9l2-2 1 1 2-2zm-2.414-4.586V6L14 8.414Z"
			}],
			"folder-font-open": [{
				"fill": "#ff5252",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffcdd2",
				"d": "M12.039 6h-1.077L8 14h1.211L10 12h3l.789 2H15Zm-1.82 5L11.5 7.382 12.776 11Z"
			}],
			"folder-video-open": [{
				"fill": "#ff9800",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffe0b2",
				"d": "m14 7 1 2h-1l-1-2h-1l1 2h-1l-1-2h-1l1 2h-1L9 7H8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7.25a.25.25 0 0 0-.25-.25Z"
			}],
			"folder-audio-open": [{
				"fill": "#ef5350",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffcdd2",
				"d": "M15.75 6h-2.5a.25.25 0 0 0-.25.25v4.027a1.95 1.95 0 0 0-1.615-.179 2 2 0 0 0 .928 3.877A2.05 2.05 0 0 0 14 11.923V8h1.75a.25.25 0 0 0 .25-.25v-1.5a.25.25 0 0 0-.25-.25"
			}],
			"folder-api-open": [{
				"fill": "#fbc02d",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#fffde7",
				"d": "M10 9H8v1h3V7h-1zm4 0V7h-1v3h3V9Zm-6 4h2v2h1v-3H8Zm5 0v2h1v-2h2v-1h-3z"
			}],
			"folder-routes-open": [{
				"fill": "#43a047",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#c8e6c9",
				"d": "M8.707 7.293 10 6H6v4l1.293-1.293 2.455 2.455a.85.85 0 0 1 .252.608V14h2v-2.23a2.84 2.84 0 0 0-.838-2.022ZM14.68 6l-2.805 2.465.285.285a2.8 2.8 0 0 1 .78 1.445L16 7.505Z"
			}],
			"folder-views-open": [{
				"fill": "#ff7043",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffccbc",
				"d": "m7 6 1 8 3.5 1 3.5-1 1-8zm4 2.95L9.33 10 11 11.051V12l-2.617-1.693v-.614L11 8Zm3.618 1.364L12 12v-.949L13.681 10 12 8.95V8l2.618 1.687z"
			}],
			"folder-class-open": [{
				"fill": "#ef5350",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#ffcdd2",
				"d": "M8 6v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1m7 7H9v-2h6zm0-3H9V8h6z"
			}],
			"folder-controller-open": [{
				"fill": "#ffc107",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#fff9c4",
				"d": "M11.5 12.075A1.6 1.6 0 0 1 9.88 10.5a1.62 1.62 0 1 1 1.62 1.575m3.438-1.138a4 4 0 0 0 .032-.437 4 4 0 0 0-.032-.45l.976-.734a.223.223 0 0 0 .056-.288l-.927-1.556a.23.23 0 0 0-.282-.1l-1.15.45a3.4 3.4 0 0 0-.783-.44l-.171-1.193A.23.23 0 0 0 12.425 6h-1.85a.23.23 0 0 0-.232.189l-.17 1.193a3.4 3.4 0 0 0-.782.44l-1.152-.45a.23.23 0 0 0-.282.1l-.925 1.556a.22.22 0 0 0 .056.288l.975.734a4 4 0 0 0-.032.45 4 4 0 0 0 .032.437l-.975.746a.22.22 0 0 0-.056.288l.925 1.558a.235.235 0 0 0 .282.099l1.152-.455a3.2 3.2 0 0 0 .782.446l.17 1.192a.23.23 0 0 0 .232.189h1.85a.23.23 0 0 0 .232-.189l.17-1.192a3.4 3.4 0 0 0 .783-.446l1.151.455a.24.24 0 0 0 .283-.1l.926-1.557a.223.223 0 0 0-.056-.288z"
			}],
			"folder-middleware-open": [{
				"fill": "#5c6bc0",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#c5cae9",
				"d": "M15.054 10H16V8a1 1 0 0 0-1-1h-2V6a1 1 0 0 0-2 0v1H9a1 1 0 0 0-1 1v2H7a1 1 0 0 0 0 2h1v2a1 1 0 0 0 1 1h2v-.946a1.04 1.04 0 0 1 .832-1.04A1 1 0 0 1 13 14v1h2a1 1 0 0 0 1-1v-2h-1a1 1 0 0 1-.986-1.168 1.04 1.04 0 0 1 1.04-.832"
			}],
			"folder-plugin-open": [{
				"fill": "#0288d1",
				"d": "M14.483 6H4.721a1 1 0 0 0-.949.684L2 12V5h12a1 1 0 0 0-1-1H7.562a1 1 0 0 1-.64-.232l-.644-.536A1 1 0 0 0 5.638 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11l2.403-5.606A1 1 0 0 0 14.483 6"
			}, {
				"fill": "#b3e5fc",
				"d": "M15.054 10H16V8a1 1 0 0 0-1-1h-2V6a1 1 0 0 0-2 0v1H9a1 1 0 0 0-1 1v2H7a1 1 0 0 0 0 2h1v2a1 1 0 0 0 1 1h2v-.946a1.04 1.04 0 0 1 .832-1.04A1 1 0 0 1 13 14v1h2a1 1 0 0 0 1-1v-2h-1a1 1 0 0 1-.986-1.168 1.04 1.04 0 0 1 1.04-.832"
			}]
		};
		/** Special whole file names (lowercase) to icon names. */
		const MATERIAL_FILE_NAMES = {
			"package.json": "nodejs",
			"package-lock.json": "nodejs",
			"pnpm-lock.yaml": "pnpm",
			"yarn.lock": "yarn",
			"pnpm-workspace.yaml": "pnpm",
			".npmrc": "npm",
			".nvmrc": "nodejs",
			".node-version": "nodejs",
			"tsconfig.json": "tsconfig",
			"jsconfig.json": "jsconfig",
			"vite.config.ts": "vite",
			"vitest.config.ts": "vitest",
			"tailwind.config.js": "tailwindcss",
			"webpack.config.js": "webpack",
			"rollup.config.js": "rollup",
			"babel.config.js": "babel",
			".babelrc": "babel",
			".eslintrc": "eslint",
			".eslintrc.json": "eslint",
			".prettierrc": "prettier",
			"dockerfile": "docker",
			"docker-compose.yml": "docker",
			"docker-compose.yaml": "docker",
			"compose.yml": "docker",
			"compose.yaml": "docker",
			"makefile": "makefile",
			"rakefile": "ruby",
			"justfile": "just",
			"gradlew": "gradle",
			"go.mod": "go-mod",
			"go.sum": "go-mod",
			"go.work": "go-mod",
			"requirements.txt": "python-misc",
			"pyproject.toml": "python-misc",
			"poetry.lock": "poetry",
			"readme.md": "readme",
			"readme": "readme",
			"license": "license",
			"licence": "license",
			"changelog.md": "changelog",
			"changelog": "changelog",
			"contributing.md": "contributing",
			"code_of_conduct.md": "conduct",
			".gitignore": "git",
			".gitattributes": "git",
			".gitmodules": "git",
			".gitkeep": "git",
			".editorconfig": "editorconfig",
			".env.local": "tune",
			".env.example": "tune",
			"gemfile": "gemfile",
			"meson.build": "meson",
			"svelte.config.js": "svelte",
			"astro.config.mjs": "astro-config",
			"next.config.js": "next",
			"nuxt.config.ts": "nuxt",
			"angular.json": "angular",
			"azure-pipelines.yml": "azure-pipelines"
		};
		/** File extensions (lowercase, no dot) to icon names. */
		const MATERIAL_FILE_EXTS = {
			"ts": "typescript",
			"cts": "typescript",
			"mts": "typescript",
			"tsx": "qwik",
			"js": "javascript",
			"mjs": "javascript",
			"cjs": "javascript",
			"jsx": "react",
			"vue": "vue",
			"svelte": "svelte",
			"astro": "astro",
			"html": "html",
			"htm": "html",
			"css": "css",
			"scss": "sass",
			"sass": "sass",
			"less": "less",
			"md": "markdown",
			"markdown": "markdown",
			"mdx": "mdx",
			"json": "json",
			"jsonc": "json",
			"json5": "json",
			"yaml": "yaml",
			"yml": "yaml",
			"toml": "toml",
			"ini": "settings",
			"properties": "settings",
			"xml": "xml",
			"sql": "database",
			"prisma": "prisma",
			"py": "python",
			"pyi": "python",
			"rs": "rust",
			"go": "go",
			"java": "java",
			"swift": "swift",
			"c": "c",
			"h": "h",
			"cpp": "cpp",
			"hpp": "hpp",
			"cc": "cpp",
			"cxx": "cpp",
			"cs": "csharp",
			"rb": "ruby",
			"php": "php",
			"pl": "prolog",
			"pm": "perl",
			"lua": "lua",
			"r": "r",
			"dart": "dart",
			"scala": "scala",
			"ex": "elixir",
			"exs": "elixir",
			"hs": "haskell",
			"elm": "elm",
			"nim": "nim",
			"zig": "zig",
			"clj": "clojure",
			"cljs": "clojure",
			"sh": "console",
			"bash": "console",
			"zsh": "console",
			"fish": "console",
			"ps1": "powershell",
			"bat": "console",
			"cmd": "console",
			"vim": "vim",
			"csv": "table",
			"tsv": "table",
			"xlsx": "table",
			"xls": "table",
			"parquet": "database",
			"sqlite": "database",
			"db": "database",
			"pdf": "pdf",
			"doc": "word",
			"docx": "word",
			"ppt": "powerpoint",
			"pptx": "powerpoint",
			"tex": "tex",
			"bib": "bibliography",
			"rst": "markdown",
			"adoc": "asciidoc",
			"txt": "document",
			"log": "log",
			"lock": "lock",
			"env": "tune",
			"png": "image",
			"jpg": "image",
			"jpeg": "image",
			"gif": "image",
			"svg": "svg",
			"webp": "image",
			"bmp": "image",
			"ico": "image",
			"avif": "image",
			"tiff": "image",
			"woff": "font",
			"woff2": "font",
			"ttf": "font",
			"otf": "font",
			"mp3": "audio",
			"wav": "audio",
			"flac": "audio",
			"mp4": "video",
			"mkv": "video",
			"mov": "video",
			"webm": "video",
			"zip": "zip",
			"tar": "zip",
			"gz": "zip",
			"tgz": "zip",
			"bz2": "zip",
			"xz": "zip",
			"7z": "zip",
			"rar": "zip",
			"zst": "zip",
			"patch": "git",
			"diff": "diff"
		};
		/** Special folder names (lowercase, no trailing slash) to closed-icon names. */
		const MATERIAL_FOLDER_NAMES = {
			"src": "folder-src",
			"source": "folder-src",
			"lib": "folder-lib",
			"libs": "folder-lib",
			"app": "folder-app",
			"apps": "folder-app",
			"components": "folder-vue",
			"public": "folder-public",
			"static": "folder-resource",
			"assets": "folder-resource",
			"docs": "folder-docs",
			"doc": "folder-docs",
			"scripts": "folder-scripts",
			"config": "folder-config",
			"configs": "folder-config",
			"test": "folder-test",
			"tests": "folder-test",
			"spec": "folder-test",
			"e2e": "folder-coverage",
			"coverage": "folder-coverage",
			"dist": "folder-dist",
			"out": "folder-dist",
			"build": "folder-dist",
			"release": "folder-dist",
			"bin": "folder-dist",
			"node_modules": "folder-node",
			"vendor": "folder-lib",
			"target": "folder-target",
			"themes": "folder-theme",
			"types": "folder-typescript",
			"typings": "folder-typescript",
			"tools": "folder-tools",
			"utils": "folder-utils",
			"examples": "folder-examples",
			"example": "folder-examples",
			"migrations": "folder-migrations",
			"data": "folder-database",
			"database": "folder-database",
			"images": "folder-images",
			"img": "folder-images",
			"fonts": "folder-font",
			"media": "folder-video",
			"video": "folder-video",
			"audio": "folder-audio",
			"api": "folder-api",
			"routes": "folder-routes",
			"pages": "folder-views",
			"views": "folder-views",
			"models": "folder-class",
			"services": "folder-controller",
			"controllers": "folder-controller",
			"middleware": "folder-middleware",
			"plugins": "folder-plugin",
			"extensions": "folder-plugin"
		};
		/** Default icon names. */
		const MATERIAL_FILE_DEFAULT = "file";
		const MATERIAL_FOLDER = "folder";
		const MATERIAL_FOLDER_OPEN = "folder-open";
		//#endregion
		//#region src/rules/tree-icons.ts
		/**
		* File/folder icon resolution for the tree fence, aligned with the Material
		* Icon Theme associations (curated inline copy: material-icons.generated.ts).
		* Special whole names first, then the basename, then the extension family,
		* then the generic document. Folder names resolve through the folder table
		* with an open variant per glyph.
		*/
		const GENERIC = {
			name: MATERIAL_FILE_DEFAULT,
			paths: MATERIAL_PATHS[MATERIAL_FILE_DEFAULT]
		};
		const FOLDER = {
			name: MATERIAL_FOLDER,
			paths: MATERIAL_PATHS[MATERIAL_FOLDER]
		};
		const FOLDER_OPEN = {
			name: MATERIAL_FOLDER_OPEN,
			paths: MATERIAL_PATHS[MATERIAL_FOLDER_OPEN]
		};
		function iconFor(name) {
			if (name === void 0) return void 0;
			const paths = MATERIAL_PATHS[name];
			return paths === void 0 ? void 0 : {
				name,
				paths
			};
		}
		/**
		* @param name - file name (folders arrive only without their trailing slash).
		* @returns the material icon for the name; the generic document as fallback.
		*/
		function fileIcon(name) {
			const lower = name.toLowerCase();
			const dot = lower.lastIndexOf(".");
			const ext = dot === -1 ? "" : lower.slice(dot + 1);
			const base = dot === -1 ? lower : lower.slice(0, dot);
			return iconFor(MATERIAL_FILE_NAMES[lower]) ?? iconFor(MATERIAL_FILE_NAMES[base]) ?? iconFor(MATERIAL_FILE_EXTS[ext]) ?? GENERIC;
		}
		/**
		* @param name - folder name without its trailing slash.
		* @param open - whether the folder is expanded (the open glyph variant).
		* @returns the material folder icon; the default folder pair as fallback.
		*/
		function folderIcon(name, open) {
			const base = MATERIAL_FOLDER_NAMES[name.toLowerCase()];
			if (base === void 0) return open ? FOLDER_OPEN : FOLDER;
			return iconFor(open ? `${base}-open` : base) ?? (open ? FOLDER_OPEN : FOLDER);
		}
		//#endregion
		//#region src/components/TreeView.tsx
		/**
		* Tree: the explicit `tree` fence as a vertical indented forest with guide
		* lines, collapsible folders (default expanded, component-local state), and
		* Material Icon Theme file/folder glyphs (curated inline copy). Long names
		* scroll horizontally and show the full name on hover.
		*/
		/** One material glyph: 16x16 filled paths at native VS Code size. */
		function TreeGlyph({ icon }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: "16",
				height: "16",
				"aria-hidden": true,
				className: "dshr-tree-icon",
				children: icon.paths.map((path, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					fill: path.fill,
					d: path.d
				}, index))
			});
		}
		/** One row: icon plus name; folders toggle their children. */
		function Row({ entry, path, expanded, toggle }) {
			const key = `${path}/${entry.name}`;
			const open = expanded.has(key);
			const name = entry.name.replace(/\/$/u, "");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-tree-row",
				role: "treeitem",
				"aria-expanded": entry.folder ? open : void 0,
				children: [
					entry.folder ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshr-tree-toggle",
						onClick: () => toggle(key),
						children: open ? "▾" : "▸"
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshr-tree-toggle",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeGlyph, { icon: entry.folder ? folderIcon(name, open) : fileIcon(name) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshr-tree-name",
						title: entry.name,
						children: entry.name
					})
				]
			}), entry.folder && open && entry.children.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-tree-children",
				role: "group",
				children: entry.children.map((child, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					entry: child,
					path: key,
					expanded,
					toggle
				}, index))
			})] });
		}
		/** Collect every folder path (default expanded). */
		function allFolderPaths(entries, path, into) {
			for (const entry of entries) {
				const key = `${path}/${entry.name}`;
				if (entry.folder) {
					into.add(key);
					allFolderPaths(entry.children, key, into);
				}
			}
		}
		/** Draw the forest. */
		function TreeView({ segment }) {
			const [expanded, setExpanded] = (0, react.useState)(() => {
				const initial = /* @__PURE__ */ new Set();
				allFolderPaths(segment.trees, "", initial);
				return initial;
			});
			const toggle = (path) => {
				setExpanded((prev) => {
					const next = new Set(prev);
					if (next.has(path)) next.delete(path);
					else next.add(path);
					return next;
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-tree dshr-fence",
				role: "tree",
				children: segment.trees.map((entry, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
					entry,
					path: "",
					expanded,
					toggle
				}, index))
			});
		}
		//#endregion
		//#region src/components/RichMarkdownText.tsx
		/**
		* One assistant text block through the upgrade pipeline.
		*
		* While the message streams the block renders exactly like the shipped
		* AssistantMarkdown path (platform MarkdownText with the streaming parser);
		* once settled, the rule engine segments the text and each upgraded segment
		* renders as its rich component inside a local error boundary — a component
		* failure degrades that segment to native markdown instead of crashing the
		* transcript (the slot's own abdication then covers a total failure).
		*/
		/** Render one segment spec; the error boundary below wraps the result. */
		function SegmentView({ segment, labels, mentions, chrome }) {
			switch (segment.kind) {
				case "native": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: segment.text,
					labels,
					fileMentions: mentions,
					pathImages
				});
				case "cards": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardsView, {
					segment,
					labels
				});
				case "callout": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CalloutView, {
					segment,
					labels,
					titles: chrome.calloutTitles
				});
				case "table": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TableDualView, {
					segment,
					chartLabels: chrome,
					labels
				});
				case "timeline": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimelineView, {
					segment,
					labels
				});
				case "mindmap": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MindmapView, {
					segment,
					labels
				});
				case "checklist": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChecklistView, {
					segment,
					labels,
					chrome
				});
				case "tree": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeView, { segment });
				case "stack": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StackView, {
					segment,
					labels
				});
				case "tab": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TabView, {
					segment,
					labels
				});
				case "choices": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoicesView, {
					segment,
					labels,
					mentions,
					chrome
				});
				case "matplotlib": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MatplotlibView, {
					segment,
					labels,
					chrome
				});
				case "image": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImageView, {
					segment,
					chrome
				});
				default: return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: JSON.stringify(segment),
					labels
				});
			}
		}
		/** Error boundary degrading the failing segment to native markdown. */
		var SegmentBoundary = class extends react.Component {
			state = { failed: false };
			static getDerivedStateFromError() {
				return { failed: true };
			}
			render() {
				return this.state.failed ? this.props.fallback : this.props.children;
			}
		};
		/** One text block: native while streaming, rule-upgraded once settled. */
		const RichMarkdownText = (0, react.memo)(function RichMarkdownText({ text, streaming, labels, mentions, chrome }) {
			if (streaming) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
				text,
				streaming: true,
				labels
			});
			let segments;
			try {
				segments = upgradeText(rewritePathImages(text));
			} catch {
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: rewritePathImages(text),
					labels,
					fileMentions: mentions,
					pathImages
				});
			}
			if (segments.length === 1 && segments[0]?.kind === "native") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
				text: segments[0].text,
				labels,
				fileMentions: mentions,
				pathImages
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: segments.map((segment, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SegmentBoundary, {
				fallback: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: segment.source,
					labels,
					fileMentions: mentions,
					pathImages
				}),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SegmentView, {
					segment,
					labels,
					mentions,
					chrome
				})
			}, index)) });
		});
		//#endregion
		//#region src/use-searchable-hidden.ts
		/**
		* Apply searchable hidden state without unmounting a stable subtree.
		* Local copy of ui-chat's searchable-hidden.ts (not reachable from a
		* module-table package); keep behavior in sync when diffing upgrades.
		*/
		/**
		* @param hidden - whether the subtree is currently hidden.
		* @param reveal - callback for browser find's `beforematch` reveal.
		* @returns ref for the stable subtree root.
		*/
		function useSearchableHidden(hidden, reveal) {
			const ref = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				const element = ref.current;
				if (element === null) return;
				if (hidden && element.contains(element.ownerDocument.activeElement)) {
					reveal();
					return;
				}
				if (hidden) element.setAttribute("hidden", "until-found");
				else element.removeAttribute("hidden");
			}, [hidden, reveal]);
			(0, react.useEffect)(() => {
				const element = ref.current;
				if (element === null) return;
				element.addEventListener("beforematch", reveal);
				return () => {
					element.removeEventListener("beforematch", reveal);
				};
			}, [reveal]);
			return ref;
		}
		//#endregion
		//#region src/components/RichAssistantNodeView.tsx
		/**
		* The assistant-step keyed renderer: a high-fidelity replica of ui-chat's
		* AssistantNodeView + AssistantMarkdown that swaps one thing only — settled
		* text blocks go through RichMarkdownText (native MarkdownText while
		* streaming, rule-upgraded segments once settled).
		*
		* Everything else mirrors the shipped behavior: block-kind split, groupPart
		* filtering, hasVisible shell skip, interrupted stopped marker, reasoning
		* disclosure with turn-process folding, image galleries through the seat's
		* renderer, and unknown blocks as JSON cards. Diff upstream when upgrading
		* dsh: AssistantNodeView.tsx, AssistantMarkdown.tsx in
		* packages/client/ui-chat/src/client/chat/.
		*/
		const NOOP = () => {};
		/** Streaming, settled, and interrupted Assistant states share one renderer. */
		const RichAssistantNodeView = (0, react.memo)(function RichAssistantNodeView({ node, groupPart, useDisclosure, useTurnData, turnProcess, openFile, renderMessageImages, fileMentions, t }) {
			const data = node.data;
			const turn = node.location.kind === "turn" || node.location.kind === "step" ? node.location.turn : void 0;
			const tail = useTurnData("turn-tail");
			const owner = (0, react.useMemo)(() => {
				if (turn?.status !== "closed" || data.finalNode === void 0) return void 0;
				if (tail?.closing?.finalNode.seq !== data.finalNode.seq) return void 0;
				return {
					turn,
					seq: data.finalNode.seq,
					openFile
				};
			}, [
				data.finalNode,
				openFile,
				tail,
				turn
			]);
			const mentions = (0, react.useMemo)(() => owner === void 0 ? void 0 : fileMentions(owner), [fileMentions, owner]);
			const reasoningHidden = turnProcess !== void 0 && turnProcess.foldable && turnProcess.spec.answerStep === data.step && turnProcess.spec.inlineReasoning && !turnProcess.open;
			const revealProcess = (0, react.useCallback)(() => {
				turnProcess?.setOpen(true);
			}, [turnProcess]);
			const labels = (0, react.useMemo)(() => markdownLabels(t), [t]);
			const chrome = (0, react.useMemo)(() => ({
				table: t("viewTable"),
				chart: t("viewChart"),
				downloadChart: t("downloadChart"),
				otherSlice: t("otherSlice"),
				checklistTitle: t("checklistTitle"),
				checklistProgress: t("checklistProgress"),
				mplCode: t("mplCode"),
				mplChart: t("mplChart"),
				mplDownload: t("mplDownload"),
				mplRunning: t("mplRunning"),
				mplFailed: t("mplFailed"),
				mplDownloadPng: t("mplDownloadPng"),
				imageCopy: t("imageCopy"),
				imageCopied: t("imageCopied"),
				imageCopyFailed: t("imageCopyFailed"),
				imagePreviewFailed: t("imagePreviewFailed"),
				calloutTitles: {
					note: t("calloutNote"),
					tip: t("calloutTip"),
					important: t("calloutImportant"),
					warning: t("calloutWarning"),
					caution: t("calloutCaution")
				}
			}), [t]);
			const streaming = data.status === "running";
			const interrupted = data.status === "interrupted";
			const last = data.blocks.length - 1;
			if (!(streaming || interrupted || data.blocks.some((block) => block.kind !== "tool-call"))) return null;
			const rendered = [];
			for (let i = 0; i < data.blocks.length; i++) {
				const block = data.blocks[i];
				if (block === void 0) continue;
				if (groupPart === "reasoning" && block.kind !== "reasoning") continue;
				if (groupPart === "response" && block.kind === "reasoning") continue;
				switch (block.kind) {
					case "text":
						rendered.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RichMarkdownText, {
							text: block.text,
							streaming,
							labels,
							mentions,
							chrome
						}, i));
						break;
					case "reasoning":
						rendered.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProcessReasoning, {
							hidden: reasoningHidden,
							reveal: revealProcess,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReasoningRow, {
								text: block.text,
								running: streaming && i === last,
								useDisclosure,
								t
							})
						}, i));
						break;
					case "image": {
						const start = i;
						const group = [block];
						while (i + 1 < data.blocks.length) {
							const next = data.blocks[i + 1];
							if (next === void 0 || next.kind !== "image") break;
							group.push(next);
							i += 1;
						}
						rendered.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(react.Fragment, { children: renderMessageImages({
							images: group.map(({ attachment }) => ({ attachment })),
							align: "start"
						}) }, start));
						break;
					}
					case "tool-call": break;
					default: rendered.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
						label: t("unknownBlock"),
						payload: block.block,
						truncatedLabel: (total) => t("truncated", { total })
					}, i));
				}
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshr-flow-root",
				"data-streaming": streaming || void 0,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshr-flow-body",
					children: [rendered, interrupted && (groupPart === void 0 || groupPart === "response" || !data.blocks.some((block) => block.kind !== "reasoning" && block.kind !== "tool-call")) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshr-stopped",
						children: t("stopped")
					})]
				})
			});
		});
		function ProcessReasoning({ hidden, reveal, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: useSearchableHidden(hidden, reveal ?? NOOP),
				"data-turn-process-inline": hidden || void 0,
				children
			});
		}
		//#endregion
		//#region src/watermark-config.ts
		const DEFAULT_WATERMARK = {
			enabled: false,
			image: "",
			opacity: .12,
			corner: "br",
			size: 42
		};
		const STORAGE_KEY = "dsh-rich-render:watermark";
		const CORNERS = [
			"tl",
			"tr",
			"bl",
			"br"
		];
		function clamp(value, min, max) {
			return Math.min(max, Math.max(min, value));
		}
		/**
		* Read the stored config, validating every field against its contract.
		* @returns the effective config; defaults when nothing (valid) is stored.
		*/
		function readWatermark() {
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw === null) return DEFAULT_WATERMARK;
				const value = JSON.parse(raw);
				return {
					enabled: value.enabled === true,
					image: typeof value.image === "string" ? value.image : DEFAULT_WATERMARK.image,
					opacity: typeof value.opacity === "number" && Number.isFinite(value.opacity) ? clamp(value.opacity, 0, 1) : DEFAULT_WATERMARK.opacity,
					corner: CORNERS.includes(value.corner) ? value.corner : DEFAULT_WATERMARK.corner,
					size: typeof value.size === "number" && Number.isFinite(value.size) ? clamp(value.size, 10, 80) : DEFAULT_WATERMARK.size
				};
			} catch {
				return DEFAULT_WATERMARK;
			}
		}
		/**
		* Persist one config revision; storage failures are swallowed (the live
		* session keeps working from state).
		* @param config - the config to store.
		*/
		function writeWatermark(config) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
			} catch {}
		}
		//#endregion
		//#region src/components/WatermarkLayer.tsx
		/**
		* Watermark background layer (shell.overlay list entry): a corner-anchored,
		* bleached (grayscale + multiply), low-opacity image that never carries
		* pointer events, plus a tiny corner gear that opens the settings popover.
		* Pure decoration: any failure leaves nothing painted.
		*/
		const CORNER_OPTIONS = [
			{
				value: "tl",
				labelKey: "wmCornerTl"
			},
			{
				value: "tr",
				labelKey: "wmCornerTr"
			},
			{
				value: "bl",
				labelKey: "wmCornerBl"
			},
			{
				value: "br",
				labelKey: "wmCornerBr"
			}
		];
		const GEAR_PATH = "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z";
		/** The settings popover: the four knobs, persisted on change. */
		function WatermarkSettings({ config, onChange, onClose, t }) {
			const fileRef = (0, react.useRef)(null);
			const pickImage = (0, react.useCallback)(() => {
				fileRef.current?.click();
			}, []);
			const onFile = (0, react.useCallback)((event) => {
				const file = event.target.files?.[0];
				if (file === void 0) return;
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result === "string") onChange({
						...config,
						image: reader.result,
						enabled: true
					});
				};
				reader.readAsDataURL(file);
			}, [config, onChange]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-wm-panel",
				role: "dialog",
				"aria-label": t("wmTitle"),
				onPointerDown: (event) => event.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-wm-panel-row dshr-wm-panel-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshr-wm-panel-title",
							children: t("wmTitle")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshr-wm-close",
							"aria-label": t("wmClose"),
							onClick: onClose,
							children: "×"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dshr-wm-panel-row",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: config.enabled,
							onChange: (event) => onChange({
								...config,
								enabled: event.target.checked
							})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("wmEnable") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-wm-panel-row dshr-wm-panel-col",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("wmImage") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshr-wm-image-row",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "text",
									className: "dshr-wm-input",
									placeholder: "https://…",
									value: config.image.startsWith("data:") ? "" : config.image,
									onChange: (event) => onChange({
										...config,
										image: event.target.value
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dshr-wm-button",
									onClick: pickImage,
									children: t("wmPick")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									ref: fileRef,
									type: "file",
									accept: "image/*",
									hidden: true,
									onChange: onFile
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dshr-wm-panel-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("wmOpacity") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "range",
								min: .02,
								max: .5,
								step: .01,
								value: config.opacity,
								onChange: (event) => onChange({
									...config,
									opacity: Number(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshr-wm-value",
								children: config.opacity.toFixed(2)
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-wm-panel-row",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("wmCorner") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshr-wm-corners",
							role: "radiogroup",
							"aria-label": t("wmCorner"),
							children: CORNER_OPTIONS.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "radio",
								"aria-checked": config.corner === option.value,
								className: "dshr-wm-corner",
								"data-active": config.corner === option.value || void 0,
								onClick: () => onChange({
									...config,
									corner: option.value
								}),
								children: t(option.labelKey)
							}, option.value))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshr-wm-panel-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("wmSize") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "range",
								min: 15,
								max: 70,
								step: 1,
								value: config.size,
								onChange: (event) => onChange({
									...config,
									size: Number(event.target.value)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dshr-wm-value",
								children: config.size
							})
						]
					})
				]
			});
		}
		/** The shell.overlay entry: painted watermark plus its settings gear. */
		function WatermarkLayer({ t }) {
			const [config, setConfig] = (0, react.useState)(readWatermark);
			const [open, setOpen] = (0, react.useState)(false);
			const [failed, setFailed] = (0, react.useState)(false);
			const change = (0, react.useCallback)((next) => {
				setConfig(next);
				setFailed(false);
				writeWatermark(next);
			}, []);
			const showImage = config.enabled && config.image !== "" && !failed;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshr-wm",
				"data-corner": config.corner,
				children: [
					showImage && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						className: "dshr-wm-img",
						src: config.image,
						alt: "",
						style: {
							opacity: config.opacity,
							width: `${config.size}vmin`
						},
						onError: () => {
							setFailed(true);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dshr-wm-gear",
						"aria-label": t("wmTitle"),
						onClick: () => {
							setOpen((value) => !value);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							width: "14",
							height: "14",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: 2,
							strokeLinecap: "round",
							strokeLinejoin: "round",
							"aria-hidden": true,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: GEAR_PATH })
						})
					}),
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshr-wm-scrim",
						onClick: () => {
							setOpen(false);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WatermarkSettings, {
						config,
						onChange: change,
						onClose: () => {
							setOpen(false);
						},
						t
					})] })
				]
			});
		}
		//#endregion
		//#region src/locales.ts
		/**
		* Bilingual dictionary for this plugin's locale namespace. The slot renderer
		* synthesizes the `t` seat from the registration's `locale: NS`; a key with
		* no entry returns the key itself (LocaleRuntime lookup contract).
		*/
		const NS = "richRender";
		const zh = {
			stopped: "已停止",
			think: "思考",
			running: "正在生成…",
			unknownBlock: "未识别的消息块",
			truncated: "内容已截断（共 {total} 项）",
			copy: "复制",
			copied: "已复制",
			codeBlockTitle: "代码块",
			codeBlockWrap: "自动换行",
			codeBlockUnwrap: "取消换行",
			footnotes: "脚注",
			viewTable: "表格",
			viewChart: "图表",
			downloadChart: "下载图片",
			otherSlice: "其他",
			checklistTitle: "检查清单",
			checklistProgress: "{done}/{total} 项完成",
			mplCode: "代码",
			mplChart: "图表",
			mplDownload: "下载",
			mplRunning: "正在执行…",
			mplFailed: "执行失败",
			mplDownloadPng: "下载 PNG",
			imageCopy: "复制",
			imageCopied: "已复制",
			imageCopyFailed: "复制失败",
			imagePreviewFailed: "图片无法预览",
			calloutNote: "注意",
			calloutTip: "提示",
			calloutImportant: "重要",
			calloutWarning: "警告",
			calloutCaution: "危险",
			wmTitle: "水印设置",
			wmClose: "关闭",
			wmEnable: "启用水印",
			wmImage: "水印图片",
			wmPick: "选择图片…",
			wmOpacity: "透明度",
			wmCorner: "位置",
			wmCornerTl: "左上",
			wmCornerTr: "右上",
			wmCornerBl: "左下",
			wmCornerBr: "右下",
			wmSize: "大小"
		};
		const en = {
			stopped: "Stopped",
			think: "Thinking",
			running: "Generating…",
			unknownBlock: "Unrecognized message block",
			truncated: "Truncated ({total} items total)",
			copy: "Copy",
			copied: "Copied",
			codeBlockTitle: "Code block",
			codeBlockWrap: "Wrap lines",
			codeBlockUnwrap: "Unwrap lines",
			footnotes: "Footnotes",
			viewTable: "Table",
			viewChart: "Chart",
			downloadChart: "Download image",
			otherSlice: "Other",
			checklistTitle: "Checklist",
			checklistProgress: "{done}/{total} done",
			mplCode: "Code",
			mplChart: "Chart",
			mplDownload: "Download",
			mplRunning: "Running…",
			mplFailed: "Execution failed",
			mplDownloadPng: "Download PNG",
			imageCopy: "Copy",
			imageCopied: "Copied",
			imageCopyFailed: "Copy failed",
			imagePreviewFailed: "Image preview unavailable",
			calloutNote: "Note",
			calloutTip: "Tip",
			calloutImportant: "Important",
			calloutWarning: "Warning",
			calloutCaution: "Caution",
			wmTitle: "Watermark settings",
			wmClose: "Close",
			wmEnable: "Enable watermark",
			wmImage: "Watermark image",
			wmPick: "Pick image…",
			wmOpacity: "Opacity",
			wmCorner: "Corner",
			wmCornerTl: "Top left",
			wmCornerTr: "Top right",
			wmCornerBl: "Bottom left",
			wmCornerBr: "Bottom right",
			wmSize: "Size"
		};
		//#endregion
		//#region src/styles.ts
		/**
		* The plugin's entire stylesheet as one injected `<style>` text.
		*
		* Out-of-tree client bundles cannot use the repository's CSS Modules preset,
		* so styles live in this plain string under the reserved `dshr-` prefix and
		* ride the plugin's own lifecycle effect (see stylesheet.ts). Colors, radii,
		* and type sizes consume the app's `--dsw-alias-*` / `--dsh-*` tokens so both
		* themes keep working; only values with no platform token are spelled out.
		*
		* Sections in file order: flow shell (AssistantMarkdown replica), think row
		* (ReasoningRow replica), a11y helper, then the rich-upgrade components.
		*/
		const STYLESHEET = `
/* ---- Flow shell: replica of ui-chat AssistantMarkdown.module.css ---- */
.dshr-flow-root {
  display: flex;
  flex-direction: column;
  font-size: var(--dsh-content-font-size, 14px);
  line-height: calc(24px + var(--dsh-content-font-delta, 0px));
  color: var(--dsw-alias-label-primary);
}

.dshr-flow-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Inline code in the rendered markdown: a tint of the text's own color, 4px
 * corners, no frame, and padding that keeps the pill on the text line
 * instead of the taller box the platform's inline-flex draws. Scoped to this
 * renderer, so tool blocks and the rest of the app keep the platform look.
 * The doubled container class outranks the platform's markdown rule, whose
 * specificity matches this one — without it, stylesheet order alone would
 * decide. */
.dshr-flow-body.dshr-flow-body :not(pre) > code {
  display: inline;
  padding: 1px 6px;
  border: 0;
  border-radius: 4px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* A dark surface already sits near the text tint, so the same 6% would read
 * darker than the platform pill there; 9% lands between the two. */
body[data-ds-dark-theme] .dshr-flow-body.dshr-flow-body :not(pre) > code {
  background: color-mix(in srgb, currentColor 9%, transparent);
}

/* Wide markdown tables span the transcript width instead of clipping at the
   message column (the renderer's >=4-column md-table-wide hook). */
.dshr-flow-body .md-table-wide {
  --dsh-table-spare: max(0px, calc((100cqw - var(--dsh-chat-content-width)) / 2));
  --dsh-table-lead: calc(var(--dsh-table-spare) + min(var(--dsh-chat-content-width), 100cqw) - 100%);
  box-sizing: border-box;
  width: calc(100% + var(--dsh-table-lead) + var(--dsh-table-spare));
  max-width: none;
  margin-left: calc(-1 * var(--dsh-table-lead));
  padding-left: var(--dsh-table-lead);
}

.dshr-flow-body .md-table-wide > table {
  position: relative;
  z-index: 1;
}

/* hidden="until-found" keeps a zero-height reasoning box in flex layout. */
.dshr-flow-body > [data-turn-process-inline][hidden] {
  margin-bottom: -16px;
}

.dshr-stopped {
  align-self: flex-start;
  padding: 0 6px;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 18px;
}

/* ---- Think row: replica of ui-chat ReasoningRow.module.css ---- */
.dshr-think-root {
  display: flex;
  flex-direction: column;
}

.dshr-think-root:not([data-expanded]) {
  contain: size layout;
  height: calc(24px + var(--dsh-content-font-delta, 0px));
}

.dshr-think-row {
  position: relative;
  overflow: hidden;
}

.dshr-think-root[data-expanded] [data-open] [data-disclosure-row] {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--dsw-alias-bg-base);
}

.dshr-think-root[data-state='running'] .dshr-think-row::after {
  content: '';
  position: absolute;
  inset-block: 0;
  left: 0;
  width: 300px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent) 55%,
    transparent 100%
  );
  animation: dshr-think-sweep 2.6s ease-out infinite;
  pointer-events: none;
}

@keyframes dshr-think-sweep {
  0% { left: -300px; }
  90%, 100% { left: 100%; }
}

.dshr-think-leading {
  flex-shrink: 0;
}

.dshr-think-chevron {
  color: var(--dsw-alias-label-secondary);
}

.dshr-think-title {
  font-weight: 400;
}

.dshr-think-separator {
  flex: none;
  width: 2px;
  height: 2px;
  margin: 0 8px;
  border-radius: 1px;
  background: var(--dsw-alias-label-caption);
}

.dshr-think-summary {
  min-width: 0;
  overflow: hidden;
  flex: 1 1 auto;
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
  white-space: nowrap;
}

.dshr-think-summary-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dshr-think-summary[data-streaming] {
  mask-image: linear-gradient(to right, black calc(100% - 48px), transparent);
}

.dshr-think-summary[data-streaming] .dshr-think-summary-text {
  overflow: visible;
  text-overflow: clip;
}

.dshr-think-root:not([data-preview]) .dshr-think-separator,
.dshr-think-root:not([data-preview]) .dshr-think-summary {
  display: none;
}

.dshr-think-body {
  padding: 4px 0 4px calc(22px + var(--dsh-content-font-delta, 0px));
  min-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .dshr-think-root[data-state='running'] .dshr-think-row::after {
    animation: none;
  }
}

/* ---- A11y helper ---- */
.dshr-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* ---- Shared fence frame: one quiet outline around every explicit fence ---- */
.dshr-fence {
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
}

/* ---- Image card: a body image in the shared fence with a copy action ---- */
.dshr-image {
  position: relative;
  padding: 10px;
}

.dshr-image-img {
  display: block;
  max-width: 100%;
  max-height: 360px;
  margin: 0 auto;
}

.dshr-image-copy {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 9px;
  border: none;
  border-radius: 6px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 18px;
  cursor: pointer;
}

.dshr-image-copy:hover {
  color: var(--dsw-alias-label-primary);
}

.dshr-image-failed {
  padding: 8px 12px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 20px;
}

/* ---- Icon-card group ---- */
.dshr-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dshr-cards-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dshr-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.dshr-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 8px);
  background: var(--dsw-alias-bg-layer-1);
  min-width: 0;
}

.dshr-card-main {
  min-width: 0;
}

.dshr-card-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  margin-bottom: 4px;
  overflow-wrap: anywhere;
}

.dshr-card-body {
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

/* ---- Callout ---- */
.dshr-callout {
  padding: 10px 14px;
  border-left: 3px solid var(--dsw-alias-border-l3);
  border-radius: 0 var(--dsw-radius-md, 8px) var(--dsw-radius-md, 8px) 0;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
}

/* GitHub alert flavors: one accent variable per type, GitHub's palette. */
.dshr-callout-alert {
  --dshr-alert-accent: var(--dsw-alias-label-secondary, #57606a);
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-left: 3px solid var(--dshr-alert-accent);
  border-radius: 0 var(--dsw-radius-md, 8px) var(--dsw-radius-md, 8px) 0;
  background: color-mix(in srgb, var(--dshr-alert-accent) 8%, transparent);
}

.dshr-callout-note { --dshr-alert-accent: #0969da; }
.dshr-callout-tip { --dshr-alert-accent: #1a7f37; }
.dshr-callout-important { --dshr-alert-accent: #8250df; }
.dshr-callout-warning { --dshr-alert-accent: #9a6700; }
.dshr-callout-caution { --dshr-alert-accent: #cf222e; }

.dshr-callout-alert-icon {
  flex: none;
  margin-top: 2px;
  color: var(--dshr-alert-accent);
}

.dshr-callout-alert-main {
  min-width: 0;
  flex: 1;
}

.dshr-callout-alert-title {
  color: var(--dshr-alert-accent);
  font-weight: 600;
  font-size: calc(14px + var(--dsh-content-font-delta-primary, 0px));
  line-height: calc(20px + var(--dsh-content-font-delta-primary, 0px));
  margin: 1px 0 2px;
}

/* ---- Checklist ---- */
.dshr-checklist {
  display: flex;
  flex-direction: column;
  padding: 20px 22px 22px;
  background: var(--dsw-alias-bg-layer-1);
}

.dshr-checklist-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.dshr-checklist-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
}

.dshr-checklist-count {
  flex: none;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}

.dshr-checklist-track {
  height: 4px;
  margin: 12px 0 18px;
  border-radius: 2px;
  background: var(--dsw-alias-border-l1);
  overflow: hidden;
}

.dshr-checklist-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--dsw-alias-label-primary);
  transition: width 160ms ease;
}

.dshr-checklist-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dshr-checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

/* The platform's checkbox recipe (ui-primitives Checkbox): a native input at
   16px tinted with the brand accent, centred in a 24px hit area so the box
   stays on the title's first line without a drawn glyph. */
.dshr-checklist-check {
  flex: none;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 24px;
  height: 22px;
  margin: 0;
  cursor: pointer;
}

.dshr-checklist-input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: inherit;
}

.dshr-checklist-input:focus-visible {
  outline: 2px solid var(--dsw-alias-link);
  outline-offset: 2px;
}

.dshr-checklist-main {
  flex: 1;
  min-width: 0;
}

.dshr-checklist-item-title {
  font-weight: 600;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
  overflow-wrap: anywhere;
}

.dshr-checklist-item-body {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

@media (prefers-reduced-motion: reduce) {
  .dshr-checklist-fill {
    transition: none;
  }
}

/* ---- Styled table ---- */
/* Minimal table: no verticals, no frame, no zebra — horizontal rules only
 * (under the header and between rows, none after the last row), bold
 * borderless header, airy even padding. */
.dshr-table-wrap {
  overflow-x: auto;
}

.dshr-table {
  border-collapse: collapse;
  width: 100%;
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

.dshr-table th {
  padding: 12px 16px 10px;
  font-weight: 700;
  vertical-align: middle;
  color: var(--dsw-alias-label-primary);
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  text-align: start;
  white-space: nowrap;
}

.dshr-table td {
  padding: 11px 16px;
  vertical-align: middle;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary);
  overflow-wrap: anywhere;
}

.dshr-table tbody tr:last-child td {
  border-bottom: none;
}

.dshr-tableblock {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ---- Dual-view bar ---- */
.dshr-dual {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Both panes stay mounted so export works from either view. */
.dshr-dual-pane {
  display: none;
}

.dshr-dual-pane[data-active] {
  display: block;
}

.dshr-dual-bar {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.dshr-dual-tab {
  padding: 2px 10px;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
}

.dshr-dual-tab:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshr-dual-tab[data-active] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

/* Export reads as an action, not a third view. */
.dshr-dual-tab-action {
  margin-left: 4px;
  color: var(--dsw-alias-link);
}

/* ---- Tab fence: equal-width line tabs with an underline indicator ---- */
.dshr-tabs {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 14px;
}

.dshr-tabs-bar {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.dshr-tabs-tab {
  flex: 1 0 auto;
  position: relative;
  padding: 8px 9px 10px;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}

.dshr-tabs-tab:hover {
  color: var(--dsw-alias-label-primary);
}

.dshr-tabs-tab[data-active] {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

.dshr-tabs-tab[data-active]::after {
  content: '';
  position: absolute;
  left: 9px;
  right: 9px;
  bottom: -1px;
  height: 2px;
  border-radius: 1px;
  background: var(--dsw-alias-label-primary);
}

.dshr-tabs-pane {
  min-width: 0;
}

/* ---- Prototype choices: native radio options over a live showcase panel ---- */
.dshr-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
}

.dshr-choices-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dshr-choices-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: var(--dsw-radius-sm, 6px);
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 20px;
  cursor: pointer;
}

.dshr-choices-option:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshr-choices-option[data-active] {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}

/* The platform's radio recipe (Checkbox / plugin manager): a native input at
   16px tinted with the brand accent. The browser draws the ring, the centred
   dot, and the focus ring, so no glyph is positioned by hand. */
.dshr-choices-input {
  flex: none;
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: inherit;
}

.dshr-choices-input:focus-visible {
  outline: 2px solid var(--dsw-alias-link);
  outline-offset: 2px;
}

.dshr-choices-label {
  min-width: 0;
  overflow-wrap: anywhere;
}

.dshr-choices-panel {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 8px);
  padding: 12px 16px;
  overflow-x: auto;
}

/* ---- Charts ---- */
.dshr-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 4px 4px;
}

.dshr-chart-svg {
  width: 100%;
  height: auto;
}

.dshr-chart-grid {
  stroke: var(--dsw-alias-border-l1);
  stroke-width: 1;
}

.dshr-chart-axis {
  stroke: var(--dsw-alias-border-l2);
  stroke-width: 1;
}

.dshr-chart-tick {
  fill: var(--dsw-alias-label-tertiary);
  font-size: 10px;
}

.dshr-chart-bar {
  cursor: default;
}

.dshr-chart-point {
  cursor: default;
}

.dshr-chart-slice {
  cursor: default;
}

.dshr-chart-slice-supplement {
  opacity: 0.5;
}

.dshr-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}

.dshr-chart-legend-column {
  flex-direction: column;
  gap: 6px;
}

.dshr-chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 1px 4px;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}

.dshr-chart-legend-item[data-off] {
  opacity: 0.45;
}

.dshr-chart-legend-item[data-supplement] {
  cursor: default;
}

.dshr-chart-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 4px;
}

.dshr-chart-dot-supplement {
  background: var(--dsw-alias-label-caption);
}

.dshr-chart-legend-name {
  color: var(--dsw-alias-label-primary);
}

.dshr-chart-legend-value {
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}

.dshr-chart-pie {
  flex-direction: row;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.dshr-chart-svg-pie {
  width: 176px;
  flex: none;
}

.dshr-chart-pie-side {
  min-width: 0;
}

/* ---- Timeline ---- */
.dshr-timelinewrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
}

.dshr-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.dshr-timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 0 0 16px 0;
}

/* Vertical rail through the dots. */
.dshr-timeline-item::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: 0;
  width: 1px;
  background: var(--dsw-alias-border-l2);
}

.dshr-timeline-item:last-child {
  padding-bottom: 4px;
}

.dshr-timeline-item:last-child::before {
  display: none;
}

.dshr-timeline-dot {
  flex: none;
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  z-index: 1;
}

.dshr-timeline-main {
  min-width: 0;
  padding-top: 2px;
}

.dshr-timeline-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
  margin-bottom: 4px;
}

.dshr-timeline-body {
  color: var(--dsw-alias-label-secondary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: calc(20px + var(--dsh-content-font-delta-secondary, 0px));
}

/* ---- Mindmap fence (anyblock list2node idiom, multi-root) ---- */
.dshr-mm {
  position: relative;
  padding: 12px;
}

.dshr-mm-scroll {
  overflow: auto;
}

.dshr-mm-zoompane {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: fit-content;
  min-width: 100%;
}

.dshr-mm-tree {
  display: flex;
  align-items: center;
  width: fit-content;
}

.dshr-mm-item {
  display: flex;
  align-items: center;
}

.dshr-mm-chip {
  max-width: 220px;
  padding: 4px 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-md, 8px);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font-size: var(--dsh-content-font-size-secondary, 13px);
  line-height: 18px;
  overflow-wrap: anywhere;
}

.dshr-mm-root {
  font-weight: 600;
  border-color: var(--dsw-alias-border-l3);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshr-mm-level-1 {
  font-weight: 600;
}

/* Horizontal stub from a node to its children rail. */
.dshr-mm-tail {
  flex: none;
  width: 14px;
  height: 1px;
  background: var(--dsw-alias-border-l2);
}

.dshr-mm-children {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dshr-mm-child {
  position: relative;
  padding-left: 14px;
}

/* Vertical rail segment linking siblings; halves at the first/last child. */
.dshr-mm-child::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-left: 1px solid var(--dsw-alias-border-l2);
}

.dshr-mm-child:first-child::before {
  top: 50%;
}

.dshr-mm-child:last-child::before {
  bottom: 50%;
}

.dshr-mm-child:only-child::before {
  display: none;
}

/* Horizontal stub from the rail into the child node. */
.dshr-mm-child::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 14px;
  border-top: 1px solid var(--dsw-alias-border-l2);
}

.dshr-mm-zoom {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  justify-content: flex-end;
}

.dshr-mm-zoombtn, .dshr-mm-zoomreset {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  border-radius: 6px;
  height: 24px;
  padding: 0 8px;
  cursor: pointer;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
}

.dshr-mm-zoombtn {
  width: 24px;
  padding: 0;
}

.dshr-mm-zoombtn:disabled {
  opacity: 0.4;
  cursor: default;
}

.dshr-mm-zoomreset {
  min-width: 44px;
  color: var(--dsw-alias-label-caption);
}

/* ---- Tree fence ---- */
.dshr-tree {
  padding: 10px 12px;
  overflow-x: auto;
  font-size: 13px;
}

.dshr-tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  white-space: nowrap;
  min-width: max-content;
}

.dshr-tree-toggle {
  width: 14px;
  height: 14px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  color: var(--dsw-alias-label-caption);
  font-size: 10px;
  line-height: 1;
  flex: none;
}

.dshr-tree-children {
  margin-left: 14px;
  padding-left: 8px;
  border-left: 1px solid var(--dsw-alias-border-l1);
}

.dshr-tree-name {
  color: var(--dsw-alias-label-primary);
}

.dshr-tree-icon {
  flex: none;
}

/* ---- Stack fence ---- */
.dshr-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.dshr-stack-layer {
  display: flex;
  align-items: stretch;
  gap: 10px;
  width: 100%;
}

.dshr-stack-box {
  flex: 1 1 0;
  min-width: 0;
  background: var(--dsw-static-neutral-100);
  border-radius: 8px;
  padding: 10px 12px;
  overflow-wrap: anywhere;
}

body[data-ds-dark-theme] .dshr-stack-box {
  background: var(--dsw-alias-bg-layer-2);
}

.dshr-stack-box * {
  color: inherit;
}

/* ---- Matplotlib cell ---- */
.dshr-mpl {
  padding: 10px 12px;
}

.dshr-mpl-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.dshr-mpl-tab {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-secondary);
  border-radius: 6px;
  padding: 2px 10px;
  font-size: 12px;
  cursor: pointer;
}

.dshr-mpl-tab.active {
  color: var(--dsw-alias-label-primary);
  border-color: var(--dsw-alias-label-primary);
}

.dshr-mpl-chart {
  overflow: auto;
  text-align: center;
}

.dshr-mpl-chart img {
  max-width: 100%;
}

.dshr-mpl-note {
  color: var(--dsw-alias-label-caption);
  font-size: 13px;
}

.dshr-mpl-error {
  color: var(--dsw-alias-label-warning, #d97706);
}

.dshr-mpl-stderr {
  text-align: left;
  font-size: 12px;
  white-space: pre-wrap;
  background: var(--dsw-alias-bg-base);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  padding: 8px;
  max-height: 240px;
  overflow: auto;
}

.dshr-mpl-dl {
  display: inline-block;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 13px;
  color: var(--dsw-alias-label-primary);
  text-decoration: none;
}

/* ---- Inline markdown fields (titles, table cells, node labels) ----
   Those fields keep model-authored markdown, notably $...$ TeX, and render
   through the platform MarkdownText. Its root is document-oriented, so this
   wrapper collapses the root box and its paragraph onto the host line and
   inherits the host typography. */
.dshr-inline-md,
.dshr-inline-md > div,
.dshr-inline-md > div > p {
  display: inline;
  margin: 0;
  font: inherit;
  color: inherit;
  line-height: inherit;
  overflow-wrap: anywhere;
}

.dshr-inline-md .katex-display {
  margin: 0;
}

/* ---- Watermark layer (four knobs; decoration never carries pointers) ---- */
.dshr-wm {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
}

.dshr-wm-img {
  position: absolute;
  max-width: var(--dshr-wm-size, 42vmin);
  max-height: var(--dshr-wm-size, 42vmin);
  filter: grayscale(1);
  mix-blend-mode: multiply;
  user-select: none;
  pointer-events: none;
}

.dshr-wm[data-corner='tl'] .dshr-wm-img { top: 24px; left: 24px; }
.dshr-wm[data-corner='tr'] .dshr-wm-img { top: 24px; right: 24px; }
.dshr-wm[data-corner='bl'] .dshr-wm-img { bottom: 24px; left: 24px; }
.dshr-wm[data-corner='br'] .dshr-wm-img { bottom: 24px; right: 24px; }

.dshr-wm-gear {
  position: absolute;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  opacity: 0.4;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 120ms ease;
}

.dshr-wm-gear:hover { opacity: 1; }

.dshr-wm[data-corner='tl'] .dshr-wm-gear { top: 6px; left: 6px; }
.dshr-wm[data-corner='tr'] .dshr-wm-gear { top: 6px; right: 6px; }
.dshr-wm[data-corner='bl'] .dshr-wm-gear { bottom: 6px; left: 6px; }
.dshr-wm[data-corner='br'] .dshr-wm-gear { bottom: 6px; right: 6px; }

.dshr-wm-scrim {
  position: fixed;
  inset: 0;
  background: transparent;
  pointer-events: auto;
}

.dshr-wm-panel {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 280px;
  padding: 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg, 12px);
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  pointer-events: auto;
}

.dshr-wm[data-corner='tl'] .dshr-wm-panel,
.dshr-wm[data-corner='tr'] .dshr-wm-panel { top: 38px; }
.dshr-wm[data-corner='bl'] .dshr-wm-panel,
.dshr-wm[data-corner='br'] .dshr-wm-panel { bottom: 38px; }
.dshr-wm[data-corner='tl'] .dshr-wm-panel,
.dshr-wm[data-corner='bl'] .dshr-wm-panel { left: 38px; }
.dshr-wm[data-corner='tr'] .dshr-wm-panel,
.dshr-wm[data-corner='br'] .dshr-wm-panel { right: 38px; }

.dshr-wm-panel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dshr-wm-panel-col {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.dshr-wm-panel-head {
  justify-content: space-between;
}

.dshr-wm-panel-title {
  font-weight: 600;
}

.dshr-wm-close {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 16px;
  cursor: pointer;
}

.dshr-wm-image-row {
  display: flex;
  gap: 6px;
}

.dshr-wm-input {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
}

.dshr-wm-button {
  flex: none;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  cursor: pointer;
}

.dshr-wm-corners {
  display: flex;
  gap: 4px;
}

.dshr-wm-corner {
  padding: 2px 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  cursor: pointer;
}

.dshr-wm-corner[data-active] {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}

.dshr-wm-value {
  min-width: 34px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
}
`;
		//#endregion
		//#region src/stylesheet.ts
		/**
		* Stylesheet lifecycle: install this plugin's one <style> element on the
		* plugin fiber's effect, remove it on unload. Idempotent against double
		* activation (reload keeps a single tag), mirroring the repository preset's
		* styleInjectionModule contract without its CSS Modules machinery.
		*/
		/** The tag identity: package id plus one fixed sheet name. */
		const TAG_ID = "dsh-rich-render/styles";
		/**
		* Install the stylesheet once; the returned disposer removes exactly this
		* plugin's tag, so disabling the entry drops every style it added.
		* @returns the removal disposer for ctx.effect.
		*/
		function injectStylesheet() {
			if (typeof document === "undefined") return () => {};
			if (document.querySelector(`style[data-plugin-css="${TAG_ID}"]`) !== null) return () => {};
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-rich-render";
			tag.dataset.pluginCss = TAG_ID;
			tag.textContent = STYLESHEET;
			document.head.appendChild(tag);
			return () => {
				tag.remove();
			};
		}
		//#endregion
		//#region src/client.ts
		/**
		* Browser half of dsh-rich-render: replaces the assistant-step Chat
		* node renderer with a rule-driven rich renderer (cards, timelines, dual-view
		* tables with charts, callouts, mindmaps) and adds the watermark overlay.
		*
		* Failure contract: unmatched markdown stays on the platform MarkdownText,
		* every upgrade segment degrades to its source slice on error, and a total
		* renderer crash abdicates the keyed cell back to the shipped
		* AssistantNodeView (the slot system retires a crashed shadowing entry).
		*/
		/** Services this client plugin consumes. */
		const inject = [
			"slots",
			"locale",
			"connection",
			"theme"
		];
		/**
		* UI face: the system sans stack from the reference config. Segoe UI leads so
		* Windows Latin resolves to it deterministically — a zh-CN document makes
		* Chromium resolve `ui-sans-serif` to Microsoft YaHei UI for Latin too — and
		* the CJK faces behind it carry the Chinese.
		*/
		const UI_FONT_STACK = "'Segoe UI', ui-sans-serif, system-ui, -apple-system, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif";
		/**
		* Code face: Consolas leads — on Windows it renders the transcript surface
		* better than Fira Code — with Fira Code next for machines without it, then
		* the platform's monospace stack. The CJK faces behind them draw the
		* characters no mono face has; the bare `monospace` tail stays off so Chinese
		* never falls back to SimSun, matching the platform's own code token.
		*/
		const CODE_FONT_STACK = "Consolas, 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Liberation Mono', 'Courier New', 'Microsoft YaHei UI', 'PingFang SC', 'Noto Sans CJK SC'";
		/** Install the stylesheet, dictionary, the matplotlib bridge, the assistant-step replacement, and the watermark overlay. */
		function apply(ctx) {
			ctx.effect(() => injectStylesheet(), "rich-render: stylesheet");
			ctx.effect(() => ctx.theme.overrideTokens("dsh-rich-render:font", {
				"--dsw-font-family": {
					light: UI_FONT_STACK,
					dark: UI_FONT_STACK
				},
				"--dsw-font-family-brand": {
					light: UI_FONT_STACK,
					dark: UI_FONT_STACK
				},
				"--ds-font-family-code": {
					light: CODE_FONT_STACK,
					dark: CODE_FONT_STACK
				}
			}), "rich-render: UI and code typography");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "rich-render: dictionaries");
			ctx.effect(() => {
				setMatplotlibRpc(ctx.connection.rpc);
				return () => setMatplotlibRpc(void 0);
			}, "rich-render: matplotlib bridge");
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "assistant-step",
				locale: NS
			}, RichAssistantNodeView));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "rich-render-watermark",
				locale: NS
			}, WatermarkLayer));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map