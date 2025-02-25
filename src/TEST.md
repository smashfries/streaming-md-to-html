## 📥 Step 1: Pull the Latest Changes
Before proceeding, make sure you have the latest code by running:

```sh
git pull origin main
```
(Replace `main` with the correct branch name if needed.)

---

## 📦 Step 2: Install Dependencies
Since we use `pnpm`, install all required dependencies by running:

```sh
pnpm i
```

This will install all necessary packages based on the `pnpm-lock.yaml` file.

---

## 📂 Step 3: Navigate to the `src` Directory
Move into the `src` directory where the tests are located:

```sh
cd src
```

---

## ✅ Step 4: Run the Tests
Execute the test suite to verify everything works correctly:

```sh
pnpm test
```

This will run all Jest tests and ensure the Markdown parser (`MdToHtml.ts`) works as expected.

---

## ⚡ Additional Commands

- **Run tests continuously (watch mode):**
  ```sh
  pnpm test -- --watch
  ```
  This will rerun tests automatically when you modify files.

- **Run a single test file (e.g., `mdToHtml.test.ts`):**
  ```sh
  pnpm test src/tests/mdToHtml.test.ts
  ```
---