const { get } = require('https');
const { writeFileSync } = require('fs');
const { format } = require('prettier');
const { stripIndent } = require('common-tags');

get('https://timdeschryver.dev/blog/latest.json', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    updateReadme(JSON.parse(data));
  });
}).on('error', (e) => {
  console.error(e);
});

function updateReadme(post) {
  const content = stripIndent`
    # ${post.title}
    ${post.description}

    [Read more](${post.canonical_url})
    
    ![Banner](${post.banner})
  `;
  const formatted = format(content, {
    parser: 'markdown',
  });
  writeFileSync('./README.md', formatted);
}
