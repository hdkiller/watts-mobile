function readPackage(pkg) {
  for (const depType of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    if (!pkg[depType]) continue;
    if (pkg[depType].tar) {
      pkg[depType].tar = '^7.5.21';
    }
    if (pkg[depType].undici) {
      pkg[depType].undici = '^6.27.0';
    }
    if (pkg[depType].uuid) {
      pkg[depType].uuid = '^9.0.1';
    }
    if (pkg[depType]['brace-expansion']) {
      if (pkg[depType]['brace-expansion'].startsWith('1.')) {
        pkg[depType]['brace-expansion'] = '1.1.11';
      } else if (pkg[depType]['brace-expansion'].startsWith('2.')) {
        pkg[depType]['brace-expansion'] = '2.0.1';
      }
    }
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
