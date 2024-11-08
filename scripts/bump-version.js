const fs = require('fs')
const { execSync } = require('child_process')

const newVersion = process.argv[2]
const phpFile = './inseri-core.php'
const readmeFile = './readme.txt'
const phpRegex = /(Version:\s*)(.*)/
const readmeRegex = /(Stable tag:\s*)(.*)/

if (!newVersion) {
	throw new Error('missing new version')
}

function bumpVersion(file, regex) {
	const fileContents = fs.readFileSync(file, { encoding: 'utf8' })
	const updatedFile = fileContents.replace(regex, '$1' + newVersion)
	fs.writeFileSync(file, updatedFile, { encoding: 'utf8' })
}

bumpVersion(phpFile, phpRegex)
bumpVersion(readmeFile, readmeRegex)
execSync(`npm version ${newVersion} --no-git-tag-version`)
