# TODO - Vecbox Tasks

## 🚨 Critical Issues

### 1. Fix `__dirname is not defined` error in ES modules
**Priority**: HIGH
**Description**: The Llama.cpp provider fails because `__dirname` is not available in ES modules
**Location**: `src/providers/llamacpp.ts` line 219
**Error**: `Llama.cpp readiness check failed: __dirname is not defined`

**Tasks**:
- [ ] Replace `__dirname` with ES module compatible alternative
- [ ] Use `fileURLToPath(import.meta.url)` and `dirname()`
- [ ] Test the fix in both development and production
- [ ] Verify all path resolution works correctly

### 2. Model availability strategy
**Priority**: HIGH  
**Description**: Users need access to the embedding model for local Llama.cpp functionality
**Current behavior**: Model not included in npm package, users must download manually

**Options to evaluate**:
- [ ] Include main model in npm package (+81M)
- [ ] Implement automatic model download on first use
- [ ] Create model download utility/CLI
- [ ] Document manual download process clearly

## 📋 Enhancement Tasks

### 3. Improve error handling and user feedback
**Priority**: MEDIUM
**Description**: Better error messages when model is missing or native module fails

**Tasks**:
- [ ] Add specific error for missing model file
- [ ] Provide clear instructions on how to fix issues
- [ ] Add model download suggestion in error messages
- [ ] Improve logging for debugging path issues

### 4. Package optimization review
**Priority**: MEDIUM
**Description**: Ensure optimal package size and inclusion/exclusion rules

**Tasks**:
- [ ] Review `.npmignore` vs `package.json files` field consistency
- [ ] Verify essential files are included
- [ ] Confirm no unnecessary files are packaged
- [ ] Test package installation and functionality

### 5. Native module robustness
**Priority**: MEDIUM
**Description**: Improve native module loading and fallback behavior

**Tasks**:
- [ ] Test native module loading across different environments
- [ ] Verify HTTP fallback works when native fails
- [ ] Add better native module compilation instructions
- [ ] Test cross-platform compatibility

## 🔍 Investigation Tasks

### 6. Path resolution testing
**Priority**: LOW
**Description**: Comprehensive testing of model path resolution

**Tasks**:
- [ ] Test all path resolution scenarios
- [ ] Verify relative paths work when installed via npm
- [ ] Test absolute path handling
- [ ] Document expected path behaviors

### 7. Performance optimization
**Priority**: LOW
**Description**: Optimize model loading and embedding generation

**Tasks**:
- [ ] Profile model loading time
- [ ] Optimize memory usage
- [ ] Consider model caching strategies
- [ ] Benchmark embedding generation performance

## 📚 Documentation Tasks

### 8. Update documentation
**Priority**: MEDIUM
**Description**: Update docs to reflect current behavior and requirements

**Tasks**:
- [ ] Document model requirements and setup
- [ ] Add troubleshooting guide for common issues
- [ ] Update README with local setup instructions
- [ ] Document native module compilation

## �� Testing Tasks

### 9. Comprehensive testing
**Priority**: HIGH
**Description**: Ensure all scenarios work correctly

**Tasks**:
- [ ] Test Llama.cpp provider with actual model
- [ ] Test fallback behavior when model missing
- [ ] Test npm package installation and usage
- [ ] Test all providers in isolation

---

## 🎯 Next Steps

1. **Immediate**: Fix `__dirname` issue (Task 1)
2. **Short-term**: Decide on model distribution strategy (Task 2)
3. **Medium-term**: Improve error handling and docs (Tasks 3, 8)
4. **Long-term**: Performance and robustness improvements (Tasks 5-7)

## 📊 Current Status

- ✅ Package size optimized (104K)
- ✅ Essential files included
- ✅ Native module compilation working
- ❌ Llama.cpp provider failing due to `__dirname`
- ❌ Model not available for users
- ⚠️ Error messages need improvement
