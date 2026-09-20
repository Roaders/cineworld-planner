import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const checkOnly = process.argv.includes('--check');
const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
const version = checkOnly ? nextPatchVersion(packageJson.version) : packageJson.version;
const changelogPath = resolve('CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf8');
const eol = changelog.includes('\r\n') ? '\r\n' : '\n';
const updatedChangelog = createRelease(changelog.replaceAll('\r\n', '\n'), version, formatDate(new Date()));

if (checkOnly) {
    console.log(`CHANGELOG.md is ready for v${version}.`);
} else {
    writeFileSync(changelogPath, updatedChangelog.replaceAll('\n', eol));
    console.log(`Moved Unreleased changes to v${version}.`);
}

function createRelease(changelogContent, releaseVersion, releaseDate) {
    const unreleasedHeading = '## [Unreleased]';
    const unreleasedIndex = changelogContent.indexOf(unreleasedHeading);

    if (unreleasedIndex < 0) {
        throw new Error('CHANGELOG.md must contain an Unreleased section.');
    }

    const bodyStart = unreleasedIndex + unreleasedHeading.length;
    const nextReleaseIndex = changelogContent.indexOf('\n## [', bodyStart);

    if (nextReleaseIndex < 0) {
        throw new Error('CHANGELOG.md must contain a versioned release after Unreleased.');
    }

    const unreleasedChanges = changelogContent.slice(bodyStart, nextReleaseIndex).trim();
    if (!unreleasedChanges.includes('- ')) {
        throw new Error('The Unreleased changelog section has no changes to release.');
    }

    if (changelogContent.includes(`## [${releaseVersion}]`)) {
        throw new Error(`CHANGELOG.md already contains v${releaseVersion}.`);
    }

    return `${changelogContent.slice(0, bodyStart)}\n\n`
        + `## [${releaseVersion}] - ${releaseDate}\n\n`
        + `${unreleasedChanges}\n`
        + changelogContent.slice(nextReleaseIndex);
}

function nextPatchVersion(version) {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
    if (match == null) {
        throw new Error(`Cannot calculate the next patch version from ${version}.`);
    }

    return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
