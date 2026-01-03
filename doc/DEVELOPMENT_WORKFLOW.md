# 🔄 Development Workflow

**Last Updated**: 2026-01-02

---

## 🌿 Git Workflow

### Branching Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/phase-2-backend
  ↑
bugfix/api-error
```

### Workflow

1. **Create Branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following [CODE_STANDARDS.md](CODE_STANDARDS.md)
   - Run tests: `pytest` and `npm test`
   - Format code: `ruff format .` and `npm run format`

3. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add image generation endpoint"
   ```

4. **Push to Remote**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Create PR from `feature/your-feature-name` to `develop`
   - Include description of changes
   - Link to related issues

6. **Code Review**
   - At least one approval required
   - All checks must pass
   - Address review comments

7. **Merge**
   - Squash and merge to develop
   - Delete feature branch

---

## ✅ Code Review Process

### Before Submitting PR

- [ ] Code follows [CODE_STANDARDS.md](CODE_STANDARDS.md)
- [ ] All tests pass: `pytest` and `npm test`
- [ ] No linting errors
- [ ] Code is formatted
- [ ] Documentation updated
- [ ] Tests added for new features

### Code Review Checklist

For reviewers:

- [ ] Code is readable and maintainable
- [ ] Logic is correct
- [ ] Error handling is adequate
- [ ] Tests cover new code
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

---

## 🧪 Testing Workflow

### Running Tests

```bash
# Python tests
pytest                          # Run all tests
pytest backend/                   # Run backend tests
pytest -v                         # Verbose output
pytest --cov=backend              # Coverage report

# TypeScript tests
npm test                         # Run all tests
npm run test:watch              # Watch mode
npm run test:coverage          # Coverage report
```

### Pre-commit Testing

Pre-commit hooks automatically run before each commit:

- Ruff linting (Python)
- Ruff formatting (Python)
- Mypy type checking (Python)
- ESLint (TypeScript)
- Prettier (TypeScript)

Run manually:

```bash
pre-commit run --all-files
```

---

## 🚀 Deployment Workflow

### Development

```bash
# Start backend
python backend/main.py

# Start frontend (new terminal)
npm run dev:renderer

# Start Electron (new terminal)
npm run dev:electron
```

### Building

```bash
# Build frontend
npm run build:renderer

# Build Electron
npm run build:electron

# Full build
npm run build
```

### Packaging

```bash
# Create installer for current platform
npm run dist

# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

### Release Process

1. **Version bump**

   ```bash
   npm version patch|minor|major
   ```

2. **Update CHANGELOG**
   - Add release notes
   - Document breaking changes

3. **Create release**

   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

4. **Build distributables**

   ```bash
   npm run dist
   ```

5. **Upload**
   - GitHub Releases
   - Distribution channels

---

## 📝 Issue Tracking

### Issue Templates

**Bug Report**

- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, versions)
- Screenshots/logs

**Feature Request**

- Description
- Use case
- Proposed implementation
- Alternatives considered

**Task**

- Description
- Acceptance criteria
- Estimated effort
- Dependencies

### Issue Labels

- `bug` - Bug report
- `enhancement` - New feature
- `documentation` - Documentation
- `good first issue` - Good for newcomers
- `help wanted` - Help needed
- `phase-0`, `phase-1`, etc. - Phase assignment
- `priority: high`, `priority: medium`, `priority: low` - Priority
- `backend`, `frontend` - Component

---

## 💬 Communication

### Channels

- **Slack/Discord**: #runware-generator
- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions
- **GitHub PRs**: For code review

### Meetings

- **Daily Standup**: 15 minutes, What did you do/what's next
- **Sprint Planning**: At sprint start
- **Sprint Review**: At sprint end
- **Retrospective**: After sprint review

---

## 📊 Sprint Workflow

### Sprint Planning (1-2 hours)

1. Review backlog items
2. Estimate effort
3. Select items for sprint
4. Define sprint goal
5. Assign tasks

### Sprint Review (1 hour)

1. Demo completed features
2. Discuss what was done
3. Review metrics

### Retrospective (1 hour)

1. What went well?
2. What could be improved?
3. Action items for next sprint

---

## 🔐 Security Workflow

### Secret Management

1. **Never commit secrets**
2. **Use .env files** (in .gitignore)
3. **Use environment variables**
4. **Rotate API keys** regularly

### Code Review Security

- Check for hardcoded secrets
- Validate input handling
- Review authentication logic
- Check for SQL injection
- Review file access permissions

---

## 📈 Performance Monitoring

### Metrics to Track

- API response time
- Generation time
- Memory usage
- CPU usage
- Error rate
- User satisfaction

### Tools

- Logging (Python: logging, Node.js: console)
- Profiling (cProfile, Chrome DevTools)
- Monitoring (future: Sentry, DataDog)

---

## 🎯 Workflow Best Practices

1. **Small, frequent commits** - Easier to review and revert
2. **Write tests first** - TDD approach
3. **Update documentation** - Keep docs in sync with code
4. **Code review** - Get feedback early
5. **Ask questions** - Don't guess
6. **Communicate** - Keep team informed
7. **Take breaks** - Avoid burnout

---

## 📞 Getting Help

1. Check documentation
2. Search GitHub issues
3. Ask in team chat
4. Create issue if bug
5. Create discussion if question

---

**Last Updated**: 2026-01-02  
**Maintained By**: Development Team
