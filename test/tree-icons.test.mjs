/**
 * Tree icon mapping against the curated Material Icon Theme associations:
 * extension families, special file names, folder glyphs with open variants,
 * and the generic document fallback.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { fileIcon, folderIcon } from '../src/rules/tree-icons.ts'
import { MATERIAL_PATHS } from '../src/rules/material-icons.generated.ts'

test('extensions map to material icons', () => {
  assert.equal(fileIcon('index.ts').name, 'typescript')
  assert.equal(fileIcon('main.py').name, 'python')
  assert.equal(fileIcon('data.csv').name, 'table')
  assert.equal(fileIcon('logo.png').name, 'image')
  assert.equal(fileIcon('cordis.yml').name, 'yaml')
  assert.equal(fileIcon('notes.md').name, 'markdown')
})

test('special file names win over extensions', () => {
  assert.equal(fileIcon('package.json').name, 'nodejs')
  assert.equal(fileIcon('Dockerfile').name, 'docker')
  assert.equal(fileIcon('.gitignore').name, 'git')
  assert.equal(fileIcon('README.md').name, 'readme')
  assert.equal(fileIcon('other.md').name, 'markdown')
})

test('unknown extension is the generic document', () => {
  assert.equal(fileIcon('mystery.zzz').name, 'file')
  assert.equal(fileIcon('noext').name, 'file')
})

test('every resolved icon carries inlined paths', () => {
  assert.ok(fileIcon('index.ts').paths.length > 0)
  assert.ok(fileIcon('mystery.zzz').paths.length > 0)
})

test('folders resolve with open variants, default pair as fallback', () => {
  assert.equal(folderIcon('src', false).name, 'folder-src')
  assert.equal(folderIcon('src', true).name, 'folder-src-open')
  assert.ok(MATERIAL_PATHS['folder-src-open'].length > 0)
  assert.equal(folderIcon('node_modules', false).name, 'folder-node')
  assert.equal(folderIcon('unmapped', false).name, 'folder')
  assert.equal(folderIcon('unmapped', true).name, 'folder-open')
})
