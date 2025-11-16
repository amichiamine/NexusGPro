# NexusGPro - AppViews Directory

This directory contains generated views from the NexusGPro Builder.

## Structure

- `exports/` - Exported views in HTML, PHP, or JSON format
- `imports/` - Place imported view files here for editing in the builder
- `temp/` - Temporary files used during the build process

## Portable Paths

This directory is designed to be portable. You can:

1. Keep it inside `nexusg-pro/` during development
2. Move it to the parent directory for production deployment

The builder uses relative paths that adapt automatically.

## Production Deployment

### For XAMPP (Windows/Linux)
1. Copy the `appviews/exports/` folder to your XAMPP `htdocs` directory
2. Access your views at `http://localhost/[view-name].html` or `.php`

### For Shared Hosting
1. Upload the exported files to your web root
2. Files work standalone without Node.js

## Format Details

### HTML Export
- Standalone HTML file with embedded CSS and JavaScript
- No dependencies required
- Works on any web server

### PHP Export
- PHP file with API endpoints
- Form handling included
- Database ready (add your connection)

### JSON Export
- Configuration file for re-import
- Preserves all builder settings
- Can be versioned with Git

## Notes

- Generated files are production-ready
- All paths are relative and portable
- API placeholders are included in PHP exports
- CSS is embedded for zero-config deployment
