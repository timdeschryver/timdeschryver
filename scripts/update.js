const { get } = require('https')
const { writeFileSync, readFileSync } = require('fs')
const { format, resolveConfig } = require('prettier')
const { stripIndents } = require('common-tags')
const { xml2js } = require('xml-js')

const FEED = 'https://timdeschryver.dev/blog/rss.xml'
const NUMBER_OF_POSTS = 5
const README = './README.md'

get(FEED, (res) => {
	let xml = ''
	res.on('data', (chunk) => {
		xml += chunk
	})
	res.on('end', () => {
		const data = xml2js(xml, { compact: true })
		updateReadme(data)
	})
}).on('error', (e) => {
	console.error(e)
})

function updateReadme(posts) {
	const readme = readFileSync(README, 'utf-8')

	const recentBlogPosts = posts.rss.channel.item
		.slice(0, NUMBER_OF_POSTS)
		.map((p) => `- [${p.title._cdata.trim()}](${p.link._text.trim()})`)
		.concat('- [More posts](https://timdeschryver.dev/blog)')
		.join('\n')
	const TITLE = '## Recent blog posts'
	const TAG_OPEN = `<!-- BLOG:START -->`
	const TAG_CLOSE = `<!-- BLOG:END -->`
	const indexBefore = readme.indexOf(TAG_OPEN) + TAG_OPEN.length
	const indexAfter = readme.indexOf(TAG_CLOSE)
	const readmeContentChunkBreakBefore = readme.substring(0, indexBefore)
	const readmeContentChunkBreakAfter = readme.substring(indexAfter)

	const readmeNew = stripIndents`
    ${readmeContentChunkBreakBefore}
		
		${TITLE}

		${recentBlogPosts}

		${readmeContentChunkBreakAfter}
  `

	formatMd(readmeNew)
}

function formatMd(content) {
	const prettierConfig = resolveConfig.sync(__dirname)
	const formatted = format(content, {
		...prettierConfig,
		parser: 'markdown',
	})
	writeFileSync(README, formatted)
}
