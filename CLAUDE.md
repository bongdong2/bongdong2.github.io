# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

개발 블로그 - Jekyll 기반 정적 사이트. Bay 테마를 사용한 개인 기술 블로그로, 주로 Java, JavaScript, React, Flutter, Dart 관련 개발 내용을 포스팅한다.

## Development Commands

### Build & Serve
```bash
# Development server with hot reload
bundle exec jekyll serve

# Build the site
bundle install
jekyll build
```

### Content Management
```bash
# New post creation in _posts/
# File naming: YYYY-MM-DD-title.md
# Front matter required: title, date, categories
```

## Architecture & Structure

### Layout System
- `_layouts/default.html` - Base template with header/footer includes
- `_layouts/post.html` - Blog post template with draft banner support
- `_layouts/blog.html` - Blog listing page
- `_layouts/home.html` - Homepage layout
- `_includes/` - Reusable HTML components (head, header, footer, etc.)

### Content Organization
- `_posts/` - Blog posts in Markdown format with Jekyll front matter
- `_sass/` - SCSS partials for styling (base, layout, post, blog, etc.)
- `assets/css/main.scss` - Main stylesheet entry point importing all partials

### Configuration
- `_config.yml` - Jekyll site configuration with header navigation and footer contact info
- Site title: "개발 블로그"
- GitHub Pages deployment to bongdong2.github.io

### Styling Architecture
SCSS with modular approach:
- Variables defined in main.scss (fonts, colors, breakpoints)
- Partial imports: base, layout, site, work, blog, post, 404
- Responsive design with mobile/laptop breakpoints

### Content Categories
Blog posts primarily cover:
- Spring Boot & REST API development
- Modern JavaScript & ES6
- React development
- Flutter & Dart programming
- Java fundamentals
- Algorithm problems
- Web development concepts

### Jekyll Features Used
- Kramdown markdown processor
- Jekyll-feed plugin for RSS
- Liquid templating for layouts
- Front matter for post metadata
- Draft post support with banner display