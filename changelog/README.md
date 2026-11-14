# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 📋 Versions

- **[v0.2.0](v0.2.0.md)** - 2026-11-13 - OpenCNPJ, alphanumeric CNPJ, bug fixes
- **[v0.1.0](v0.1.0.md)** - 2025-08-13 - Initial release (5 APIs)

## 🔖 Version Format

Each version file contains:

- **Added**: New features and capabilities
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Features that have been removed
- **Fixed**: Bug fixes
- **Security**: Security improvements
- **Documentation**: Documentation updates
- **Technical Details**: Implementation specifics

## 📌 Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Incompatible API changes
- **MINOR** (0.X.0): New functionality, backward-compatible
- **PATCH** (0.0.X): Backward-compatible bug fixes

## 🔗 Quick Links

- [Main Documentation](../README.md)
- [Portuguese Documentation](../docs/README-pt.md)
- [Release Notes](../releases/)
- [GitHub Repository](https://github.com/dssiqueira/n8n-nodes-cnpj-hub)

## 📝 Latest Changes

### [0.2.0] - 2026-11-13

#### Added
- OpenCNPJ API integration (6th API)
- Alphanumeric CNPJ support and check-digit validation

#### Changed
- Delay is a per-API minimum interval; fallback no longer waits between APIs
- Repeated CNPJs in one execution are queried once
- Specific-API failures raise `NodeApiError`

#### Fixed
- `"undefined"` in CNPJ.ws phone normalization (#1)
- Codex `node` field uses the package name (#2)
- TypeScript build

[View full changelog →](v0.2.0.md)

---

## 🔔 Stay Updated

Watch the [GitHub repository](https://github.com/dssiqueira/n8n-nodes-cnpj-hub) for new releases and updates.
