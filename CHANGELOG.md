# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 📋 Quick Summary

### [0.2.0] - 2026-11-13
- ✨ Added OpenCNPJ API support (6th API)
- ✨ Alphanumeric CNPJ support + check-digit validation before any API call
- ⚡ Delay is now a per-API minimum interval (fallback switches APIs without waiting)
- ⚡ Repeated CNPJs in the same execution are queried only once
- 🐛 Fixed `"undefined"` in CNPJ.ws phone normalization (#1)
- 🐛 Codex file now uses the package name instead of `n8n-nodes-base` (#2)
- 🔧 Specific-API failures raise `NodeApiError` with HTTP status
- 🔧 Fixed TypeScript build; corrected BrasilAPI description
- 📝 Updated documentation

[View detailed changelog →](changelog/v0.2.0.md)

### [0.1.0] - 2025-01-08
- 🎉 Initial release
- ✨ Support for 5 public Brazilian CNPJ APIs
- 🔄 Automatic fallback mechanism
- 📊 Data normalization across all APIs

[View detailed changelog →](changelog/v0.1.0.md)

---

## 📁 Detailed Changelogs

For detailed information about each version, including technical details, breaking changes, and migration guides, see the [changelog directory](changelog/).

- **[v0.2.0](changelog/v0.2.0.md)** - OpenCNPJ, alphanumeric CNPJ, bug fixes
- **[v0.1.0](changelog/v0.1.0.md)** - Initial release

## 🔗 Additional Resources

- [Release Notes](releases/) - User-friendly release announcements
- [Documentation](README.md) - Full project documentation
- [GitHub Releases](https://github.com/dssiqueira/n8n-nodes-cnpj-hub/releases) - Official releases
