const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "backend");

const directories = [
  "src",
  "src/config",
  "src/controllers",
  "src/services",
  "src/repositories",
  "src/models",
  "src/routes",
  "src/middlewares",
  "src/validations",
  "src/interfaces",
  "src/types",
  "src/utils",
  "src/schemas",
  "src/docs",
  "src/uploads",
  "src/templates",
  "src/modules",

  "src/modules/auth",
  "src/modules/user",
  "src/modules/product",

  "tests",
  "tests/unit",
  "tests/integration",
];

const files = [
  // Root
  ".env",
  ".env.example",
  ".gitignore",
  "package.json",
  "tsconfig.json",
  "nodemon.json",
  "eslint.config.js",
  "prettier.config.js",
  "README.md",

  // Main application
  "src/app.ts",
  "src/server.ts",

  // Config
  "src/config/database.ts",
  "src/config/env.ts",
  "src/config/cors.ts",
  "src/config/logger.ts",
  "src/config/rateLimiter.ts",
  "src/config/constants.ts",

  // Controllers
  "src/controllers/auth.controller.ts",
  "src/controllers/user.controller.ts",
  "src/controllers/product.controller.ts",

  // Services
  "src/services/auth.service.ts",
  "src/services/user.service.ts",
  "src/services/product.service.ts",

  // Repositories
  "src/repositories/auth.repository.ts",
  "src/repositories/user.repository.ts",
  "src/repositories/product.repository.ts",

  // Models
  "src/models/user.model.ts",
  "src/models/product.model.ts",
  "src/models/index.ts",

  // Routes
  "src/routes/auth.routes.ts",
  "src/routes/user.routes.ts",
  "src/routes/product.routes.ts",
  "src/routes/index.ts",

  // Middlewares
  "src/middlewares/auth.middleware.ts",
  "src/middlewares/validation.middleware.ts",
  "src/middlewares/error.middleware.ts",
  "src/middlewares/notFound.middleware.ts",
  "src/middlewares/upload.middleware.ts",

  // Validations
  "src/validations/auth.validation.ts",
  "src/validations/user.validation.ts",
  "src/validations/product.validation.ts",

  // Interfaces
  "src/interfaces/auth.interface.ts",
  "src/interfaces/user.interface.ts",
  "src/interfaces/product.interface.ts",

  // Types
  "src/types/express.d.ts",
  "src/types/env.d.ts",
  "src/types/common.types.ts",

  // Utils
  "src/utils/ApiError.ts",
  "src/utils/ApiResponse.ts",
  "src/utils/asyncHandler.ts",
  "src/utils/generateToken.ts",
  "src/utils/password.ts",
  "src/utils/pagination.ts",
  "src/utils/helpers.ts",

  // Modules
  "src/modules/auth/.gitkeep",
  "src/modules/user/.gitkeep",
  "src/modules/product/.gitkeep",

  // Tests
  "tests/unit/.gitkeep",
  "tests/integration/.gitkeep",
];

function createDirectories() {
  directories.forEach((directory) => {
    const fullPath = path.join(root, directory);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Created: ${path.relative(__dirname, fullPath)}`);
    }
  });
}

function createFiles() {
  files.forEach((file) => {
    const fullPath = path.join(root, file);

    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, "", "utf8");
      console.log(`📄 Created: ${path.relative(__dirname, fullPath)}`);
    }
  });
}

function createPackageJson() {
  const packagePath = path.join(root, "package.json");

  const packageJson = {
    name: "nextmeet-backend",
    version: "1.0.0",
    description: "NextMeet Developer Interview Platform Backend",
    main: "dist/server.js",
    scripts: {
      dev: "nodemon",
      build: "tsc",
      start: "node dist/server.js",
      test: "jest",
      lint: "eslint .",
      format: "prettier --write ."
    },
    keywords: [
      "nextmeet",
      "interview",
      "mern",
      "node",
      "express",
      "typescript"
    ],
    author: "",
    license: "ISC"
  };

  fs.writeFileSync(
    packagePath,
    JSON.stringify(packageJson, null, 2),
    "utf8"
  );

  console.log("📦 Created: package.json");
}

function main() {
  console.log("\n🚀 Creating NextMeet backend structure...\n");

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  createDirectories();
  createFiles();
  createPackageJson();

  console.log("\n✅ NextMeet backend structure created successfully.");
  console.log("\nNext steps:");
  console.log("1. cd backend");
  console.log("2. npm install");
  console.log("3. npm run dev\n");
}

main();