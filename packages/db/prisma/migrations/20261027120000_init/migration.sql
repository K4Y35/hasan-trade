-- CreateTable
CREATE TABLE `store_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NULL,
    `tagline` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `logoUrl` VARCHAR(500) NULL,
    `logoDarkUrl` VARCHAR(500) NULL,
    `faviconUrl` VARCHAR(500) NULL,
    `ogImageUrl` VARCHAR(500) NULL,
    `invoiceLogoUrl` VARCHAR(500) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'BD',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'BDT',
    `currencySymbol` VARCHAR(191) NOT NULL DEFAULT '৳',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Dhaka',
    `language` ENUM('EN', 'BN') NOT NULL DEFAULT 'EN',
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en-BD',
    `themeId` ENUM('CLASSIC', 'MODERN', 'BOLD') NOT NULL DEFAULT 'CLASSIC',
    `colorPrimary` VARCHAR(191) NOT NULL DEFAULT '#0F172A',
    `colorSecondary` VARCHAR(191) NOT NULL DEFAULT '#F59E0B',
    `colorAccent` VARCHAR(191) NOT NULL DEFAULT '#0EA5E9',
    `colorBackground` VARCHAR(191) NOT NULL DEFAULT '#FFFFFF',
    `colorForeground` VARCHAR(191) NOT NULL DEFAULT '#0F172A',
    `colorMuted` VARCHAR(191) NOT NULL DEFAULT '#F1F5F9',
    `fontSans` VARCHAR(191) NOT NULL DEFAULT 'Inter',
    `fontHeading` VARCHAR(191) NOT NULL DEFAULT 'Inter',
    `radius` VARCHAR(191) NOT NULL DEFAULT '0.5rem',
    `buttonStyle` ENUM('SOLID', 'OUTLINE', 'SOFT') NOT NULL DEFAULT 'SOLID',
    `cardStyle` ENUM('FLAT', 'ELEVATED', 'OUTLINED') NOT NULL DEFAULT 'ELEVATED',
    `footerText` TEXT NULL,
    `copyrightText` VARCHAR(191) NULL,
    `privacyPolicy` LONGTEXT NULL,
    `termsOfService` LONGTEXT NULL,
    `returnPolicy` LONGTEXT NULL,
    `warrantyPolicy` LONGTEXT NULL,
    `invoicePrefix` VARCHAR(191) NOT NULL DEFAULT 'INV',
    `invoiceFooter` TEXT NULL,
    `orderPrefix` VARCHAR(191) NOT NULL DEFAULT 'ORD',
    `posReceiptFooter` TEXT NULL,
    `taxRate` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `taxInclusive` BOOLEAN NOT NULL DEFAULT true,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,
    `allowGuestCheckout` BOOLEAN NOT NULL DEFAULT true,
    `allowCod` BOOLEAN NOT NULL DEFAULT true,
    `storageDriver` ENUM('LOCAL', 'MINIO', 'S3') NOT NULL DEFAULT 'LOCAL',
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `googleAnalyticsId` VARCHAR(191) NULL,
    `facebookPixelId` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(500) NULL,
    `instagramUrl` VARCHAR(500) NULL,
    `youtubeUrl` VARCHAR(500) NULL,
    `tiktokUrl` VARCHAR(500) NULL,
    `licenseKey` VARCHAR(191) NULL,
    `licensedDomain` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `store_settings_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branches` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `division` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `thana` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `hours` JSON NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `fulfillsOnline` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `branches_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_providers` (
    `id` VARCHAR(191) NOT NULL,
    `provider` ENUM('COD', 'BKASH', 'NAGAD', 'CARD', 'CASH', 'BANK_TRANSFER', 'DUE') NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `config` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_providers_provider_key`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_providers` (
    `id` VARCHAR(191) NOT NULL,
    `channel` ENUM('EMAIL', 'SMS') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_providers_channel_name_key`(`channel`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('STAFF', 'CUSTOMER') NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `passwordHash` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_kind_status_idx`(`kind`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_slug_key`(`slug`),
    INDEX `permissions_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `userAgent` VARCHAR(500) NULL,
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_tokenHash_key`(`tokenHash`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL DEFAULT 'Home',
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `thana` VARCHAR(191) NULL,
    `district` VARCHAR(191) NOT NULL,
    `division` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'BD',
    `isDefaultShip` BOOLEAN NOT NULL DEFAULT false,
    `isDefaultBill` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `addresses_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `diff` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_actorId_createdAt_idx`(`actorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `website` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brands_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `path` VARCHAR(500) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `brandId` VARCHAR(191) NULL,
    `type` ENUM('SIMPLE', 'VARIABLE') NOT NULL DEFAULT 'SIMPLE',
    `status` ENUM('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `shortDescription` TEXT NULL,
    `description` LONGTEXT NULL,
    `warrantyMonths` INTEGER NOT NULL DEFAULT 0,
    `taxRate` DECIMAL(5, 2) NULL,
    `weightGrams` INTEGER NULL,
    `isSerialized` BOOLEAN NOT NULL DEFAULT false,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `products_brandId_status_idx`(`brandId`, `status`),
    INDEX `products_status_publishedAt_idx`(`status`, `publishedAt`),
    FULLTEXT INDEX `products_name_shortDescription_sku_idx`(`name`, `shortDescription`, `sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `productId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `product_categories_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`productId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `compareAtPrice` DECIMAL(12, 2) NULL,
    `costPrice` DECIMAL(12, 2) NULL,
    `weightGrams` INTEGER NULL,
    `options` JSON NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_variants_sku_key`(`sku`),
    UNIQUE INDEX `product_variants_barcode_key`(`barcode`),
    INDEX `product_variants_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `mediaId` VARCHAR(191) NULL,
    `url` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `product_images_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `related_products` (
    `productId` VARCHAR(191) NOT NULL,
    `relatedId` VARCHAR(191) NOT NULL,
    `type` ENUM('RELATED', 'UPSELL', 'CROSS_SELL') NOT NULL DEFAULT 'RELATED',

    PRIMARY KEY (`productId`, `relatedId`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spec_groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spec_fields` (
    `id` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT') NOT NULL DEFAULT 'TEXT',
    `unit` VARCHAR(191) NULL,
    `options` JSON NULL,
    `filterable` BOOLEAN NOT NULL DEFAULT false,
    `comparable` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `spec_fields_slug_key`(`slug`),
    INDEX `spec_fields_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_specs` (
    `productId` VARCHAR(191) NOT NULL,
    `fieldId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(500) NOT NULL,

    INDEX `product_specs_fieldId_value_idx`(`fieldId`, `value`),
    PRIMARY KEY (`productId`, `fieldId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(500) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `driver` ENUM('LOCAL', 'MINIO', 'S3') NOT NULL DEFAULT 'LOCAL',
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `alt` VARCHAR(191) NULL,
    `folder` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `media_assets_key_key`(`key`),
    INDEX `media_assets_folder_idx`(`folder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_balances` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `onHand` INTEGER NOT NULL DEFAULT 0,
    `reserved` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `stock_balances_variantId_idx`(`variantId`),
    UNIQUE INDEX `stock_balances_branchId_variantId_key`(`branchId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_ledger` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `type` ENUM('PURCHASE', 'SALE', 'POS_SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'RESERVE', 'RELEASE') NOT NULL,
    `reason` VARCHAR(191) NULL,
    `unitCost` DECIMAL(12, 2) NULL,
    `referenceType` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_ledger_branchId_variantId_createdAt_idx`(`branchId`, `variantId`, `createdAt`),
    INDEX `stock_ledger_referenceType_referenceId_idx`(`referenceType`, `referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `serial_numbers` (
    `id` VARCHAR(191) NOT NULL,
    `serial` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NULL,
    `status` ENUM('IN_STOCK', 'RESERVED', 'SOLD', 'RETURNED', 'DEFECTIVE', 'IN_TRANSIT') NOT NULL DEFAULT 'IN_STOCK',
    `purchasedAt` DATETIME(3) NULL,
    `soldAt` DATETIME(3) NULL,
    `orderItemId` VARCHAR(191) NULL,
    `posSaleItemId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `serial_numbers_serial_key`(`serial`),
    INDEX `serial_numbers_variantId_status_idx`(`variantId`, `status`),
    INDEX `serial_numbers_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `notes` TEXT NULL,
    `orderedAt` DATETIME(3) NULL,
    `receivedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchase_orders_poNumber_key`(`poNumber`),
    INDEX `purchase_orders_supplierId_status_idx`(`supplierId`, `status`),
    INDEX `purchase_orders_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `quantityOrdered` INTEGER NOT NULL,
    `quantityReceived` INTEGER NOT NULL DEFAULT 0,
    `unitCost` DECIMAL(12, 2) NOT NULL,

    INDEX `purchase_order_items_purchaseOrderId_idx`(`purchaseOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_transfers` (
    `id` VARCHAR(191) NOT NULL,
    `transferNumber` VARCHAR(191) NOT NULL,
    `fromBranchId` VARCHAR(191) NOT NULL,
    `toBranchId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `notes` TEXT NULL,
    `shippedAt` DATETIME(3) NULL,
    `receivedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_transfers_transferNumber_key`(`transferNumber`),
    INDEX `stock_transfers_fromBranchId_status_idx`(`fromBranchId`, `status`),
    INDEX `stock_transfers_toBranchId_idx`(`toBranchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_transfer_items` (
    `id` VARCHAR(191) NOT NULL,
    `transferId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `stock_transfer_items_transferId_idx`(`transferId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `sessionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carts_userId_key`(`userId`),
    UNIQUE INDEX `carts_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cart_items_cartId_variantId_key`(`cartId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wishlist_items_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compare_items` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `compare_items_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` ENUM('PERCENT', 'FIXED') NOT NULL,
    `value` DECIMAL(12, 2) NOT NULL,
    `minSubtotal` DECIMAL(12, 2) NULL,
    `maxUses` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupons_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `channel` ENUM('WEB', 'POS', 'PHONE') NOT NULL DEFAULT 'WEB',
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `customerId` VARCHAR(191) NULL,
    `staffId` VARCHAR(191) NULL,
    `branchId` VARCHAR(191) NULL,
    `couponId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shippingAddress` JSON NULL,
    `billingAddress` JSON NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `shipping` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `customerNotes` TEXT NULL,
    `staffNotes` TEXT NULL,
    `placedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    INDEX `orders_customerId_placedAt_idx`(`customerId`, `placedAt`),
    INDEX `orders_status_placedAt_idx`(`status`, `placedAt`),
    INDEX `orders_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `warrantyMonths` INTEGER NOT NULL DEFAULT 0,

    INDEX `order_items_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_logs` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NULL,
    `toStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_logs_orderId_createdAt_idx`(`orderId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `posSaleId` VARCHAR(191) NULL,
    `provider` ENUM('COD', 'BKASH', 'NAGAD', 'CARD', 'CASH', 'BANK_TRANSFER', 'DUE') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payments_orderId_idx`(`orderId`),
    INDEX `payments_posSaleId_idx`(`posSaleId`),
    INDEX `payments_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `posSaleId` VARCHAR(191) NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pdfUrl` VARCHAR(500) NULL,

    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `invoices_orderId_key`(`orderId`),
    UNIQUE INDEX `invoices_posSaleId_key`(`posSaleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_terminals` (
    `id` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pos_terminals_code_key`(`code`),
    INDEX `pos_terminals_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `terminalId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `cashierId` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `openingFloat` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `closingCash` DECIMAL(12, 2) NULL,
    `notes` TEXT NULL,
    `openedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `closedAt` DATETIME(3) NULL,

    INDEX `pos_sessions_terminalId_status_idx`(`terminalId`, `status`),
    INDEX `pos_sessions_cashierId_openedAt_idx`(`cashierId`, `openedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_sales` (
    `id` VARCHAR(191) NOT NULL,
    `saleNumber` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `cashierId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `status` ENUM('COMPLETED', 'RETURNED', 'VOID') NOT NULL DEFAULT 'COMPLETED',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `paid` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `due` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `soldAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pos_sales_saleNumber_key`(`saleNumber`),
    INDEX `pos_sales_sessionId_idx`(`sessionId`),
    INDEX `pos_sales_branchId_soldAt_idx`(`branchId`, `soldAt`),
    INDEX `pos_sales_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_sale_items` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `warrantyMonths` INTEGER NOT NULL DEFAULT 0,

    INDEX `pos_sale_items_saleId_idx`(`saleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_payments` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `provider` ENUM('COD', 'BKASH', 'NAGAD', 'CARD', 'CASH', 'BANK_TRANSFER', 'DUE') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pos_payments_saleId_idx`(`saleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_returns` (
    `id` VARCHAR(191) NOT NULL,
    `returnNumber` VARCHAR(191) NOT NULL,
    `originalSaleId` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `refundAmount` DECIMAL(12, 2) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pos_returns_returnNumber_key`(`returnNumber`),
    INDEX `pos_returns_originalSaleId_idx`(`originalSaleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pos_return_items` (
    `id` VARCHAR(191) NOT NULL,
    `returnId` VARCHAR(191) NOT NULL,
    `posSaleItemId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `pos_return_items_returnId_idx`(`returnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `due_ledger` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `posSaleId` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `type` ENUM('SALE', 'COLLECTION', 'ADJUSTMENT') NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `due_ledger_customerId_createdAt_idx`(`customerId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warranties` (
    `id` VARCHAR(191) NOT NULL,
    `serialId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `orderItemId` VARCHAR(191) NULL,
    `posSaleItemId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'CLAIMED', 'VOID') NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `warranties_serialId_key`(`serialId`),
    INDEX `warranties_customerId_status_idx`(`customerId`, `status`),
    INDEX `warranties_endDate_status_idx`(`endDate`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warranty_claims` (
    `id` VARCHAR(191) NOT NULL,
    `warrantyId` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `resolution` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `warranty_claims_warrantyId_status_idx`(`warrantyId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` VARCHAR(191) NOT NULL,
    `location` ENUM('HEADER', 'FOOTER', 'MOBILE', 'ACCOUNT') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `menus_location_key`(`location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `menuId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `label` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `menu_items_menuId_sortOrder_idx`(`menuId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `homepage_sections` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'FEATURED_CATEGORIES', 'FEATURED_PRODUCTS', 'BANNERS', 'BRANDS', 'CUSTOM_HTML') NOT NULL,
    `title` VARCHAR(191) NULL,
    `payload` JSON NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `themeId` ENUM('CLASSIC', 'MODERN', 'BOLD') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `homepage_sections_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `url_redirects` (
    `id` VARCHAR(191) NOT NULL,
    `fromPath` VARCHAR(500) NOT NULL,
    `toPath` VARCHAR(500) NOT NULL,
    `statusCode` INTEGER NOT NULL DEFAULT 301,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `url_redirects_fromPath_key`(`fromPath`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_products` ADD CONSTRAINT `related_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_products` ADD CONSTRAINT `related_products_relatedId_fkey` FOREIGN KEY (`relatedId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spec_fields` ADD CONSTRAINT `spec_fields_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `spec_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_fieldId_fkey` FOREIGN KEY (`fieldId`) REFERENCES `spec_fields`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_balances` ADD CONSTRAINT `stock_balances_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_balances` ADD CONSTRAINT `stock_balances_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_ledger` ADD CONSTRAINT `stock_ledger_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serial_numbers` ADD CONSTRAINT `serial_numbers_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serial_numbers` ADD CONSTRAINT `serial_numbers_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serial_numbers` ADD CONSTRAINT `serial_numbers_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `serial_numbers` ADD CONSTRAINT `serial_numbers_posSaleItemId_fkey` FOREIGN KEY (`posSaleItemId`) REFERENCES `pos_sale_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `purchase_orders_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_items` ADD CONSTRAINT `purchase_order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_fromBranchId_fkey` FOREIGN KEY (`fromBranchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_toBranchId_fkey` FOREIGN KEY (`toBranchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfer_items` ADD CONSTRAINT `stock_transfer_items_transferId_fkey` FOREIGN KEY (`transferId`) REFERENCES `stock_transfers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfer_items` ADD CONSTRAINT `stock_transfer_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compare_items` ADD CONSTRAINT `compare_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compare_items` ADD CONSTRAINT `compare_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_logs` ADD CONSTRAINT `order_status_logs_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_posSaleId_fkey` FOREIGN KEY (`posSaleId`) REFERENCES `pos_sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_posSaleId_fkey` FOREIGN KEY (`posSaleId`) REFERENCES `pos_sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_terminals` ADD CONSTRAINT `pos_terminals_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sessions` ADD CONSTRAINT `pos_sessions_terminalId_fkey` FOREIGN KEY (`terminalId`) REFERENCES `pos_terminals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sessions` ADD CONSTRAINT `pos_sessions_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sessions` ADD CONSTRAINT `pos_sessions_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sales` ADD CONSTRAINT `pos_sales_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `pos_sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sales` ADD CONSTRAINT `pos_sales_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sales` ADD CONSTRAINT `pos_sales_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sales` ADD CONSTRAINT `pos_sales_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sale_items` ADD CONSTRAINT `pos_sale_items_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `pos_sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_sale_items` ADD CONSTRAINT `pos_sale_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_payments` ADD CONSTRAINT `pos_payments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `pos_sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_returns` ADD CONSTRAINT `pos_returns_originalSaleId_fkey` FOREIGN KEY (`originalSaleId`) REFERENCES `pos_sales`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_return_items` ADD CONSTRAINT `pos_return_items_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `pos_returns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pos_return_items` ADD CONSTRAINT `pos_return_items_posSaleItemId_fkey` FOREIGN KEY (`posSaleItemId`) REFERENCES `pos_sale_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `due_ledger` ADD CONSTRAINT `due_ledger_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `due_ledger` ADD CONSTRAINT `due_ledger_posSaleId_fkey` FOREIGN KEY (`posSaleId`) REFERENCES `pos_sales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_serialId_fkey` FOREIGN KEY (`serialId`) REFERENCES `serial_numbers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranties` ADD CONSTRAINT `warranties_posSaleItemId_fkey` FOREIGN KEY (`posSaleItemId`) REFERENCES `pos_sale_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warranty_claims` ADD CONSTRAINT `warranty_claims_warrantyId_fkey` FOREIGN KEY (`warrantyId`) REFERENCES `warranties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

