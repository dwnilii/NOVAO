# Novao

This is a Next.js web application for managing users and configurations for a proxy service, built with a modern and robust stack.

## Getting Started

To get started with developing or deploying this application, please refer to the installation and setup guides:

- [English README](./README.md)
- [فارسی README](./README-fa.md)

## Features

- **User Management**: Create, edit, and manage users with specific proxy configurations.
- **Organizational Units (OUs)**: Group users into OUs for easier management and bulk configuration.
- **Proxy Management**: Centrally manage a list of proxies (HTTP, SOCKS4, SOCKS5).
- **PAC File Generation**: Automatically generate and serve PAC (Proxy Auto-Config) files for each user and OU.
- **Dynamic Routing Modes**: Supports various routing modes like `Proxy All`, `Direct All`, `Direct Except`, and `Proxy Except`.
- **Dashboard**: An intuitive dashboard for administrators to monitor the system.
- **Backup & Restore**: Easily back up and restore the application's database.
- **Automatic PAC file updates**: When a proxy is updated, all associated PAC files are automatically regenerated.
- **Secure by default**: Implements best practices for security and data handling.
- **Live Update**: Update the application to the latest version directly from the UI.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [SQLite](https://www.sqlite.org/index.html)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Branding and Theming

The application's logo is the **Zap** icon sourced from the `lucide-react` icon library. It is rendered as an inline SVG component throughout the application.

You can easily customize the application's color scheme by modifying the HSL CSS variables in `src/app/globals.css`. The primary color, used by the logo and other key elements, can be changed by updating the `--primary` variable.

```css
/* src/app/globals.css */
@layer base {
  :root {
    --primary: 204 100% 50%; /* #00A3FF - Default Sky Blue */
    /* ... other color variables */
  }
}
```

## Installation

For detailed installation instructions, please refer to the `install.sh` script and the `README.md` file in the root of the repository.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.
