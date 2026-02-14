# Publishing Guide - embedify v0.1.0

This guide provides step-by-step instructions for publishing Embed Kit to npm and yarn.

## 📋 Pre-Publishing Checklist

### ✅ Requirements Met
- [x] Version set to 1.0.0 in package.json
- [x] Complete README.md with examples
- [x] CHANGELOG.md with v1.0.0 changes
- [x] MIT License file
- [x] Proper package.json metadata
- [x] Build system configured (tsup)
- [x] TypeScript definitions generated
- [x] All tests passing
- [x] Code clean and organized

### 🧪 Final Tests
```bash
# Run all tests
pnpm test:run

# Test build
pnpm build

# Test examples
pnpm example
```

## 🚀 Publishing Steps

### 1. Login to npm
```bash
npm login
# Enter your npm credentials
```

### 2. Build the package
```bash
pnpm build
```

### 3. Check package contents
```bash
npm pack --dry-run
# Verify only necessary files are included
```

### 4. Publish to npm
```bash
npm publish
# OR for public scoped packages
npm publish --access public
```

### 5. Verify publication
```bash
npm view embed-kit
# Should show version 1.0.0
```

## 📦 Yarn Support

Yarn automatically pulls from npm registry, so no additional steps needed:

```bash
yarn add embed-kit
```

## 🏷️ Version Management

For future versions, follow semantic versioning:

- **Major (X.0.0)**: Breaking changes
- **Minor (X.Y.0)**: New features, backward compatible
- **Patch (X.Y.Z)**: Bug fixes, backward compatible

### Version bump commands:
```bash
# Patch version (1.0.1)
npm version patch

# Minor version (1.1.0)
npm version minor

# Major version (2.0.0)
npm version major
```

## 📊 Post-Publishing

### 1. Update GitHub
- Create release tag: `git tag v1.0.0`
- Push tag: `git push origin v1.0.0`
- Create GitHub Release with changelog

### 2. Documentation
- Update website if applicable
- Announce on social media
- Update community channels

### 3. Monitor
- Watch npm downloads
- Monitor GitHub issues
- Check for bug reports

## 🔧 Package Configuration

### Files included in package:
```
dist/           # Built JavaScript/TypeScript files
README.md       # Documentation
CHANGELOG.md    # Version history
LICENSE         # MIT License
```

### Entry points:
- **Main**: `dist/index.js` (ESM)
- **CommonJS**: `dist/index.cjs`
- **Types**: `dist/index.d.ts`

### Supported environments:
- Node.js >= 16.0.0
- TypeScript projects
- ES Modules and CommonJS

## 🚨 Important Notes

1. **Always test before publishing**: Run full test suite
2. **Check dependencies**: Ensure all dependencies are properly declared
3. **Verify build**: Make sure TypeScript compilation succeeds
4. **Update docs**: Keep README and examples current
5. **Version consistency**: Ensure all version references match

## 📞 Support

For publishing issues:
- Check npm logs: `npm log`
- Verify authentication: `npm whoami`
- Review package contents: `npm pack --dry-run`

---

**Ready to publish! 🚀**
