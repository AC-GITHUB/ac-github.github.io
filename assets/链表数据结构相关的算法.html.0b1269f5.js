import{_ as s}from"./plugin-vue_export-helper.21dcd24c.js";import{e as n}from"./app.aab1f085.js";const a={},l=n(`<h2 id="\u7FFB\u8F6C\u94FE\u8868" tabindex="-1"><a class="header-anchor" href="#\u7FFB\u8F6C\u94FE\u8868" aria-hidden="true">#</a> \u7FFB\u8F6C\u94FE\u8868</h2><div class="language-java ext-java line-numbers-mode"><pre class="shiki" style="background-color:#292D3E;"><code><span class="line"><span style="color:#C792EA;">public</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">static</span><span style="color:#A6ACCD;"> </span><span style="color:#C792EA;">Node</span><span style="color:#A6ACCD;"> </span><span style="color:#82AAFF;">reverse</span><span style="color:#89DDFF;">(</span><span style="color:#C792EA;">Node</span><span style="color:#A6ACCD;"> node</span><span style="color:#89DDFF;">)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#89DDFF;font-style:italic;">if</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">node </span><span style="color:#89DDFF;">==</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">||</span><span style="color:#A6ACCD;"> node</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">next </span><span style="color:#89DDFF;">==</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#A6ACCD;">		</span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> node</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#C792EA;">Node</span><span style="color:#A6ACCD;"> prev </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null;</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#C792EA;">Node</span><span style="color:#A6ACCD;"> next </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> node</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">next</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;font-style:italic;">//next \u6307\u5411\u7A7A\u65F6\uFF0C\u53EA\u9700\u518D\u8FDB\u884C\u6700\u540E\u4E00\u6B21\u53CD\u8F6C</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#89DDFF;font-style:italic;">while</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">(</span><span style="color:#A6ACCD;">next </span><span style="color:#89DDFF;">!=</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">null)</span><span style="color:#A6ACCD;"> </span><span style="color:#89DDFF;">{</span></span>
<span class="line"><span style="color:#89DDFF;">		</span><span style="color:#676E95;font-style:italic;">//\u53CD\u8F6C\u8282\u70B9</span></span>
<span class="line"><span style="color:#A6ACCD;">		node</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">next </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> prev</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">		</span><span style="color:#676E95;font-style:italic;">//\u5F15\u7528\u540E\u79FB</span></span>
<span class="line"><span style="color:#A6ACCD;">		prev </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> node</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">		node </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> next</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">		next </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> next</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">next</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#89DDFF;">}</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;font-style:italic;">//\u53CD\u8F6C\u6700\u540E\u4E00\u4E2A\u8282\u70B9</span></span>
<span class="line"><span style="color:#A6ACCD;">	node</span><span style="color:#89DDFF;">.</span><span style="color:#A6ACCD;">next </span><span style="color:#89DDFF;">=</span><span style="color:#A6ACCD;"> prev</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">	</span><span style="color:#676E95;font-style:italic;">//\u8FD4\u56DE\u53CD\u8F6C\u540E\u7684\u94FE\u8868\u5934\u5F15\u7528</span></span>
<span class="line"><span style="color:#A6ACCD;">	</span><span style="color:#89DDFF;font-style:italic;">return</span><span style="color:#A6ACCD;"> node</span><span style="color:#89DDFF;">;</span></span>
<span class="line"><span style="color:#89DDFF;">}</span></span>
<span class="line"></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div>`,2);function p(o,e){return l}var c=s(a,[["render",p],["__file","\u94FE\u8868\u6570\u636E\u7ED3\u6784\u76F8\u5173\u7684\u7B97\u6CD5.html.vue"]]);export{c as default};
