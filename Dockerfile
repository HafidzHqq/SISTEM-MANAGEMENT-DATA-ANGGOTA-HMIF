# Build frontend assets
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Install PHP dependencies
FROM composer:2.7 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction

# Production image
FROM php:8.2-apache
WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends libzip-dev libicu-dev libpng-dev libxml2-dev unzip git zlib1g-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip intl opcache \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /app/vendor ./vendor
COPY --from=node-builder /app/public/build ./public/build
COPY . .

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!DocumentRoot /var/www/html!DocumentRoot ${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!<Directory /var/www/html>!<Directory ${APACHE_DOCUMENT_ROOT}>!g' /etc/apache2/apache2.conf /etc/apache2/sites-available/*.conf

EXPOSE 80
CMD ["apache2-foreground"]
