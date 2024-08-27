import{_ as i,c as a,o as s,a2 as t}from"./chunks/framework.DqitMrFO.js";const F=JSON.parse('{"title":"Command line interface","description":"","frontmatter":{},"headers":[],"relativePath":"guide/cli.md","filePath":"guide/cli.md"}'),e={name:"guide/cli.md"},n=t('<h1 id="command-line-interface" tabindex="-1">Command line interface <a class="header-anchor" href="#command-line-interface" aria-label="Permalink to &quot;Command line interface&quot;">​</a></h1><h2 id="artipub" tabindex="-1"><code>artipub</code> <a class="header-anchor" href="#artipub" aria-label="Permalink to &quot;`artipub`&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Usage:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> artipub</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [options] [command]</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Options:</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  -v,--version</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">               output</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> the</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> current</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> version</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  -h,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --help</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                 display</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> help</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> for</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> command</span></span>\n<span class="line"></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Commands:</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [options] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">     add an existing article</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  update</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [options] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  Update an existing article</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  clear</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">                      Clear</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> the</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cache</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [options]           Edit the configuration file</span></span>\n<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  help</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [command]             display help </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> command</span></span></code></pre></div><h2 id="add" tabindex="-1"><code>add</code> <a class="header-anchor" href="#add" aria-label="Permalink to &quot;`add`&quot;">​</a></h2><h3 id="usage" tabindex="-1"><code>Usage</code> <a class="header-anchor" href="#usage" aria-label="Permalink to &quot;`Usage`&quot;">​</a></h3><p>首次发布文章，使用add命令rticle for the first time, using the ADD command</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">artipub</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">markdown</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> file</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">h</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div><h3 id="options" tabindex="-1"><code>Options</code> <a class="header-anchor" href="#options" aria-label="Permalink to &quot;`Options`&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Options</th><th></th></tr></thead><tbody><tr><td><code>-c, --config</code></td><td>config file path</td></tr></tbody></table><h2 id="update" tabindex="-1"><code>update</code> <a class="header-anchor" href="#update" aria-label="Permalink to &quot;`update`&quot;">​</a></h2><p>Update the article, use the update command</p><h3 id="usage-1" tabindex="-1"><code>Usage</code> <a class="header-anchor" href="#usage-1" aria-label="Permalink to &quot;`Usage`&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">artipub</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> update</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">markdown</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> file</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> pat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">h</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span></code></pre></div><h3 id="options-1" tabindex="-1"><code>Options</code> <a class="header-anchor" href="#options-1" aria-label="Permalink to &quot;`Options`&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Options</th><th></th></tr></thead><tbody><tr><td><code>-c, --config</code></td><td>config file path</td></tr></tbody></table><h2 id="config" tabindex="-1"><code>config</code> <a class="header-anchor" href="#config" aria-label="Permalink to &quot;`config`&quot;">​</a></h2><p>Edit the configuration file to facilitate manually adding configuration information</p><h3 id="usage-2" tabindex="-1"><code>Usage</code> <a class="header-anchor" href="#usage-2" aria-label="Permalink to &quot;`Usage`&quot;">​</a></h3><p>From the current directory addressing configuration file, if you can&#39;t find it, you will go to the user directory to find the configuration file. no configuration file found.</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">artipub</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --edit</span></span></code></pre></div>',20),h=[n];function l(p,d,o,k,r,c){return s(),a("div",null,h)}const u=i(e,[["render",l]]);export{F as __pageData,u as default};